import { z } from 'zod';

/** Every attribute is an integer on the classic 1–20 scale. */
export const Attr = z.number().int().min(1).max(20);

export const TECHNICAL_KEYS = [
  'corners',
  'crossing',
  'dribbling',
  'finishing',
  'firstTouch',
  'freeKicks',
  'heading',
  'longShots',
  'marking',
  'passing',
  'penalties',
  'tackling',
  'technique',
] as const;

export const MENTAL_KEYS = [
  'aggression',
  'anticipation',
  'bravery',
  'composure',
  'concentration',
  'decisions',
  'determination',
  'flair',
  'leadership',
  'offTheBall',
  'positioning',
  'teamwork',
  'vision',
  'workRate',
] as const;

export const PHYSICAL_KEYS = [
  'acceleration',
  'agility',
  'balance',
  'jumping',
  'naturalFitness',
  'pace',
  'stamina',
  'strength',
] as const;

export const GOALKEEPING_KEYS = [
  'aerialReach',
  'commandOfArea',
  'communication',
  'handling',
  'kicking',
  'oneOnOnes',
  'reflexes',
  'rushingOut',
  'throwing',
] as const;

export type TechnicalKey = (typeof TECHNICAL_KEYS)[number];
export type MentalKey = (typeof MENTAL_KEYS)[number];
export type PhysicalKey = (typeof PHYSICAL_KEYS)[number];
export type GoalkeepingKey = (typeof GOALKEEPING_KEYS)[number];
export type AttrKey = TechnicalKey | MentalKey | PhysicalKey | GoalkeepingKey;

function group<K extends string>(keys: readonly K[]) {
  return z.object(Object.fromEntries(keys.map((k) => [k, Attr])) as Record<K, typeof Attr>).strict();
}

export const TechnicalAttrs = group(TECHNICAL_KEYS);
export const MentalAttrs = group(MENTAL_KEYS);
export const PhysicalAttrs = group(PHYSICAL_KEYS);
export const GoalkeepingAttrs = group(GOALKEEPING_KEYS);

export type TechnicalAttrs = z.infer<typeof TechnicalAttrs>;
export type MentalAttrs = z.infer<typeof MentalAttrs>;
export type PhysicalAttrs = z.infer<typeof PhysicalAttrs>;
export type GoalkeepingAttrs = z.infer<typeof GoalkeepingAttrs>;

export const ATTR_LABELS: Record<AttrKey, string> = {
  corners: 'Corners',
  crossing: 'Crossing',
  dribbling: 'Dribbling',
  finishing: 'Finishing',
  firstTouch: 'First Touch',
  freeKicks: 'Free Kicks',
  heading: 'Heading',
  longShots: 'Long Shots',
  marking: 'Marking',
  passing: 'Passing',
  penalties: 'Penalties',
  tackling: 'Tackling',
  technique: 'Technique',
  aggression: 'Aggression',
  anticipation: 'Anticipation',
  bravery: 'Bravery',
  composure: 'Composure',
  concentration: 'Concentration',
  decisions: 'Decisions',
  determination: 'Determination',
  flair: 'Flair',
  leadership: 'Leadership',
  offTheBall: 'Off the Ball',
  positioning: 'Positioning',
  teamwork: 'Teamwork',
  vision: 'Vision',
  workRate: 'Work Rate',
  acceleration: 'Acceleration',
  agility: 'Agility',
  balance: 'Balance',
  jumping: 'Jumping Reach',
  naturalFitness: 'Natural Fitness',
  pace: 'Pace',
  stamina: 'Stamina',
  strength: 'Strength',
  aerialReach: 'Aerial Reach',
  commandOfArea: 'Command of Area',
  communication: 'Communication',
  handling: 'Handling',
  kicking: 'Kicking',
  oneOnOnes: 'One on Ones',
  reflexes: 'Reflexes',
  rushingOut: 'Rushing Out',
  throwing: 'Throwing',
};
