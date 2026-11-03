import type { Club, Kit, PublicTeamInfo, TeamSheet } from '@touchline/shared';
import { shortNameOf } from '@touchline/shared';

export function publicTeam(club: Club, sheet: TeamSheet, kit: Kit): PublicTeamInfo {
  return {
    clubId: club.id,
    name: club.name,
    shortName: club.shortName,
    abbr: club.abbr,
    kit,
    gkKit: club.kits.gk,
    xi: sheet.tactic.slots.map((s) => s.playerId ?? ''),
    bench: [...sheet.bench],
    players: club.players.map((p) => ({ id: p.id, name: p.name, shortName: shortNameOf(p), number: p.number, positions: p.positions })),
  };
}
