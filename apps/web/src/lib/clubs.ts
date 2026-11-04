import { CLUBS, getClub } from '@touchline/data';
import { clubStrength } from '@touchline/engine';
import type { Club } from '@touchline/shared';

export { CLUBS, getClub };

const strength = new Map<string, number>();
for (const c of CLUBS) strength.set(c.id, clubStrength(c));
const values = [...strength.values()];
const lo = Math.min(...values);
const hi = Math.max(...values);

/** 1..5 in half steps, relative to the other clubs. */
export function stars(club: Club): number {
  const s = strength.get(club.id) ?? lo;
  if (hi - lo < 1e-6) return 3;
  return Math.round((1 + (4 * (s - lo)) / (hi - lo)) * 2) / 2;
}

export function starText(n: number): string {
  const full = Math.floor(n);
  return '★'.repeat(full) + (n - full >= 0.5 ? '½' : '') ;
}

export function clubPower(club: Club): number {
  return strength.get(club.id) ?? 0;
}
