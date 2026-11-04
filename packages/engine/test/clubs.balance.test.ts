import { describe, expect, it } from 'vitest';
import { CLUBS } from '@touchline/data';
import { autoSheet, clubStrength, simulate } from '../src';

describe('real clubs: stronger sides usually win, upsets still happen', () => {
  it('pot 1 beats pot 4 in most of 100 one-off finals, but not all', () => {
    const p1 = CLUBS.filter((c) => c.pot === 1);
    const p4 = CLUBS.filter((c) => c.pot === 4);
    let favWins = 0;
    for (let i = 0; i < 100; i++) {
      const a = p1[i % p1.length]!;
      const b = p4[(i * 4 + 1) % p4.length]!;
      const [home, away] = i % 2 ? [a, b] : [b, a];
      const fav = clubStrength(home) >= clubStrength(away) ? 0 : 1;
      const m = simulate(70_000 + i, { club: home, sheet: autoSheet(home) }, { club: away, sheet: autoSheet(away) });
      if (m.s.winner === fav) favWins++;
    }
    console.log(`pot 1 v pot 4: favourite won ${favWins}/100`);
    expect(favWins).toBeGreaterThanOrEqual(65);
    expect(favWins).toBeLessThanOrEqual(97);
  });
});
