import { FLAG_LEAVE, FLAG_LOAN, FLAG_NEW, kit, scout } from '../src/scout';

const UNVERIFIED = 'Listed from the 2025-26 squad; 2026-27 status not confirmed.';

export default scout({
  id: 'slavia-praha', name: 'Slavia Praha', shortName: 'Slavia', abbr: 'SLA', country: 'CZE', pot: 4, prefix: 'sla',
  kits: { home: kit('#ffffff', '#e2001a', 'halves', '#e2001a', '#e2001a'), away: kit('#e2001a', '#ffffff', 'plain', '#e2001a', '#ffffff'), gk: kit('#22c55e', '#111111', 'plain', '#111111', '#111111') },
  formation: '3-4-2-1', instructions: { mentality: 1, pressing: 2, tempo: 1, directness: 1 },
  players: [
    [36, 'Jindřich Staněk', 30, 'CZE', 'GK', 'R', 13.5, 'gk'],
    [1, 'Jakub Markovič', 25, 'CZE', 'GK', 'R', 11, 'gk'],
    [3, 'Tomáš Holeš', 33, 'CZE', 'DC,DM', 'R', 13, 'cbStopper', { leadership: 16 }],
    [5, 'Igoh Ogbu', 26, 'NGA', 'DC', 'R', 13.5, 'cbStopper'],
    [4, 'David Zima', 25, 'CZE', 'DC', 'R', 13.5, 'cbBallPlayer'],
    [25, 'Štěpán Chaloupek', 23, 'CZE', 'DC', 'L', 13, 'cbBallPlayer'],
    [32, 'Denis Halinský', 22, 'CZE', 'DC', 'R', 11.5, 'cbStopper', {}, FLAG_LOAN],
    [21, 'David Douděra', 28, 'CZE', 'WBR,DR', 'R', 13, 'fbAttacking'],
    [18, 'Jan Bořil', 35, 'CZE', 'WBL,DL', 'L', 12, 'fbDefensive', {}, FLAG_LEAVE],
    [19, 'Oscar Dorley', 28, 'LBR', 'WBL,DM', 'L', 13, 'wideWorker'],
    [27, 'Daiki Hashioka', 27, 'JPN', 'WBR,DR', 'R', 12.5, 'fbAttacking', {}, UNVERIFIED],
    [23, 'Michal Sadílek', 27, 'CZE', 'MC,DM', 'R', 13.5, 'cmBoxToBox'],
    [10, 'Christos Zafeiris', 23, 'GRE', 'MC', 'R', 14, 'cmBoxToBox'],
    [17, 'Lukáš Provod', 30, 'CZE', 'AMC,ML', 'L', 14, 'amCreator', { longShots: 16, crossing: 16 }],
    [26, 'Ivan Schranz', 33, 'SVK', 'AML,AMR', 'R', 13, 'amShadow'],
    [22, 'Muhammed Cham', 25, 'AUT', 'AMC,AML', 'L', 13.5, 'amCreator', {}, UNVERIFIED],
    [13, 'Mojmír Chytil', 27, 'CZE', 'ST', 'R', 13, 'stPoacher'],
    [11, 'Tomáš Chorý', 31, 'CZE', 'ST', 'R', 13, 'stTarget', { heading: 17 }, FLAG_NEW],
    [9, 'Erik Prekop', 28, 'SVK', 'ST', 'R', 12.5, 'stTarget', {}, UNVERIFIED],
  ],
});
