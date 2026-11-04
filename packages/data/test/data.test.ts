import { describe, expect, it } from 'vitest';
import { Club as ClubZ, sheetErrors } from '@touchline/shared';
import { autoSheet, clubStrength } from '@touchline/engine';
import { CLUBS } from '../src';

describe('club data', () => {
  it('has the 36 league-phase clubs, nine per pot', () => {
    expect(CLUBS).toHaveLength(36);
    for (const pot of [1, 2, 3, 4]) expect(CLUBS.filter((c) => c.pot === pot)).toHaveLength(9);
    expect(new Set(CLUBS.map((c) => c.id)).size).toBe(36);
  });

  it.each(CLUBS.map((c) => [c.name, c] as const))('%s: valid schema and a legal auto-picked team sheet', (_n, club) => {
    expect(ClubZ.safeParse(club).success).toBe(true);
    expect(sheetErrors(club, autoSheet(club))).toEqual([]);
    expect(club.players.length).toBeGreaterThanOrEqual(18);
  });

  it('no player is listed at two clubs', () => {
    const seen = new Map<string, string>();
    for (const c of CLUBS) {
      for (const p of c.players) {
        const key = p.name.toLowerCase();
        expect(seen.get(key), `${p.name} at ${seen.get(key)} and ${c.id}`).toBeUndefined();
        seen.set(key, c.id);
      }
    }
  });

  it('pot 1 is stronger on average than pot 4', () => {
    const avg = (pot: number) => {
      const cs = CLUBS.filter((c) => c.pot === pot);
      return cs.reduce((s, c) => s + clubStrength(c), 0) / cs.length;
    };
    expect(avg(1)).toBeGreaterThan(avg(2));
    expect(avg(2)).toBeGreaterThan(avg(4));
  });
});
