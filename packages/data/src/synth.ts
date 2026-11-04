import { DEFAULT_INSTRUCTIONS, type Club, type FormationId } from '@touchline/shared';
import { fromTuple, generatePlayer, type ScoutTuple } from './gen';

/**
 * Synthetic clubs for tests and calibration: a balanced 24-man squad whose every player sits at
 * `level` (± small archetype variation). `bonus` is added to every generated attribute (capped at 20).
 */
export function synthClub(id: string, level: number, opts: { bonus?: number; formation?: FormationId; name?: string } = {}): Club {
  const L = level;
  const rows: ScoutTuple[] = [
    [1, 'Keeper One', 28, 'XXA', 'GK', 'R', L, 'gk'],
    [13, 'Keeper Two', 24, 'XXA', 'GK', 'R', L - 2, 'gk'],
    [4, 'Centre Back A', 27, 'XXA', 'DC', 'R', L, 'cbStopper'],
    [5, 'Centre Back B', 26, 'XXA', 'DC', 'L', L, 'cbBallPlayer'],
    [15, 'Centre Back C', 24, 'XXA', 'DC', 'R', L - 1, 'cbAthletic'],
    [24, 'Centre Back D', 21, 'XXA', 'DC', 'R', L - 2, 'cbStopper'],
    [3, 'Left Back A', 26, 'XXA', 'DL,WBL', 'L', L, 'fbAttacking'],
    [21, 'Left Back B', 23, 'XXA', 'DL', 'L', L - 1.5, 'fbDefensive'],
    [2, 'Right Back A', 27, 'XXA', 'DR,WBR', 'R', L, 'fbAttacking'],
    [22, 'Right Back B', 25, 'XXA', 'DR', 'R', L - 1.5, 'fbDefensive'],
    [6, 'Holding Mid A', 28, 'XXA', 'DM,MC', 'R', L, 'dmAnchor'],
    [16, 'Holding Mid B', 24, 'XXA', 'DM', 'R', L - 1.5, 'dmBallWinner'],
    [8, 'Central Mid A', 26, 'XXA', 'MC,DM', 'R', L, 'cmPlaymaker'],
    [14, 'Central Mid B', 25, 'XXA', 'MC', 'R', L, 'cmBoxToBox'],
    [18, 'Central Mid C', 22, 'XXA', 'MC,AMC', 'L', L - 1, 'cmMezzala'],
    [20, 'Central Mid D', 20, 'XXA', 'MC', 'R', L - 2, 'cmBoxToBox'],
    [10, 'Playmaker', 26, 'XXA', 'AMC,MC', 'L', L, 'amCreator'],
    [11, 'Left Winger A', 25, 'XXA', 'AML,ML', 'R', L, 'wingerInverted'],
    [17, 'Left Winger B', 22, 'XXA', 'AML,AMR', 'L', L - 1.5, 'wingerClassic'],
    [7, 'Right Winger A', 26, 'XXA', 'AMR,MR', 'L', L, 'wingerInverted'],
    [19, 'Right Winger B', 21, 'XXA', 'AMR,ML', 'R', L - 1.5, 'wingerClassic'],
    [9, 'Striker A', 27, 'XXA', 'ST', 'R', L, 'stComplete'],
    [23, 'Striker B', 24, 'XXA', 'ST', 'L', L - 1, 'stPoacher'],
    [12, 'Striker C', 29, 'XXA', 'ST', 'R', L - 2, 'stTarget'],
  ];
  const prefix = id.slice(0, 6);
  const bonus = opts.bonus ?? 0;
  const players = rows.map((r) => {
    const p = generatePlayer(prefix, fromTuple(r));
    if (bonus) {
      for (const grp of [p.technical, p.mental, p.physical, p.goalkeeping] as (Record<string, number> | undefined)[]) {
        if (!grp) continue;
        for (const k of Object.keys(grp)) grp[k] = Math.max(1, Math.min(20, grp[k]! + bonus));
      }
    }
    return p;
  });
  return {
    id,
    name: opts.name ?? `Synthetic ${id}`,
    shortName: opts.name ?? id,
    abbr: id.slice(0, 3).toUpperCase().padEnd(3, 'X'),
    country: 'XXA',
    pot: 1,
    kits: {
      home: { shirt: '#c8102e', trim: '#ffffff', shorts: '#ffffff', number: '#ffffff', pattern: 'plain' },
      away: { shirt: '#1d4ed8', trim: '#ffffff', shorts: '#1d4ed8', number: '#ffffff', pattern: 'plain' },
      gk: { shirt: '#16a34a', trim: '#111111', shorts: '#111111', number: '#ffffff', pattern: 'plain' },
    },
    defaultTactic: { formation: opts.formation ?? '4-3-3', instructions: { ...DEFAULT_INSTRUCTIONS } },
    dataAsOf: '2026-11-03',
    players,
  };
}
