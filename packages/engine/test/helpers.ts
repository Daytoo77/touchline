import type { Club, MatchCommand, ReplayFile } from '@touchline/shared';
import { synthClub } from '@touchline/data';
import { AiManager, Match, autoSheet, makeReplay } from '../src';

export const HOME = synthClub('home-fc', 14);
export const AWAY = synthClub('away-fc', 14);

export function inputs(home: Club = HOME, away: Club = AWAY) {
  return { home: { club: home, sheet: autoSheet(home) }, away: { club: away, sheet: autoSheet(away) } };
}

/**
 * A scripted "human" on seat 0 (formation change, shout, subs, team talk, penalty order) and the AI on seat 1.
 * Exercises every command type so determinism covers the whole command path.
 */
export function runScripted(seed: number, home: Club = HOME, away: Club = AWAY): { m: Match; replay: ReplayFile } {
  const { home: h, away: a } = inputs(home, away);
  const m = new Match(seed, h, a);
  const ai = new AiManager(1, seed);
  let subsDone = 0;
  let didTactic = false;
  let didShout = false;
  let breakSeen = '';
  while (!m.isOver() && m.s.tick < 60_000) {
    for (const c of ai.update(m)) m.command(1, c);
    const t = m.teams[0];
    if (m.s.phase === 'break') {
      const key = `${m.s.breakKind}${m.s.tick}`;
      if (breakSeen !== key) {
        breakSeen = key;
        if (m.s.breakKind === 'preShootout') {
          m.command(0, { type: 'penaltyOrder', order: t.players.filter((p) => p.onPitch).map((p) => p.def.id).reverse() });
        } else {
          m.command(0, { type: 'teamTalk', tone: 'encourage' });
          if (m.s.breakKind === 'halfTime' && t.bench.length) {
            const out = t.players.find((p) => p.onPitch && p.slot === 9)!;
            m.command(0, { type: 'sub', out: out.def.id, in: t.bench[t.bench.length - 1]! });
          }
        }
        m.command(0, { type: 'ready' });
      }
      if (m.s.phase === 'break') m.command(-1, { type: 'endBreak' });
      continue;
    }
    if (!didTactic && m.s.tick >= 3000) {
      didTactic = true;
      const tac = structuredClone(t.tactic);
      tac.instructions.mentality = 1;
      tac.instructions.pressing = 1;
      tac.instructions.width = 1;
      m.command(0, { type: 'tactic', tactic: tac });
    }
    if (!didShout && m.s.tick >= 6000 && m.s.phase === 'play') {
      didShout = true;
      m.command(0, { type: 'shout', shout: 'demandMore' } as MatchCommand);
    }
    if (subsDone < 2 && m.s.tick >= 18_000 + subsDone * 2500 && t.pendingSubs.length === 0) {
      const out = t.players.filter((p) => p.onPitch && p.slot > 0).sort((x, y) => x.cond - y.cond)[0];
      const inn = t.bench.find((id) => !t.club.players.find((p) => p.id === id)!.positions.includes('GK'));
      if (out && inn) m.command(0, { type: 'sub', out: out.def.id, in: inn });
      subsDone++;
    }
    m.step();
  }
  return { m, replay: makeReplay(m) };
}

/** Every event and the final state reduced to a comparable string. */
export function fingerprint(m: Match): string {
  return JSON.stringify({ score: m.s.score, pens: m.s.pens, tick: m.s.tick, winner: m.s.winner, checksums: m.checksums, stats: m.publicState().stats });
}
