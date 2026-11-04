// Shakhtar Donetsk: 2026-27 squad. Ratings are Touchline's own estimates from each player's level and role
// (not taken from any game or ratings database). Generated from packages/data/scouting/shakhtar-donetsk.ts;
// this file is now the source of truth: edit any number by hand (1-20), then run `npm run data:check`.
import { defineClub } from '../define';

export default defineClub({
  id: 'shakhtar-donetsk',
  name: "Shakhtar Donetsk",
  shortName: "Shakhtar",
  abbr: 'SHK',
  country: 'UKR',
  pot: 3,
  kits: {
    home: {"shirt":"#f26522","trim":"#111111","pattern":"stripes","shorts":"#111111","number":"#111111"},
    away: {"shirt":"#f5f5f5","trim":"#f26522","pattern":"plain","shorts":"#f5f5f5","number":"#f26522"},
    gk: {"shirt":"#22c55e","trim":"#111111","pattern":"plain","shorts":"#111111","number":"#111111"},
  },
  defaultTactic: { formation: '4-2-3-1', instructions: {"mentality":1,"pressing":0,"line":0,"width":0,"tempo":1,"directness":-1,"timeWasting":0} },
  dataAsOf: '2026-11-03',
  notes: "Ukrainian champions 2025-26; head coach Arda Turan. Squad largely from 2025-26.",
  players: [
    {
      id: 'shk-dmytro-riznyk', name: "Dmytro Riznyk", number: 31, age: 27, nationality: 'UKR', positions: ['GK'], foot: 'R',
      technical: { corners: 4, crossing: 4, dribbling: 2, finishing: 2, firstTouch: 12, freeKicks: 2, heading: 4, longShots: 3, marking: 3, passing: 8, penalties: 2, tackling: 3, technique: 9 },
      mental: { aggression: 9, anticipation: 14, bravery: 14, composure: 13, concentration: 15, decisions: 14, determination: 14, flair: 4, leadership: 7, offTheBall: 3, positioning: 15, teamwork: 13, vision: 9, workRate: 7 },
      physical: { acceleration: 9, agility: 16, balance: 12, jumping: 14, naturalFitness: 13, pace: 7, stamina: 7, strength: 12 },
      goalkeeping: { aerialReach: 13, commandOfArea: 13, communication: 14, handling: 16, kicking: 12, oneOnOnes: 15, reflexes: 17, rushingOut: 11, throwing: 13 },
    },
    {
      id: 'shk-kiril-fesiun', name: "Kiril Fesiun", number: 23, age: 24, nationality: 'UKR', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 1, finishing: 1, firstTouch: 10, freeKicks: 1, heading: 1, longShots: 1, marking: 1, passing: 6, penalties: 1, tackling: 1, technique: 5 },
      mental: { aggression: 4, anticipation: 12, bravery: 13, composure: 12, concentration: 14, decisions: 13, determination: 13, flair: 1, leadership: 8, offTheBall: 1, positioning: 14, teamwork: 9, vision: 4, workRate: 6 },
      physical: { acceleration: 4, agility: 15, balance: 9, jumping: 11, naturalFitness: 13, pace: 6, stamina: 5, strength: 10 },
      goalkeeping: { aerialReach: 12, commandOfArea: 12, communication: 11, handling: 14, kicking: 9, oneOnOnes: 12, reflexes: 15, rushingOut: 9, throwing: 9 },
    },
    {
      id: 'shk-mykola-matviyenko', name: "Mykola Matviyenko", number: 22, age: 30, nationality: 'UKR', positions: ['DC', 'DL'], foot: 'L',
      technical: { corners: 9, crossing: 9, dribbling: 7, finishing: 2, firstTouch: 16, freeKicks: 7, heading: 17, longShots: 8, marking: 17, passing: 17, penalties: 7, tackling: 17, technique: 17 },
      mental: { aggression: 16, anticipation: 15, bravery: 15, composure: 15, concentration: 14, decisions: 16, determination: 15, flair: 9, leadership: 17, offTheBall: 8, positioning: 16, teamwork: 14, vision: 13, workRate: 12 },
      physical: { acceleration: 13, agility: 12, balance: 13, jumping: 17, naturalFitness: 13, pace: 11, stamina: 11, strength: 17 },
    },
    {
      id: 'shk-valeriy-bondar', name: "Valeriy Bondar", number: 5, age: 27, nationality: 'UKR', positions: ['DC'], foot: 'R',
      technical: { corners: 8, crossing: 8, dribbling: 8, finishing: 3, firstTouch: 11, freeKicks: 8, heading: 17, longShots: 7, marking: 15, passing: 9, penalties: 8, tackling: 15, technique: 12 },
      mental: { aggression: 16, anticipation: 13, bravery: 13, composure: 11, concentration: 14, decisions: 13, determination: 13, flair: 8, leadership: 9, offTheBall: 7, positioning: 16, teamwork: 12, vision: 8, workRate: 12 },
      physical: { acceleration: 12, agility: 11, balance: 13, jumping: 17, naturalFitness: 14, pace: 11, stamina: 12, strength: 16 },
    },
    {
      id: 'shk-irakli-azarovi', name: "Irakli Azarovi", number: 3, age: 23, nationality: 'GEO', positions: ['DL'], foot: 'L',
      technical: { corners: 8, crossing: 19, dribbling: 15, finishing: 6, firstTouch: 12, freeKicks: 6, heading: 13, longShots: 7, marking: 12, passing: 14, penalties: 6, tackling: 14, technique: 14 },
      mental: { aggression: 13, anticipation: 14, bravery: 12, composure: 11, concentration: 13, decisions: 12, determination: 14, flair: 8, leadership: 6, offTheBall: 15, positioning: 11, teamwork: 15, vision: 8, workRate: 15 },
      physical: { acceleration: 17, agility: 14, balance: 12, jumping: 12, naturalFitness: 13, pace: 15, stamina: 15, strength: 12 },
    },
    {
      id: 'shk-vinicius-tobias', name: "Vinícius Tobias", number: 16, age: 22, nationality: 'BRA', positions: ['DR'], foot: 'R',
      technical: { corners: 7, crossing: 18, dribbling: 16, finishing: 7, firstTouch: 11, freeKicks: 7, heading: 12, longShots: 6, marking: 11, passing: 13, penalties: 7, tackling: 13, technique: 13 },
      mental: { aggression: 12, anticipation: 13, bravery: 11, composure: 11, concentration: 14, decisions: 10, determination: 13, flair: 7, leadership: 6, offTheBall: 14, positioning: 12, teamwork: 14, vision: 7, workRate: 16 },
      physical: { acceleration: 16, agility: 13, balance: 13, jumping: 13, naturalFitness: 14, pace: 16, stamina: 16, strength: 11 },
      flag: "May have left (or been loaned out) in the summer-2026 window; not confirmed.",
    },
    {
      id: 'shk-alaa-ghram', name: "Alaa Ghram", number: 26, age: 24, nationality: 'TUN', positions: ['DR'], foot: 'R',
      technical: { corners: 7, crossing: 13, dribbling: 11, finishing: 7, firstTouch: 10, freeKicks: 7, heading: 11, longShots: 6, marking: 15, passing: 12, penalties: 7, tackling: 16, technique: 11 },
      mental: { aggression: 11, anticipation: 12, bravery: 10, composure: 11, concentration: 13, decisions: 10, determination: 12, flair: 7, leadership: 8, offTheBall: 8, positioning: 16, teamwork: 13, vision: 7, workRate: 15 },
      physical: { acceleration: 15, agility: 12, balance: 12, jumping: 12, naturalFitness: 13, pace: 15, stamina: 15, strength: 10 },
    },
    {
      id: 'shk-taras-stepanenko', name: "Taras Stepanenko", number: 6, age: 37, nationality: 'UKR', positions: ['DM'], foot: 'R',
      technical: { corners: 6, crossing: 7, dribbling: 6, finishing: 8, firstTouch: 14, freeKicks: 8, heading: 10, longShots: 11, marking: 15, passing: 13, penalties: 8, tackling: 17, technique: 10 },
      mental: { aggression: 11, anticipation: 16, bravery: 11, composure: 15, concentration: 14, decisions: 16, determination: 13, flair: 6, leadership: 18, offTheBall: 8, positioning: 19, teamwork: 15, vision: 8, workRate: 13 },
      physical: { acceleration: 8, agility: 8, balance: 11, jumping: 11, naturalFitness: 10, pace: 8, stamina: 11, strength: 16 },
      flag: "May have left (or been loaned out) in the summer-2026 window; not confirmed.",
    },
    {
      id: 'shk-artem-bondarenko', name: "Artem Bondarenko", number: 21, age: 26, nationality: 'UKR', positions: ['MC', 'AMC'], foot: 'R',
      technical: { corners: 13, crossing: 13, dribbling: 13, finishing: 11, firstTouch: 16, freeKicks: 11, heading: 9, longShots: 14, marking: 12, passing: 16, penalties: 7, tackling: 15, technique: 17 },
      mental: { aggression: 13, anticipation: 14, bravery: 12, composure: 13, concentration: 11, decisions: 16, determination: 14, flair: 13, leadership: 7, offTheBall: 16, positioning: 13, teamwork: 17, vision: 14, workRate: 18 },
      physical: { acceleration: 13, agility: 12, balance: 12, jumping: 8, naturalFitness: 13, pace: 11, stamina: 18, strength: 12 },
    },
    {
      id: 'shk-oleh-ocheretko', name: "Oleh Ocheretko", number: 29, age: 23, nationality: 'UKR', positions: ['DM', 'MC'], foot: 'R',
      technical: { corners: 8, crossing: 8, dribbling: 6, finishing: 6, firstTouch: 14, freeKicks: 6, heading: 13, longShots: 12, marking: 14, passing: 16, penalties: 6, tackling: 19, technique: 11 },
      mental: { aggression: 17, anticipation: 16, bravery: 14, composure: 12, concentration: 13, decisions: 16, determination: 14, flair: 8, leadership: 6, offTheBall: 7, positioning: 15, teamwork: 17, vision: 10, workRate: 16 },
      physical: { acceleration: 13, agility: 12, balance: 12, jumping: 12, naturalFitness: 13, pace: 11, stamina: 15, strength: 14 },
    },
    {
      id: 'shk-marlon-gomes', name: "Marlon Gomes", number: 8, age: 22, nationality: 'BRA', positions: ['MC', 'DM'], foot: 'R',
      technical: { corners: 13, crossing: 13, dribbling: 13, finishing: 7, firstTouch: 16, freeKicks: 11, heading: 9, longShots: 14, marking: 12, passing: 19, penalties: 7, tackling: 12, technique: 19 },
      mental: { aggression: 13, anticipation: 14, bravery: 12, composure: 14, concentration: 11, decisions: 17, determination: 14, flair: 13, leadership: 5, offTheBall: 14, positioning: 13, teamwork: 17, vision: 19, workRate: 14 },
      physical: { acceleration: 13, agility: 12, balance: 12, jumping: 8, naturalFitness: 13, pace: 11, stamina: 14, strength: 12 },
    },
    {
      id: 'shk-dmytro-kryskiv', name: "Dmytro Kryskiv", number: 7, age: 26, nationality: 'UKR', positions: ['MC'], foot: 'R',
      technical: { corners: 13, crossing: 13, dribbling: 13, finishing: 10, firstTouch: 16, freeKicks: 11, heading: 8, longShots: 14, marking: 12, passing: 16, penalties: 6, tackling: 15, technique: 17 },
      mental: { aggression: 13, anticipation: 14, bravery: 12, composure: 13, concentration: 11, decisions: 16, determination: 14, flair: 13, leadership: 6, offTheBall: 16, positioning: 13, teamwork: 17, vision: 14, workRate: 18 },
      physical: { acceleration: 13, agility: 12, balance: 12, jumping: 7, naturalFitness: 13, pace: 11, stamina: 18, strength: 12 },
    },
    {
      id: 'shk-pedrinho', name: "Pedrinho", number: 10, age: 28, nationality: 'BRA', positions: ['AMR', 'AMC'], foot: 'R',
      technical: { corners: 13, crossing: 13, dribbling: 17, finishing: 15, firstTouch: 16, freeKicks: 13, heading: 8, longShots: 14, marking: 7, passing: 18, penalties: 13, tackling: 7, technique: 17 },
      mental: { aggression: 8, anticipation: 14, bravery: 7, composure: 15, concentration: 13, decisions: 15, determination: 12, flair: 19, leadership: 9, offTheBall: 14, positioning: 8, teamwork: 13, vision: 19, workRate: 13 },
      physical: { acceleration: 13, agility: 14, balance: 16, jumping: 9, naturalFitness: 15, pace: 13, stamina: 13, strength: 7 },
    },
    {
      id: 'shk-eguinaldo', name: "Eguinaldo", number: 11, age: 22, nationality: 'BRA', positions: ['AML'], foot: 'R',
      technical: { corners: 12, crossing: 17, dribbling: 17, finishing: 12, firstTouch: 14, freeKicks: 12, heading: 8, longShots: 12, marking: 9, passing: 15, penalties: 12, tackling: 8, technique: 16 },
      mental: { aggression: 7, anticipation: 12, bravery: 9, composure: 11, concentration: 12, decisions: 12, determination: 13, flair: 14, leadership: 9, offTheBall: 14, positioning: 8, teamwork: 11, vision: 11, workRate: 15 },
      physical: { acceleration: 16, agility: 17, balance: 13, jumping: 7, naturalFitness: 15, pace: 18, stamina: 14, strength: 8 },
    },
    {
      id: 'shk-newerton', name: "Newerton", number: 17, age: 21, nationality: 'BRA', positions: ['AMR'], foot: 'L',
      technical: { corners: 11, crossing: 13, dribbling: 19, finishing: 18, firstTouch: 15, freeKicks: 13, heading: 6, longShots: 14, marking: 7, passing: 14, penalties: 13, tackling: 8, technique: 15 },
      mental: { aggression: 7, anticipation: 13, bravery: 7, composure: 13, concentration: 13, decisions: 11, determination: 12, flair: 15, leadership: 6, offTheBall: 15, positioning: 8, teamwork: 12, vision: 12, workRate: 14 },
      physical: { acceleration: 16, agility: 16, balance: 14, jumping: 7, naturalFitness: 14, pace: 16, stamina: 15, strength: 8 },
    },
    {
      id: 'shk-lucas-ferreira', name: "Lucas Ferreira", number: 30, age: 19, nationality: 'BRA', positions: ['AMC', 'AMR'], foot: 'R',
      technical: { corners: 13, crossing: 13, dribbling: 15, finishing: 13, firstTouch: 16, freeKicks: 11, heading: 8, longShots: 14, marking: 7, passing: 18, penalties: 11, tackling: 7, technique: 17 },
      mental: { aggression: 8, anticipation: 13, bravery: 7, composure: 11, concentration: 10, decisions: 13, determination: 12, flair: 19, leadership: 3, offTheBall: 14, positioning: 5, teamwork: 13, vision: 19, workRate: 11 },
      physical: { acceleration: 13, agility: 14, balance: 14, jumping: 7, naturalFitness: 13, pace: 11, stamina: 11, strength: 6 },
    },
    {
      id: 'shk-lassina-traore', name: "Lassina Traoré", number: 2, age: 25, nationality: 'BFA', positions: ['ST'], foot: 'R',
      technical: { corners: 8, crossing: 8, dribbling: 12, finishing: 17, firstTouch: 16, freeKicks: 8, heading: 19, longShots: 12, marking: 7, passing: 12, penalties: 15, tackling: 7, technique: 15 },
      mental: { aggression: 8, anticipation: 16, bravery: 14, composure: 17, concentration: 13, decisions: 12, determination: 14, flair: 13, leadership: 9, offTheBall: 16, positioning: 8, teamwork: 13, vision: 13, workRate: 13 },
      physical: { acceleration: 12, agility: 11, balance: 16, jumping: 19, naturalFitness: 15, pace: 12, stamina: 13, strength: 18 },
    },
    {
      id: 'shk-kaua-elias', name: "Kauã Elias", number: 9, age: 20, nationality: 'BRA', positions: ['ST'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 14, finishing: 18, firstTouch: 15, freeKicks: 7, heading: 14, longShots: 11, marking: 6, passing: 8, penalties: 14, tackling: 6, technique: 14 },
      mental: { aggression: 7, anticipation: 17, bravery: 11, composure: 16, concentration: 12, decisions: 10, determination: 13, flair: 12, leadership: 6, offTheBall: 17, positioning: 7, teamwork: 12, vision: 9, workRate: 10 },
      physical: { acceleration: 14, agility: 13, balance: 15, jumping: 15, naturalFitness: 14, pace: 14, stamina: 10, strength: 13 },
    },
    {
      id: 'shk-ivan-petryak', name: "Ivan Petryak", number: 19, age: 32, nationality: 'UKR', positions: ['AMR', 'MR'], foot: 'R',
      technical: { corners: 11, crossing: 17, dribbling: 14, finishing: 9, firstTouch: 12, freeKicks: 9, heading: 7, longShots: 9, marking: 6, passing: 12, penalties: 9, tackling: 6, technique: 15 },
      mental: { aggression: 7, anticipation: 10, bravery: 6, composure: 9, concentration: 9, decisions: 11, determination: 10, flair: 13, leadership: 8, offTheBall: 12, positioning: 6, teamwork: 11, vision: 11, workRate: 11 },
      physical: { acceleration: 15, agility: 13, balance: 12, jumping: 6, naturalFitness: 10, pace: 13, stamina: 10, strength: 6 },
      flag: "Reported summer-2026 arrival; not confirmed against an official club squad list.",
    },
  ],
});
