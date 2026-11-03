/** Verify a downloaded replay: re-simulates from seed + team sheets + command log and compares checksums. */
import { readFileSync } from 'node:fs';
import { runReplay, ENGINE_VERSION } from '@touchline/engine';
import { getClub } from '@touchline/data';
import type { ReplayFile } from '@touchline/shared';

const path = process.argv[2];
if (!path) {
  console.error('usage: npm run replay -- <replay.json>');
  process.exit(2);
}
const file = JSON.parse(readFileSync(path, 'utf8')) as ReplayFile;
if (file.engineVersion !== ENGINE_VERSION) console.warn(`warning: replay made with engine v${file.engineVersion}, this is v${ENGINE_VERSION}`);
const home = getClub(file.home.clubId);
const away = getClub(file.away.clubId);
if (!home || !away) {
  console.error('unknown club in replay');
  process.exit(2);
}
const r = runReplay(file, { home, away });
const [a, b] = r.match.s.score;
console.log(`${home.name} ${a}–${b} ${away.name}${r.match.s.pens ? ` (${r.match.s.pens[0]}–${r.match.s.pens[1]} pens)` : ''}`);
if (r.ok) console.log(`✓ replay verified: ${file.checksums.length} checksums match`);
else {
  console.log(`✗ mismatch at tick ${r.firstMismatch!.tick}`);
  process.exitCode = 1;
}
