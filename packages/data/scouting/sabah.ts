import { kit, scout } from '../src/scout';

const UNVERIFIED = 'Appears in some 2026 listings but not in the UEFA squad list.';

export default scout({
  id: 'sabah', name: 'Sabah', shortName: 'Sabah', abbr: 'SAB', country: 'AZE', pot: 4, prefix: 'sab',
  kits: { home: kit('#f28c28', '#111111', 'plain', '#111111', '#111111'), away: kit('#f5f5f5', '#f28c28', 'plain', '#f5f5f5', '#f28c28'), gk: kit('#16a34a', '#111111', 'plain', '#111111', '#ffffff') },
  formation: '4-2-3-1', instructions: { mentality: 0, pressing: 0, tempo: 0 },
  notes: 'First Champions League season. Names from the 2026-27 UEFA squad list; ages, shirt numbers, nationalities and exact positions are estimates for most players.',
  players: [
    [1, 'Ravan Mirzammadov', 24, 'AZE', 'GK', 'R', 11.5, 'gk'],
    [99, 'Amin Ramazanov', 23, 'AZE', 'GK', 'R', 10.5, 'gk'],
    [4, 'Steve Solvet', 27, 'FRA', 'DC', 'R', 11.5, 'cbStopper'],
    [5, 'Aden McCarthy', 24, 'IRL', 'DC', 'R', 11.5, 'cbAthletic'],
    [3, 'Rahman Dashdamirov', 25, 'AZE', 'DC', 'L', 11, 'cbStopper'],
    [22, 'Akim Zedadka', 31, 'ALG', 'DR', 'R', 11.5, 'fbAttacking'],
    [2, 'Erivaldo Almeida', 27, 'CPV', 'DR,DC', 'R', 11, 'fbDefensive'],
    [17, 'Tymoteusz Puchacz', 27, 'POL', 'DL', 'L', 12, 'fbAttacking'],
    [13, 'Tellur Mutallimov', 30, 'AZE', 'DL', 'L', 11, 'fbDefensive'],
    [6, 'Ivan Lepinjica', 27, 'CRO', 'DM', 'R', 11.5, 'dmAnchor'],
    [8, 'Umarali Rakhmonaliev', 23, 'UZB', 'MC,DM', 'R', 12, 'cmBoxToBox'],
    [10, 'Abdulakh Khaibulaev', 25, 'RUS', 'AMC,MC', 'R', 12, 'amCreator'],
    [19, 'Khayal Aliyev', 25, 'AZE', 'MC,AMC', 'R', 11.5, 'cmBoxToBox'],
    [14, 'Aleksey Isaev', 31, 'AZE', 'MC', 'R', 11, 'cmPlaymaker'],
    [21, 'Rauf Rustamli', 22, 'AZE', 'MC,AMR', 'R', 11, 'cmBoxToBox'],
    [11, 'Kaheem Parris', 26, 'JAM', 'AMR,AML', 'R', 12, 'wingerClassic'],
    [7, 'Xander Severina', 25, 'CUW', 'AML,AMR', 'R', 11.5, 'wingerInverted'],
    [9, 'Veljko Simić', 30, 'SRB', 'ST', 'R', 12, 'stComplete'],
    [20, 'Orphé Mbina', 24, 'GAB', 'ST,AML', 'R', 11.5, 'stPacey'],
    [18, 'Christian Nwachukwu', 23, 'NGA', 'ST', 'R', 11.5, 'stPoacher', {}, UNVERIFIED],
    [23, 'Joy-Lance Mickels', 31, 'GER', 'ST', 'R', 12, 'stPoacher', {}, UNVERIFIED],
  ],
});
