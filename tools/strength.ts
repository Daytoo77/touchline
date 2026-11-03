import { simulate, autoSheet } from '@touchline/engine';
import { synthClub } from '@touchline/data';
const bonus = Number(process.argv[2] ?? 3);
const N = Number(process.argv[3] ?? 40);
const base = synthClub('base', 14);
const strong = synthClub('base', 14, { bonus });
let wins = 0;
const g = [0, 0];
for (let i = 0; i < N; i++) {
  const strongHome = i % 2 === 0;
  const h = strongHome ? strong : base, a = strongHome ? base : strong;
  const m = simulate(7000 + i, { club: h, sheet: autoSheet(h) }, { club: a, sheet: autoSheet(a) });
  const sSide = strongHome ? 0 : 1;
  if (m.s.winner === sSide) wins++;
  g[0] += m.s.score[sSide]; g[1] += m.s.score[1 - sSide];
}
console.log(`bonus +${bonus}: strong won ${wins}/${N}; goals strong ${g[0]} weak ${g[1]}`);
