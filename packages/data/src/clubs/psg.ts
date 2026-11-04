// Paris Saint-Germain: 2026-27 squad. Ratings are Touchline's own estimates from each player's level and role
// (not taken from any game or ratings database). Generated from packages/data/scouting/psg.ts;
// this file is now the source of truth: edit any number by hand (1-20), then run `npm run data:check`.
import { defineClub } from '../define';

export default defineClub({
  id: 'psg',
  name: "Paris Saint-Germain",
  shortName: "PSG",
  abbr: 'PSG',
  country: 'FRA',
  pot: 1,
  kits: {
    home: {"shirt":"#1b2a4e","trim":"#da291c","pattern":"plain","shorts":"#1b2a4e","number":"#ffffff"},
    away: {"shirt":"#f5f5f5","trim":"#1b2a4e","pattern":"plain","shorts":"#f5f5f5","number":"#1b2a4e"},
    gk: {"shirt":"#22c55e","trim":"#111111","pattern":"plain","shorts":"#111111","number":"#111111"},
  },
  defaultTactic: { formation: '4-3-3', instructions: {"mentality":1,"pressing":2,"line":1,"width":0,"tempo":1,"directness":-1,"timeWasting":0} },
  dataAsOf: '2026-11-03',
  players: [
    {
      id: 'psg-lucas-chevalier', name: "Lucas Chevalier", number: 30, age: 25, nationality: 'FRA', positions: ['GK'], foot: 'R',
      technical: { corners: 5, crossing: 4, dribbling: 5, finishing: 5, firstTouch: 17, freeKicks: 5, heading: 5, longShots: 6, marking: 6, passing: 16, penalties: 5, tackling: 5, technique: 10 },
      mental: { aggression: 9, anticipation: 16, bravery: 17, composure: 17, concentration: 18, decisions: 17, determination: 17, flair: 5, leadership: 13, offTheBall: 5, positioning: 18, teamwork: 13, vision: 12, workRate: 11 },
      physical: { acceleration: 9, agility: 19, balance: 13, jumping: 15, naturalFitness: 17, pace: 11, stamina: 10, strength: 14 },
      goalkeeping: { aerialReach: 16, commandOfArea: 17, communication: 15, handling: 18, kicking: 17, oneOnOnes: 15, reflexes: 18, rushingOut: 18, throwing: 13 },
    },
    {
      id: 'psg-matvey-safonov', name: "Matvey Safonov", number: 39, age: 27, nationality: 'RUS', positions: ['GK'], foot: 'R',
      technical: { corners: 3, crossing: 3, dribbling: 3, finishing: 3, firstTouch: 12, freeKicks: 3, heading: 3, longShots: 2, marking: 2, passing: 7, penalties: 3, tackling: 2, technique: 8 },
      mental: { aggression: 8, anticipation: 14, bravery: 14, composure: 15, concentration: 17, decisions: 14, determination: 14, flair: 3, leadership: 9, offTheBall: 2, positioning: 17, teamwork: 13, vision: 8, workRate: 8 },
      physical: { acceleration: 8, agility: 16, balance: 14, jumping: 16, naturalFitness: 15, pace: 8, stamina: 8, strength: 12 },
      goalkeeping: { aerialReach: 15, commandOfArea: 15, communication: 16, handling: 16, kicking: 12, oneOnOnes: 17, reflexes: 19, rushingOut: 13, throwing: 13 },
    },
    {
      id: 'psg-renato-marin', name: "Renato Marin", number: 89, age: 20, nationality: 'ITA', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 1, finishing: 1, firstTouch: 10, freeKicks: 1, heading: 1, longShots: 1, marking: 1, passing: 5, penalties: 1, tackling: 1, technique: 6 },
      mental: { aggression: 6, anticipation: 12, bravery: 12, composure: 10, concentration: 13, decisions: 11, determination: 12, flair: 1, leadership: 2, offTheBall: 1, positioning: 13, teamwork: 11, vision: 6, workRate: 4 },
      physical: { acceleration: 6, agility: 14, balance: 10, jumping: 12, naturalFitness: 11, pace: 4, stamina: 4, strength: 10 },
      goalkeeping: { aerialReach: 11, commandOfArea: 11, communication: 12, handling: 14, kicking: 10, oneOnOnes: 13, reflexes: 15, rushingOut: 9, throwing: 11 },
    },
    {
      id: 'psg-achraf-hakimi', name: "Achraf Hakimi", number: 2, age: 27, nationality: 'MAR', positions: ['DR', 'WBR'], foot: 'R',
      technical: { corners: 11, crossing: 17, dribbling: 19, finishing: 11, firstTouch: 14, freeKicks: 11, heading: 15, longShots: 10, marking: 14, passing: 16, penalties: 11, tackling: 16, technique: 16 },
      mental: { aggression: 15, anticipation: 16, bravery: 14, composure: 15, concentration: 17, decisions: 14, determination: 16, flair: 11, leadership: 12, offTheBall: 17, positioning: 15, teamwork: 17, vision: 11, workRate: 19 },
      physical: { acceleration: 19, agility: 16, balance: 16, jumping: 16, naturalFitness: 17, pace: 19, stamina: 19, strength: 14 },
    },
    {
      id: 'psg-marquinhos', name: "Marquinhos", number: 5, age: 32, nationality: 'BRA', positions: ['DC'], foot: 'R',
      technical: { corners: 10, crossing: 10, dribbling: 10, finishing: 5, firstTouch: 17, freeKicks: 10, heading: 18, longShots: 9, marking: 18, passing: 18, penalties: 10, tackling: 18, technique: 18 },
      mental: { aggression: 17, anticipation: 16, bravery: 16, composure: 18, concentration: 17, decisions: 18, determination: 16, flair: 10, leadership: 18, offTheBall: 9, positioning: 20, teamwork: 15, vision: 14, workRate: 15 },
      physical: { acceleration: 13, agility: 12, balance: 16, jumping: 20, naturalFitness: 15, pace: 13, stamina: 13, strength: 18 },
    },
    {
      id: 'psg-willian-pacho', name: "Willian Pacho", number: 51, age: 24, nationality: 'ECU', positions: ['DC'], foot: 'L',
      technical: { corners: 9, crossing: 10, dribbling: 11, finishing: 6, firstTouch: 16, freeKicks: 11, heading: 17, longShots: 10, marking: 19, passing: 15, penalties: 11, tackling: 20, technique: 14 },
      mental: { aggression: 17, anticipation: 19, bravery: 17, composure: 16, concentration: 18, decisions: 17, determination: 17, flair: 9, leadership: 11, offTheBall: 11, positioning: 20, teamwork: 15, vision: 10, workRate: 15 },
      physical: { acceleration: 19, agility: 17, balance: 15, jumping: 19, naturalFitness: 17, pace: 19, stamina: 16, strength: 20 },
    },
    {
      id: 'psg-illia-zabarnyi', name: "Illia Zabarnyi", number: 6, age: 23, nationality: 'UKR', positions: ['DC'], foot: 'R',
      technical: { corners: 9, crossing: 8, dribbling: 9, finishing: 4, firstTouch: 14, freeKicks: 9, heading: 19, longShots: 10, marking: 19, passing: 13, penalties: 9, tackling: 18, technique: 14 },
      mental: { aggression: 17, anticipation: 16, bravery: 17, composure: 13, concentration: 16, decisions: 17, determination: 17, flair: 9, leadership: 12, offTheBall: 9, positioning: 18, teamwork: 13, vision: 8, workRate: 15 },
      physical: { acceleration: 13, agility: 15, balance: 13, jumping: 17, naturalFitness: 17, pace: 14, stamina: 14, strength: 19 },
    },
    {
      id: 'psg-lucas-beraldo', name: "Lucas Beraldo", number: 4, age: 22, nationality: 'BRA', positions: ['DC', 'DL'], foot: 'L',
      technical: { corners: 7, crossing: 8, dribbling: 9, finishing: 4, firstTouch: 17, freeKicks: 9, heading: 15, longShots: 8, marking: 17, passing: 17, penalties: 9, tackling: 18, technique: 15 },
      mental: { aggression: 15, anticipation: 16, bravery: 15, composure: 16, concentration: 16, decisions: 15, determination: 15, flair: 7, leadership: 7, offTheBall: 9, positioning: 18, teamwork: 13, vision: 12, workRate: 13 },
      physical: { acceleration: 13, agility: 13, balance: 13, jumping: 17, naturalFitness: 15, pace: 13, stamina: 14, strength: 18 },
    },
    {
      id: 'psg-lucas-hernandez', name: "Lucas Hernández", number: 21, age: 30, nationality: 'FRA', positions: ['DL', 'DC'], foot: 'L',
      technical: { corners: 9, crossing: 15, dribbling: 14, finishing: 9, firstTouch: 14, freeKicks: 9, heading: 14, longShots: 10, marking: 20, passing: 17, penalties: 9, tackling: 20, technique: 14 },
      mental: { aggression: 13, anticipation: 16, bravery: 15, composure: 14, concentration: 16, decisions: 15, determination: 17, flair: 9, leadership: 14, offTheBall: 12, positioning: 19, teamwork: 15, vision: 8, workRate: 19 },
      physical: { acceleration: 16, agility: 16, balance: 13, jumping: 13, naturalFitness: 16, pace: 18, stamina: 17, strength: 14 },
    },
    {
      id: 'psg-nuno-mendes', name: "Nuno Mendes", number: 25, age: 24, nationality: 'POR', positions: ['DL', 'WBL'], foot: 'L',
      technical: { corners: 11, crossing: 20, dribbling: 17, finishing: 11, firstTouch: 14, freeKicks: 11, heading: 15, longShots: 10, marking: 14, passing: 16, penalties: 11, tackling: 16, technique: 16 },
      mental: { aggression: 15, anticipation: 16, bravery: 14, composure: 15, concentration: 17, decisions: 14, determination: 16, flair: 11, leadership: 12, offTheBall: 17, positioning: 15, teamwork: 17, vision: 11, workRate: 19 },
      physical: { acceleration: 19, agility: 16, balance: 16, jumping: 16, naturalFitness: 17, pace: 18, stamina: 19, strength: 14 },
    },
    {
      id: 'psg-vitinha', name: "Vitinha", number: 17, age: 26, nationality: 'POR', positions: ['DM', 'MC'], foot: 'R',
      technical: { corners: 12, crossing: 12, dribbling: 10, finishing: 10, firstTouch: 20, freeKicks: 10, heading: 17, longShots: 16, marking: 15, passing: 19, penalties: 10, tackling: 17, technique: 20 },
      mental: { aggression: 17, anticipation: 20, bravery: 16, composure: 19, concentration: 17, decisions: 20, determination: 18, flair: 12, leadership: 10, offTheBall: 11, positioning: 19, teamwork: 20, vision: 18, workRate: 17 },
      physical: { acceleration: 17, agility: 16, balance: 16, jumping: 16, naturalFitness: 17, pace: 15, stamina: 17, strength: 16 },
    },
    {
      id: 'psg-joao-neves', name: "João Neves", number: 87, age: 21, nationality: 'POR', positions: ['MC', 'DM'], foot: 'R',
      technical: { corners: 16, crossing: 16, dribbling: 16, finishing: 14, firstTouch: 19, freeKicks: 14, heading: 12, longShots: 17, marking: 15, passing: 19, penalties: 10, tackling: 16, technique: 20 },
      mental: { aggression: 16, anticipation: 17, bravery: 15, composure: 15, concentration: 14, decisions: 18, determination: 17, flair: 16, leadership: 8, offTheBall: 19, positioning: 16, teamwork: 20, vision: 17, workRate: 19 },
      physical: { acceleration: 16, agility: 15, balance: 15, jumping: 11, naturalFitness: 16, pace: 14, stamina: 20, strength: 15 },
    },
    {
      id: 'psg-fabian-ruiz', name: "Fabián Ruiz", number: 8, age: 30, nationality: 'ESP', positions: ['MC'], foot: 'L',
      technical: { corners: 13, crossing: 14, dribbling: 17, finishing: 11, firstTouch: 19, freeKicks: 15, heading: 9, longShots: 16, marking: 14, passing: 20, penalties: 11, tackling: 15, technique: 19 },
      mental: { aggression: 14, anticipation: 17, bravery: 14, composure: 19, concentration: 15, decisions: 20, determination: 16, flair: 13, leadership: 13, offTheBall: 17, positioning: 17, teamwork: 18, vision: 20, workRate: 17 },
      physical: { acceleration: 14, agility: 14, balance: 14, jumping: 10, naturalFitness: 16, pace: 14, stamina: 18, strength: 15 },
    },
    {
      id: 'psg-warren-zaire-emery', name: "Warren Zaïre-Emery", number: 33, age: 20, nationality: 'FRA', positions: ['MC', 'DR'], foot: 'R',
      technical: { corners: 14, crossing: 13, dribbling: 16, finishing: 13, firstTouch: 18, freeKicks: 14, heading: 9, longShots: 17, marking: 15, passing: 19, penalties: 9, tackling: 17, technique: 18 },
      mental: { aggression: 13, anticipation: 16, bravery: 15, composure: 15, concentration: 14, decisions: 18, determination: 17, flair: 14, leadership: 10, offTheBall: 18, positioning: 16, teamwork: 17, vision: 14, workRate: 20 },
      physical: { acceleration: 13, agility: 15, balance: 13, jumping: 8, naturalFitness: 17, pace: 15, stamina: 20, strength: 14 },
    },
    {
      id: 'psg-senny-mayulu', name: "Senny Mayulu", number: 24, age: 20, nationality: 'FRA', positions: ['MC', 'AMC'], foot: 'R',
      technical: { corners: 12, crossing: 12, dribbling: 17, finishing: 12, firstTouch: 15, freeKicks: 12, heading: 7, longShots: 14, marking: 11, passing: 15, penalties: 7, tackling: 11, technique: 18 },
      mental: { aggression: 12, anticipation: 13, bravery: 11, composure: 13, concentration: 12, decisions: 14, determination: 13, flair: 14, leadership: 6, offTheBall: 16, positioning: 12, teamwork: 16, vision: 14, workRate: 16 },
      physical: { acceleration: 12, agility: 11, balance: 13, jumping: 8, naturalFitness: 14, pace: 12, stamina: 16, strength: 11 },
      flag: "May have left (or been loaned out) in the summer-2026 window; not confirmed.",
    },
    {
      id: 'psg-ousmane-dembele', name: "Ousmane Dembélé", number: 10, age: 29, nationality: 'FRA', positions: ['AMR', 'ST', 'AML'], foot: 'B',
      technical: { corners: 17, crossing: 18, dribbling: 19, finishing: 17, firstTouch: 18, freeKicks: 15, heading: 13, longShots: 18, marking: 12, passing: 18, penalties: 15, tackling: 12, technique: 20 },
      mental: { aggression: 13, anticipation: 16, bravery: 12, composure: 16, concentration: 15, decisions: 16, determination: 16, flair: 19, leadership: 13, offTheBall: 18, positioning: 11, teamwork: 17, vision: 17, workRate: 17 },
      physical: { acceleration: 20, agility: 20, balance: 18, jumping: 12, naturalFitness: 17, pace: 19, stamina: 17, strength: 12 },
    },
    {
      id: 'psg-khvicha-kvaratskhelia', name: "Khvicha Kvaratskhelia", number: 7, age: 25, nationality: 'GEO', positions: ['AML'], foot: 'R',
      technical: { corners: 16, crossing: 17, dribbling: 19, finishing: 20, firstTouch: 17, freeKicks: 16, heading: 11, longShots: 17, marking: 10, passing: 17, penalties: 16, tackling: 10, technique: 20 },
      mental: { aggression: 11, anticipation: 15, bravery: 10, composure: 17, concentration: 16, decisions: 15, determination: 15, flair: 19, leadership: 12, offTheBall: 17, positioning: 11, teamwork: 16, vision: 16, workRate: 18 },
      physical: { acceleration: 20, agility: 19, balance: 19, jumping: 12, naturalFitness: 18, pace: 20, stamina: 18, strength: 10 },
    },
    {
      id: 'psg-desire-doue', name: "Désiré Doué", number: 14, age: 21, nationality: 'FRA', positions: ['AMR', 'AML', 'AMC'], foot: 'R',
      technical: { corners: 15, crossing: 15, dribbling: 20, finishing: 20, firstTouch: 17, freeKicks: 15, heading: 10, longShots: 18, marking: 11, passing: 18, penalties: 15, tackling: 10, technique: 19 },
      mental: { aggression: 9, anticipation: 15, bravery: 11, composure: 15, concentration: 15, decisions: 15, determination: 16, flair: 19, leadership: 11, offTheBall: 17, positioning: 10, teamwork: 14, vision: 14, workRate: 18 },
      physical: { acceleration: 18, agility: 20, balance: 16, jumping: 9, naturalFitness: 18, pace: 20, stamina: 17, strength: 10 },
    },
    {
      id: 'psg-bradley-barcola', name: "Bradley Barcola", number: 29, age: 24, nationality: 'FRA', positions: ['AML', 'AMR'], foot: 'R',
      technical: { corners: 13, crossing: 20, dribbling: 20, finishing: 15, firstTouch: 17, freeKicks: 15, heading: 9, longShots: 13, marking: 10, passing: 16, penalties: 15, tackling: 11, technique: 17 },
      mental: { aggression: 10, anticipation: 15, bravery: 10, composure: 15, concentration: 15, decisions: 14, determination: 14, flair: 15, leadership: 11, offTheBall: 17, positioning: 11, teamwork: 14, vision: 14, workRate: 16 },
      physical: { acceleration: 19, agility: 18, balance: 16, jumping: 10, naturalFitness: 16, pace: 18, stamina: 17, strength: 11 },
      flag: "May have left (or been loaned out) in the summer-2026 window; not confirmed.",
    },
    {
      id: 'psg-goncalo-ramos', name: "Gonçalo Ramos", number: 9, age: 25, nationality: 'POR', positions: ['ST'], foot: 'R',
      technical: { corners: 9, crossing: 8, dribbling: 16, finishing: 20, firstTouch: 18, freeKicks: 9, heading: 16, longShots: 15, marking: 10, passing: 12, penalties: 16, tackling: 9, technique: 16 },
      mental: { aggression: 8, anticipation: 20, bravery: 15, composure: 19, concentration: 14, decisions: 15, determination: 17, flair: 14, leadership: 12, offTheBall: 20, positioning: 9, teamwork: 13, vision: 10, workRate: 13 },
      physical: { acceleration: 15, agility: 17, balance: 15, jumping: 15, naturalFitness: 17, pace: 17, stamina: 12, strength: 16 },
      flag: "May have left (or been loaned out) in the summer-2026 window; not confirmed.",
    },
    {
      id: 'psg-quentin-ndjantou', name: "Quentin Ndjantou", number: 20, age: 19, nationality: 'FRA', positions: ['ST', 'AMR'], foot: 'R',
      technical: { corners: 6, crossing: 5, dribbling: 13, finishing: 15, firstTouch: 15, freeKicks: 6, heading: 10, longShots: 12, marking: 7, passing: 12, penalties: 13, tackling: 6, technique: 13 },
      mental: { aggression: 5, anticipation: 14, bravery: 12, composure: 13, concentration: 10, decisions: 10, determination: 14, flair: 11, leadership: 6, offTheBall: 15, positioning: 5, teamwork: 10, vision: 10, workRate: 12 },
      physical: { acceleration: 16, agility: 15, balance: 12, jumping: 12, naturalFitness: 14, pace: 17, stamina: 11, strength: 10 },
    },
  ],
});
