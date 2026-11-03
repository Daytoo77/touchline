import type { Club } from '@touchline/shared';
import { CLUB_LIST } from './clubs';

export { defineClub } from './define';
export { generatePlayer, fromTuple, slugify, ARCHETYPES, type Archetype, type ScoutLine, type ScoutTuple } from './gen';
export { synthClub } from './synth';

/** All playable clubs, ordered by pot then name. */
export const CLUBS: Club[] = [...CLUB_LIST].sort((a, b) => a.pot - b.pot || a.name.localeCompare(b.name));

const BY_ID = new Map(CLUBS.map((c) => [c.id, c]));

export function getClub(id: string): Club | undefined {
  return BY_ID.get(id);
}
