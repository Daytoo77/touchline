import type { AttrKey, Player, Position } from '@touchline/shared';
import { GOALKEEPING_KEYS, MENTAL_KEYS, PHYSICAL_KEYS, TECHNICAL_KEYS, positionFit } from '@touchline/shared';

export const ALL_KEYS: readonly AttrKey[] = Object.freeze( [...TECHNICAL_KEYS, ...MENTAL_KEYS, ...PHYSICAL_KEYS, ...GOALKEEPING_KEYS]);

/** Raw attribute value 1..20 (goalkeeping defaults to 1 for outfielders). */
export function raw(p: Player, k: AttrKey): number {
  const t = p.technical as Record<string, number>;
  if (k in t) return t[k]!;
  const m = p.mental as Record<string, number>;
  if (k in m) return m[k]!;
  const ph = p.physical as Record<string, number>;
  if (k in ph) return ph[k]!;
  const g = p.goalkeeping as Record<string, number> | undefined;
  return g?.[k] ?? 1;
}

/** Normalised 0..1 copy of every attribute. */
export type Norm = Record<AttrKey, number>;

/**
 * How strongly attribute differences act inside the engine. 1 = raw 1–20 scale mapped to 0..1; lower values
 * compress differences around a typical Champions League level (≈14), which keeps upsets possible.
 */
export const ATTR_GAIN = 0.6;
const PIVOT = 13 / 19;

export function normalise(p: Player): Norm {
  const out = {} as Norm;
  for (const k of ALL_KEYS) {
    const n = (raw(p, k) - 1) / 19;
    out[k] = PIVOT + (n - PIVOT) * ATTR_GAIN;
  }
  return out;
}

type Weights = Partial<Record<AttrKey, number>>;

const W_GK: Weights = { reflexes: 0.2, handling: 0.12, oneOnOnes: 0.12, aerialReach: 0.1, commandOfArea: 0.1, positioning: 0.1, kicking: 0.06, rushingOut: 0.05, communication: 0.05, concentration: 0.05, decisions: 0.05 };
const W_DC: Weights = { tackling: 0.13, marking: 0.13, positioning: 0.13, heading: 0.1, jumping: 0.08, strength: 0.08, anticipation: 0.08, concentration: 0.07, decisions: 0.06, pace: 0.07, bravery: 0.04, composure: 0.03 };
const W_FB: Weights = { tackling: 0.1, marking: 0.08, positioning: 0.08, pace: 0.1, acceleration: 0.07, stamina: 0.08, crossing: 0.09, workRate: 0.07, dribbling: 0.06, passing: 0.07, decisions: 0.05, teamwork: 0.05, anticipation: 0.05, technique: 0.05 };
const W_DM: Weights = { tackling: 0.12, positioning: 0.12, anticipation: 0.1, passing: 0.1, decisions: 0.1, marking: 0.07, teamwork: 0.07, workRate: 0.06, stamina: 0.06, composure: 0.06, strength: 0.07, concentration: 0.07 };
const W_MC: Weights = { passing: 0.13, decisions: 0.1, vision: 0.09, firstTouch: 0.08, technique: 0.08, stamina: 0.08, workRate: 0.07, teamwork: 0.07, anticipation: 0.06, composure: 0.07, tackling: 0.06, offTheBall: 0.05, dribbling: 0.06 };
const W_W: Weights = { dribbling: 0.12, pace: 0.1, acceleration: 0.1, crossing: 0.08, technique: 0.08, firstTouch: 0.07, passing: 0.06, offTheBall: 0.08, finishing: 0.07, flair: 0.06, agility: 0.06, decisions: 0.05, vision: 0.05, workRate: 0.02 };
const W_AM: Weights = { passing: 0.1, vision: 0.12, technique: 0.1, firstTouch: 0.09, decisions: 0.09, dribbling: 0.09, offTheBall: 0.08, composure: 0.07, flair: 0.06, finishing: 0.07, longShots: 0.06, agility: 0.04, anticipation: 0.03 };
const W_ST: Weights = { finishing: 0.17, offTheBall: 0.1, composure: 0.09, firstTouch: 0.08, anticipation: 0.08, pace: 0.07, acceleration: 0.08, heading: 0.07, strength: 0.06, technique: 0.06, dribbling: 0.05, jumping: 0.04, decisions: 0.05 };

const WEIGHTS: Record<Position, Weights> = {
  GK: W_GK,
  DC: W_DC,
  DL: W_FB,
  DR: W_FB,
  WBL: W_FB,
  WBR: W_FB,
  DM: W_DM,
  MC: W_MC,
  ML: W_W,
  MR: W_W,
  AML: W_W,
  AMR: W_W,
  AMC: W_AM,
  ST: W_ST,
};

/** Weighted ability for a position on the 1..20 scale, before familiarity. */
export function rawAbilityAt(p: Player, pos: Position): number {
  const w = WEIGHTS[pos];
  let s = 0;
  let tw = 0;
  for (const k in w) {
    const wk = w[k as AttrKey]!;
    s += raw(p, k as AttrKey) * wk;
    tw += wk;
  }
  return s / tw;
}

/** Ability at a position including the familiarity penalty, 1..20 scale. */
export function abilityAt(p: Player, pos: Position): number {
  return rawAbilityAt(p, pos) * positionFit(p.positions, pos);
}

/** Best ability over the player's listed positions. */
export function bestAbility(p: Player): number {
  let best = 0;
  for (const pos of p.positions) best = Math.max(best, rawAbilityAt(p, pos));
  return best;
}
