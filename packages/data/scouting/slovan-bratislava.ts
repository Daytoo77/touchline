import { kit, scout } from '../src/scout';

const UNVERIFIED = 'Not found in 2026-27 squad listings; carried over from earlier seasons.';

export default scout({
  id: 'slovan-bratislava', name: 'Slovan Bratislava', shortName: 'Slovan', abbr: 'SLO', country: 'SVK', pot: 4, prefix: 'slo',
  kits: { home: kit('#5ea9dd', '#ffffff', 'plain', '#ffffff', '#ffffff'), away: kit('#1f2a44', '#5ea9dd', 'plain', '#1f2a44', '#ffffff'), gk: kit('#f97316', '#111111', 'plain', '#111111', '#111111') },
  formation: '4-2-3-1', instructions: { mentality: 0, pressing: 0, tempo: 0 },
  notes: 'Squad pieced together from partial 2026-27 listings; shirt numbers, ages and exact positions are estimates for some players.',
  players: [
    [71, 'Dominik Takáč', 26, 'SVK', 'GK', 'R', 12, 'gk', {}, UNVERIFIED],
    [30, 'Michal Šulla', 35, 'SVK', 'GK', 'R', 10.5, 'gk', {}, UNVERIFIED],
    [4, 'Kevin Wimmer', 33, 'AUT', 'DC', 'L', 12.5, 'cbBallPlayer'],
    [5, 'Kenan Bajrić', 31, 'SVN', 'DC,DM', 'R', 12.5, 'cbStopper', { leadership: 16 }],
    [6, 'Siemen Voet', 26, 'BEL', 'DC', 'R', 12.5, 'cbStopper'],
    [17, 'César Blackman', 28, 'PAN', 'DR', 'R', 12.5, 'fbAttacking', {}, UNVERIFIED],
    [3, 'Sandro Cruz', 25, 'POR', 'DL', 'L', 12, 'fbAttacking'],
    [21, 'Alen Mustafić', 26, 'BIH', 'DM,MC', 'R', 12.5, 'dmBallWinner'],
    [8, 'Danylo Ignatenko', 29, 'UKR', 'DM', 'R', 12.5, 'dmAnchor', {}, UNVERIFIED],
    [27, 'Kyriakos Savvidis', 31, 'GRE', 'MC', 'R', 12, 'cmPlaymaker', {}, UNVERIFIED],
    [14, 'Artur Gajdoš', 22, 'SVK', 'MC', 'R', 12, 'cmBoxToBox'],
    [10, 'Marko Tolić', 29, 'CRO', 'AMC', 'R', 12.5, 'amCreator', {}, UNVERIFIED],
    [11, 'Tigran Barseghyan', 33, 'ARM', 'AML,AMR', 'L', 13.5, 'wingerInverted', { crossing: 16 }],
    [77, 'Aleksandar Čavrić', 32, 'SRB', 'AML,AMR', 'R', 12.5, 'wingerInverted', {}, UNVERIFIED],
    [24, 'Nino Marcelli', 21, 'SVK', 'AMR,AML', 'R', 12.5, 'wingerClassic', {}, UNVERIFIED],
    [79, 'Vladimír Weiss', 36, 'SVK', 'AMR', 'R', 11.5, 'wingerInverted', {}, UNVERIFIED],
    [20, 'Rahim Ibrahim', 24, 'GHA', 'MC', 'R', 12, 'cmBoxToBox', {}, UNVERIFIED],
    [9, 'Andraž Šporar', 32, 'SVN', 'ST', 'R', 13.5, 'stPoacher', { finishing: 16, leadership: 15 }],
  ],
});
