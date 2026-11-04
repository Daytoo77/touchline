import { FLAG_LOAN, FLAG_NEW, kit, scout } from '../src/scout';

const UNVERIFIED = 'Listed from the 2025-26 squad; 2026-27 status not confirmed.';

export default scout({
  id: 'lask', name: 'LASK', shortName: 'LASK', abbr: 'LAS', country: 'AUT', pot: 4, prefix: 'las',
  kits: { home: kit('#111111', '#ffffff', 'stripes', '#111111', '#ffffff'), away: kit('#f5f5f5', '#111111', 'plain', '#f5f5f5', '#111111'), gk: kit('#f59e0b', '#111111', 'plain', '#111111', '#111111') },
  formation: '3-4-3', instructions: { mentality: 0, pressing: 1, tempo: 1, directness: 1 },
  notes: 'Squad pieced together from partial 2026-27 listings; shirt numbers, ages and exact positions are estimates for some players.',
  players: [
    [1, 'Lukas Jungwirth', 24, 'AUT', 'GK', 'R', 12, 'gk'],
    [31, 'Tobias Schützenauer', 29, 'AUT', 'GK', 'R', 11, 'gk'],
    [5, 'Andrés Andrade', 27, 'PAN', 'DC', 'R', 12.5, 'cbStopper', {}, UNVERIFIED],
    [4, 'Philipp Ziereis', 33, 'GER', 'DC', 'R', 12, 'cbBallPlayer', {}, UNVERIFIED],
    [3, 'Maksym Talovierov', 25, 'UKR', 'DC', 'L', 12, 'cbStopper', {}, UNVERIFIED],
    [15, 'Xavier Mbuyamba', 24, 'NED', 'DC', 'R', 11.5, 'cbAthletic', {}, FLAG_NEW],
    [2, 'Florian Flecker', 30, 'AUT', 'WBR,DR', 'R', 12, 'fbAttacking', {}, UNVERIFIED],
    [17, 'George Bello', 24, 'USA', 'WBL,DL', 'L', 12, 'fbAttacking', {}, UNVERIFIED],
    [8, 'Sascha Horvath', 29, 'AUT', 'MC', 'L', 12.5, 'cmBoxToBox', { leadership: 16 }, UNVERIFIED],
    [6, 'Ivan Ljubić', 29, 'AUT', 'DM,MC', 'R', 12, 'dmAnchor', {}, UNVERIFIED],
    [26, 'Daniel Elfadli', 29, 'GER', 'DM', 'R', 12, 'dmBallWinner', {}, FLAG_LOAN],
    [10, 'Robert Ljubičić', 27, 'AUT', 'MC,AMC', 'R', 12.5, 'cmBoxToBox', {}, FLAG_LOAN],
    [20, 'Art Smakaj', 22, 'KOS', 'MC', 'R', 11.5, 'cmPlaymaker', {}, FLAG_NEW],
    [11, 'Moses Usor', 24, 'NGA', 'AML,AMR', 'R', 12.5, 'wingerClassic', {}, UNVERIFIED],
    [7, 'Krystof Daněk', 23, 'CZE', 'AMR,AML', 'R', 12, 'wingerClassic', {}, UNVERIFIED],
    [19, 'Bryan Teixeira', 25, 'CPV', 'AML,ST', 'R', 12, 'wingerInverted', {}, FLAG_NEW],
    [9, 'Saša Kalajdžić', 29, 'AUT', 'ST', 'R', 13, 'stTarget', { heading: 17, jumping: 18 }, FLAG_NEW],
    [18, 'Samuel Adeniran', 27, 'USA', 'ST', 'R', 12, 'stTarget', {}, UNVERIFIED],
  ],
});
