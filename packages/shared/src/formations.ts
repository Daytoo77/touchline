import type { Position } from './schema/player';
import type { Duty, RoleId } from './roles';

/**
 * Formation slots are expressed in the TEAM FRAME, for a neutral shape (ball at the centre spot):
 *   u = metres from the team's own goal line towards the opponent goal (0..105)
 *   v = metres from the team's LEFT touchline (0..68), looking towards the opponent goal.
 */
export interface FormationSlot {
  pos: Position;
  u: number;
  v: number;
  role: RoleId;
  duty: Duty;
}

export interface Formation {
  id: FormationId;
  name: string;
  slots: FormationSlot[]; // exactly 11, slot 0 is always the goalkeeper
}

export const FORMATION_IDS = [
  '4-4-2',
  '4-2-3-1',
  '4-3-3',
  '4-3-3-flat',
  '4-1-4-1',
  '4-4-1-1',
  '4-2-2-2',
  '4-3-1-2',
  '3-5-2',
  '3-4-3',
  '3-4-2-1',
  '5-3-2',
] as const;
export type FormationId = (typeof FORMATION_IDS)[number];

const GK: FormationSlot = { pos: 'GK', u: 4, v: 34, role: 'gk', duty: 'D' };
const back4: FormationSlot[] = [
  { pos: 'DL', u: 23, v: 7, role: 'fb', duty: 'S' },
  { pos: 'DC', u: 21, v: 26, role: 'cd', duty: 'D' },
  { pos: 'DC', u: 21, v: 42, role: 'cd', duty: 'D' },
  { pos: 'DR', u: 23, v: 61, role: 'fb', duty: 'S' },
];
const back3: FormationSlot[] = [
  { pos: 'DC', u: 22, v: 18, role: 'cd', duty: 'D' },
  { pos: 'DC', u: 20, v: 34, role: 'cd', duty: 'D' },
  { pos: 'DC', u: 22, v: 50, role: 'cd', duty: 'D' },
];

const F = (id: FormationId, name: string, slots: FormationSlot[]): Formation => ({ id, name, slots: [GK, ...slots] });

export const FORMATIONS: Record<FormationId, Formation> = {
  '4-4-2': F('4-4-2', '4-4-2', [
    ...back4,
    { pos: 'ML', u: 42, v: 8, role: 'wm', duty: 'S' },
    { pos: 'MC', u: 41, v: 26, role: 'cm', duty: 'D' },
    { pos: 'MC', u: 41, v: 42, role: 'b2b', duty: 'S' },
    { pos: 'MR', u: 42, v: 60, role: 'wm', duty: 'S' },
    { pos: 'ST', u: 62, v: 27, role: 'af', duty: 'A' },
    { pos: 'ST', u: 61, v: 41, role: 'dlf', duty: 'S' },
  ]),
  '4-2-3-1': F('4-2-3-1', '4-2-3-1', [
    ...back4,
    { pos: 'DM', u: 33, v: 27, role: 'dlp', duty: 'D' },
    { pos: 'DM', u: 33, v: 41, role: 'b2b', duty: 'S' },
    { pos: 'AML', u: 53, v: 10, role: 'if', duty: 'A' },
    { pos: 'AMC', u: 54, v: 34, role: 'am', duty: 'S' },
    { pos: 'AMR', u: 53, v: 58, role: 'w', duty: 'S' },
    { pos: 'ST', u: 64, v: 34, role: 'af', duty: 'A' },
  ]),
  '4-3-3': F('4-3-3', '4-3-3 (DM)', [
    ...back4,
    { pos: 'DM', u: 32, v: 34, role: 'dm', duty: 'D' },
    { pos: 'MC', u: 43, v: 22, role: 'mez', duty: 'S' },
    { pos: 'MC', u: 43, v: 46, role: 'cm', duty: 'S' },
    { pos: 'AML', u: 57, v: 9, role: 'if', duty: 'A' },
    { pos: 'AMR', u: 57, v: 59, role: 'w', duty: 'A' },
    { pos: 'ST', u: 64, v: 34, role: 'cf', duty: 'S' },
  ]),
  '4-3-3-flat': F('4-3-3-flat', '4-3-3 Flat', [
    ...back4,
    { pos: 'MC', u: 41, v: 20, role: 'cm', duty: 'S' },
    { pos: 'MC', u: 39, v: 34, role: 'dlp', duty: 'D' },
    { pos: 'MC', u: 41, v: 48, role: 'b2b', duty: 'S' },
    { pos: 'AML', u: 57, v: 9, role: 'if', duty: 'A' },
    { pos: 'AMR', u: 57, v: 59, role: 'w', duty: 'A' },
    { pos: 'ST', u: 64, v: 34, role: 'af', duty: 'A' },
  ]),
  '4-1-4-1': F('4-1-4-1', '4-1-4-1', [
    ...back4,
    { pos: 'DM', u: 31, v: 34, role: 'a', duty: 'D' },
    { pos: 'ML', u: 45, v: 9, role: 'w', duty: 'S' },
    { pos: 'MC', u: 44, v: 26, role: 'cm', duty: 'S' },
    { pos: 'MC', u: 44, v: 42, role: 'b2b', duty: 'S' },
    { pos: 'MR', u: 45, v: 59, role: 'w', duty: 'S' },
    { pos: 'ST', u: 64, v: 34, role: 'af', duty: 'A' },
  ]),
  '4-4-1-1': F('4-4-1-1', '4-4-1-1', [
    ...back4,
    { pos: 'ML', u: 42, v: 8, role: 'wm', duty: 'S' },
    { pos: 'MC', u: 40, v: 26, role: 'cm', duty: 'D' },
    { pos: 'MC', u: 40, v: 42, role: 'cm', duty: 'S' },
    { pos: 'MR', u: 42, v: 60, role: 'wm', duty: 'S' },
    { pos: 'AMC', u: 55, v: 34, role: 'ss', duty: 'A' },
    { pos: 'ST', u: 64, v: 34, role: 'tm', duty: 'S' },
  ]),
  '4-2-2-2': F('4-2-2-2', '4-2-2-2', [
    ...back4,
    { pos: 'DM', u: 33, v: 27, role: 'dm', duty: 'S' },
    { pos: 'DM', u: 33, v: 41, role: 'bwm', duty: 'D' },
    { pos: 'AMC', u: 53, v: 20, role: 'am', duty: 'S' },
    { pos: 'AMC', u: 53, v: 48, role: 'am', duty: 'A' },
    { pos: 'ST', u: 63, v: 27, role: 'af', duty: 'A' },
    { pos: 'ST', u: 63, v: 41, role: 'pf', duty: 'S' },
  ]),
  '4-3-1-2': F('4-3-1-2', '4-3-1-2 Diamond', [
    ...back4,
    { pos: 'DM', u: 32, v: 34, role: 'a', duty: 'D' },
    { pos: 'MC', u: 42, v: 21, role: 'car', duty: 'S' },
    { pos: 'MC', u: 42, v: 47, role: 'mez', duty: 'A' },
    { pos: 'AMC', u: 54, v: 34, role: 'ap', duty: 'A' },
    { pos: 'ST', u: 63, v: 27, role: 'af', duty: 'A' },
    { pos: 'ST', u: 62, v: 41, role: 'dlf', duty: 'S' },
  ]),
  '3-5-2': F('3-5-2', '3-5-2', [
    ...back3,
    { pos: 'WBL', u: 35, v: 6, role: 'wb', duty: 'S' },
    { pos: 'DM', u: 32, v: 34, role: 'dlp', duty: 'D' },
    { pos: 'MC', u: 43, v: 24, role: 'b2b', duty: 'S' },
    { pos: 'MC', u: 43, v: 44, role: 'mez', duty: 'A' },
    { pos: 'WBR', u: 35, v: 62, role: 'wb', duty: 'S' },
    { pos: 'ST', u: 63, v: 27, role: 'af', duty: 'A' },
    { pos: 'ST', u: 62, v: 41, role: 'tm', duty: 'S' },
  ]),
  '3-4-3': F('3-4-3', '3-4-3', [
    ...back3,
    { pos: 'WBL', u: 36, v: 6, role: 'wb', duty: 'A' },
    { pos: 'MC', u: 40, v: 27, role: 'dlp', duty: 'S' },
    { pos: 'MC', u: 40, v: 41, role: 'bwm', duty: 'D' },
    { pos: 'WBR', u: 36, v: 62, role: 'wb', duty: 'A' },
    { pos: 'AML', u: 57, v: 13, role: 'if', duty: 'A' },
    { pos: 'AMR', u: 57, v: 55, role: 'if', duty: 'S' },
    { pos: 'ST', u: 64, v: 34, role: 'cf', duty: 'A' },
  ]),
  '3-4-2-1': F('3-4-2-1', '3-4-2-1', [
    ...back3,
    { pos: 'WBL', u: 36, v: 6, role: 'wb', duty: 'S' },
    { pos: 'MC', u: 39, v: 27, role: 'dlp', duty: 'D' },
    { pos: 'MC', u: 39, v: 41, role: 'b2b', duty: 'S' },
    { pos: 'WBR', u: 36, v: 62, role: 'wb', duty: 'S' },
    { pos: 'AMC', u: 54, v: 23, role: 'ss', duty: 'A' },
    { pos: 'AMC', u: 54, v: 45, role: 'ap', duty: 'A' },
    { pos: 'ST', u: 64, v: 34, role: 'af', duty: 'A' },
  ]),
  '5-3-2': F('5-3-2', '5-3-2', [
    { pos: 'WBL', u: 27, v: 6, role: 'wb', duty: 'S' },
    ...back3,
    { pos: 'WBR', u: 27, v: 62, role: 'wb', duty: 'S' },
    { pos: 'MC', u: 40, v: 21, role: 'cm', duty: 'S' },
    { pos: 'MC', u: 38, v: 34, role: 'dlp', duty: 'D' },
    { pos: 'MC', u: 40, v: 47, role: 'b2b', duty: 'S' },
    { pos: 'ST', u: 62, v: 27, role: 'af', duty: 'A' },
    { pos: 'ST', u: 61, v: 41, role: 'tm', duty: 'S' },
  ]),
};

/** Familiarity of a player at position `slot` given his listed positions (first = best). 0.2 for outfielders in goal. */
export function positionFit(playerPositions: readonly Position[], slot: Position): number {
  const i = playerPositions.indexOf(slot);
  if (i === 0) return 1;
  if (i > 0) return 0.97;
  if (slot === 'GK' || playerPositions[0] === 'GK') return 0.2;
  let best = 0;
  for (const p of playerPositions) best = Math.max(best, POS_NEIGHBOUR[p]?.[slot] ?? 0);
  return best || 0.68;
}

/** How well a player natural at row-key position copes at column-key position (if not listed). */
const POS_NEIGHBOUR: Partial<Record<Position, Partial<Record<Position, number>>>> = {
  DL: { WBL: 0.95, DC: 0.85, ML: 0.85, DR: 0.84, WBR: 0.8 },
  DR: { WBR: 0.95, DC: 0.85, MR: 0.85, DL: 0.84, WBL: 0.8 },
  DC: { DM: 0.84, DL: 0.8, DR: 0.8 },
  WBL: { DL: 0.92, ML: 0.9, AML: 0.82 },
  WBR: { DR: 0.92, MR: 0.9, AMR: 0.82 },
  DM: { MC: 0.94, DC: 0.84 },
  MC: { DM: 0.92, AMC: 0.9, ML: 0.82, MR: 0.82 },
  ML: { AML: 0.93, WBL: 0.86, MC: 0.82, MR: 0.85, DL: 0.78 },
  MR: { AMR: 0.93, WBR: 0.86, MC: 0.82, ML: 0.85, DR: 0.78 },
  AMC: { MC: 0.9, ST: 0.88, AML: 0.86, AMR: 0.86 },
  AML: { ML: 0.92, AMR: 0.88, ST: 0.84, AMC: 0.86, WBL: 0.78 },
  AMR: { MR: 0.92, AML: 0.88, ST: 0.84, AMC: 0.86, WBR: 0.78 },
  ST: { AMC: 0.86, AML: 0.82, AMR: 0.82 },
};
