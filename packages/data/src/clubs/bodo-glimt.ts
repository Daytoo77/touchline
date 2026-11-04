// Bodø/Glimt: 2026-27 squad. Ratings are Touchline's own estimates from each player's level and role
// (not taken from any game or ratings database). Generated from packages/data/scouting/bodo-glimt.ts;
// this file is now the source of truth: edit any number by hand (1-20), then run `npm run data:check`.
import { defineClub } from '../define';

export default defineClub({
  id: 'bodo-glimt',
  name: "Bodø/Glimt",
  shortName: "Bodø/Glimt",
  abbr: 'BOD',
  country: 'NOR',
  pot: 3,
  kits: {
    home: {"shirt":"#ffd200","trim":"#111111","pattern":"plain","shorts":"#ffd200","number":"#111111"},
    away: {"shirt":"#1f1f1f","trim":"#ffd200","pattern":"plain","shorts":"#1f1f1f","number":"#ffd200"},
    gk: {"shirt":"#22c55e","trim":"#111111","pattern":"plain","shorts":"#111111","number":"#111111"},
  },
  defaultTactic: { formation: '4-3-3', instructions: {"mentality":1,"pressing":2,"line":1,"width":0,"tempo":2,"directness":0,"timeWasting":0} },
  dataAsOf: '2026-11-03',
  notes: "Squad based on the 2025 season; summer-2026 moves could not be verified from accessible sources.",
  players: [
    {
      id: 'bod-nikita-haikin', name: "Nikita Haikin", number: 12, age: 31, nationality: 'NOR', positions: ['GK'], foot: 'R',
      technical: { corners: 3, crossing: 2, dribbling: 3, finishing: 3, firstTouch: 15, freeKicks: 3, heading: 3, longShots: 4, marking: 4, passing: 14, penalties: 3, tackling: 3, technique: 8 },
      mental: { aggression: 7, anticipation: 14, bravery: 15, composure: 15, concentration: 16, decisions: 16, determination: 15, flair: 3, leadership: 14, offTheBall: 3, positioning: 17, teamwork: 11, vision: 10, workRate: 9 },
      physical: { acceleration: 5, agility: 16, balance: 11, jumping: 13, naturalFitness: 14, pace: 7, stamina: 6, strength: 12 },
      goalkeeping: { aerialReach: 14, commandOfArea: 15, communication: 13, handling: 16, kicking: 15, oneOnOnes: 13, reflexes: 16, rushingOut: 16, throwing: 11 },
    },
    {
      id: 'bod-julian-faye-lund', name: "Julian Faye Lund", number: 1, age: 27, nationality: 'NOR', positions: ['GK'], foot: 'R',
      technical: { corners: 1, crossing: 1, dribbling: 1, finishing: 1, firstTouch: 10, freeKicks: 1, heading: 1, longShots: 2, marking: 2, passing: 7, penalties: 1, tackling: 1, technique: 6 },
      mental: { aggression: 5, anticipation: 12, bravery: 13, composure: 12, concentration: 14, decisions: 13, determination: 13, flair: 1, leadership: 9, offTheBall: 1, positioning: 14, teamwork: 9, vision: 5, workRate: 7 },
      physical: { acceleration: 5, agility: 15, balance: 9, jumping: 11, naturalFitness: 13, pace: 7, stamina: 6, strength: 10 },
      goalkeeping: { aerialReach: 12, commandOfArea: 12, communication: 11, handling: 14, kicking: 9, oneOnOnes: 12, reflexes: 15, rushingOut: 9, throwing: 9 },
    },
    {
      id: 'bod-fredrik-sjovold', name: "Fredrik Sjøvold", number: 20, age: 22, nationality: 'NOR', positions: ['DR'], foot: 'R',
      technical: { corners: 7, crossing: 17, dribbling: 16, finishing: 7, firstTouch: 12, freeKicks: 7, heading: 12, longShots: 8, marking: 13, passing: 15, penalties: 7, tackling: 14, technique: 13 },
      mental: { aggression: 11, anticipation: 14, bravery: 13, composure: 11, concentration: 14, decisions: 12, determination: 15, flair: 7, leadership: 8, offTheBall: 15, positioning: 12, teamwork: 13, vision: 6, workRate: 17 },
      physical: { acceleration: 15, agility: 15, balance: 11, jumping: 11, naturalFitness: 15, pace: 17, stamina: 16, strength: 12 },
    },
    {
      id: 'bod-jostein-gundersen', name: "Jostein Gundersen", number: 4, age: 30, nationality: 'NOR', positions: ['DC'], foot: 'R',
      technical: { corners: 8, crossing: 8, dribbling: 6, finishing: 1, firstTouch: 12, freeKicks: 6, heading: 18, longShots: 7, marking: 16, passing: 10, penalties: 6, tackling: 16, technique: 13 },
      mental: { aggression: 17, anticipation: 14, bravery: 14, composure: 10, concentration: 13, decisions: 14, determination: 14, flair: 8, leadership: 8, offTheBall: 7, positioning: 15, teamwork: 13, vision: 8, workRate: 11 },
      physical: { acceleration: 12, agility: 11, balance: 12, jumping: 16, naturalFitness: 12, pace: 9, stamina: 10, strength: 17 },
    },
    {
      id: 'bod-odin-bjortuft', name: "Odin Bjørtuft", number: 6, age: 27, nationality: 'NOR', positions: ['DC'], foot: 'L',
      technical: { corners: 6, crossing: 7, dribbling: 8, finishing: 3, firstTouch: 16, freeKicks: 8, heading: 14, longShots: 7, marking: 16, passing: 16, penalties: 8, tackling: 17, technique: 14 },
      mental: { aggression: 14, anticipation: 15, bravery: 14, composure: 16, concentration: 15, decisions: 15, determination: 14, flair: 6, leadership: 8, offTheBall: 8, positioning: 17, teamwork: 12, vision: 11, workRate: 12 },
      physical: { acceleration: 12, agility: 12, balance: 12, jumping: 16, naturalFitness: 14, pace: 12, stamina: 13, strength: 17 },
    },
    {
      id: 'bod-haitam-aleesami', name: "Haitam Aleesami", number: 3, age: 35, nationality: 'NOR', positions: ['DC', 'DL'], foot: 'L',
      technical: { corners: 6, crossing: 6, dribbling: 6, finishing: 1, firstTouch: 13, freeKicks: 6, heading: 14, longShots: 5, marking: 14, passing: 14, penalties: 6, tackling: 14, technique: 14 },
      mental: { aggression: 13, anticipation: 12, bravery: 12, composure: 15, concentration: 13, decisions: 14, determination: 12, flair: 6, leadership: 11, offTheBall: 5, positioning: 16, teamwork: 11, vision: 10, workRate: 11 },
      physical: { acceleration: 8, agility: 7, balance: 12, jumping: 16, naturalFitness: 10, pace: 8, stamina: 8, strength: 14 },
      flag: "No 2026 squad source could be checked; carried over from 2025.",
    },
    {
      id: 'bod-villads-nielsen', name: "Villads Nielsen", number: 5, age: 25, nationality: 'DEN', positions: ['DC'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 7, finishing: 2, firstTouch: 10, freeKicks: 7, heading: 16, longShots: 6, marking: 14, passing: 8, penalties: 7, tackling: 14, technique: 11 },
      mental: { aggression: 15, anticipation: 12, bravery: 12, composure: 10, concentration: 13, decisions: 12, determination: 12, flair: 7, leadership: 8, offTheBall: 6, positioning: 15, teamwork: 11, vision: 7, workRate: 11 },
      physical: { acceleration: 11, agility: 10, balance: 12, jumping: 16, naturalFitness: 13, pace: 10, stamina: 11, strength: 15 },
    },
    {
      id: 'bod-fredrik-andre-bjorkan', name: "Fredrik André Bjørkan", shortName: "Bjørkan", number: 15, age: 28, nationality: 'NOR', positions: ['DL'], foot: 'L',
      technical: { corners: 8, crossing: 19, dribbling: 15, finishing: 6, firstTouch: 12, freeKicks: 6, heading: 13, longShots: 7, marking: 12, passing: 14, penalties: 6, tackling: 14, technique: 14 },
      mental: { aggression: 13, anticipation: 14, bravery: 12, composure: 11, concentration: 13, decisions: 12, determination: 14, flair: 8, leadership: 6, offTheBall: 15, positioning: 11, teamwork: 15, vision: 8, workRate: 15 },
      physical: { acceleration: 17, agility: 14, balance: 12, jumping: 12, naturalFitness: 13, pace: 15, stamina: 15, strength: 12 },
    },
    {
      id: 'bod-brice-wembangomo', name: "Brice Wembangomo", number: 2, age: 29, nationality: 'NOR', positions: ['DR'], foot: 'R',
      technical: { corners: 6, crossing: 13, dribbling: 11, finishing: 6, firstTouch: 10, freeKicks: 6, heading: 11, longShots: 5, marking: 15, passing: 12, penalties: 6, tackling: 16, technique: 11 },
      mental: { aggression: 11, anticipation: 12, bravery: 10, composure: 11, concentration: 13, decisions: 10, determination: 12, flair: 6, leadership: 9, offTheBall: 8, positioning: 16, teamwork: 13, vision: 6, workRate: 15 },
      physical: { acceleration: 14, agility: 11, balance: 12, jumping: 12, naturalFitness: 12, pace: 14, stamina: 14, strength: 10 },
      flag: "No 2026 squad source could be checked; carried over from 2025.",
    },
    {
      id: 'bod-patrick-berg', name: "Patrick Berg", number: 7, age: 28, nationality: 'NOR', positions: ['DM'], foot: 'R',
      technical: { corners: 9, crossing: 8, dribbling: 9, finishing: 9, firstTouch: 17, freeKicks: 9, heading: 13, longShots: 14, marking: 13, passing: 20, penalties: 9, tackling: 14, technique: 16 },
      mental: { aggression: 12, anticipation: 17, bravery: 14, composure: 17, concentration: 15, decisions: 18, determination: 16, flair: 9, leadership: 17, offTheBall: 9, positioning: 17, teamwork: 16, vision: 16, workRate: 16 },
      physical: { acceleration: 12, agility: 14, balance: 12, jumping: 12, naturalFitness: 16, pace: 14, stamina: 15, strength: 13 },
    },
    {
      id: 'bod-hakon-evjen', name: "Håkon Evjen", number: 26, age: 26, nationality: 'NOR', positions: ['MC', 'AMC'], foot: 'R',
      technical: { corners: 14, crossing: 14, dribbling: 17, finishing: 12, firstTouch: 17, freeKicks: 12, heading: 9, longShots: 16, marking: 13, passing: 17, penalties: 7, tackling: 13, technique: 20 },
      mental: { aggression: 14, anticipation: 15, bravery: 13, composure: 14, concentration: 12, decisions: 17, determination: 15, flair: 16, leadership: 7, offTheBall: 18, positioning: 12, teamwork: 18, vision: 16, workRate: 16 },
      physical: { acceleration: 14, agility: 13, balance: 13, jumping: 8, naturalFitness: 14, pace: 12, stamina: 16, strength: 13 },
    },
    {
      id: 'bod-sondre-brunstad-fet', name: "Sondre Brunstad Fet", shortName: "Brunstad Fet", number: 19, age: 29, nationality: 'NOR', positions: ['MC'], foot: 'R',
      technical: { corners: 12, crossing: 13, dribbling: 16, finishing: 9, firstTouch: 18, freeKicks: 14, heading: 7, longShots: 15, marking: 13, passing: 20, penalties: 9, tackling: 14, technique: 18 },
      mental: { aggression: 13, anticipation: 16, bravery: 13, composure: 18, concentration: 14, decisions: 19, determination: 15, flair: 12, leadership: 11, offTheBall: 16, positioning: 16, teamwork: 17, vision: 19, workRate: 16 },
      physical: { acceleration: 12, agility: 12, balance: 13, jumping: 8, naturalFitness: 14, pace: 12, stamina: 16, strength: 14 },
    },
    {
      id: 'bod-ulrik-saltnes', name: "Ulrik Saltnes", number: 14, age: 31, nationality: 'NOR', positions: ['MC'], foot: 'R',
      technical: { corners: 12, crossing: 12, dribbling: 14, finishing: 11, firstTouch: 15, freeKicks: 12, heading: 7, longShots: 13, marking: 11, passing: 15, penalties: 7, tackling: 14, technique: 16 },
      mental: { aggression: 12, anticipation: 13, bravery: 11, composure: 14, concentration: 12, decisions: 16, determination: 13, flair: 12, leadership: 11, offTheBall: 15, positioning: 15, teamwork: 16, vision: 13, workRate: 19 },
      physical: { acceleration: 10, agility: 9, balance: 13, jumping: 8, naturalFitness: 12, pace: 10, stamina: 17, strength: 11 },
      flag: "No 2026 squad source could be checked; carried over from 2025.",
    },
    {
      id: 'bod-isak-dybvik-maatta', name: "Isak Dybvik Määttä", shortName: "Määttä", number: 8, age: 25, nationality: 'NOR', positions: ['MC'], foot: 'R',
      technical: { corners: 12, crossing: 11, dribbling: 14, finishing: 11, firstTouch: 16, freeKicks: 12, heading: 7, longShots: 15, marking: 13, passing: 17, penalties: 7, tackling: 15, technique: 16 },
      mental: { aggression: 11, anticipation: 14, bravery: 13, composure: 14, concentration: 12, decisions: 17, determination: 15, flair: 12, leadership: 10, offTheBall: 16, positioning: 14, teamwork: 15, vision: 12, workRate: 20 },
      physical: { acceleration: 11, agility: 13, balance: 11, jumping: 6, naturalFitness: 15, pace: 13, stamina: 19, strength: 12 },
      flag: "No 2026 squad source could be checked; carried over from 2025.",
    },
    {
      id: 'bod-jens-petter-hauge', name: "Jens Petter Hauge", number: 10, age: 27, nationality: 'NOR', positions: ['AML'], foot: 'L',
      technical: { corners: 13, crossing: 14, dribbling: 19, finishing: 18, firstTouch: 14, freeKicks: 13, heading: 9, longShots: 14, marking: 8, passing: 14, penalties: 13, tackling: 8, technique: 17 },
      mental: { aggression: 9, anticipation: 12, bravery: 8, composure: 14, concentration: 13, decisions: 12, determination: 12, flair: 17, leadership: 10, offTheBall: 14, positioning: 9, teamwork: 13, vision: 13, workRate: 15 },
      physical: { acceleration: 17, agility: 16, balance: 16, jumping: 10, naturalFitness: 15, pace: 17, stamina: 15, strength: 8 },
    },
    {
      id: 'bod-ole-didrik-blomberg', name: "Ole Didrik Blomberg", number: 11, age: 25, nationality: 'NOR', positions: ['AMR'], foot: 'R',
      technical: { corners: 11, crossing: 18, dribbling: 18, finishing: 13, firstTouch: 15, freeKicks: 13, heading: 7, longShots: 11, marking: 8, passing: 14, penalties: 13, tackling: 9, technique: 15 },
      mental: { aggression: 8, anticipation: 13, bravery: 8, composure: 13, concentration: 13, decisions: 12, determination: 12, flair: 13, leadership: 9, offTheBall: 15, positioning: 9, teamwork: 12, vision: 12, workRate: 14 },
      physical: { acceleration: 17, agility: 16, balance: 14, jumping: 8, naturalFitness: 14, pace: 17, stamina: 15, strength: 9 },
    },
    {
      id: 'bod-sondre-sorli', name: "Sondre Sørli", number: 17, age: 22, nationality: 'NOR', positions: ['AML', 'AMR'], foot: 'R',
      technical: { corners: 12, crossing: 17, dribbling: 17, finishing: 12, firstTouch: 14, freeKicks: 12, heading: 7, longShots: 12, marking: 8, passing: 15, penalties: 12, tackling: 7, technique: 16 },
      mental: { aggression: 6, anticipation: 12, bravery: 8, composure: 11, concentration: 12, decisions: 12, determination: 13, flair: 14, leadership: 8, offTheBall: 14, positioning: 7, teamwork: 11, vision: 11, workRate: 15 },
      physical: { acceleration: 16, agility: 17, balance: 13, jumping: 6, naturalFitness: 15, pace: 18, stamina: 14, strength: 7 },
    },
    {
      id: 'bod-daniel-bassi', name: "Daniel Bassi", number: 21, age: 21, nationality: 'COL', positions: ['AMR'], foot: 'L',
      technical: { corners: 11, crossing: 12, dribbling: 17, finishing: 16, firstTouch: 12, freeKicks: 11, heading: 7, longShots: 12, marking: 6, passing: 12, penalties: 11, tackling: 6, technique: 15 },
      mental: { aggression: 7, anticipation: 10, bravery: 6, composure: 11, concentration: 11, decisions: 9, determination: 10, flair: 15, leadership: 6, offTheBall: 12, positioning: 7, teamwork: 11, vision: 11, workRate: 13 },
      physical: { acceleration: 15, agility: 14, balance: 14, jumping: 8, naturalFitness: 13, pace: 15, stamina: 13, strength: 6 },
    },
    {
      id: 'bod-kasper-hogh', name: "Kasper Høgh", number: 9, age: 25, nationality: 'DEN', positions: ['ST'], foot: 'R',
      technical: { corners: 8, crossing: 7, dribbling: 15, finishing: 17, firstTouch: 17, freeKicks: 8, heading: 16, longShots: 14, marking: 9, passing: 16, penalties: 15, tackling: 8, technique: 17 },
      mental: { aggression: 7, anticipation: 17, bravery: 14, composure: 17, concentration: 13, decisions: 16, determination: 16, flair: 13, leadership: 11, offTheBall: 17, positioning: 8, teamwork: 12, vision: 14, workRate: 14 },
      physical: { acceleration: 14, agility: 16, balance: 14, jumping: 14, naturalFitness: 16, pace: 16, stamina: 13, strength: 17 },
    },
    {
      id: 'bod-andreas-helmersen', name: "Andreas Helmersen", number: 16, age: 25, nationality: 'NOR', positions: ['ST'], foot: 'R',
      technical: { corners: 7, crossing: 7, dribbling: 13, finishing: 17, firstTouch: 14, freeKicks: 7, heading: 13, longShots: 10, marking: 6, passing: 7, penalties: 13, tackling: 6, technique: 13 },
      mental: { aggression: 7, anticipation: 16, bravery: 10, composure: 16, concentration: 11, decisions: 10, determination: 12, flair: 11, leadership: 8, offTheBall: 16, positioning: 7, teamwork: 11, vision: 8, workRate: 9 },
      physical: { acceleration: 13, agility: 12, balance: 14, jumping: 14, naturalFitness: 13, pace: 13, stamina: 9, strength: 12 },
    },
  ],
});
