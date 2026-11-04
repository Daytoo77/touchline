import { kit, scout } from '../src/scout';

const UNVERIFIED = 'No 2026 squad source could be checked; carried over from 2025.';

export default scout({
  id: 'bodo-glimt', name: 'Bodø/Glimt', shortName: 'Bodø/Glimt', abbr: 'BOD', country: 'NOR', pot: 3, prefix: 'bod',
  kits: { home: kit('#ffd200', '#111111', 'plain', '#ffd200', '#111111'), away: kit('#1f1f1f', '#ffd200', 'plain', '#1f1f1f', '#ffd200'), gk: kit('#22c55e', '#111111', 'plain', '#111111', '#111111') },
  formation: '4-3-3', instructions: { mentality: 1, pressing: 2, line: 1, tempo: 2 },
  notes: 'Squad based on the 2025 season; summer-2026 moves could not be verified from accessible sources.',
  players: [
    [12, 'Nikita Haikin', 31, 'NOR', 'GK', 'R', 13.5, 'gkSweeper'],
    [1, 'Julian Faye Lund', 27, 'NOR', 'GK', 'R', 11.5, 'gk'],
    [20, 'Fredrik Sjøvold', 22, 'NOR', 'DR', 'R', 13, 'fbAttacking'],
    [4, 'Jostein Gundersen', 30, 'NOR', 'DC', 'R', 13, 'cbStopper'],
    [6, 'Odin Bjørtuft', 27, 'NOR', 'DC', 'L', 13, 'cbBallPlayer'],
    [3, 'Haitam Aleesami', 35, 'NOR', 'DC,DL', 'L', 12, 'cbBallPlayer', {}, UNVERIFIED],
    [5, 'Villads Nielsen', 25, 'DEN', 'DC', 'R', 12.5, 'cbStopper'],
    [15, 'Fredrik André Bjørkan', 28, 'NOR', 'DL', 'L', 13, 'fbAttacking', {}, '', 'Bjørkan'],
    [2, 'Brice Wembangomo', 29, 'NOR', 'DR', 'R', 12, 'fbDefensive', {}, UNVERIFIED],
    [7, 'Patrick Berg', 28, 'NOR', 'DM', 'R', 14.5, 'dmPlaymaker', { leadership: 17 }],
    [26, 'Håkon Evjen', 26, 'NOR', 'MC,AMC', 'R', 14, 'cmMezzala'],
    [19, 'Sondre Brunstad Fet', 29, 'NOR', 'MC', 'R', 14, 'cmPlaymaker', {}, '', 'Brunstad Fet'],
    [14, 'Ulrik Saltnes', 31, 'NOR', 'MC', 'R', 13, 'cmBoxToBox', {}, UNVERIFIED],
    [8, 'Isak Dybvik Määttä', 25, 'NOR', 'MC', 'R', 13, 'cmBoxToBox', {}, UNVERIFIED, 'Määttä'],
    [10, 'Jens Petter Hauge', 27, 'NOR', 'AML', 'L', 14.5, 'wingerInverted'],
    [11, 'Ole Didrik Blomberg', 25, 'NOR', 'AMR', 'R', 13.5, 'wingerClassic'],
    [17, 'Sondre Sørli', 22, 'NOR', 'AML,AMR', 'R', 13, 'wingerClassic'],
    [21, 'Daniel Bassi', 21, 'COL', 'AMR', 'L', 12.5, 'wingerInverted'],
    [9, 'Kasper Høgh', 25, 'DEN', 'ST', 'R', 14, 'stComplete'],
    [16, 'Andreas Helmersen', 25, 'NOR', 'ST', 'R', 12.5, 'stPoacher'],
  ],
});
