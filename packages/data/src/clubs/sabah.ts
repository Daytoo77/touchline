// Sabah: 2026-27 squad. Ratings are Touchline's own estimates from each player's level and role
// (not taken from any game or ratings database). Generated from packages/data/scouting/sabah.ts;
// this file is now the source of truth: edit any number by hand (1-20), then run `npm run data:check`.
import { defineClub } from '../define';

export default defineClub({
  id: 'sabah',
  name: "Sabah",
  shortName: "Sabah",
  abbr: 'SAB',
  country: 'AZE',
  pot: 4,
  kits: {
    home: {"shirt":"#f28c28","trim":"#111111","pattern":"plain","shorts":"#111111","number":"#111111"},
    away: {"shirt":"#f5f5f5","trim":"#f28c28","pattern":"plain","shorts":"#f5f5f5","number":"#f28c28"},
    gk: {"shirt":"#16a34a","trim":"#111111","pattern":"plain","shorts":"#111111","number":"#ffffff"},
  },
  defaultTactic: { formation: '4-2-3-1', instructions: {"mentality":0,"pressing":0,"line":0,"width":0,"tempo":0,"directness":0,"timeWasting":0} },
  dataAsOf: '2026-11-03',
  notes: "First Champions League season. Names from the 2026-27 UEFA squad list; ages, shirt numbers, nationalities and exact positions are estimates for most players.",
  players: [
    {
      id: 'sab-ravan-mirzammadov', name: "Ravan Mirzammadov", number: 1, age: 24, nationality: 'AZE', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 2, finishing: 2, firstTouch: 11, freeKicks: 2, heading: 1, longShots: 1, marking: 1, passing: 6, penalties: 2, tackling: 2, technique: 5 },
      mental: { aggression: 6, anticipation: 13, bravery: 12, composure: 13, concentration: 15, decisions: 12, determination: 12, flair: 1, leadership: 7, offTheBall: 2, positioning: 15, teamwork: 10, vision: 6, workRate: 6 },
      physical: { acceleration: 6, agility: 14, balance: 10, jumping: 12, naturalFitness: 12, pace: 6, stamina: 7, strength: 11 },
      goalkeeping: { aerialReach: 13, commandOfArea: 13, communication: 12, handling: 15, kicking: 8, oneOnOnes: 13, reflexes: 14, rushingOut: 8, throwing: 10 },
    },
    {
      id: 'sab-amin-ramazanov', name: "Amin Ramazanov", number: 99, age: 23, nationality: 'AZE', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 1, finishing: 1, firstTouch: 8, freeKicks: 1, heading: 1, longShots: 1, marking: 1, passing: 4, penalties: 1, tackling: 1, technique: 5 },
      mental: { aggression: 5, anticipation: 10, bravery: 10, composure: 11, concentration: 13, decisions: 10, determination: 10, flair: 1, leadership: 6, offTheBall: 1, positioning: 13, teamwork: 9, vision: 5, workRate: 5 },
      physical: { acceleration: 5, agility: 12, balance: 10, jumping: 12, naturalFitness: 11, pace: 5, stamina: 5, strength: 8 },
      goalkeeping: { aerialReach: 11, commandOfArea: 11, communication: 12, handling: 12, kicking: 8, oneOnOnes: 13, reflexes: 15, rushingOut: 9, throwing: 9 },
    },
    {
      id: 'sab-steve-solvet', name: "Steve Solvet", number: 4, age: 27, nationality: 'FRA', positions: ['DC'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 5, finishing: 1, firstTouch: 10, freeKicks: 5, heading: 16, longShots: 6, marking: 14, passing: 8, penalties: 5, tackling: 14, technique: 11 },
      mental: { aggression: 15, anticipation: 12, bravery: 12, composure: 8, concentration: 11, decisions: 12, determination: 12, flair: 7, leadership: 5, offTheBall: 6, positioning: 13, teamwork: 11, vision: 7, workRate: 9 },
      physical: { acceleration: 11, agility: 10, balance: 10, jumping: 14, naturalFitness: 11, pace: 8, stamina: 9, strength: 15 },
    },
    {
      id: 'sab-aden-mccarthy', name: "Aden McCarthy", number: 5, age: 24, nationality: 'IRL', positions: ['DC'], foot: 'R',
      technical: { corners: 5, crossing: 6, dribbling: 7, finishing: 2, firstTouch: 11, freeKicks: 7, heading: 12, longShots: 6, marking: 14, passing: 10, penalties: 7, tackling: 15, technique: 9 },
      mental: { aggression: 12, anticipation: 14, bravery: 12, composure: 11, concentration: 13, decisions: 12, determination: 12, flair: 5, leadership: 7, offTheBall: 7, positioning: 15, teamwork: 10, vision: 6, workRate: 10 },
      physical: { acceleration: 14, agility: 12, balance: 10, jumping: 14, naturalFitness: 12, pace: 14, stamina: 11, strength: 15 },
    },
    {
      id: 'sab-rahman-dashdamirov', name: "Rahman Dashdamirov", number: 3, age: 25, nationality: 'AZE', positions: ['DC'], foot: 'L',
      technical: { corners: 4, crossing: 5, dribbling: 6, finishing: 1, firstTouch: 11, freeKicks: 6, heading: 14, longShots: 5, marking: 14, passing: 8, penalties: 6, tackling: 15, technique: 9 },
      mental: { aggression: 14, anticipation: 13, bravery: 12, composure: 10, concentration: 13, decisions: 12, determination: 12, flair: 4, leadership: 6, offTheBall: 6, positioning: 15, teamwork: 10, vision: 5, workRate: 10 },
      physical: { acceleration: 10, agility: 10, balance: 10, jumping: 14, naturalFitness: 12, pace: 9, stamina: 11, strength: 16 },
    },
    {
      id: 'sab-akim-zedadka', name: "Akim Zedadka", number: 22, age: 31, nationality: 'ALG', positions: ['DR'], foot: 'R',
      technical: { corners: 6, crossing: 16, dribbling: 14, finishing: 6, firstTouch: 9, freeKicks: 6, heading: 10, longShots: 5, marking: 9, passing: 11, penalties: 6, tackling: 11, technique: 11 },
      mental: { aggression: 10, anticipation: 11, bravery: 9, composure: 10, concentration: 12, decisions: 10, determination: 11, flair: 6, leadership: 10, offTheBall: 12, positioning: 11, teamwork: 12, vision: 6, workRate: 14 },
      physical: { acceleration: 13, agility: 10, balance: 11, jumping: 11, naturalFitness: 11, pace: 13, stamina: 13, strength: 9 },
    },
    {
      id: 'sab-erivaldo-almeida', name: "Erivaldo Almeida", number: 2, age: 27, nationality: 'CPV', positions: ['DR', 'DC'], foot: 'R',
      technical: { corners: 4, crossing: 12, dribbling: 11, finishing: 6, firstTouch: 11, freeKicks: 6, heading: 9, longShots: 5, marking: 15, passing: 12, penalties: 6, tackling: 17, technique: 9 },
      mental: { aggression: 10, anticipation: 13, bravery: 10, composure: 11, concentration: 13, decisions: 10, determination: 12, flair: 4, leadership: 6, offTheBall: 9, positioning: 16, teamwork: 12, vision: 5, workRate: 14 },
      physical: { acceleration: 14, agility: 12, balance: 10, jumping: 10, naturalFitness: 12, pace: 14, stamina: 15, strength: 11 },
    },
    {
      id: 'sab-tymoteusz-puchacz', name: "Tymoteusz Puchacz", number: 17, age: 27, nationality: 'POL', positions: ['DL'], foot: 'L',
      technical: { corners: 6, crossing: 17, dribbling: 15, finishing: 6, firstTouch: 10, freeKicks: 6, heading: 11, longShots: 5, marking: 10, passing: 12, penalties: 6, tackling: 12, technique: 12 },
      mental: { aggression: 11, anticipation: 12, bravery: 10, composure: 11, concentration: 13, decisions: 10, determination: 12, flair: 6, leadership: 7, offTheBall: 13, positioning: 11, teamwork: 13, vision: 6, workRate: 15 },
      physical: { acceleration: 15, agility: 12, balance: 12, jumping: 12, naturalFitness: 13, pace: 15, stamina: 15, strength: 10 },
    },
    {
      id: 'sab-tellur-mutallimov', name: "Tellur Mutallimov", number: 13, age: 30, nationality: 'AZE', positions: ['DL'], foot: 'L',
      technical: { corners: 5, crossing: 12, dribbling: 10, finishing: 5, firstTouch: 9, freeKicks: 5, heading: 10, longShots: 4, marking: 14, passing: 11, penalties: 5, tackling: 15, technique: 10 },
      mental: { aggression: 10, anticipation: 11, bravery: 9, composure: 10, concentration: 12, decisions: 9, determination: 11, flair: 5, leadership: 8, offTheBall: 7, positioning: 15, teamwork: 12, vision: 5, workRate: 14 },
      physical: { acceleration: 13, agility: 10, balance: 11, jumping: 11, naturalFitness: 11, pace: 13, stamina: 13, strength: 9 },
    },
    {
      id: 'sab-ivan-lepinjica', name: "Ivan Lepinjica", number: 6, age: 27, nationality: 'CRO', positions: ['DM'], foot: 'R',
      technical: { corners: 6, crossing: 5, dribbling: 4, finishing: 6, firstTouch: 12, freeKicks: 6, heading: 10, longShots: 11, marking: 15, passing: 13, penalties: 6, tackling: 15, technique: 10 },
      mental: { aggression: 9, anticipation: 14, bravery: 11, composure: 12, concentration: 12, decisions: 15, determination: 13, flair: 6, leadership: 9, offTheBall: 6, positioning: 16, teamwork: 13, vision: 6, workRate: 13 },
      physical: { acceleration: 9, agility: 11, balance: 9, jumping: 9, naturalFitness: 13, pace: 11, stamina: 12, strength: 14 },
    },
    {
      id: 'sab-umarali-rakhmonaliev', name: "Umarali Rakhmonaliev", number: 8, age: 23, nationality: 'UZB', positions: ['MC', 'DM'], foot: 'R',
      technical: { corners: 11, crossing: 11, dribbling: 13, finishing: 10, firstTouch: 14, freeKicks: 11, heading: 6, longShots: 12, marking: 10, passing: 14, penalties: 6, tackling: 13, technique: 15 },
      mental: { aggression: 11, anticipation: 12, bravery: 10, composure: 13, concentration: 11, decisions: 14, determination: 12, flair: 11, leadership: 7, offTheBall: 14, positioning: 13, teamwork: 15, vision: 12, workRate: 18 },
      physical: { acceleration: 11, agility: 10, balance: 12, jumping: 7, naturalFitness: 13, pace: 11, stamina: 18, strength: 10 },
    },
    {
      id: 'sab-abdulakh-khaibulaev', name: "Abdulakh Khaibulaev", number: 10, age: 25, nationality: 'RUS', positions: ['AMC', 'MC'], foot: 'R',
      technical: { corners: 12, crossing: 12, dribbling: 14, finishing: 12, firstTouch: 15, freeKicks: 10, heading: 7, longShots: 13, marking: 6, passing: 17, penalties: 10, tackling: 6, technique: 16 },
      mental: { aggression: 7, anticipation: 13, bravery: 6, composure: 12, concentration: 10, decisions: 14, determination: 11, flair: 18, leadership: 5, offTheBall: 13, positioning: 5, teamwork: 12, vision: 18, workRate: 10 },
      physical: { acceleration: 12, agility: 13, balance: 13, jumping: 6, naturalFitness: 12, pace: 10, stamina: 10, strength: 6 },
    },
    {
      id: 'sab-khayal-aliyev', name: "Khayal Aliyev", number: 19, age: 25, nationality: 'AZE', positions: ['MC', 'AMC'], foot: 'R',
      technical: { corners: 11, crossing: 11, dribbling: 11, finishing: 9, firstTouch: 14, freeKicks: 9, heading: 7, longShots: 12, marking: 10, passing: 14, penalties: 5, tackling: 13, technique: 15 },
      mental: { aggression: 11, anticipation: 12, bravery: 10, composure: 11, concentration: 9, decisions: 14, determination: 12, flair: 11, leadership: 5, offTheBall: 14, positioning: 11, teamwork: 15, vision: 12, workRate: 16 },
      physical: { acceleration: 11, agility: 10, balance: 10, jumping: 6, naturalFitness: 11, pace: 9, stamina: 16, strength: 10 },
    },
    {
      id: 'sab-aleksey-isaev', name: "Aleksey Isaev", number: 14, age: 31, nationality: 'AZE', positions: ['MC'], foot: 'R',
      technical: { corners: 10, crossing: 10, dribbling: 12, finishing: 5, firstTouch: 13, freeKicks: 10, heading: 5, longShots: 11, marking: 9, passing: 16, penalties: 5, tackling: 9, technique: 16 },
      mental: { aggression: 10, anticipation: 11, bravery: 9, composure: 14, concentration: 10, decisions: 16, determination: 11, flair: 10, leadership: 9, offTheBall: 11, positioning: 13, teamwork: 14, vision: 16, workRate: 13 },
      physical: { acceleration: 8, agility: 7, balance: 11, jumping: 6, naturalFitness: 10, pace: 8, stamina: 11, strength: 9 },
    },
    {
      id: 'sab-rauf-rustamli', name: "Rauf Rustamli", number: 21, age: 22, nationality: 'AZE', positions: ['MC', 'AMR'], foot: 'R',
      technical: { corners: 10, crossing: 9, dribbling: 12, finishing: 9, firstTouch: 14, freeKicks: 10, heading: 5, longShots: 13, marking: 11, passing: 15, penalties: 5, tackling: 13, technique: 14 },
      mental: { aggression: 9, anticipation: 12, bravery: 11, composure: 11, concentration: 10, decisions: 14, determination: 13, flair: 10, leadership: 6, offTheBall: 14, positioning: 12, teamwork: 13, vision: 10, workRate: 18 },
      physical: { acceleration: 9, agility: 11, balance: 9, jumping: 4, naturalFitness: 13, pace: 11, stamina: 17, strength: 10 },
    },
    {
      id: 'sab-kaheem-parris', name: "Kaheem Parris", number: 11, age: 26, nationality: 'JAM', positions: ['AMR', 'AML'], foot: 'R',
      technical: { corners: 12, crossing: 18, dribbling: 15, finishing: 10, firstTouch: 13, freeKicks: 10, heading: 7, longShots: 10, marking: 6, passing: 13, penalties: 10, tackling: 6, technique: 16 },
      mental: { aggression: 7, anticipation: 11, bravery: 6, composure: 10, concentration: 10, decisions: 11, determination: 11, flair: 14, leadership: 5, offTheBall: 13, positioning: 5, teamwork: 12, vision: 12, workRate: 12 },
      physical: { acceleration: 17, agility: 15, balance: 13, jumping: 6, naturalFitness: 12, pace: 15, stamina: 12, strength: 6 },
    },
    {
      id: 'sab-xander-severina', name: "Xander Severina", number: 7, age: 25, nationality: 'CUW', positions: ['AML', 'AMR'], foot: 'R',
      technical: { corners: 9, crossing: 11, dribbling: 17, finishing: 16, firstTouch: 13, freeKicks: 11, heading: 5, longShots: 12, marking: 6, passing: 12, penalties: 11, tackling: 7, technique: 13 },
      mental: { aggression: 6, anticipation: 11, bravery: 6, composure: 12, concentration: 11, decisions: 10, determination: 10, flair: 13, leadership: 7, offTheBall: 13, positioning: 7, teamwork: 10, vision: 10, workRate: 12 },
      physical: { acceleration: 14, agility: 14, balance: 12, jumping: 6, naturalFitness: 12, pace: 14, stamina: 13, strength: 7 },
    },
    {
      id: 'sab-veljko-simic', name: "Veljko Simić", number: 9, age: 30, nationality: 'SRB', positions: ['ST'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 12, finishing: 14, firstTouch: 15, freeKicks: 5, heading: 15, longShots: 11, marking: 6, passing: 13, penalties: 12, tackling: 6, technique: 16 },
      mental: { aggression: 7, anticipation: 15, bravery: 11, composure: 14, concentration: 10, decisions: 13, determination: 13, flair: 12, leadership: 7, offTheBall: 15, positioning: 5, teamwork: 12, vision: 14, workRate: 10 },
      physical: { acceleration: 13, agility: 12, balance: 13, jumping: 13, naturalFitness: 11, pace: 11, stamina: 9, strength: 15 },
    },
    {
      id: 'sab-orphe-mbina', name: "Orphé Mbina", number: 20, age: 24, nationality: 'GAB', positions: ['ST', 'AML'], foot: 'R',
      technical: { corners: 6, crossing: 5, dribbling: 12, finishing: 14, firstTouch: 14, freeKicks: 6, heading: 9, longShots: 11, marking: 7, passing: 11, penalties: 12, tackling: 6, technique: 12 },
      mental: { aggression: 5, anticipation: 14, bravery: 11, composure: 14, concentration: 10, decisions: 11, determination: 13, flair: 10, leadership: 9, offTheBall: 14, positioning: 6, teamwork: 9, vision: 9, workRate: 11 },
      physical: { acceleration: 15, agility: 14, balance: 11, jumping: 11, naturalFitness: 13, pace: 16, stamina: 10, strength: 10 },
    },
    {
      id: 'sab-christian-nwachukwu', name: "Christian Nwachukwu", number: 18, age: 23, nationality: 'NGA', positions: ['ST'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 11, finishing: 15, firstTouch: 14, freeKicks: 5, heading: 13, longShots: 10, marking: 6, passing: 7, penalties: 11, tackling: 6, technique: 13 },
      mental: { aggression: 7, anticipation: 16, bravery: 10, composure: 14, concentration: 9, decisions: 10, determination: 12, flair: 11, leadership: 5, offTheBall: 16, positioning: 5, teamwork: 11, vision: 8, workRate: 7 },
      physical: { acceleration: 13, agility: 12, balance: 12, jumping: 12, naturalFitness: 11, pace: 11, stamina: 7, strength: 12 },
      flag: "Appears in some 2026 listings but not in the UEFA squad list.",
    },
    {
      id: 'sab-joy-lance-mickels', name: "Joy-Lance Mickels", number: 23, age: 31, nationality: 'GER', positions: ['ST'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 12, finishing: 16, firstTouch: 15, freeKicks: 5, heading: 14, longShots: 11, marking: 6, passing: 8, penalties: 12, tackling: 6, technique: 14 },
      mental: { aggression: 7, anticipation: 17, bravery: 11, composure: 15, concentration: 10, decisions: 12, determination: 13, flair: 12, leadership: 8, offTheBall: 17, positioning: 6, teamwork: 12, vision: 9, workRate: 8 },
      physical: { acceleration: 12, agility: 11, balance: 13, jumping: 13, naturalFitness: 10, pace: 10, stamina: 6, strength: 13 },
      flag: "Appears in some 2026 listings but not in the UEFA squad list.",
    },
  ],
});
