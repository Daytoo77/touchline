import { describe, expect, it } from 'vitest';
import { synthClub } from '@touchline/data';
import { autoSheet, simulate } from '../src';

/** Play n knockout matches between `strong` and `weak`, alternating home advantage. */
function series(n: number, bonus: number, seedBase: number) {
  const weak = synthClub('base-xi', 14);
  const strong = synthClub('base-xi', 14, { bonus });
  let wins = 0;
  let gf = 0;
  let ga = 0;
  let upsetsIn90 = 0;
  for (let i = 0; i < n; i++) {
    const strongHome = i % 2 === 0;
    const h = strongHome ? strong : weak;
    const a = strongHome ? weak : strong;
    const m = simulate(seedBase + i, { club: h, sheet: autoSheet(h) }, { club: a, sheet: autoSheet(a) });
    const s = strongHome ? 0 : 1;
    if (m.s.winner === s) wins++;
    gf += m.s.score[s];
    ga += m.s.score[1 - s];
    if (m.s.score[1 - s] > m.s.score[s]) upsetsIn90++;
  }
  return { wins, gf, ga, upsetsIn90 };
}

describe('a clearly stronger XI wins most matches, but not all', () => {
  it('+3 on every attribute: wins at least 140 of 200 knockouts, and loses some', () => {
    const r = series(200, 3, 50_000);
    console.log(`+3 XI: won ${r.wins}/200, goals ${r.gf}-${r.ga}, lost in open play ${r.upsetsIn90}`);
    expect(r.wins).toBeGreaterThanOrEqual(140);
    expect(r.wins).toBeLessThanOrEqual(194);
    expect(r.gf).toBeGreaterThan(r.ga * 1.5);
  });

  it('+1 is a smaller edge than +3 (strength is monotonic, upsets common)', () => {
    const r = series(100, 1, 60_000);
    console.log(`+1 XI: won ${r.wins}/100, goals ${r.gf}-${r.ga}`);
    expect(r.wins).toBeGreaterThanOrEqual(50);
    expect(r.wins).toBeLessThanOrEqual(88);
  });
});
