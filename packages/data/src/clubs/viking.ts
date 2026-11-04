// Viking: 2026-27 squad. Ratings are Touchline's own estimates from each player's level and role
// (not taken from any game or ratings database). Generated from packages/data/scouting/viking.ts;
// this file is now the source of truth: edit any number by hand (1-20), then run `npm run data:check`.
import { defineClub } from '../define';

export default defineClub({
  id: 'viking',
  name: "Viking",
  shortName: "Viking",
  abbr: 'VIK',
  country: 'NOR',
  pot: 4,
  kits: {
    home: {"shirt":"#1b3a6b","trim":"#ffffff","pattern":"plain","shorts":"#ffffff","number":"#ffffff"},
    away: {"shirt":"#f5f5f5","trim":"#1b3a6b","pattern":"plain","shorts":"#f5f5f5","number":"#1b3a6b"},
    gk: {"shirt":"#f97316","trim":"#111111","pattern":"plain","shorts":"#111111","number":"#111111"},
  },
  defaultTactic: { formation: '4-3-3', instructions: {"mentality":1,"pressing":1,"line":0,"width":0,"tempo":1,"directness":0,"timeWasting":0} },
  dataAsOf: '2026-11-03',
  notes: "Squad pieced together from partial 2026 listings; shirt numbers, ages and exact positions are estimates for some players.",
  players: [
    {
      id: 'vik-arild-stbo', name: "Arild Østbø", number: 1, age: 34, nationality: 'NOR', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 1, finishing: 1, firstTouch: 10, freeKicks: 1, heading: 1, longShots: 1, marking: 1, passing: 5, penalties: 1, tackling: 1, technique: 6 },
      mental: { aggression: 6, anticipation: 12, bravery: 12, composure: 14, concentration: 15, decisions: 13, determination: 12, flair: 1, leadership: 11, offTheBall: 1, positioning: 16, teamwork: 11, vision: 6, workRate: 6 },
      physical: { acceleration: 3, agility: 11, balance: 12, jumping: 14, naturalFitness: 10, pace: 3, stamina: 3, strength: 10 },
      goalkeeping: { aerialReach: 13, commandOfArea: 13, communication: 14, handling: 14, kicking: 10, oneOnOnes: 15, reflexes: 17, rushingOut: 11, throwing: 11 },
    },
    {
      id: 'vik-lubomir-belko', name: "Ľubomír Belko", number: 30, age: 24, nationality: 'SVK', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 2, finishing: 2, firstTouch: 12, freeKicks: 2, heading: 1, longShots: 1, marking: 1, passing: 6, penalties: 2, tackling: 2, technique: 5 },
      mental: { aggression: 6, anticipation: 14, bravery: 13, composure: 14, concentration: 16, decisions: 13, determination: 13, flair: 1, leadership: 7, offTheBall: 2, positioning: 16, teamwork: 11, vision: 6, workRate: 6 },
      physical: { acceleration: 6, agility: 15, balance: 11, jumping: 13, naturalFitness: 13, pace: 6, stamina: 7, strength: 12 },
      goalkeeping: { aerialReach: 14, commandOfArea: 14, communication: 13, handling: 16, kicking: 9, oneOnOnes: 14, reflexes: 15, rushingOut: 9, throwing: 11 },
    },
    {
      id: 'vik-erlend-jacobsen', name: "Erlend Jacobsen", number: 12, age: 25, nationality: 'NOR', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 1, finishing: 1, firstTouch: 9, freeKicks: 1, heading: 1, longShots: 1, marking: 1, passing: 6, penalties: 1, tackling: 1, technique: 5 },
      mental: { aggression: 4, anticipation: 11, bravery: 12, composure: 11, concentration: 13, decisions: 12, determination: 12, flair: 1, leadership: 8, offTheBall: 1, positioning: 13, teamwork: 8, vision: 4, workRate: 6 },
      physical: { acceleration: 4, agility: 14, balance: 8, jumping: 10, naturalFitness: 12, pace: 6, stamina: 5, strength: 9 },
      goalkeeping: { aerialReach: 11, commandOfArea: 11, communication: 10, handling: 13, kicking: 8, oneOnOnes: 11, reflexes: 14, rushingOut: 8, throwing: 8 },
    },
    {
      id: 'vik-herman-haugen', name: "Herman Haugen", number: 2, age: 25, nationality: 'NOR', positions: ['DR', 'DC'], foot: 'R',
      technical: { corners: 5, crossing: 13, dribbling: 12, finishing: 7, firstTouch: 12, freeKicks: 7, heading: 10, longShots: 6, marking: 16, passing: 13, penalties: 7, tackling: 18, technique: 10 },
      mental: { aggression: 11, anticipation: 14, bravery: 11, composure: 12, concentration: 14, decisions: 11, determination: 13, flair: 5, leadership: 7, offTheBall: 10, positioning: 17, teamwork: 13, vision: 6, workRate: 15 },
      physical: { acceleration: 15, agility: 13, balance: 11, jumping: 11, naturalFitness: 13, pace: 15, stamina: 16, strength: 12 },
    },
    {
      id: 'vik-viljar-vevatne', name: "Viljar Vevatne", number: 4, age: 31, nationality: 'NOR', positions: ['DC'], foot: 'R',
      technical: { corners: 5, crossing: 6, dribbling: 7, finishing: 2, firstTouch: 12, freeKicks: 7, heading: 15, longShots: 6, marking: 15, passing: 9, penalties: 7, tackling: 16, technique: 10 },
      mental: { aggression: 15, anticipation: 14, bravery: 13, composure: 11, concentration: 14, decisions: 14, determination: 13, flair: 5, leadership: 10, offTheBall: 7, positioning: 17, teamwork: 11, vision: 6, workRate: 11 },
      physical: { acceleration: 9, agility: 9, balance: 11, jumping: 15, naturalFitness: 11, pace: 8, stamina: 10, strength: 17 },
    },
    {
      id: 'vik-henrik-heggheim', name: "Henrik Heggheim", number: 5, age: 25, nationality: 'NOR', positions: ['DC'], foot: 'R',
      technical: { corners: 6, crossing: 5, dribbling: 6, finishing: 1, firstTouch: 14, freeKicks: 6, heading: 14, longShots: 7, marking: 16, passing: 16, penalties: 6, tackling: 15, technique: 14 },
      mental: { aggression: 12, anticipation: 13, bravery: 14, composure: 14, concentration: 13, decisions: 15, determination: 14, flair: 6, leadership: 9, offTheBall: 6, positioning: 15, teamwork: 10, vision: 9, workRate: 12 },
      physical: { acceleration: 10, agility: 12, balance: 10, jumping: 14, naturalFitness: 14, pace: 12, stamina: 11, strength: 15 },
    },
    {
      id: 'vik-sondre-bjorshol', name: "Sondre Bjørshol", number: 3, age: 32, nationality: 'NOR', positions: ['DR'], foot: 'R',
      technical: { corners: 6, crossing: 16, dribbling: 14, finishing: 6, firstTouch: 9, freeKicks: 6, heading: 10, longShots: 5, marking: 9, passing: 11, penalties: 6, tackling: 11, technique: 11 },
      mental: { aggression: 10, anticipation: 11, bravery: 9, composure: 10, concentration: 12, decisions: 10, determination: 11, flair: 6, leadership: 10, offTheBall: 12, positioning: 11, teamwork: 12, vision: 6, workRate: 14 },
      physical: { acceleration: 13, agility: 10, balance: 11, jumping: 11, naturalFitness: 11, pace: 13, stamina: 13, strength: 9 },
      flag: "Not found in 2026 squad listings; carried over from earlier seasons.",
    },
    {
      id: 'vik-fredrik-torsteinsbo', name: "Fredrik Torsteinsbo", number: 18, age: 31, nationality: 'NOR', positions: ['DL', 'ML'], foot: 'L',
      technical: { corners: 5, crossing: 16, dribbling: 15, finishing: 7, firstTouch: 11, freeKicks: 7, heading: 9, longShots: 6, marking: 10, passing: 12, penalties: 7, tackling: 13, technique: 10 },
      mental: { aggression: 10, anticipation: 13, bravery: 10, composure: 11, concentration: 13, decisions: 11, determination: 12, flair: 5, leadership: 10, offTheBall: 14, positioning: 12, teamwork: 12, vision: 6, workRate: 14 },
      physical: { acceleration: 13, agility: 11, balance: 10, jumping: 10, naturalFitness: 11, pace: 13, stamina: 14, strength: 11 },
    },
    {
      id: 'vik-gianni-stensness', name: "Gianni Stensness", number: 6, age: 27, nationality: 'NOR', positions: ['DM', 'DC'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 5, finishing: 7, firstTouch: 12, freeKicks: 7, heading: 11, longShots: 10, marking: 14, passing: 12, penalties: 7, tackling: 15, technique: 11 },
      mental: { aggression: 11, anticipation: 14, bravery: 10, composure: 13, concentration: 13, decisions: 14, determination: 12, flair: 7, leadership: 8, offTheBall: 6, positioning: 17, teamwork: 15, vision: 8, workRate: 13 },
      physical: { acceleration: 11, agility: 10, balance: 12, jumping: 12, naturalFitness: 13, pace: 11, stamina: 13, strength: 14 },
    },
    {
      id: 'vik-joe-bell', name: "Joe Bell", number: 8, age: 27, nationality: 'NZL', positions: ['MC', 'DM'], foot: 'L',
      technical: { corners: 10, crossing: 11, dribbling: 14, finishing: 8, firstTouch: 16, freeKicks: 12, heading: 6, longShots: 13, marking: 11, passing: 18, penalties: 8, tackling: 12, technique: 16 },
      mental: { aggression: 11, anticipation: 14, bravery: 11, composure: 16, concentration: 12, decisions: 17, determination: 13, flair: 10, leadership: 8, offTheBall: 14, positioning: 14, teamwork: 15, vision: 17, workRate: 14 },
      physical: { acceleration: 11, agility: 11, balance: 11, jumping: 7, naturalFitness: 13, pace: 11, stamina: 15, strength: 12 },
    },
    {
      id: 'vik-kristoffer-lokberg', name: "Kristoffer Løkberg", number: 7, age: 33, nationality: 'NOR', positions: ['MC', 'AMC'], foot: 'R',
      technical: { corners: 10, crossing: 9, dribbling: 12, finishing: 6, firstTouch: 14, freeKicks: 10, heading: 6, longShots: 13, marking: 11, passing: 18, penalties: 6, tackling: 10, technique: 16 },
      mental: { aggression: 9, anticipation: 12, bravery: 11, composure: 15, concentration: 10, decisions: 18, determination: 13, flair: 10, leadership: 13, offTheBall: 12, positioning: 13, teamwork: 13, vision: 15, workRate: 14 },
      physical: { acceleration: 6, agility: 8, balance: 9, jumping: 5, naturalFitness: 10, pace: 8, stamina: 10, strength: 10 },
      flag: "Not found in 2026 squad listings; carried over from earlier seasons.",
    },
    {
      id: 'vik-zlatko-tripic', name: "Zlatko Tripić", number: 10, age: 33, nationality: 'NOR', positions: ['AMC', 'AMR'], foot: 'L',
      technical: { corners: 13, crossing: 13, dribbling: 15, finishing: 13, firstTouch: 16, freeKicks: 16, heading: 8, longShots: 14, marking: 7, passing: 18, penalties: 16, tackling: 7, technique: 17 },
      mental: { aggression: 8, anticipation: 14, bravery: 7, composure: 14, concentration: 11, decisions: 16, determination: 12, flair: 19, leadership: 10, offTheBall: 14, positioning: 7, teamwork: 13, vision: 19, workRate: 11 },
      physical: { acceleration: 10, agility: 11, balance: 14, jumping: 7, naturalFitness: 10, pace: 8, stamina: 8, strength: 7 },
      flag: "Not found in 2026 squad listings; carried over from earlier seasons.",
    },
    {
      id: 'vik-sander-svendsen', name: "Sander Svendsen", number: 14, age: 28, nationality: 'NOR', positions: ['AMC', 'ST'], foot: 'R',
      technical: { corners: 10, crossing: 11, dribbling: 16, finishing: 17, firstTouch: 16, freeKicks: 12, heading: 6, longShots: 13, marking: 7, passing: 13, penalties: 12, tackling: 8, technique: 14 },
      mental: { aggression: 7, anticipation: 16, bravery: 7, composure: 16, concentration: 12, decisions: 13, determination: 11, flair: 14, leadership: 8, offTheBall: 17, positioning: 8, teamwork: 11, vision: 13, workRate: 11 },
      physical: { acceleration: 11, agility: 13, balance: 13, jumping: 7, naturalFitness: 13, pace: 11, stamina: 12, strength: 8 },
      flag: "Not found in 2026 squad listings; carried over from earlier seasons.",
    },
    {
      id: 'vik-yann-erik-de-lanlay', name: "Yann-Erik de Lanlay", number: 11, age: 34, nationality: 'NOR', positions: ['AML', 'AMR'], foot: 'R',
      technical: { corners: 10, crossing: 10, dribbling: 16, finishing: 15, firstTouch: 12, freeKicks: 10, heading: 6, longShots: 13, marking: 7, passing: 13, penalties: 10, tackling: 6, technique: 14 },
      mental: { aggression: 5, anticipation: 10, bravery: 7, composure: 12, concentration: 10, decisions: 12, determination: 11, flair: 14, leadership: 13, offTheBall: 12, positioning: 7, teamwork: 9, vision: 9, workRate: 13 },
      physical: { acceleration: 10, agility: 12, balance: 11, jumping: 5, naturalFitness: 10, pace: 12, stamina: 9, strength: 6 },
      flag: "Not found in 2026 squad listings; carried over from earlier seasons.",
    },
    {
      id: 'vik-ruben-alte', name: "Ruben Alte", number: 22, age: 22, nationality: 'NOR', positions: ['AMR', 'AML'], foot: 'R',
      technical: { corners: 11, crossing: 17, dribbling: 14, finishing: 9, firstTouch: 12, freeKicks: 9, heading: 7, longShots: 9, marking: 6, passing: 12, penalties: 9, tackling: 6, technique: 15 },
      mental: { aggression: 7, anticipation: 10, bravery: 6, composure: 8, concentration: 9, decisions: 9, determination: 10, flair: 13, leadership: 3, offTheBall: 12, positioning: 5, teamwork: 11, vision: 11, workRate: 11 },
      physical: { acceleration: 16, agility: 14, balance: 12, jumping: 6, naturalFitness: 11, pace: 14, stamina: 11, strength: 6 },
    },
    {
      id: 'vik-edvin-austbo', name: "Edvin Austbø", number: 17, age: 21, nationality: 'NOR', positions: ['ST', 'AML'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 11, finishing: 13, firstTouch: 14, freeKicks: 5, heading: 10, longShots: 10, marking: 6, passing: 10, penalties: 11, tackling: 6, technique: 13 },
      mental: { aggression: 7, anticipation: 14, bravery: 10, composure: 12, concentration: 9, decisions: 9, determination: 12, flair: 11, leadership: 3, offTheBall: 14, positioning: 5, teamwork: 11, vision: 11, workRate: 9 },
      physical: { acceleration: 17, agility: 13, balance: 12, jumping: 12, naturalFitness: 11, pace: 14, stamina: 9, strength: 10 },
    },
    {
      id: 'vik-veton-berisha', name: "Veton Berisha", number: 19, age: 32, nationality: 'NOR', positions: ['ST'], foot: 'R',
      technical: { corners: 6, crossing: 6, dribbling: 13, finishing: 17, firstTouch: 14, freeKicks: 6, heading: 13, longShots: 10, marking: 5, passing: 7, penalties: 13, tackling: 5, technique: 13 },
      mental: { aggression: 6, anticipation: 16, bravery: 10, composure: 16, concentration: 11, decisions: 11, determination: 12, flair: 11, leadership: 10, offTheBall: 16, positioning: 7, teamwork: 11, vision: 8, workRate: 9 },
      physical: { acceleration: 11, agility: 10, balance: 14, jumping: 14, naturalFitness: 11, pace: 11, stamina: 7, strength: 12 },
    },
    {
      id: 'vik-peter-christiansen', name: "Peter Christiansen", number: 9, age: 26, nationality: 'DEN', positions: ['ST'], foot: 'R',
      technical: { corners: 7, crossing: 6, dribbling: 14, finishing: 16, firstTouch: 16, freeKicks: 7, heading: 15, longShots: 13, marking: 8, passing: 15, penalties: 14, tackling: 7, technique: 16 },
      mental: { aggression: 6, anticipation: 16, bravery: 13, composure: 16, concentration: 12, decisions: 15, determination: 15, flair: 12, leadership: 10, offTheBall: 16, positioning: 7, teamwork: 11, vision: 13, workRate: 13 },
      physical: { acceleration: 13, agility: 15, balance: 13, jumping: 13, naturalFitness: 15, pace: 15, stamina: 12, strength: 16 },
    },
  ],
});
