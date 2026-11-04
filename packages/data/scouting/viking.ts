import { kit, scout } from '../src/scout';

const UNVERIFIED = 'Not found in 2026 squad listings; carried over from earlier seasons.';

export default scout({
  id: 'viking', name: 'Viking', shortName: 'Viking', abbr: 'VIK', country: 'NOR', pot: 4, prefix: 'vik',
  kits: { home: kit('#1b3a6b', '#ffffff', 'plain', '#ffffff', '#ffffff'), away: kit('#f5f5f5', '#1b3a6b', 'plain', '#f5f5f5', '#1b3a6b'), gk: kit('#f97316', '#111111', 'plain', '#111111', '#111111') },
  formation: '4-3-3', instructions: { mentality: 1, pressing: 1, tempo: 1 },
  notes: 'Squad pieced together from partial 2026 listings; shirt numbers, ages and exact positions are estimates for some players.',
  players: [
    [1, 'Arild Østbø', 34, 'NOR', 'GK', 'R', 12, 'gk'],
    [30, 'Ľubomír Belko', 24, 'SVK', 'GK', 'R', 12, 'gk'],
    [12, 'Erlend Jacobsen', 25, 'NOR', 'GK', 'R', 10.5, 'gk'],
    [2, 'Herman Haugen', 25, 'NOR', 'DR,DC', 'R', 12, 'fbDefensive'],
    [4, 'Viljar Vevatne', 31, 'NOR', 'DC', 'R', 12, 'cbStopper'],
    [5, 'Henrik Heggheim', 25, 'NOR', 'DC', 'R', 12, 'cbBallPlayer'],
    [3, 'Sondre Bjørshol', 32, 'NOR', 'DR', 'R', 11.5, 'fbAttacking', {}, UNVERIFIED],
    [18, 'Fredrik Torsteinsbo', 31, 'NOR', 'DL,ML', 'L', 11.5, 'fbAttacking'],
    [6, 'Gianni Stensness', 27, 'NOR', 'DM,DC', 'R', 12.5, 'dmAnchor'],
    [8, 'Joe Bell', 27, 'NZL', 'MC,DM', 'L', 12.5, 'cmPlaymaker'],
    [7, 'Kristoffer Løkberg', 33, 'NOR', 'MC,AMC', 'R', 11.5, 'cmPlaymaker', {}, UNVERIFIED],
    [10, 'Zlatko Tripić', 33, 'NOR', 'AMC,AMR', 'L', 13, 'amCreator', { freeKicks: 16, penalties: 16 }, UNVERIFIED],
    [14, 'Sander Svendsen', 28, 'NOR', 'AMC,ST', 'R', 12.5, 'amShadow', {}, UNVERIFIED],
    [11, 'Yann-Erik de Lanlay', 34, 'NOR', 'AML,AMR', 'R', 11.5, 'wingerInverted', {}, UNVERIFIED],
    [22, 'Ruben Alte', 22, 'NOR', 'AMR,AML', 'R', 11.5, 'wingerClassic'],
    [17, 'Edvin Austbø', 21, 'NOR', 'ST,AML', 'R', 11.5, 'stPacey'],
    [19, 'Veton Berisha', 32, 'NOR', 'ST', 'R', 12, 'stPoacher'],
    [9, 'Peter Christiansen', 26, 'DEN', 'ST', 'R', 13, 'stComplete', { finishing: 16 }],
  ],
});
