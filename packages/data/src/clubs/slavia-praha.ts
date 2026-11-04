// Slavia Praha: 2026-27 squad. Ratings are Touchline's own estimates from each player's level and role
// (not taken from any game or ratings database). Generated from packages/data/scouting/slavia-praha.ts;
// this file is now the source of truth: edit any number by hand (1-20), then run `npm run data:check`.
import { defineClub } from '../define';

export default defineClub({
  id: 'slavia-praha',
  name: "Slavia Praha",
  shortName: "Slavia",
  abbr: 'SLA',
  country: 'CZE',
  pot: 4,
  kits: {
    home: {"shirt":"#ffffff","trim":"#e2001a","pattern":"halves","shorts":"#e2001a","number":"#e2001a"},
    away: {"shirt":"#e2001a","trim":"#ffffff","pattern":"plain","shorts":"#e2001a","number":"#ffffff"},
    gk: {"shirt":"#22c55e","trim":"#111111","pattern":"plain","shorts":"#111111","number":"#111111"},
  },
  defaultTactic: { formation: '3-4-2-1', instructions: {"mentality":1,"pressing":2,"line":0,"width":0,"tempo":1,"directness":1,"timeWasting":0} },
  dataAsOf: '2026-11-03',
  players: [
    {
      id: 'sla-jindrich-stanek', name: "Jindřich Staněk", number: 36, age: 30, nationality: 'CZE', positions: ['GK'], foot: 'R',
      technical: { corners: 2, crossing: 3, dribbling: 4, finishing: 4, firstTouch: 13, freeKicks: 4, heading: 2, longShots: 3, marking: 3, passing: 8, penalties: 4, tackling: 4, technique: 7 },
      mental: { aggression: 8, anticipation: 15, bravery: 14, composure: 15, concentration: 17, decisions: 14, determination: 14, flair: 2, leadership: 11, offTheBall: 4, positioning: 17, teamwork: 12, vision: 8, workRate: 8 },
      physical: { acceleration: 7, agility: 16, balance: 12, jumping: 14, naturalFitness: 14, pace: 7, stamina: 8, strength: 13 },
      goalkeeping: { aerialReach: 15, commandOfArea: 15, communication: 14, handling: 17, kicking: 10, oneOnOnes: 15, reflexes: 16, rushingOut: 10, throwing: 12 },
    },
    {
      id: 'sla-jakub-markovic', name: "Jakub Markovič", number: 1, age: 25, nationality: 'CZE', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 1, finishing: 1, firstTouch: 11, freeKicks: 1, heading: 1, longShots: 1, marking: 1, passing: 5, penalties: 1, tackling: 1, technique: 4 },
      mental: { aggression: 5, anticipation: 13, bravery: 12, composure: 13, concentration: 15, decisions: 12, determination: 12, flair: 1, leadership: 6, offTheBall: 1, positioning: 15, teamwork: 10, vision: 5, workRate: 5 },
      physical: { acceleration: 5, agility: 14, balance: 10, jumping: 12, naturalFitness: 12, pace: 5, stamina: 6, strength: 11 },
      goalkeeping: { aerialReach: 13, commandOfArea: 13, communication: 12, handling: 15, kicking: 8, oneOnOnes: 13, reflexes: 14, rushingOut: 8, throwing: 10 },
    },
    {
      id: 'sla-tomas-holes', name: "Tomáš Holeš", number: 3, age: 33, nationality: 'CZE', positions: ['DC', 'DM'], foot: 'R',
      technical: { corners: 7, crossing: 6, dribbling: 7, finishing: 2, firstTouch: 12, freeKicks: 7, heading: 17, longShots: 8, marking: 17, passing: 11, penalties: 7, tackling: 16, technique: 12 },
      mental: { aggression: 15, anticipation: 14, bravery: 15, composure: 12, concentration: 14, decisions: 16, determination: 15, flair: 7, leadership: 16, offTheBall: 7, positioning: 17, teamwork: 11, vision: 6, workRate: 13 },
      physical: { acceleration: 8, agility: 10, balance: 11, jumping: 15, naturalFitness: 12, pace: 9, stamina: 9, strength: 17 },
    },
    {
      id: 'sla-igoh-ogbu', name: "Igoh Ogbu", number: 5, age: 26, nationality: 'NGA', positions: ['DC'], foot: 'R',
      technical: { corners: 8, crossing: 8, dribbling: 8, finishing: 3, firstTouch: 11, freeKicks: 8, heading: 17, longShots: 7, marking: 15, passing: 9, penalties: 8, tackling: 15, technique: 12 },
      mental: { aggression: 16, anticipation: 13, bravery: 13, composure: 11, concentration: 14, decisions: 13, determination: 13, flair: 8, leadership: 9, offTheBall: 7, positioning: 16, teamwork: 12, vision: 8, workRate: 12 },
      physical: { acceleration: 12, agility: 11, balance: 13, jumping: 17, naturalFitness: 14, pace: 11, stamina: 12, strength: 16 },
    },
    {
      id: 'sla-david-zima', name: "David Zima", number: 4, age: 25, nationality: 'CZE', positions: ['DC'], foot: 'R',
      technical: { corners: 8, crossing: 7, dribbling: 8, finishing: 3, firstTouch: 15, freeKicks: 8, heading: 15, longShots: 9, marking: 17, passing: 17, penalties: 8, tackling: 16, technique: 15 },
      mental: { aggression: 13, anticipation: 14, bravery: 15, composure: 15, concentration: 14, decisions: 16, determination: 15, flair: 8, leadership: 11, offTheBall: 8, positioning: 16, teamwork: 11, vision: 11, workRate: 13 },
      physical: { acceleration: 11, agility: 13, balance: 11, jumping: 15, naturalFitness: 15, pace: 13, stamina: 12, strength: 16 },
    },
    {
      id: 'sla-stepan-chaloupek', name: "Štěpán Chaloupek", number: 25, age: 23, nationality: 'CZE', positions: ['DC'], foot: 'L',
      technical: { corners: 7, crossing: 6, dribbling: 7, finishing: 2, firstTouch: 15, freeKicks: 7, heading: 15, longShots: 8, marking: 17, passing: 17, penalties: 7, tackling: 16, technique: 15 },
      mental: { aggression: 13, anticipation: 14, bravery: 15, composure: 15, concentration: 14, decisions: 16, determination: 15, flair: 7, leadership: 10, offTheBall: 7, positioning: 16, teamwork: 11, vision: 10, workRate: 13 },
      physical: { acceleration: 11, agility: 13, balance: 11, jumping: 15, naturalFitness: 15, pace: 13, stamina: 12, strength: 16 },
    },
    {
      id: 'sla-denis-halinsky', name: "Denis Halinský", number: 32, age: 22, nationality: 'CZE', positions: ['DC'], foot: 'R',
      technical: { corners: 6, crossing: 6, dribbling: 6, finishing: 1, firstTouch: 9, freeKicks: 6, heading: 15, longShots: 5, marking: 13, passing: 7, penalties: 6, tackling: 13, technique: 10 },
      mental: { aggression: 14, anticipation: 11, bravery: 11, composure: 8, concentration: 12, decisions: 10, determination: 11, flair: 6, leadership: 5, offTheBall: 5, positioning: 14, teamwork: 10, vision: 6, workRate: 10 },
      physical: { acceleration: 10, agility: 9, balance: 11, jumping: 15, naturalFitness: 12, pace: 9, stamina: 10, strength: 14 },
      flag: "On loan / loan return reported for 2026-27; status not confirmed.",
    },
    {
      id: 'sla-david-doudera', name: "David Douděra", number: 21, age: 28, nationality: 'CZE', positions: ['WBR', 'DR'], foot: 'R',
      technical: { corners: 7, crossing: 18, dribbling: 16, finishing: 7, firstTouch: 11, freeKicks: 7, heading: 12, longShots: 6, marking: 11, passing: 13, penalties: 7, tackling: 13, technique: 13 },
      mental: { aggression: 12, anticipation: 13, bravery: 11, composure: 12, concentration: 14, decisions: 11, determination: 13, flair: 7, leadership: 8, offTheBall: 14, positioning: 12, teamwork: 14, vision: 7, workRate: 16 },
      physical: { acceleration: 16, agility: 13, balance: 13, jumping: 13, naturalFitness: 14, pace: 16, stamina: 16, strength: 11 },
    },
    {
      id: 'sla-jan-boril', name: "Jan Bořil", number: 18, age: 35, nationality: 'CZE', positions: ['WBL', 'DL'], foot: 'L',
      technical: { corners: 6, crossing: 12, dribbling: 11, finishing: 6, firstTouch: 11, freeKicks: 6, heading: 11, longShots: 7, marking: 17, passing: 14, penalties: 6, tackling: 17, technique: 11 },
      mental: { aggression: 10, anticipation: 13, bravery: 12, composure: 12, concentration: 13, decisions: 13, determination: 14, flair: 6, leadership: 13, offTheBall: 9, positioning: 17, teamwork: 12, vision: 5, workRate: 16 },
      physical: { acceleration: 11, agility: 11, balance: 10, jumping: 10, naturalFitness: 11, pace: 13, stamina: 12, strength: 11 },
      flag: "May have left (or been loaned out) in the summer-2026 window; not confirmed.",
    },
    {
      id: 'sla-oscar-dorley', name: "Oscar Dorley", number: 19, age: 28, nationality: 'LBR', positions: ['WBL', 'DM'], foot: 'L',
      technical: { corners: 12, crossing: 15, dribbling: 14, finishing: 14, firstTouch: 14, freeKicks: 12, heading: 7, longShots: 13, marking: 13, passing: 15, penalties: 12, tackling: 13, technique: 16 },
      mental: { aggression: 6, anticipation: 12, bravery: 8, composure: 12, concentration: 12, decisions: 13, determination: 13, flair: 12, leadership: 10, offTheBall: 14, positioning: 12, teamwork: 14, vision: 11, workRate: 19 },
      physical: { acceleration: 15, agility: 17, balance: 13, jumping: 6, naturalFitness: 15, pace: 17, stamina: 18, strength: 7 },
    },
    {
      id: 'sla-daiki-hashioka', name: "Daiki Hashioka", number: 27, age: 27, nationality: 'JPN', positions: ['WBR', 'DR'], foot: 'R',
      technical: { corners: 7, crossing: 17, dribbling: 15, finishing: 7, firstTouch: 10, freeKicks: 7, heading: 11, longShots: 6, marking: 10, passing: 12, penalties: 7, tackling: 12, technique: 12 },
      mental: { aggression: 11, anticipation: 12, bravery: 10, composure: 11, concentration: 13, decisions: 10, determination: 12, flair: 7, leadership: 8, offTheBall: 13, positioning: 11, teamwork: 13, vision: 7, workRate: 15 },
      physical: { acceleration: 15, agility: 12, balance: 12, jumping: 12, naturalFitness: 13, pace: 15, stamina: 15, strength: 10 },
      flag: "Listed from the 2025-26 squad; 2026-27 status not confirmed.",
    },
    {
      id: 'sla-michal-sadilek', name: "Michal Sadílek", number: 23, age: 27, nationality: 'CZE', positions: ['MC', 'DM'], foot: 'R',
      technical: { corners: 11, crossing: 12, dribbling: 15, finishing: 13, firstTouch: 17, freeKicks: 13, heading: 7, longShots: 14, marking: 12, passing: 16, penalties: 9, tackling: 16, technique: 15 },
      mental: { aggression: 12, anticipation: 15, bravery: 12, composure: 15, concentration: 13, decisions: 16, determination: 14, flair: 11, leadership: 9, offTheBall: 17, positioning: 15, teamwork: 16, vision: 13, workRate: 19 },
      physical: { acceleration: 12, agility: 12, balance: 12, jumping: 8, naturalFitness: 14, pace: 12, stamina: 20, strength: 13 },
    },
    {
      id: 'sla-christos-zafeiris', name: "Christos Zafeiris", number: 10, age: 23, nationality: 'GRE', positions: ['MC'], foot: 'R',
      technical: { corners: 13, crossing: 13, dribbling: 15, finishing: 12, firstTouch: 16, freeKicks: 13, heading: 8, longShots: 14, marking: 12, passing: 16, penalties: 8, tackling: 15, technique: 17 },
      mental: { aggression: 13, anticipation: 14, bravery: 12, composure: 15, concentration: 13, decisions: 16, determination: 14, flair: 13, leadership: 9, offTheBall: 16, positioning: 15, teamwork: 17, vision: 14, workRate: 20 },
      physical: { acceleration: 13, agility: 12, balance: 14, jumping: 9, naturalFitness: 15, pace: 13, stamina: 20, strength: 12 },
    },
    {
      id: 'sla-lukas-provod', name: "Lukáš Provod", number: 17, age: 30, nationality: 'CZE', positions: ['AMC', 'ML'], foot: 'L',
      technical: { corners: 14, crossing: 16, dribbling: 16, finishing: 14, firstTouch: 17, freeKicks: 12, heading: 9, longShots: 16, marking: 8, passing: 19, penalties: 12, tackling: 8, technique: 18 },
      mental: { aggression: 9, anticipation: 15, bravery: 8, composure: 14, concentration: 12, decisions: 16, determination: 13, flair: 20, leadership: 9, offTheBall: 15, positioning: 7, teamwork: 14, vision: 20, workRate: 12 },
      physical: { acceleration: 13, agility: 14, balance: 15, jumping: 8, naturalFitness: 13, pace: 11, stamina: 11, strength: 8 },
    },
    {
      id: 'sla-ivan-schranz', name: "Ivan Schranz", number: 26, age: 33, nationality: 'SVK', positions: ['AML', 'AMR'], foot: 'R',
      technical: { corners: 12, crossing: 11, dribbling: 16, finishing: 17, firstTouch: 16, freeKicks: 12, heading: 7, longShots: 15, marking: 8, passing: 15, penalties: 12, tackling: 7, technique: 16 },
      mental: { aggression: 6, anticipation: 16, bravery: 8, composure: 17, concentration: 12, decisions: 16, determination: 13, flair: 16, leadership: 14, offTheBall: 17, positioning: 8, teamwork: 11, vision: 13, workRate: 13 },
      physical: { acceleration: 8, agility: 12, balance: 13, jumping: 6, naturalFitness: 12, pace: 10, stamina: 9, strength: 7 },
    },
    {
      id: 'sla-muhammed-cham', name: "Muhammed Cham", number: 22, age: 25, nationality: 'AUT', positions: ['AMC', 'AML'], foot: 'L',
      technical: { corners: 11, crossing: 12, dribbling: 17, finishing: 15, firstTouch: 17, freeKicks: 13, heading: 7, longShots: 14, marking: 8, passing: 18, penalties: 13, tackling: 9, technique: 15 },
      mental: { aggression: 8, anticipation: 15, bravery: 8, composure: 15, concentration: 13, decisions: 15, determination: 12, flair: 17, leadership: 9, offTheBall: 15, positioning: 9, teamwork: 12, vision: 18, workRate: 12 },
      physical: { acceleration: 12, agility: 14, balance: 14, jumping: 8, naturalFitness: 14, pace: 12, stamina: 13, strength: 9 },
      flag: "Listed from the 2025-26 squad; 2026-27 status not confirmed.",
    },
    {
      id: 'sla-mojmir-chytil', name: "Mojmír Chytil", number: 13, age: 27, nationality: 'CZE', positions: ['ST'], foot: 'R',
      technical: { corners: 7, crossing: 6, dribbling: 14, finishing: 18, firstTouch: 16, freeKicks: 7, heading: 14, longShots: 13, marking: 8, passing: 10, penalties: 14, tackling: 7, technique: 14 },
      mental: { aggression: 6, anticipation: 18, bravery: 13, composure: 17, concentration: 12, decisions: 13, determination: 15, flair: 12, leadership: 10, offTheBall: 18, positioning: 7, teamwork: 11, vision: 8, workRate: 11 },
      physical: { acceleration: 13, agility: 15, balance: 13, jumping: 13, naturalFitness: 15, pace: 15, stamina: 10, strength: 14 },
    },
    {
      id: 'sla-tomas-chory', name: "Tomáš Chorý", number: 11, age: 31, nationality: 'CZE', positions: ['ST'], foot: 'R',
      technical: { corners: 6, crossing: 7, dribbling: 12, finishing: 17, firstTouch: 17, freeKicks: 8, heading: 17, longShots: 12, marking: 7, passing: 12, penalties: 15, tackling: 8, technique: 13 },
      mental: { aggression: 7, anticipation: 17, bravery: 14, composure: 17, concentration: 13, decisions: 13, determination: 14, flair: 11, leadership: 11, offTheBall: 17, positioning: 9, teamwork: 12, vision: 12, workRate: 12 },
      physical: { acceleration: 9, agility: 9, balance: 14, jumping: 17, naturalFitness: 12, pace: 9, stamina: 11, strength: 19 },
      flag: "Reported summer-2026 arrival; not confirmed against an official club squad list.",
    },
    {
      id: 'sla-erik-prekop', name: "Erik Prekop", number: 9, age: 28, nationality: 'SVK', positions: ['ST'], foot: 'R',
      technical: { corners: 8, crossing: 8, dribbling: 9, finishing: 14, firstTouch: 15, freeKicks: 6, heading: 18, longShots: 11, marking: 7, passing: 11, penalties: 12, tackling: 7, technique: 14 },
      mental: { aggression: 8, anticipation: 15, bravery: 13, composure: 14, concentration: 10, decisions: 11, determination: 13, flair: 12, leadership: 6, offTheBall: 15, positioning: 6, teamwork: 12, vision: 12, workRate: 10 },
      physical: { acceleration: 11, agility: 10, balance: 13, jumping: 16, naturalFitness: 12, pace: 9, stamina: 10, strength: 17 },
      flag: "Listed from the 2025-26 squad; 2026-27 status not confirmed.",
    },
  ],
});
