import type { Club } from '@touchline/shared';

/** Identity helper so club files get full type-checking and autocomplete in the editor. */
export function defineClub(club: Club): Club {
  return club;
}
