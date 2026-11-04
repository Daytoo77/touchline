/**
 * Balance report with the real clubs: favourite win rates by pot pairing, goals, shots and possession.
 *   npm run balance -- [matchesPerPairing=40]
 */
import { CLUBS } from '@touchline/data';
import { autoSheet, clubStrength, simulate } from '@touchline/engine';
import type { Club } from '@touchline/shared';

const N = Number(process.argv[2] ?? 40);
const byPot = (p: number) => CLUBS.filter((c) => c.pot === p);
const pairings: [number, number][] = [[1, 1], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4], [4, 4]];
let seed = 90_000;

console.log(`${N} knockouts per pairing; favourite = higher club strength\n`);
console.log('pairing   fav win%  fav won in 90%  extra time%  goals  shots/team  fav poss%  gap');
for (const [a, b] of pairings) {
  const A = byPot(a);
  const B = byPot(b);
  let fw = 0, fw90 = 0, et = 0, goals = 0, shots = 0, poss = 0, gap = 0;
  for (let i = 0; i < N; i++) {
    const h = A[(i * 7) % A.length]!;
    let w = B[(i * 5 + 3) % B.length]!;
    if (w.id === h.id) w = B[(i * 5 + 4) % B.length]!;
    const [home, away]: [Club, Club] = i % 2 ? [h, w] : [w, h];
    const sh = clubStrength(home), sa = clubStrength(away);
    const fav = sh >= sa ? 0 : 1;
    gap += Math.abs(sh - sa);
    const m = simulate(seed++, { club: home, sheet: autoSheet(home) }, { club: away, sheet: autoSheet(away) });
    const st = m.publicState().stats;
    if (m.s.winner === fav) fw++;
    // A match still in period 1–2 at the end was decided in normal time.
    if (m.s.period <= 2) {
      if (m.s.winner === fav) fw90++;
    } else et++;
    goals += m.s.score[0] + m.s.score[1];
    shots += (st[0].shots + st[1].shots) / 2;
    poss += st[fav].possessionTicks / (st[0].possessionTicks + st[1].possessionTicks);
  }
  const pct = (x: number) => ((100 * x) / N).toFixed(0).padStart(5);
  console.log(
    `P${a} v P${b}   ${pct(fw)}      ${pct(fw90)}          ${pct(et)}     ${(goals / N).toFixed(2)}     ${(shots / N).toFixed(1)}      ${pct(poss)}   ${(gap / N).toFixed(2)}`,
  );
}
