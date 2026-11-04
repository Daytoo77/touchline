import { FLAG_LEAVE, FLAG_NEW, kit, scout } from '../src/scout';

export default scout({
  id: 'atletico-madrid', name: 'Atlético de Madrid', shortName: 'Atlético', abbr: 'ATM', country: 'ESP', pot: 1, prefix: 'atm',
  kits: { home: kit('#cb3524', '#ffffff', 'stripes', '#272e61', '#272e61'), away: kit('#272e61', '#cb3524', 'plain', '#272e61', '#ffffff'), gk: kit('#a3e635', '#111111', 'plain', '#111111', '#111111') },
  formation: '4-4-2', instructions: { mentality: 0, pressing: 1, line: -1, tempo: 0, timeWasting: 1 },
  players: [
    [13, 'Jan Oblak', 33, 'SVN', 'GK', 'R', 16.5, 'gk', { reflexes: 19 }],
    [1, 'Juan Musso', 32, 'ARG', 'GK', 'R', 13.5, 'gk', {}, FLAG_LEAVE],
    [2, 'José María Giménez', 31, 'URU', 'DC', 'R', 15.5, 'cbStopper', { aggression: 18 }, '', 'Giménez'],
    [24, 'Robin Le Normand', 29, 'ESP', 'DC', 'R', 15, 'cbStopper'],
    [17, 'Dávid Hancko', 28, 'SVK', 'DC,DL', 'L', 15.5, 'cbBallPlayer'],
    [22, 'Cristian Romero', 28, 'ARG', 'DC', 'R', 16, 'cbStopper', { aggression: 19 }, FLAG_NEW, 'Romero'],
    [15, 'Clément Lenglet', 31, 'FRA', 'DC,DL', 'L', 14, 'cbBallPlayer', {}, FLAG_LEAVE],
    [18, 'Marc Pubill', 23, 'ESP', 'DR,DC', 'R', 14.5, 'fbDefensive'],
    [3, 'Álex Grimaldo', 30, 'ESP', 'DL,WBL', 'L', 15.5, 'fbAttacking', { crossing: 18, freeKicks: 18 }, FLAG_NEW],
    [6, 'Koke', 34, 'ESP', 'MC,DM', 'R', 14.5, 'cmPlaymaker', { leadership: 19 }],
    [8, 'Pablo Barrios', 23, 'ESP', 'MC', 'R', 15.5, 'cmBoxToBox'],
    [5, 'Johnny Cardoso', 25, 'USA', 'DM,MC', 'R', 15, 'dmBallWinner'],
    [21, 'Morten Hjulmand', 27, 'DEN', 'DM', 'R', 15.5, 'dmAnchor', { leadership: 17 }, FLAG_NEW],
    [4, 'Conor Gallagher', 26, 'ENG', 'MC', 'R', 15, 'cmBoxToBox', { workRate: 20 }, FLAG_LEAVE],
    [10, 'Álex Baena', 25, 'ESP', 'AML,AMC,ML', 'L', 15.5, 'amCreator', { crossing: 17, corners: 17 }],
    [20, 'Giuliano Simeone', 23, 'ARG', 'MR,DR,AMR', 'R', 14.5, 'wideWorker'],
    [14, 'Lee Kang-in', 25, 'KOR', 'MR,AMC,AMR', 'L', 15, 'amCreator', {}, FLAG_NEW, 'Lee'],
    [19, 'Julián Álvarez', 26, 'ARG', 'ST', 'R', 17, 'stComplete', { workRate: 19, finishing: 18, freeKicks: 16 }, '', 'Julián'],
    [9, 'Alexander Sørloth', 30, 'NOR', 'ST', 'L', 15, 'stTarget'],
    [23, 'Giacomo Raspadori', 26, 'ITA', 'ST,AMC', 'R', 14.5, 'stComplete', {}, FLAG_LEAVE],
  ],
});
