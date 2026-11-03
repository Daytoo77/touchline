import {
  FORMATIONS,
  RULES,
  emptyTeamStats,
  roleParams,
  positionFit,
  shortNameOf,
  type BreakKind,
  type Club,
  type Frame,
  type GoalKind,
  type LoggedCommand,
  type MatchCommand,
  type MatchEvent,
  type Player,
  type PrivateTeamState,
  type PublicMatchState,
  type RosterEntry,
  type Seat,
  type Side,
  type SystemCommand,
  type TeamSheet,
} from '@touchline/shared';
import { normalise } from './ability';
import { r1 } from './detmath';
import { Rng, forkRng } from './rng';
import {
  DT,
  HALF_L,
  PITCH_L,
  PITCH_W,
  TICKS_PER_MIN,
  type BallRt,
  type MatchCore,
  type PlayerRt,
  type Restart,
  type TeamParams,
  type TeamRt,
} from './types';
import { refreshEffective, movePlayers, computeTargets, updateFatigue } from './shape';
import { stepPlay } from './play';
import { stepDead, setDead, startKickoff, stepShootout, startShootout } from './restarts';
import { applyCommand, deriveTeamParams } from './commands';
import { teamStrength } from './ai/selection';

export const ENGINE_VERSION = 1;

export interface TeamInput {
  club: Club;
  sheet: TeamSheet;
}

export interface MatchOptions {
  /** Knockout: extra time and penalties when level. Default true. */
  knockout?: boolean;
}

type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type EventInput = DistOmit<MatchEvent, 't' | 'clock'>;

const PERIOD_START: Record<number, number> = { 1: 0, 2: 2700, 3: 5400, 4: 6300, 5: 7200 };
const PERIOD_LEN: Record<number, number> = { 1: 2700, 2: 2700, 3: 900, 4: 900, 5: 0 };

export class Match {
  readonly seed: number;
  readonly opts: Required<MatchOptions>;
  readonly rng: Rng;
  readonly refRng: Rng;
  readonly teams: [TeamRt, TeamRt];
  /** All 22 pitch slots, indexed by pitch index. */
  readonly players: PlayerRt[];
  readonly ball: BallRt;
  readonly s: MatchCore;
  /** Events not yet drained by the host. */
  events: MatchEvent[] = [];
  /** Every command passed to `command()`, in order (accepted or not). */
  readonly commandLog: LoggedCommand[] = [];
  readonly checksums: [number, number][] = [];
  rosterVersion = 0;
  lastShotXg = 0;
  lastShotKind: GoalKind = 'open';
  pendingKickoffSnap = false;
  /** Calibration counters (never read by the simulation). */
  readonly dbg: Record<string, number> = {};
  carrierInBox = false;
  lastTurnover = 0;
  lastPassKind = '';
  passZone = '';
  ownedSince = 0;
  trace: string[] | null = null;
  /** Per-player temporary assignment (receiver/interceptor/chaser) overriding the shape target. */
  readonly assign: ({ x: number; y: number; until: number; urg: number } | null)[];
  /** Defending marking assignment: markOf[defIdx] = attacker idx or -1. */
  readonly markOf: Int8Array;
  readonly sources: [TeamInput, TeamInput];

  constructor(seed: number, home: TeamInput, away: TeamInput, opts: MatchOptions = {}) {
    this.seed = seed >>> 0;
    this.opts = { knockout: opts.knockout ?? true };
    this.sources = [home, away];
    this.rng = forkRng(this.seed, 'sim');
    this.refRng = forkRng(this.seed, 'referee');
    this.players = [];
    this.teams = [this.buildTeam(0, home), this.buildTeam(1, away)];
    this.assign = this.players.map(() => null);
    this.markOf = new Int8Array(22).fill(-1);
    this.ball = { x: HALF_L, y: PITCH_W / 2, z: 0, vx: 0, vy: 0, owner: -1, flight: null, lastTouch: -1, lastSide: 0, lastPasser: -1, lastPasserTick: -1 };
    this.s = {
      tick: 0,
      clock: 0,
      period: 1,
      periodTick: 0,
      phase: 'play',
      breakKind: null,
      dead: null,
      stoppage: 0,
      stoppageAnnounced: false,
      score: [0, 0],
      pens: null,
      possession: 0,
      decideAt: 0,
      carryX: HALF_L,
      carryY: PITCH_W / 2,
      refStrict: 0.85 + this.refRng.next() * 0.35,
      wastedTicks: 0,
      goalsThisPeriod: 0,
      cardsThisPeriod: 0,
      subsThisPeriod: 0,
      shootout: null,
      winner: null,
      lastAttackEvent: -9999,
    };
    for (const t of this.teams) {
      t.strength = teamStrength(t);
      for (const p of t.players) refreshEffective(this, p);
    }
    const kickoffSide: Side = this.rng.chance(0.5) ? 0 : 1;
    this.firstKickoff = kickoffSide;
    startKickoff(this, kickoffSide, false);
    this.recordChecksum();
  }

  /** Side that kicked off the first half (the other side kicks off the second). */
  firstKickoff: Side;

  private buildTeam(side: Side, input: TeamInput): TeamRt {
    const { club, sheet } = input;
    const byId = new Map(club.players.map((p) => [p.id, p]));
    const formation = FORMATIONS[sheet.tactic.formation];
    const team: TeamRt = {
      side,
      club,
      tactic: structuredClone(sheet.tactic),
      formation,
      instr: { ...sheet.tactic.instructions },
      tp: {} as TeamParams,
      players: [],
      bench: [...sheet.bench],
      subbedOff: [],
      subsUsed: 0,
      windowsUsed: 0,
      subsAllowed: RULES.subs,
      windowsAllowed: RULES.windows,
      pendingSubs: [],
      shout: null,
      shoutCdUntil: 0,
      lastShout: null,
      talkGiven: false,
      penaltyOrder: [],
      ready: false,
      dir: side === 0 ? 1 : -1,
      stats: emptyTeamStats(),
      strength: 0,
    };
    sheet.tactic.slots.forEach((slot, k) => {
      const def = byId.get(slot.playerId ?? '');
      if (!def) throw new Error(`Team sheet for ${club.id} references unknown player ${slot.playerId}`);
      const p = this.makePlayer(side, side * 11 + k, def, k, team);
      team.players.push(p);
      this.players.push(p);
    });
    team.tp = deriveTeamParams(team);
    return team;
  }

  makePlayer(side: Side, idx: number, def: Player, slot: number, team: TeamRt): PlayerRt {
    const fpos = team.formation.slots[slot]!;
    const ts = team.tactic.slots[slot]!;
    const base = normalise(def);
    // Big-match nerves: low composure/determination start slightly down.
    const nerves = (base.composure + base.determination) / 2 - 0.55;
    return {
      idx,
      side,
      def,
      slot,
      onPitch: true,
      sentOff: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
      urg: 0.5,
      cond: 0.97 + this.rng.next() * 0.03,
      morale: nerves * 2,
      yellow: false,
      base,
      e: { ...base },
      topSpeed: 7,
      accel: 3,
      fit: positionFit(def.positions, fpos.pos),
      rp: roleParams(ts.role, ts.duty),
      runUntil: 0,
      runX: 0,
      runY: 0,
      tackleCd: 0,
      stunUntil: 0,
      st: { passes: 0, passesOk: 0, shots: 0, onTarget: 0, goals: 0, assists: 0, tackles: 0, interceptions: 0, fouls: 0, saves: 0, keyPasses: 0, dribbles: 0, rating: 6.5 },
    };
  }

  // ------------------------------------------------------------------ frames of reference

  /** Team-frame depth (0 = own goal line). */
  u(side: Side, x: number): number {
    return this.teams[side].dir > 0 ? x : PITCH_L - x;
  }
  /** Team-frame lateral (0 = own left touchline). */
  v(side: Side, y: number): number {
    return this.teams[side].dir > 0 ? y : PITCH_W - y;
  }
  toX(side: Side, u: number): number {
    return this.teams[side].dir > 0 ? u : PITCH_L - u;
  }
  toY(side: Side, v: number): number {
    return this.teams[side].dir > 0 ? v : PITCH_W - v;
  }
  /** x of the goal this side attacks. */
  goalX(side: Side): number {
    return this.teams[side].dir > 0 ? PITCH_L : 0;
  }

  // ------------------------------------------------------------------ helpers

  emit(ev: EventInput): void {
    this.events.push({ ...(ev as MatchEvent), t: this.s.tick, clock: r1(this.s.clock) });
  }

  name(idx: number): string {
    return this.players[idx]!.def.id;
  }

  team(side: Side): TeamRt {
    return this.teams[side];
  }

  opp(side: Side): Side {
    return (1 - side) as Side;
  }

  onPitch(side: Side): PlayerRt[] {
    return this.teams[side].players.filter((p) => p.onPitch);
  }

  gkOf(side: Side): PlayerRt | undefined {
    return this.teams[side].players.find((p) => p.onPitch && p.slot === 0);
  }

  findPlayer(side: Side, id: string): PlayerRt | undefined {
    return this.teams[side].players.find((p) => p.def.id === id);
  }

  /** Give the ball to a player (possession, decision timer). */
  giveBall(idx: number, holdTicks?: number): void {
    const p = this.players[idx]!;
    const b = this.ball;
    const changed = this.s.possession !== p.side;
    b.owner = idx;
    this.ownedSince = this.s.tick;
    b.flight = null;
    b.lastTouch = idx;
    b.lastSide = p.side;
    b.z = 0;
    b.vx = 0;
    b.vy = 0;
    b.x = p.x;
    b.y = p.y;
    this.s.possession = p.side;
    if (changed) {
      this.dbg['turnovers'] = (this.dbg['turnovers'] ?? 0) + 1;
      this.lastTurnover = this.s.tick;
      b.lastPasser = -1;
      this.assign.fill(null);
    }
    {
      const u = this.u(p.side, p.x);
      const v = this.v(p.side, p.y);
      if (u > 88.5 && Math.abs(v - 34) < 20 && !this.s.dead) {
        const k = 'boxGain:' + (changed ? 'turnover' : b.lastPasser === -1 ? 'loose' : 'pass');
        this.dbg[k] = (this.dbg[k] ?? 0) + 1;
      }
    }
    const tp = this.teams[p.side].tp;
    const base = holdTicks ?? Math.round((4.5 + this.rng.next() * 6) * (1 - 0.18 * tp.tempo));
    this.s.decideAt = this.s.tick + Math.max(1, base);
    this.s.carryX = p.x;
    this.s.carryY = p.y;
  }

  // ------------------------------------------------------------------ main loop

  isOver(): boolean {
    return this.s.phase === 'ended';
  }

  /** Advance one tick (DT match seconds). No-op during breaks and after full time. */
  step(): void {
    const s = this.s;
    if (s.phase === 'ended' || s.phase === 'break') return;
    s.tick++;
    if (s.phase === 'shootout') {
      stepShootout(this);
      this.afterTick();
      return;
    }
    s.periodTick++;
    s.clock = PERIOD_START[s.period]! + s.periodTick * DT;
    if (s.dead) stepDead(this);
    else stepPlay(this);
    if (s.phase !== 'play') {
      this.afterTick();
      return;
    }
    computeTargets(this);
    movePlayers(this);
    updateFatigue(this);
    this.trackPossession();
    if (s.tick % 25 === 0) for (const p of this.players) if (p.onPitch) refreshEffective(this, p);
    if (s.tick % TICKS_PER_MIN === 0) this.minuteTick();
    this.checkClock();
    this.afterTick();
  }

  private afterTick(): void {
    if (this.s.tick % 500 === 0) this.recordChecksum();
  }

  private trackPossession(): void {
    const b = this.ball;
    let side: Side = b.lastSide;
    if (b.owner >= 0) side = this.players[b.owner]!.side;
    else if (b.flight) side = this.players[b.flight.by]!.side;
    if (!this.s.dead) this.teams[side].stats.possessionTicks++;
  }

  private minuteTick(): void {
    for (const p of this.players) {
      if (!p.onPitch) continue;
      p.morale += (0 - p.morale) * 0.02;
    }
    for (const t of this.teams) {
      if (t.shout && t.shout.until <= this.s.tick) {
        t.shout = null;
        t.tp = deriveTeamParams(t);
      }
    }
  }

  private checkClock(): void {
    const s = this.s;
    const len = PERIOD_LEN[s.period]!;
    const elapsed = s.periodTick * DT;
    if (!s.stoppageAnnounced && elapsed >= len - 30) {
      s.stoppageAnnounced = true;
      s.stoppage = this.computeStoppage();
      this.emit({ type: 'stoppage', period: s.period, minutes: s.stoppage });
    }
    if (s.stoppageAnnounced && elapsed >= len + s.stoppage * 60) {
      const bu = this.ball.x;
      const neutral = s.dead !== null || (bu > 30 && bu < 75 && !this.ball.flight);
      if (neutral || elapsed >= len + s.stoppage * 60 + 25) this.endPeriod();
    }
  }

  private computeStoppage(): number {
    const s = this.s;
    const base = s.period === 1 ? 1.2 : s.period === 2 ? 3 : s.period === 3 ? 0.6 : 1.2;
    const raw = base + s.goalsThisPeriod * 0.6 + s.cardsThisPeriod * 0.3 + s.subsThisPeriod * 0.35 + (s.wastedTicks * DT) / 60 + this.rng.next() * 1.2;
    return Math.max(s.period === 2 ? 2 : 1, Math.min(10, Math.round(raw)));
  }

  private endPeriod(): void {
    const s = this.s;
    this.emit({ type: 'periodEnd', period: s.period });
    const level = s.score[0] === s.score[1];
    if (s.period === 1) return this.startBreak('halfTime');
    if (s.period === 2) {
      if (level && this.opts.knockout) return this.startBreak('preExtraTime');
      return this.finish();
    }
    if (s.period === 3) {
      // Extra-time half-time: swap ends, no break screen; subs at this stoppage are free.
      this.nextPeriod(4);
      startKickoff(this, this.opp(this.extraKickoff), true);
      return;
    }
    if (s.period === 4) {
      if (level) return this.startBreak('preShootout');
      return this.finish();
    }
  }

  extraKickoff: Side = 0;

  private nextPeriod(p: 2 | 3 | 4): void {
    const s = this.s;
    s.period = p;
    s.periodTick = 0;
    s.clock = PERIOD_START[p]!;
    s.stoppage = 0;
    s.stoppageAnnounced = false;
    s.goalsThisPeriod = 0;
    s.cardsThisPeriod = 0;
    s.subsThisPeriod = 0;
    s.wastedTicks = 0;
    for (const t of this.teams) t.dir = (t.dir === 1 ? -1 : 1) as 1 | -1;
    this.assign.fill(null);
    this.markOf.fill(-1);
  }

  startBreak(kind: BreakKind): void {
    const s = this.s;
    s.phase = 'break';
    s.breakKind = kind;
    s.dead = null;
    this.ball.owner = -1;
    this.ball.flight = null;
    for (const t of this.teams) {
      t.ready = false;
      t.talkGiven = false;
      if (kind === 'preExtraTime') {
        t.subsAllowed = RULES.subs + RULES.extraSubs;
        t.windowsAllowed = RULES.windows + RULES.extraWindows;
      }
    }
    this.emit({ type: 'break', kind });
  }

  /** Called when both managers are ready or the host's break timer expires. */
  endBreak(): void {
    const s = this.s;
    if (s.phase !== 'break') return;
    const kind = s.breakKind;
    s.breakKind = null;
    s.phase = 'play';
    for (const t of this.teams) {
      for (const p of t.players) {
        if (!p.onPitch) continue;
        const rec = kind === 'halfTime' ? 0.05 + 0.08 * p.base.naturalFitness : 0.02 + 0.04 * p.base.naturalFitness;
        p.cond = Math.min(1, p.cond + rec);
        refreshEffective(this, p);
      }
      t.ready = false;
    }
    if (kind === 'halfTime') {
      this.nextPeriod(2);
      startKickoff(this, this.opp(this.firstKickoff), true);
    } else if (kind === 'preExtraTime') {
      this.nextPeriod(3);
      this.extraKickoff = this.rng.chance(0.5) ? 0 : 1;
      startKickoff(this, this.extraKickoff, true);
    } else if (kind === 'preShootout') {
      startShootout(this);
    }
  }

  finish(): void {
    const s = this.s;
    s.phase = 'ended';
    s.dead = null;
    this.ball.owner = -1;
    this.ball.flight = null;
    let winner: Side;
    if (s.score[0] !== s.score[1]) winner = s.score[0] > s.score[1] ? 0 : 1;
    else if (s.pens) winner = s.pens[0] > s.pens[1] ? 0 : 1;
    else winner = 0; // league mode draw: report home (unused in knockouts)
    s.winner = winner;
    this.emit({ type: 'fullTime', score: [...s.score] as [number, number], pens: s.pens ? ([...s.pens] as [number, number]) : undefined, winner });
    this.recordChecksum();
  }

  // ------------------------------------------------------------------ commands

  /** Apply a manager (seat 0/1) or system (-1) command. Returns an error string, or null on success. */
  command(seat: Seat | -1, cmd: MatchCommand | SystemCommand): string | null {
    this.commandLog.push({ tick: this.s.tick, seat, cmd: structuredClone(cmd) });
    if (seat === -1) {
      if (cmd.type === 'endBreak') {
        this.endBreak();
        return null;
      }
      return 'unknown system command';
    }
    return applyCommand(this, seat, cmd as MatchCommand);
  }

  // ------------------------------------------------------------------ outputs

  frame(): Frame {
    const p: number[] = new Array(44);
    for (let i = 0; i < 22; i++) {
      const pl = this.players[i]!;
      if (pl.onPitch) {
        p[i * 2] = r1(pl.x);
        p[i * 2 + 1] = r1(pl.y);
      } else {
        p[i * 2] = -1;
        p[i * 2 + 1] = -1;
      }
    }
    const b = this.ball;
    return { t: this.s.tick, c: r1(this.s.clock), b: [r1(b.x), r1(b.y), r1(b.z)], o: b.owner, p };
  }

  roster(): RosterEntry[] {
    return this.players.map((p) => ({
      idx: p.idx,
      playerId: p.onPitch ? p.def.id : null,
      number: p.def.number,
      name: shortNameOf(p.def),
      isGk: p.slot === 0,
    }));
  }

  publicState(): PublicMatchState {
    const s = this.s;
    return {
      tick: s.tick,
      clock: r1(s.clock),
      period: s.period,
      phase: s.phase,
      breakKind: s.breakKind,
      score: [...s.score] as [number, number],
      pens: s.pens ? ([...s.pens] as [number, number]) : null,
      stats: [{ ...this.teams[0].stats, xg: Math.round(this.teams[0].stats.xg * 100) / 100 }, { ...this.teams[1].stats, xg: Math.round(this.teams[1].stats.xg * 100) / 100 }],
      homeAttacksRight: this.teams[0].dir > 0,
      stoppageMinutes: s.stoppageAnnounced ? s.stoppage : 0,
      ready: [this.teams[0].ready, this.teams[1].ready],
    };
  }

  privateState(side: Side): PrivateTeamState {
    const t = this.teams[side];
    const ids = new Set<string>();
    const players: PrivateTeamState['players'] = [];
    for (const p of t.players) {
      ids.add(p.def.id);
      players.push({ id: p.def.id, condition: Math.round(p.cond * 100) / 100, morale: Math.round(p.morale * 10) / 10, yellow: p.yellow, sentOff: p.sentOff, onPitch: p.onPitch, rating: Math.round(p.st.rating * 10) / 10 });
    }
    for (const id of t.bench) if (!ids.has(id)) players.push({ id, condition: 1, morale: 0, yellow: false, sentOff: false, onPitch: false, rating: 0 });
    return {
      side,
      tactic: structuredClone(t.tactic),
      bench: [...t.bench],
      subsUsed: t.subsUsed,
      subsAllowed: t.subsAllowed,
      windowsUsed: t.windowsUsed,
      windowsAllowed: t.windowsAllowed,
      pendingSubs: t.pendingSubs.map((x) => ({ ...x })),
      subbedOff: [...t.subbedOff],
      players,
      shoutCooldownUntil: t.shoutCdUntil,
      activeShout: t.shout?.kind ?? null,
      teamTalkGiven: t.talkGiven,
      penaltyOrder: [...t.penaltyOrder],
    };
  }

  drainEvents(): MatchEvent[] {
    const ev = this.events;
    this.events = [];
    return ev;
  }

  // ------------------------------------------------------------------ determinism

  checksum(): number {
    const buf = new DataView(new ArrayBuffer(8));
    let h = 0x811c9dc5;
    const mix = (v: number) => {
      buf.setFloat64(0, v);
      for (let i = 0; i < 8; i++) {
        h ^= buf.getUint8(i);
        h = Math.imul(h, 0x01000193);
      }
    };
    mix(this.s.tick);
    mix(this.ball.x);
    mix(this.ball.y);
    mix(this.ball.z);
    mix(this.ball.owner);
    for (const p of this.players) {
      mix(p.x);
      mix(p.y);
      mix(p.cond);
      mix(p.morale);
    }
    mix(this.s.score[0]);
    mix(this.s.score[1]);
    for (const w of this.rng.state()) mix(w);
    return h >>> 0;
  }

  private recordChecksum(): void {
    const last = this.checksums[this.checksums.length - 1];
    if (last && last[0] === this.s.tick) return;
    this.checksums.push([this.s.tick, this.checksum()]);
  }

  /** Utility for restarts, used by play.ts when the ball goes dead. */
  dead(restart: Restart, delayTicks: number): void {
    setDead(this, restart, delayTicks);
  }
}
