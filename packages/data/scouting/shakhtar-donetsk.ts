import { FLAG_LEAVE, FLAG_NEW, kit, scout } from '../src/scout';

export default scout({
  id: 'shakhtar-donetsk', name: 'Shakhtar Donetsk', shortName: 'Shakhtar', abbr: 'SHK', country: 'UKR', pot: 3, prefix: 'shk',
  kits: { home: kit('#f26522', '#111111', 'stripes', '#111111', '#111111'), away: kit('#f5f5f5', '#f26522', 'plain', '#f5f5f5', '#f26522'), gk: kit('#22c55e', '#111111', 'plain', '#111111', '#111111') },
  formation: '4-2-3-1', instructions: { mentality: 1, tempo: 1, directness: -1 },
  notes: 'Ukrainian champions 2025-26; head coach Arda Turan. Squad largely from 2025-26.',
  players: [
    [31, 'Dmytro Riznyk', 27, 'UKR', 'GK', 'R', 13.5, 'gk'],
    [23, 'Kiril Fesiun', 24, 'UKR', 'GK', 'R', 11, 'gk'],
    [22, 'Mykola Matviyenko', 30, 'UKR', 'DC,DL', 'L', 14, 'cbBallPlayer', { leadership: 17 }],
    [5, 'Valeriy Bondar', 27, 'UKR', 'DC', 'R', 13.5, 'cbStopper'],
    [3, 'Irakli Azarovi', 23, 'GEO', 'DL', 'L', 13, 'fbAttacking'],
    [16, 'Vinícius Tobias', 22, 'BRA', 'DR', 'R', 13, 'fbAttacking', {}, FLAG_LEAVE],
    [26, 'Alaa Ghram', 24, 'TUN', 'DR', 'R', 12.5, 'fbDefensive'],
    [6, 'Taras Stepanenko', 37, 'UKR', 'DM', 'R', 12.5, 'dmAnchor', { leadership: 18 }, FLAG_LEAVE],
    [21, 'Artem Bondarenko', 26, 'UKR', 'MC,AMC', 'R', 13.5, 'cmBoxToBox'],
    [29, 'Oleh Ocheretko', 23, 'UKR', 'DM,MC', 'R', 13, 'dmBallWinner'],
    [8, 'Marlon Gomes', 22, 'BRA', 'MC,DM', 'R', 13.5, 'cmPlaymaker'],
    [7, 'Dmytro Kryskiv', 26, 'UKR', 'MC', 'R', 13, 'cmBoxToBox'],
    [10, 'Pedrinho', 28, 'BRA', 'AMR,AMC', 'R', 14, 'amCreator'],
    [11, 'Eguinaldo', 22, 'BRA', 'AML', 'R', 13.5, 'wingerClassic'],
    [17, 'Newerton', 21, 'BRA', 'AMR', 'L', 13, 'wingerInverted'],
    [30, 'Lucas Ferreira', 19, 'BRA', 'AMC,AMR', 'R', 13, 'amCreator'],
    [2, 'Lassina Traoré', 25, 'BFA', 'ST', 'R', 14, 'stTarget'],
    [9, 'Kauã Elias', 20, 'BRA', 'ST', 'R', 13, 'stPoacher'],
    [19, 'Ivan Petryak', 32, 'UKR', 'AMR,MR', 'R', 11.5, 'wingerClassic', {}, FLAG_NEW],
  ],
});
