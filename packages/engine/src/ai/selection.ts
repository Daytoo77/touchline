import {
  DEFAULT_INSTRUCTIONS,
  FORMATIONS,
  RULES,
  type Club,
  type FormationId,
  type Instructions,
  type Player,
  type Tactic,
  type TacticSlot,
  type TeamSheet,
} from '@touchline/shared';
import { abilityAt, bestAbility, raw } from '../ability';
import type { TeamRt } from '../types';

/**
 * Pick the strongest XI for a formation: greedy global assignment of the best (player, slot) pairs by
 * ability × familiarity, goalkeeper slot first.
 */
export function pickXI(players: readonly Player[], formationId: FormationId, exclude: ReadonlySet<string> = new Set()): (string | null)[] {
  const f = FORMATIONS[formationId];
  const pool = players.filter((p) => !exclude.has(p.id));
  const result: (string | null)[] = new Array(11).fill(null);
  const used = new Set<string>();
  // Keeper first.
  const gks = pool.filter((p) => p.positions[0] === 'GK').sort((a, b) => abilityAt(b, 'GK') - abilityAt(a, 'GK'));
  const gk = gks[0] ?? pool.slice().sort((a, b) => abilityAt(b, 'GK') - abilityAt(a, 'GK'))[0];
  if (gk) {
    result[0] = gk.id;
    used.add(gk.id);
  }
  const pairs: { s: number; slot: number; id: string }[] = [];
  for (let slot = 1; slot < 11; slot++) {
    const pos = f.slots[slot]!.pos;
    for (const p of pool) {
      if (p.positions[0] === 'GK') continue;
      pairs.push({ s: abilityAt(p, pos), slot, id: p.id });
    }
  }
  pairs.sort((a, b) => b.s - a.s || a.slot - b.slot || (a.id < b.id ? -1 : 1));
  for (const pr of pairs) {
    if (result[pr.slot] || used.has(pr.id)) continue;
    result[pr.slot] = pr.id;
    used.add(pr.id);
  }
  return result;
}

export function pickBench(players: readonly Player[], xi: readonly (string | null)[]): string[] {
  const inXi = new Set(xi.filter(Boolean) as string[]);
  const rest = players.filter((p) => !inXi.has(p.id)).sort((a, b) => bestAbility(b) - bestAbility(a));
  const bench: string[] = [];
  const gk = rest.find((p) => p.positions[0] === 'GK');
  if (gk) bench.push(gk.id);
  for (const p of rest) {
    if (bench.length >= RULES.maxBench) break;
    if (!bench.includes(p.id)) bench.push(p.id);
  }
  return bench;
}

export function pickSetPieces(players: readonly Player[], xi: readonly (string | null)[]): Tactic['setPieces'] {
  const on = xi.map((id) => players.find((p) => p.id === id)).filter((p): p is Player => !!p);
  const outfield = on.filter((p) => p.positions[0] !== 'GK');
  const best = (list: Player[], f: (p: Player) => number) => list.reduce((a, b) => (f(b) > f(a) ? b : a)).id;
  const corners = outfield.slice().sort((a, b) => raw(b, 'corners') - raw(a, 'corners'));
  const rightFooted = corners.find((p) => p.foot !== 'L') ?? corners[0]!;
  const leftFooted = corners.find((p) => p.foot !== 'R') ?? corners[0]!;
  return {
    captain: best(on, (p) => raw(p, 'leadership') * 2 + raw(p, 'determination') + p.age / 4),
    penalty: best(outfield, (p) => raw(p, 'penalties') * 0.7 + raw(p, 'composure') * 0.3),
    freeKick: best(outfield, (p) => raw(p, 'freeKicks')),
    // In-swinging deliveries: right-footer from the left, left-footer from the right.
    cornerLeft: rightFooted.id,
    cornerRight: leftFooted.id,
  };
}

/** Full auto-picked team sheet using the club's preferred formation and instructions. */
export function autoSheet(club: Club, formationId?: FormationId, instructions?: Instructions): TeamSheet {
  const fid = formationId ?? club.defaultTactic.formation;
  const f = FORMATIONS[fid];
  const xi = pickXI(club.players, fid);
  const roles = fid === club.defaultTactic.formation ? club.defaultTactic.roles : undefined;
  const slots: TacticSlot[] = f.slots.map((s, i) => ({
    playerId: xi[i] ?? null,
    role: roles?.[i]?.role ?? s.role,
    duty: roles?.[i]?.duty ?? s.duty,
  }));
  return {
    clubId: club.id,
    tactic: {
      formation: fid,
      slots,
      instructions: { ...(instructions ?? club.defaultTactic.instructions ?? DEFAULT_INSTRUCTIONS) },
      setPieces: pickSetPieces(club.players, xi),
    },
    bench: pickBench(club.players, xi),
  };
}

/** Average ability of the XI in its slots (1..20 scale). */
export function teamStrength(t: TeamRt): number {
  let s = 0;
  let n = 0;
  for (const p of t.players) {
    if (!p.onPitch) continue;
    s += abilityAt(p.def, t.formation.slots[p.slot]!.pos);
    n++;
  }
  return n ? s / n : 0;
}

/** Club strength from its auto-picked XI (for the club picker's stars). */
export function clubStrength(club: Club): number {
  const sheet = autoSheet(club);
  const f = FORMATIONS[sheet.tactic.formation];
  let s = 0;
  sheet.tactic.slots.forEach((sl, i) => {
    const p = club.players.find((q) => q.id === sl.playerId);
    if (p) s += abilityAt(p, f.slots[i]!.pos);
  });
  return s / 11;
}
