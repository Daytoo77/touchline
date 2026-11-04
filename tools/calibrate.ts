/**
 * Calibration report: runs N matches and prints the averages that the balancing targets refer to.
 *   npm run calibrate -- [n=40] [mode=synth|clubs] [homeClub] [awayClub]
 */
import { simulate, autoSheet } from '@touchline/engine';
import { synthClub } from '@touchline/data';
import type { Club } from '@touchline/shared';

const n = Number(process.argv[2] ?? 40);
const mode = process.argv[3] ?? 'synth';

async function loadClubs(): Promise<Club[]> {
  const mod = await import('@touchline/data');
  return mod.CLUBS;
}

function stat(label: string, v: number, unit = ''): void {
  console.log(`${label.padEnd(28)} ${v.toFixed(2)}${unit}`);
}

async function main(): Promise<void> {
  let pairs: [Club, Club][] = [];
  if (mode === 'synth') {
    const a = synthClub('alpha', 14);
    const b = synthClub('bravo', 14);
    pairs = Array.from({ length: n }, () => [a, b]);
  } else {
    const clubs = await loadClubs();
    const h = clubs.find((c) => c.id === process.argv[4]) ?? clubs[0]!;
    const a = clubs.find((c) => c.id === process.argv[5]) ?? clubs[1]!;
    pairs = Array.from({ length: n }, () => [h, a]);
  }
  const acc = { goals: 0, shots: 0, onT: 0, xg: 0, poss0: 0, passes: 0, passOk: 0, corners: 0, fouls: 0, yel: 0, red: 0, off: 0, draws90: 0, homeWins: 0, et: 0, pens: 0, ms: 0, ticks: 0 };
  for (let i = 0; i < n; i++) {
    const [h, a] = pairs[i]!;
    const t0 = performance.now();
    const m = simulate(1000 + i, { club: h, sheet: autoSheet(h) }, { club: a, sheet: autoSheet(a) });
    acc.ms += performance.now() - t0;
    acc.ticks += m.s.tick;
    const st = m.publicState().stats;
    for (const t of st) {
      acc.goals += t.goals;
      acc.shots += t.shots;
      acc.onT += t.onTarget;
      acc.xg += t.xg;
      acc.passes += t.passes;
      acc.passOk += t.passesCompleted;
      acc.corners += t.corners;
      acc.fouls += t.fouls;
      acc.yel += t.yellows;
      acc.red += t.reds;
      acc.off += t.offsides;
    }
    acc.poss0 += st[0].possessionTicks / (st[0].possessionTicks + st[1].possessionTicks);
    if (m.s.period >= 3) acc.et++;
    if (m.s.pens) acc.pens++;
    if (m.s.winner === 0) acc.homeWins++;
  }
  console.log(`matches: ${n} (${mode})`);
  stat('ms per match', acc.ms / n);
  stat('goals / match', acc.goals / n);
  stat('shots / team', acc.shots / n / 2);
  stat('on target / team', acc.onT / n / 2);
  stat('xG / team', acc.xg / n / 2);
  stat('goals / xG', acc.goals / Math.max(acc.xg, 1e-9));
  stat('passes / team', acc.passes / n / 2);
  stat('pass completion', (100 * acc.passOk) / Math.max(1, acc.passes), '%');
  stat('corners / team', acc.corners / n / 2);
  stat('fouls / team', acc.fouls / n / 2);
  stat('yellows / team', acc.yel / n / 2);
  stat('reds / match', acc.red / n);
  stat('offsides / team', acc.off / n / 2);
  stat('home possession', (100 * acc.poss0) / n, '%');
  stat('extra time rate', (100 * acc.et) / n, '%');
  stat('shootout rate', (100 * acc.pens) / n, '%');
  stat('home win rate', (100 * acc.homeWins) / n, '%');
}

main();
