import type { ReplayFile } from '@touchline/shared';
import { AiManager } from './ai/manager';
import { ENGINE_VERSION, Match, type MatchOptions, type TeamInput } from './match';

export interface SimOptions extends MatchOptions {
  /** Which seats the built-in AI manages (default both). */
  ai?: [boolean, boolean];
  /** Safety cap on ticks. */
  maxTicks?: number;
}

/** Run a whole match headless as fast as possible. */
export function simulate(seed: number, home: TeamInput, away: TeamInput, opts: SimOptions = {}): Match {
  const m = new Match(seed, home, away, opts);
  const aiOn = opts.ai ?? [true, true];
  const ais = [aiOn[0] ? new AiManager(0, seed) : null, aiOn[1] ? new AiManager(1, seed) : null];
  const max = opts.maxTicks ?? 60_000;
  let guard = 0;
  while (!m.isOver() && m.s.tick < max) {
    for (const ai of ais) if (ai) for (const cmd of ai.update(m)) m.command(ai.side, cmd);
    if (m.s.phase === 'break') {
      // Seats without an AI never confirm: end the break as a host timer would.
      m.command(-1, { type: 'endBreak' });
      if (++guard > 10) throw new Error('stuck in break');
      continue;
    }
    guard = 0;
    m.step();
  }
  return m;
}

export function makeReplay(m: Match): ReplayFile {
  return {
    format: 'touchline-replay',
    engineVersion: ENGINE_VERSION,
    seed: m.seed,
    home: m.sources[0].sheet,
    away: m.sources[1].sheet,
    commands: m.commandLog.map((c) => structuredClone(c)),
    checksums: m.checksums.map((c) => [c[0], c[1]] as [number, number]),
    result: { score: [...m.s.score] as [number, number], pens: m.s.pens ? ([...m.s.pens] as [number, number]) : null, winner: m.s.winner ?? 0 },
  };
}

export interface ReplayResult {
  match: Match;
  ok: boolean;
  firstMismatch: { tick: number; expected: number; got: number } | null;
}

/** Re-run a replay from seed + team sheets + command log, and verify every checksum. */
export function runReplay(file: ReplayFile, clubs: { home: TeamInput['club']; away: TeamInput['club'] }, opts: MatchOptions = {}): ReplayResult {
  const m = new Match(file.seed, { club: clubs.home, sheet: file.home }, { club: clubs.away, sheet: file.away }, opts);
  const cmds = file.commands;
  let i = 0;
  let spins = 0;
  while (!m.isOver()) {
    while (i < cmds.length && cmds[i]!.tick <= m.s.tick) {
      const c = cmds[i]!;
      m.command(c.seat, c.cmd);
      i++;
    }
    if (m.s.phase === 'break') {
      if (++spins > 3) throw new Error(`Replay stuck in a break at tick ${m.s.tick}: command log is incomplete.`);
      continue;
    }
    spins = 0;
    m.step();
    if (m.s.tick > 100_000) break;
  }
  const got = new Map(m.checksums.map(([t, h]) => [t, h]));
  let firstMismatch: ReplayResult['firstMismatch'] = null;
  for (const [t, h] of file.checksums) {
    const g = got.get(t);
    if (g !== h) {
      firstMismatch = { tick: t, expected: h, got: g ?? -1 };
      break;
    }
  }
  return { match: m, ok: firstMismatch === null, firstMismatch };
}
