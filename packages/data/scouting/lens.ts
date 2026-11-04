import { FLAG_LEAVE, FLAG_LOAN, kit, scout } from '../src/scout';

const UNVERIFIED = 'Listed from the 2025-26 squad; 2026-27 status not confirmed.';

export default scout({
  id: 'lens', name: 'RC Lens', shortName: 'Lens', abbr: 'RCL', country: 'FRA', pot: 4, prefix: 'rcl',
  kits: { home: kit('#fde047', '#e30613', 'plain', '#e30613', '#e30613'), away: kit('#111111', '#fde047', 'plain', '#111111', '#fde047'), gk: kit('#22c55e', '#111111', 'plain', '#111111', '#111111') },
  formation: '3-4-2-1', instructions: { mentality: 0, pressing: 1, tempo: 1 },
  notes: 'Head coach Pierre Sage reported to have left for the Premier League in summer 2026.',
  players: [
    [40, 'Robin Risser', 21, 'FRA', 'GK', 'R', 13, 'gk'],
    [16, 'Mathew Ryan', 34, 'AUS', 'GK', 'R', 12, 'gk', {}, UNVERIFIED],
    [30, 'Hervé Koffi', 30, 'BFA', 'GK', 'R', 11.5, 'gk', {}, FLAG_LOAN],
    [24, 'Jonathan Gradit', 33, 'FRA', 'DC', 'R', 13, 'cbStopper', { leadership: 16 }],
    [4, 'Samson Baidoo', 22, 'AUT', 'DC', 'R', 13, 'cbAthletic'],
    [20, 'Malang Sarr', 27, 'FRA', 'DC,DL', 'L', 13, 'cbBallPlayer'],
    [25, 'Ismaëlo Ganiou', 21, 'FRA', 'DC', 'R', 12.5, 'cbStopper'],
    [2, 'Ruben Aguilar', 33, 'FRA', 'WBR,DR', 'R', 12, 'fbAttacking', {}, FLAG_LEAVE],
    [12, 'Saud Abdulhamid', 27, 'KSA', 'WBR,DR', 'R', 12.5, 'fbAttacking', {}, UNVERIFIED],
    [14, 'Matthieu Udol', 30, 'FRA', 'WBL,DL', 'L', 12.5, 'fbAttacking'],
    [3, 'Deiver Machado', 33, 'COL', 'WBL,DL', 'L', 12, 'fbAttacking', {}, FLAG_LEAVE],
    [21, 'Jhoanner Chávez', 24, 'ECU', 'WBL,DL', 'L', 12.5, 'fbAttacking'],
    [8, 'Mamadou Sangaré', 23, 'MLI', 'MC,DM', 'R', 13, 'cmBoxToBox'],
    [10, 'Florian Thauvin', 33, 'FRA', 'AMR,AMC', 'L', 14, 'amCreator', { crossing: 17, freeKicks: 16 }],
    [7, 'Allan Saint-Maximin', 29, 'FRA', 'AML,AMR', 'R', 13.5, 'wingerClassic', { dribbling: 18 }, UNVERIFIED],
    [11, 'Thorgan Hazard', 33, 'BEL', 'AML,AMC', 'L', 12.5, 'amCreator', {}, UNVERIFIED],
    [22, 'Rayan Fofana', 20, 'FRA', 'AMR,AML', 'R', 12.5, 'wingerClassic', {}, UNVERIFIED],
    [9, 'Odsonne Édouard', 28, 'FRA', 'ST', 'L', 13, 'stComplete'],
    [29, 'Morgan Guilavogui', 27, 'FRA', 'ST,AML', 'R', 12.5, 'stPresser'],
    [19, 'Franjo Ivanović', 23, 'CRO', 'ST', 'R', 12.5, 'stPacey', {}, FLAG_LOAN],
  ],
});
