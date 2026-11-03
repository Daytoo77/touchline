import { AiManager, DT, Match, makeReplay, type TeamInput } from '@touchline/engine';
import type {
  Frame,
  MatchCommand,
  MatchEvent,
  PauseInfo,
  PrivateTeamState,
  PublicMatchState,
  ReplayFile,
  RosterEntry,
  Seat,
  Side,
} from '@touchline/shared';
import { PacingGovernor } from './pacing';

export { baseRate, PacingGovernor } from './pacing';

export interface HostListener {
  frames(frames: Frame[]): void;
  events(events: MatchEvent[]): void;
  publicState(s: PublicMatchState): void;
  privateState(side: Side, s: PrivateTeamState): void;
  roster(r: RosterEntry[]): void;
  pause(info: PauseInfo): void;
  ended(replay: ReplayFile): void;
}

export interface HostOptions {
  seed: number;
  home: TeamInput;
  away: TeamInput;
  /** Seats driven by the built-in AI. */
  ai: [boolean, boolean];
  /** Real seconds for 90 minutes (default 600). */
  targetSeconds?: number;
  /** Real seconds for half-time / pre-extra-time breaks (default 90). */
  breakSeconds?: number;
  /** Real seconds to choose the penalty order (default 40). */
  shootoutBreakSeconds?: number;
  /** Speed multiplier (dev / tests). */
  speed?: number;
  /** Auto-pause budget per manager while disconnected, ms (default 120 000). */
  pauseBudgetMs?: number;
  /** Wall clock in ms (injectable for tests). */
  now?: () => number;
}

export interface CommandResult {
  ok: boolean;
  error?: string;
  tick: number;
}

/** Keep only the events a side may see. */
export function visibleTo(events: MatchEvent[], side: Side): MatchEvent[] {
  return events.filter((e) => e.vis === undefined || e.vis === side);
}

/**
 * Runs a Match against the wall clock: variable pacing, AI seats, break timers, the capped
 * disconnect pause, and fan-out of frames/events/state to a listener. Used both by the server
 * (online rooms) and by the browser Worker (single device vs AI).
 */
export class MatchHost {
  readonly match: Match;
  readonly opts: Required<Omit<HostOptions, 'home' | 'away'>> & Pick<HostOptions, 'home' | 'away'>;
  private readonly ais: (AiManager | null)[];
  private readonly governor: PacingGovernor;
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastWall = 0;
  private acc = 0;
  private lastStateWall = 0;
  private rosterVersion = -1;
  private breakEndsAt: number | null = null;
  private breakKey = '';
  private connected: [boolean, boolean] = [true, true];
  private budget: [number, number];
  private pausedBy: Seat | null = null;
  private endedSent = false;
  /** All events so far (for reconnect snapshots). */
  readonly history: MatchEvent[] = [];
  lastFrame: Frame | null = null;

  constructor(
    options: HostOptions,
    private readonly listener: HostListener,
  ) {
    this.opts = {
      targetSeconds: 600,
      breakSeconds: 90,
      shootoutBreakSeconds: 40,
      speed: 1,
      pauseBudgetMs: 120_000,
      now: () => Date.now(),
      ...options,
    };
    this.match = new Match(options.seed, options.home, options.away);
    this.ais = [options.ai[0] ? new AiManager(0, options.seed) : null, options.ai[1] ? new AiManager(1, options.seed) : null];
    this.governor = new PacingGovernor(this.opts.targetSeconds);
    this.budget = [this.opts.pauseBudgetMs, this.opts.pauseBudgetMs];
  }

  start(intervalMs = 50): void {
    this.lastWall = this.opts.now();
    this.flushAll();
    this.timer = setInterval(() => this.pump(), intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  get isOver(): boolean {
    return this.match.isOver();
  }

  get paused(): boolean {
    return this.pausedBy !== null;
  }

  /** Public state plus the real-time break countdown. */
  publicState(): PublicMatchState {
    const ps = this.match.publicState();
    if (this.breakEndsAt !== null && ps.phase === 'break') ps.breakRemainingMs = Math.max(0, Math.round(this.breakEndsAt - this.opts.now()));
    return ps;
  }

  /** Wall-clock ms at which the current break ends, if any. */
  get breakDeadline(): number | null {
    return this.breakEndsAt;
  }

  /** One host iteration. Called by the interval timer, or manually in tests. */
  pump(): void {
    const now = this.opts.now();
    const dtMs = Math.min(500, Math.max(0, now - this.lastWall));
    this.lastWall = now;
    const m = this.match;
    if (m.isOver()) return this.sendEnded();
    if (this.pausedBy !== null) {
      this.budget[this.pausedBy] = Math.max(0, this.budget[this.pausedBy] - dtMs);
      if (this.breakEndsAt !== null) this.breakEndsAt += dtMs;
      if (this.budget[this.pausedBy] <= 0) this.updatePause();
      return;
    }
    this.runAis();
    if (m.s.phase === 'break') {
      this.handleBreak(now);
      this.flushEvents();
      this.maybeState(now, true);
      return;
    }
    this.breakEndsAt = null;
    const rate = this.governor.rate(m, now / 1000) * this.opts.speed;
    this.acc += ((dtMs / 1000) * rate) / DT;
    let n = Math.floor(this.acc);
    this.acc -= n;
    if (n > 600) n = 600;
    const frames: Frame[] = [];
    const every = n > 12 ? Math.ceil(n / 12) : 1;
    for (let i = 0; i < n; i++) {
      if (i > 0) this.runAis();
      if ((m.s.phase as string) === 'break' || m.isOver()) break;
      m.step();
      if (i % every === every - 1 || i === n - 1) frames.push(m.frame());
    }
    if (frames.length) {
      this.lastFrame = frames[frames.length - 1]!;
      this.listener.frames(frames);
    }
    this.flushEvents();
    this.maybeState(now, false);
    if (m.isOver()) this.sendEnded();
  }

  /** Run the game as fast as possible to the end (tests / "skip to result"). */
  runToEnd(): void {
    const m = this.match;
    let guard = 0;
    while (!m.isOver() && guard++ < 200_000) {
      this.runAis();
      if (m.s.phase === 'break') {
        m.command(-1, { type: 'endBreak' });
        continue;
      }
      m.step();
    }
    this.flushEvents();
    this.flushAll();
    this.sendEnded();
  }

  command(seat: Seat, cmd: MatchCommand): CommandResult {
    const m = this.match;
    if (this.ais[seat]) return { ok: false, error: 'This seat is managed by the AI.', tick: m.s.tick };
    const err = m.command(seat, cmd);
    this.flushEvents();
    this.listener.privateState(seat, m.privateState(seat));
    this.listener.publicState(this.publicState());
    if (this.rosterVersion !== m.rosterVersion) {
      this.rosterVersion = m.rosterVersion;
      this.listener.roster(m.roster());
    }
    return err ? { ok: false, error: err, tick: m.s.tick } : { ok: true, tick: m.s.tick };
  }

  /** Mark a human seat (dis)connected; drives the capped auto-pause. */
  setConnected(seat: Seat, connected: boolean): void {
    if (this.ais[seat]) return;
    this.connected[seat] = connected;
    this.updatePause();
  }

  pauseInfo(): PauseInfo {
    return { paused: this.pausedBy !== null, by: this.pausedBy, budgetMs: [Math.round(this.budget[0]), Math.round(this.budget[1])] };
  }

  private updatePause(): void {
    const prev = this.pausedBy;
    let by: Seat | null = null;
    if (!this.match.isOver()) {
      for (const s of [0, 1] as Seat[]) if (!this.ais[s] && !this.connected[s] && this.budget[s] > 0) by = by ?? s;
    }
    this.pausedBy = by;
    if (prev !== by) {
      this.lastWall = this.opts.now();
      this.listener.pause(this.pauseInfo());
    }
  }

  private runAis(): void {
    const m = this.match;
    for (const ai of this.ais) {
      if (!ai) continue;
      for (const c of ai.update(m)) m.command(ai.side, c);
    }
  }

  private handleBreak(now: number): void {
    const m = this.match;
    const key = `${m.s.breakKind}:${m.s.tick}`;
    if (key !== this.breakKey) {
      this.breakKey = key;
      const secs = m.s.breakKind === 'preShootout' ? this.opts.shootoutBreakSeconds : this.opts.breakSeconds;
      this.breakEndsAt = now + (secs * 1000) / Math.max(1, this.opts.speed);
      this.listener.publicState(this.publicState());
    }
    if (this.breakEndsAt !== null && now >= this.breakEndsAt) {
      m.command(-1, { type: 'endBreak' });
      this.breakEndsAt = null;
    }
  }

  private flushEvents(): void {
    const ev = this.match.drainEvents();
    if (ev.length) {
      this.history.push(...ev);
      this.listener.events(ev);
    }
    if (this.rosterVersion !== this.match.rosterVersion) {
      this.rosterVersion = this.match.rosterVersion;
      this.listener.roster(this.match.roster());
    }
  }

  private maybeState(now: number, force: boolean): void {
    if (!force && now - this.lastStateWall < 400) return;
    if (force && now - this.lastStateWall < 200) return;
    this.lastStateWall = now;
    const m = this.match;
    this.listener.publicState(this.publicState());
    this.listener.privateState(0, m.privateState(0));
    this.listener.privateState(1, m.privateState(1));
  }

  flushAll(): void {
    const m = this.match;
    this.rosterVersion = m.rosterVersion;
    this.listener.roster(m.roster());
    this.lastFrame = m.frame();
    this.listener.frames([this.lastFrame]);
    this.listener.publicState(this.publicState());
    this.listener.privateState(0, m.privateState(0));
    this.listener.privateState(1, m.privateState(1));
  }

  private sendEnded(): void {
    if (this.endedSent) return;
    this.endedSent = true;
    this.flushEvents();
    this.listener.publicState(this.publicState());
    this.listener.ended(makeReplay(this.match));
    this.stop();
  }
}
