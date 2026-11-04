import { FORMATIONS, RULES, isRoleValid, positionFit, rolesForPosition, type Club, type FormationId, type Tactic, type TeamSheet } from '@touchline/shared';
import { abilityAt, pickSetPieces } from '@touchline/engine';

/** A thing you can tap or drag on the lineup screen. */
export type Ref = { kind: 'slot'; i: number } | { kind: 'player'; id: string };

export function refKey(r: Ref): string {
  return r.kind === 'slot' ? `slot:${r.i}` : `player:${r.id}`;
}

export function parseRef(s: string | null | undefined): Ref | null {
  if (!s) return null;
  const [k, v] = s.split(':');
  if (k === 'slot') return { kind: 'slot', i: Number(v) };
  if (k === 'player' && v) return { kind: 'player', id: v };
  return null;
}

function clone(s: TeamSheet): TeamSheet {
  return structuredClone(s);
}

/** Ensure set-piece duties point at starters. */
export function fixSetPieces(sheet: TeamSheet, club: Club): TeamSheet {
  const xi = sheet.tactic.slots.map((s) => s.playerId);
  const sp = sheet.tactic.setPieces;
  const auto = pickSetPieces(club.players, xi);
  for (const k of Object.keys(sp) as (keyof typeof sp)[]) if (!xi.includes(sp[k])) sp[k] = auto[k];
  return sheet;
}

/**
 * Swap / move between two refs. Slot↔slot swaps positions; a bench or reserve player dropped on a slot
 * starts, and the displaced starter takes his place in the list he came from.
 */
export function applyMove(sheet0: TeamSheet, club: Club, a: Ref, b: Ref): TeamSheet {
  const sheet = clone(sheet0);
  const slots = sheet.tactic.slots;
  const inBench = (id: string) => sheet.bench.includes(id);
  if (a.kind === 'slot' && b.kind === 'slot') {
    const t = slots[a.i]!.playerId;
    slots[a.i]!.playerId = slots[b.i]!.playerId;
    slots[b.i]!.playerId = t;
  } else if (a.kind === 'player' && b.kind === 'player') {
    // Swap list membership (bench <-> reserves).
    const aB = inBench(a.id);
    const bB = inBench(b.id);
    if (aB !== bB) {
      sheet.bench = sheet.bench.map((x) => (x === a.id ? b.id : x === b.id ? a.id : x));
    }
  } else {
    const slotRef = (a.kind === 'slot' ? a : b) as { kind: 'slot'; i: number };
    const pRef = (a.kind === 'player' ? a : b) as { kind: 'player'; id: string };
    const startingIdx = slots.findIndex((s) => s.playerId === pRef.id);
    const out = slots[slotRef.i]!.playerId;
    if (startingIdx >= 0) {
      slots[startingIdx]!.playerId = out;
      slots[slotRef.i]!.playerId = pRef.id;
    } else {
      const wasBench = inBench(pRef.id);
      slots[slotRef.i]!.playerId = pRef.id;
      if (wasBench) sheet.bench = sheet.bench.map((x) => (x === pRef.id ? (out ?? '') : x)).filter(Boolean);
    }
  }
  return fixSetPieces(sheet, club);
}

export function toggleBench(sheet0: TeamSheet, id: string): TeamSheet {
  const sheet = clone(sheet0);
  if (sheet.bench.includes(id)) sheet.bench = sheet.bench.filter((x) => x !== id);
  else if (sheet.bench.length < RULES.maxBench) sheet.bench.push(id);
  return sheet;
}

/**
 * Change formation keeping exactly the same players, re-fitted to the new slots (every player is placed;
 * with fewer than eleven, the most advanced slots stay empty). Roles reset to the formation's defaults.
 */
export function changeFormation(tactic0: Tactic, players: Club['players'], formation: FormationId): Tactic {
  const tactic = structuredClone(tactic0);
  const ids = tactic.slots.map((s) => s.playerId).filter((x): x is string => !!x);
  const pool = players.filter((p) => ids.includes(p.id));
  const f = FORMATIONS[formation];
  const xi: (string | null)[] = new Array(11).fill(null);
  const left = new Set(pool.map((p) => p.id));
  // Keeper: the current one if possible, else the best available.
  const currentGk = tactic.slots[0]?.playerId;
  const gk = (currentGk && left.has(currentGk) ? pool.find((p) => p.id === currentGk) : undefined) ?? pool.slice().sort((a, b) => abilityAt(b, 'GK') - abilityAt(a, 'GK'))[0];
  if (gk) {
    xi[0] = gk.id;
    left.delete(gk.id);
  }
  // Outfield slots to fill: the most defensive ones first when short-handed.
  const order = f.slots.map((s, i) => ({ i, u: s.u })).filter((o) => o.i > 0).sort((a, b) => a.u - b.u);
  const keep = order.slice(0, left.size).map((o) => o.i);
  const pairs: { s: number; slot: number; id: string }[] = [];
  for (const slot of keep) for (const p of pool) if (left.has(p.id)) pairs.push({ s: abilityAt(p, f.slots[slot]!.pos), slot, id: p.id });
  pairs.sort((a, b) => b.s - a.s || a.slot - b.slot || (a.id < b.id ? -1 : 1));
  for (const pr of pairs) {
    if (xi[pr.slot] || !left.has(pr.id)) continue;
    xi[pr.slot] = pr.id;
    left.delete(pr.id);
  }
  tactic.formation = formation;
  tactic.slots = f.slots.map((s, i) => ({ playerId: xi[i] ?? null, role: s.role, duty: s.duty }));
  return tactic;
}

export function setRole(tactic0: Tactic, i: number, role: Tactic['slots'][number]['role'], duty?: Tactic['slots'][number]['duty']): Tactic {
  const tactic = structuredClone(tactic0);
  const pos = FORMATIONS[tactic.formation].slots[i]!.pos;
  const defs = rolesForPosition(pos);
  const def = defs.find((r) => r.id === role) ?? defs[0]!;
  const d = duty && def.duties.includes(duty) ? duty : def.duties.includes(tactic.slots[i]!.duty) ? tactic.slots[i]!.duty : def.duties[Math.min(1, def.duties.length - 1)]!;
  tactic.slots[i] = { ...tactic.slots[i]!, role: def.id, duty: d };
  if (!isRoleValid(def.id, d, pos)) tactic.slots[i]!.duty = def.duties[0]!;
  return tactic;
}

export function fitOf(club: Club, playerId: string | null, formation: FormationId, i: number): number {
  const p = club.players.find((q) => q.id === playerId);
  if (!p) return 0;
  return positionFit(p.positions, FORMATIONS[formation].slots[i]!.pos);
}

export function ratingAt(club: Club, playerId: string, formation: FormationId, i: number): number {
  const p = club.players.find((q) => q.id === playerId);
  if (!p) return 0;
  return abilityAt(p, FORMATIONS[formation].slots[i]!.pos);
}

/** Down to ten: move the most advanced player into an empty, more important slot (as the AI does). */
export function reshapeForTen(tactic0: Tactic): Tactic | null {
  const tactic = structuredClone(tactic0);
  const f = FORMATIONS[tactic.formation];
  const empty = tactic.slots.findIndex((s, i) => i > 0 && !s.playerId);
  if (empty < 0) return null;
  let adv = -1;
  for (let i = 1; i < 11; i++) {
    if (!tactic.slots[i]!.playerId) continue;
    if (adv < 0 || f.slots[i]!.u > f.slots[adv]!.u) adv = i;
  }
  if (adv < 0 || f.slots[adv]!.u <= f.slots[empty]!.u + 4) return null;
  tactic.slots[empty] = { ...tactic.slots[empty]!, playerId: tactic.slots[adv]!.playerId };
  tactic.slots[adv] = { ...tactic.slots[adv]!, playerId: null };
  return tactic;
}
