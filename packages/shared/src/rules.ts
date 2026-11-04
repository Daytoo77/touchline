import type { Club } from './schema/club';
import type { TeamSheet } from './schema/tactic';
import { FORMATIONS } from './formations';
import { isRoleValid, ROLES } from './roles';

/** UEFA competition rules (2026-27). */
export const RULES = {
  maxBench: 12,
  subs: 5,
  windows: 3,
  /** Extra time adds one substitute and one window. */
  extraSubs: 1,
  extraWindows: 1,
  periodMinutes: 45,
  extraPeriodMinutes: 15,
  /** Breaks during which substitutions do not use a window. */
  freeWindowBreaks: ['halfTime', 'preExtraTime', 'extraHalfTime'] as const,
} as const;

export interface SheetIssue {
  level: 'error' | 'warning';
  message: string;
}

/** Validate a team sheet against its club. Errors block kickoff; warnings are shown to the manager. */
export function validateSheet(club: Club, sheet: TeamSheet): SheetIssue[] {
  const issues: SheetIssue[] = [];
  const byId = new Map(club.players.map((p) => [p.id, p]));
  const formation = FORMATIONS[sheet.tactic.formation];
  const xi: string[] = [];
  sheet.tactic.slots.forEach((s, i) => {
    const slot = formation.slots[i]!;
    if (!s.playerId) {
      issues.push({ level: 'error', message: `No player in the ${slot.pos} slot.` });
      return;
    }
    const p = byId.get(s.playerId);
    if (!p) {
      issues.push({ level: 'error', message: `Unknown player ${s.playerId}.` });
      return;
    }
    xi.push(p.id);
    if (!isRoleValid(s.role, s.duty, slot.pos)) {
      issues.push({ level: 'error', message: `${ROLES[s.role].name} (${s.duty}) is not available at ${slot.pos}.` });
    }
    if (i === 0 && p.positions[0] !== 'GK') issues.push({ level: 'warning', message: `${p.name} is not a goalkeeper.` });
    if (i > 0 && p.positions[0] === 'GK') issues.push({ level: 'warning', message: `${p.name} is a goalkeeper playing outfield.` });
    if (i > 0 && !p.positions.includes(slot.pos) && p.positions[0] !== 'GK') {
      issues.push({ level: 'warning', message: `${p.name} is unfamiliar at ${slot.pos}.` });
    }
  });
  if (new Set(xi).size !== xi.length) issues.push({ level: 'error', message: 'A player is selected twice in the XI.' });
  if (sheet.bench.length > RULES.maxBench) issues.push({ level: 'error', message: `At most ${RULES.maxBench} substitutes.` });
  for (const b of sheet.bench) {
    if (!byId.has(b)) issues.push({ level: 'error', message: `Unknown substitute ${b}.` });
    if (xi.includes(b)) issues.push({ level: 'error', message: `${byId.get(b)?.name ?? b} is both starting and on the bench.` });
  }
  if (new Set(sheet.bench).size !== sheet.bench.length) issues.push({ level: 'error', message: 'A substitute is listed twice.' });
  if (!sheet.bench.some((b) => byId.get(b)?.positions[0] === 'GK')) {
    issues.push({ level: 'warning', message: 'No goalkeeper on the bench.' });
  }
  const sp = sheet.tactic.setPieces;
  for (const [k, v] of Object.entries(sp)) {
    if (!xi.includes(v)) issues.push({ level: 'error', message: `Set-piece role "${k}" must be a starting player.` });
  }
  return issues;
}

export function sheetErrors(club: Club, sheet: TeamSheet): string[] {
  return validateSheet(club, sheet)
    .filter((i) => i.level === 'error')
    .map((i) => i.message);
}
