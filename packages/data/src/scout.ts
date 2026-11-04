import type { FormationId, Instructions, Kit } from '@touchline/shared';
import type { ScoutTuple } from './gen';

/** Compact squad description used to (re)generate a club file. See tools/expand-squad.ts. */
export interface ScoutClub {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  country: string;
  pot: 1 | 2 | 3 | 4;
  kits: { home: Kit; away: Kit; gk: Kit };
  formation: FormationId;
  instructions?: Partial<Instructions>;
  notes?: string;
  /** Player id prefix, e.g. "rma". */
  prefix: string;
  players: ScoutTuple[];
}

export function scout(c: ScoutClub): ScoutClub {
  return c;
}

/** kit(shirt, trim, pattern, shorts, number) */
export function kit(shirt: string, trim: string, pattern: Kit['pattern'], shorts: string, number: string): Kit {
  return { shirt, trim, pattern, shorts, number };
}

export const FLAG_NEW = 'Reported summer-2026 arrival; not confirmed against an official club squad list.';
export const FLAG_LEAVE = 'May have left (or been loaned out) in the summer-2026 window; not confirmed.';
export const FLAG_LOAN = 'On loan / loan return reported for 2026-27; status not confirmed.';
