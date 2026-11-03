import { FORMATIONS, RULES, isRoleValid, positionFit, rolesForPosition, type Club, type FormationId, type Tactic, type TeamSheet } from '@touchline/shared';
import { abilityAt, pickSetPieces, pickXI } from '@touchline/engine';

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

/** Change formation keeping the same XI, re-fitted to the new slots; roles reset to the formation's defaults. */
export function changeFormation(tactic0: Tactic, players: Club['players'], formation: FormationId): Tactic {
  const tactic = structuredClone(tactic0);
  const ids = tactic.slots.map((s) => s.playerId).filter((x): x is string => !!x);
  const pool = players.filter((p) => ids.includes(p.id));
  const empty = 11 - ids.length;
  let xi = pickXI(pool, formation);
  // With fewer than 11 (red card), leave the most advanced slots empty.
  if (empty > 0) {
    const f = FORMATIONS[formation];
    const order = f.slots.map((s, i) => ({ i, u: s.u })).sort((a, b) => b.u - a.u);
    const keep = new Set(order.slice(empty).map((o) => o.i));
    const xi2 = pickXI(pool, formation);
    xi = xi2.map((id, i) => (keep.has(i) ? id : null));
    // Re-fit the dropped players into the kept slots.
    const placed = new Set(xi.filter(Boolean) as string[]);
    for (const p of pool) {
      if (placed.has(p.id)) continue;
      const free = xi.findIndex((x, i) => x === null && keep.has(i));
      if (free >= 0) {
        xi[free] = p.id;
        placed.add(p.id);
      }
    }
  }
  const f = FORMATIONS[formation];
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
