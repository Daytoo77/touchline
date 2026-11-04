import { simulate, autoSheet } from '@touchline/engine';
import { synthClub } from '@touchline/data';
const a = synthClub('alpha', 14), b = synthClub('bravo', 14);
const t0 = performance.now();
for (let i = 0; i < 6; i++) simulate(300 + i, { club: a, sheet: autoSheet(a) }, { club: b, sheet: autoSheet(b) }, { knockout: false });
console.log('ms/match', ((performance.now() - t0) / 6).toFixed(0));
