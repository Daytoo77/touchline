/**
 * Attribute estimator. Turns a short scouting line (level + archetype + a few signature traits) into a
 * full 1–20 attribute block. These are our own estimates, derived only from a player's level and role,
 * not copied from any game or ratings database. After generation the numbers live in the club files
 * and can be edited by hand.
 */
import {
  GOALKEEPING_KEYS,
  MENTAL_KEYS,
  PHYSICAL_KEYS,
  TECHNICAL_KEYS,
  type AttrKey,
  type Foot,
  type Player,
  type Position,
} from '@touchline/shared';

export const ARCHETYPES = [
  'gk', 'gkSweeper',
  'cbStopper', 'cbBallPlayer', 'cbAthletic',
  'fbAttacking', 'fbDefensive', 'fbInverted',
  'dmAnchor', 'dmPlaymaker', 'dmBallWinner',
  'cmBoxToBox', 'cmPlaymaker', 'cmMezzala',
  'amCreator', 'amShadow',
  'wingerClassic', 'wingerInverted', 'wideWorker',
  'stPoacher', 'stTarget', 'stComplete', 'stPacey', 'stFalse9', 'stPresser',
] as const;
export type Archetype = (typeof ARCHETYPES)[number];

type Group = 'gk' | 'cb' | 'fb' | 'dm' | 'cm' | 'am' | 'w' | 'st';
const GROUP_OF: Record<Archetype, Group> = {
  gk: 'gk', gkSweeper: 'gk',
  cbStopper: 'cb', cbBallPlayer: 'cb', cbAthletic: 'cb',
  fbAttacking: 'fb', fbDefensive: 'fb', fbInverted: 'fb',
  dmAnchor: 'dm', dmPlaymaker: 'dm', dmBallWinner: 'dm',
  cmBoxToBox: 'cm', cmPlaymaker: 'cm', cmMezzala: 'cm',
  amCreator: 'am', amShadow: 'am',
  wingerClassic: 'w', wingerInverted: 'w', wideWorker: 'w',
  stPoacher: 'st', stTarget: 'st', stComplete: 'st', stPacey: 'st', stFalse9: 'st', stPresser: 'st',
};

// Category offsets relative to the player's level.
const P = 2.5, S = 0.5, N = -1.5, W = -6, X = -11;

function tpl(spec: Partial<Record<number, AttrKey[]>>): Partial<Record<AttrKey, number>> {
  const out: Partial<Record<AttrKey, number>> = {};
  for (const [off, keys] of Object.entries(spec)) for (const k of keys!) out[k] = Number(off);
  return out;
}

const T: Record<Group, Partial<Record<AttrKey, number>>> = {
  gk: tpl({
    [P]: ['reflexes', 'handling', 'positioning', 'concentration', 'agility'],
    [S]: ['oneOnOnes', 'aerialReach', 'commandOfArea', 'communication', 'decisions', 'anticipation', 'composure', 'bravery', 'jumping', 'determination', 'naturalFitness'],
    [N]: ['kicking', 'throwing', 'rushingOut', 'balance', 'strength', 'firstTouch', 'teamwork'],
    [W]: ['passing', 'pace', 'acceleration', 'stamina', 'workRate', 'aggression', 'vision', 'technique'],
    [X]: ['corners', 'crossing', 'dribbling', 'finishing', 'freeKicks', 'heading', 'longShots', 'marking', 'tackling', 'flair', 'offTheBall', 'penalties'],
  }),
  cb: tpl({
    [P]: ['tackling', 'marking', 'positioning', 'heading', 'strength', 'jumping'],
    [S]: ['anticipation', 'concentration', 'bravery', 'decisions', 'aggression', 'determination', 'naturalFitness'],
    [N]: ['passing', 'composure', 'firstTouch', 'pace', 'acceleration', 'stamina', 'workRate', 'teamwork', 'balance', 'agility', 'technique'],
    [W]: ['crossing', 'dribbling', 'longShots', 'offTheBall', 'vision', 'flair', 'freeKicks', 'corners', 'penalties'],
    [X]: ['finishing'],
  }),
  fb: tpl({
    [P]: ['pace', 'stamina', 'tackling', 'crossing', 'acceleration', 'workRate'],
    [S]: ['marking', 'positioning', 'dribbling', 'teamwork', 'passing', 'anticipation', 'agility', 'concentration', 'naturalFitness', 'determination'],
    [N]: ['firstTouch', 'technique', 'decisions', 'composure', 'balance', 'strength', 'jumping', 'heading', 'offTheBall', 'bravery', 'aggression'],
    [W]: ['finishing', 'longShots', 'freeKicks', 'penalties', 'flair', 'vision', 'corners'],
  }),
  dm: tpl({
    [P]: ['tackling', 'positioning', 'anticipation', 'teamwork', 'passing', 'decisions'],
    [S]: ['marking', 'workRate', 'stamina', 'concentration', 'composure', 'strength', 'firstTouch', 'determination', 'naturalFitness'],
    [N]: ['technique', 'vision', 'aggression', 'bravery', 'balance', 'pace', 'acceleration', 'agility', 'jumping', 'heading', 'longShots'],
    [W]: ['dribbling', 'crossing', 'offTheBall', 'flair', 'finishing', 'corners', 'freeKicks', 'penalties'],
  }),
  cm: tpl({
    [P]: ['passing', 'decisions', 'firstTouch', 'technique', 'stamina', 'workRate', 'teamwork'],
    [S]: ['vision', 'composure', 'anticipation', 'offTheBall', 'tackling', 'dribbling', 'longShots', 'positioning', 'determination', 'naturalFitness'],
    [N]: ['balance', 'agility', 'pace', 'acceleration', 'strength', 'concentration', 'flair', 'marking', 'corners', 'freeKicks', 'crossing', 'aggression', 'bravery'],
    [W]: ['heading', 'jumping', 'finishing', 'penalties'],
  }),
  am: tpl({
    [P]: ['vision', 'passing', 'technique', 'firstTouch', 'flair', 'dribbling'],
    [S]: ['decisions', 'composure', 'offTheBall', 'agility', 'longShots', 'finishing', 'anticipation', 'balance', 'naturalFitness'],
    [N]: ['acceleration', 'pace', 'corners', 'freeKicks', 'penalties', 'crossing', 'teamwork', 'workRate', 'stamina', 'determination', 'concentration'],
    [W]: ['tackling', 'marking', 'positioning', 'heading', 'jumping', 'strength', 'aggression', 'bravery'],
  }),
  w: tpl({
    [P]: ['pace', 'acceleration', 'dribbling', 'crossing', 'agility', 'technique'],
    [S]: ['firstTouch', 'offTheBall', 'flair', 'balance', 'finishing', 'passing', 'stamina', 'workRate', 'naturalFitness'],
    [N]: ['decisions', 'composure', 'vision', 'anticipation', 'longShots', 'corners', 'freeKicks', 'teamwork', 'determination', 'penalties', 'concentration'],
    [W]: ['tackling', 'marking', 'positioning', 'heading', 'jumping', 'strength', 'aggression', 'bravery'],
  }),
  st: tpl({
    [P]: ['finishing', 'offTheBall', 'composure', 'anticipation', 'firstTouch'],
    [S]: ['pace', 'acceleration', 'technique', 'heading', 'strength', 'dribbling', 'balance', 'agility', 'jumping', 'determination', 'penalties', 'naturalFitness'],
    [N]: ['decisions', 'passing', 'longShots', 'flair', 'stamina', 'workRate', 'bravery', 'vision', 'concentration', 'teamwork'],
    [W]: ['tackling', 'marking', 'positioning', 'crossing', 'corners', 'freeKicks', 'aggression'],
  }),
};

const A: Record<Archetype, Partial<Record<AttrKey, number>>> = {
  gk: { reflexes: 1, oneOnOnes: 1, kicking: -1, rushingOut: -1 },
  gkSweeper: { rushingOut: 4, kicking: 2.5, passing: 5, firstTouch: 3, composure: 1, commandOfArea: 1, vision: 3 },
  cbStopper: { aggression: 2, strength: 1, heading: 1, passing: -2, composure: -1, pace: -1 },
  cbBallPlayer: { passing: 4, composure: 3, technique: 3, vision: 4, firstTouch: 3, decisions: 1, heading: -1 },
  cbAthletic: { pace: 4, acceleration: 4, agility: 2, anticipation: 1, heading: -1 },
  fbAttacking: { crossing: 2, dribbling: 2, offTheBall: 3, technique: 1, tackling: -2, marking: -2, positioning: -2 },
  fbDefensive: { tackling: 2, marking: 3, positioning: 3, crossing: -2, dribbling: -2, offTheBall: -2 },
  fbInverted: { passing: 3, technique: 2, decisions: 2, vision: 3, firstTouch: 2, crossing: -2, pace: -1 },
  dmAnchor: { positioning: 2, strength: 2, marking: 2, tackling: 1, passing: -2, vision: -3, dribbling: -2 },
  dmPlaymaker: { passing: 3, vision: 4, technique: 3, composure: 2, firstTouch: 2, tackling: -3, marking: -3, strength: -2 },
  dmBallWinner: { tackling: 3, aggression: 4, workRate: 3, stamina: 2, bravery: 2, vision: -3, technique: -2, composure: -1 },
  cmBoxToBox: { stamina: 3, workRate: 3, offTheBall: 2, tackling: 1, finishing: 4, vision: -1 },
  cmPlaymaker: { passing: 3, vision: 4, technique: 2, decisions: 2, composure: 2, tackling: -2, stamina: -1, workRate: -1 },
  cmMezzala: { dribbling: 3, offTheBall: 3, technique: 2, flair: 2, finishing: 5, longShots: 1, tackling: -2, positioning: -2 },
  amCreator: { vision: 2, passing: 2, flair: 2, decisions: 1 },
  amShadow: { offTheBall: 3, finishing: 3, anticipation: 2, composure: 2, vision: -2, passing: -2 },
  wingerClassic: { crossing: 2, pace: 1, acceleration: 1, dribbling: 1, finishing: -2, longShots: -1 },
  wingerInverted: { finishing: 3, longShots: 2, dribbling: 2, flair: 2, crossing: -3, composure: 1 },
  wideWorker: { workRate: 4, stamina: 4, teamwork: 3, tackling: 6, positioning: 5, marking: 5, flair: -2, dribbling: -2 },
  stPoacher: { finishing: 2, offTheBall: 2, anticipation: 2, composure: 1, passing: -3, vision: -3, workRate: -2, stamina: -2 },
  stTarget: { heading: 4, strength: 4, jumping: 3, bravery: 2, pace: -3, acceleration: -3, dribbling: -3, agility: -3 },
  stComplete: { passing: 2, technique: 2, strength: 2, vision: 2, decisions: 2, heading: 1 },
  stPacey: { pace: 3, acceleration: 4, agility: 1, heading: -3, strength: -2 },
  stFalse9: { passing: 4, vision: 5, technique: 3, dribbling: 2, flair: 2, decisions: 2, heading: -3, strength: -2, finishing: -1 },
  stPresser: { workRate: 5, stamina: 4, aggression: 3, teamwork: 3, determination: 2, technique: -1, composure: -1 },
};

function ageAdj(age: number, k: AttrKey): number {
  const phys = k === 'pace' || k === 'acceleration' || k === 'agility' || k === 'stamina' || k === 'naturalFitness';
  if (age <= 19) {
    if (k === 'composure' || k === 'decisions') return -2;
    if (k === 'positioning' || k === 'concentration' || k === 'anticipation' || k === 'strength') return -1;
    if (k === 'leadership') return -4;
    return 0;
  }
  if (age <= 22) {
    if (k === 'composure' || k === 'decisions') return -1;
    if (k === 'leadership') return -3;
    return 0;
  }
  if (age <= 28) return k === 'leadership' ? -1 : 0;
  if (age <= 30) return phys ? -0.5 : k === 'leadership' ? 1 : 0;
  if (age <= 32) return phys ? -1.5 : k === 'decisions' || k === 'positioning' ? 1 : k === 'leadership' ? 2 : 0;
  return phys ? -3 : k === 'decisions' || k === 'composure' || k === 'positioning' ? 1 : k === 'leadership' ? 3 : 0;
}

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic noise in {-1, 0, +1} (25% / 50% / 25%). */
function noise(id: string, k: string): number {
  const r = hash(`${id}:${k}`) % 4;
  return r === 0 ? -1 : r === 3 ? 1 : 0;
}

export interface ScoutLine {
  number: number;
  name: string;
  shortName?: string;
  age: number;
  nationality: string;
  positions: Position[];
  foot: Foot;
  /** Overall level on the 1–20 scale (e.g. 17 = world class, 14 = solid UCL starter, 11 = squad player at a small club). */
  level: number;
  archetype: Archetype;
  /** Explicit values that replace generated ones. */
  set?: Partial<Record<AttrKey, number>>;
  flag?: string;
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .replace(/ł/g, 'l')
    .replace(/đ/g, 'd')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generatePlayer(prefix: string, line: ScoutLine): Player {
  const id = `${prefix}-${slugify(line.name)}`;
  const g = GROUP_OF[line.archetype];
  const tmpl = T[g];
  const arch = A[line.archetype];
  const val = (k: AttrKey): number => {
    if (line.set?.[k] !== undefined) return line.set[k]!;
    const base = line.level + (tmpl[k] ?? N) + (arch[k] ?? 0) + ageAdj(line.age, k) + noise(id, k);
    let v = Math.round(base);
    if (k === 'leadership') v = Math.round(line.level - 4 + ageAdj(line.age, k) + noise(id, k) * 2);
    return Math.max(1, Math.min(20, v));
  };
  const block = <K extends AttrKey>(keys: readonly K[]) => Object.fromEntries(keys.map((k) => [k, val(k)])) as Record<K, number>;
  const p: Player = {
    id,
    name: line.name,
    ...(line.shortName ? { shortName: line.shortName } : {}),
    number: line.number,
    age: line.age,
    nationality: line.nationality,
    positions: line.positions,
    foot: line.foot,
    technical: block(TECHNICAL_KEYS),
    mental: block(MENTAL_KEYS),
    physical: block(PHYSICAL_KEYS),
    ...(g === 'gk' ? { goalkeeping: block(GOALKEEPING_KEYS) } : {}),
    ...(line.flag ? { flag: line.flag } : {}),
  };
  return p;
}

/** Compact scouting tuple: [number, name, age, nat, 'POS,POS', foot, level, archetype, set?, flag?, shortName?] */
export type ScoutTuple = [number, string, number, string, string, Foot, number, Archetype, Partial<Record<AttrKey, number>>?, string?, string?];

export function fromTuple(t: ScoutTuple): ScoutLine {
  const [number, name, age, nationality, pos, foot, level, archetype, set, flag, shortName] = t;
  return { number, name, shortName, age, nationality, positions: pos.split(',').map((s) => s.trim()) as Position[], foot, level, archetype, set, flag: flag || undefined };
}
