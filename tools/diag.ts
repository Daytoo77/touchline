import { simulate, autoSheet } from '@touchline/engine';
import { synthClub } from '@touchline/data';
const a = synthClub('alpha', 14), b = synthClub('bravo', 14);
const tot: Record<string, number> = {};
const N = Number(process.argv[2] ?? 6);
let condSum = 0, condN = 0;
for (let i = 0; i < N; i++) {
  const m = simulate(77 + i, { club: a, sheet: autoSheet(a) }, { club: b, sheet: autoSheet(b) }, { knockout: false });
  for (const [k, v] of Object.entries(m.dbg)) tot[k] = (tot[k] ?? 0) + v;
  for (const p of m.players) if (p.onPitch && p.slot>0) { condSum += p.cond; condN++; }
  const ev = m.events;
  for (const e of ev) { const k = 'ev:' + e.type; tot[k] = (tot[k] ?? 0) + 1; if (e.type==='card') { const kk='card:'+e.color+':'+e.reason; tot[kk]=(tot[kk]??0)+1; } }
}
for (const k of Object.keys(tot).sort()) console.log(k.padEnd(50), (tot[k]! / N).toFixed(1));
console.log('avg outfield condition at end', (condSum/condN).toFixed(2));
