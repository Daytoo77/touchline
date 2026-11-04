/** Validate every club file against the typed schema and print a squad summary. `npm run data:check` */
import { Club as ClubZ, validateSheet } from '@touchline/shared';
import { CLUBS } from '@touchline/data';
import { autoSheet, clubStrength } from '@touchline/engine';

let bad = 0;
const ids = new Set<string>();
for (const c of CLUBS) {
  const r = ClubZ.safeParse(c);
  const issues: string[] = r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  for (const p of c.players) {
    if (ids.has(p.id)) issues.push(`player id ${p.id} used by two clubs`);
    ids.add(p.id);
  }
  const sheetErrors = validateSheet(c, autoSheet(c)).filter((i) => i.level === 'error');
  for (const e of sheetErrors) issues.push(`auto team sheet: ${e.message}`);
  const flagged = c.players.filter((p) => p.flag).length;
  const line = `${c.pot} ${c.name.padEnd(24)} ${String(c.players.length).padStart(2)} players  strength ${clubStrength(c).toFixed(2)}  flagged ${flagged}`;
  if (issues.length) {
    bad++;
    console.log(`✗ ${line}\n   ${issues.join('\n   ')}`);
  } else console.log(`✓ ${line}`);
}
console.log(`${CLUBS.length} clubs, ${bad} with problems.`);
if (bad) process.exitCode = 1;
