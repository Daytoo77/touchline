import { z } from 'zod';
import { ShoutZ, TalkToneZ, Tactic } from './tactic';

export type Side = 0 | 1; // 0 = home, 1 = away
export type Seat = 0 | 1;

// ---------------------------------------------------------------- commands

export const MatchCommand = z.discriminatedUnion('type', [
  z.object({ type: z.literal('tactic'), tactic: Tactic }).strict(),
  z.object({ type: z.literal('shout'), shout: ShoutZ }).strict(),
  z.object({ type: z.literal('sub'), out: z.string(), in: z.string() }).strict(),
  z.object({ type: z.literal('cancelSub'), out: z.string() }).strict(),
  z.object({ type: z.literal('teamTalk'), tone: TalkToneZ }).strict(),
  z.object({ type: z.literal('penaltyOrder'), order: z.array(z.string()).min(1).max(11) }).strict(),
  z.object({ type: z.literal('ready') }).strict(),
]);
export type MatchCommand = z.infer<typeof MatchCommand>;

/** Issued by the host, never by a client. */
export type SystemCommand = { type: 'endBreak' };

export interface LoggedCommand {
  tick: number;
  /** 0/1 = manager seat, -1 = system (host). */
  seat: Seat | -1;
  cmd: MatchCommand | SystemCommand;
}

// ---------------------------------------------------------------- phases

export type Period = 1 | 2 | 3 | 4 | 5; // 3,4 = extra time, 5 = shootout
export type BreakKind = 'halfTime' | 'preExtraTime' | 'preShootout';
export type MatchPhase = 'play' | 'break' | 'shootout' | 'ended';

// ---------------------------------------------------------------- events

interface EvBase {
  t: number; // tick
  clock: number; // match seconds
  /** If set, only this side may see the event. */
  vis?: Side;
}
export type GoalKind = 'open' | 'header' | 'penalty' | 'freeKick' | 'ownGoal' | 'longShot';
export type ShotOutcome = 'saved' | 'off' | 'blocked' | 'post' | 'goal';

export type MatchEvent = EvBase &
  (
    | { type: 'kickoff'; team: Side; period: Period }
    | { type: 'periodEnd'; period: Period }
    | { type: 'stoppage'; period: Period; minutes: number }
    | { type: 'break'; kind: BreakKind }
    | { type: 'goal'; team: Side; player: string; assist?: string; xg: number; kind: GoalKind; score: [number, number] }
    | { type: 'shot'; team: Side; player: string; xg: number; outcome: Exclude<ShotOutcome, 'goal'>; kind: GoalKind; gk?: string }
    | { type: 'bigChance'; team: Side; player: string }
    | { type: 'attack'; team: Side; player: string; zone: 'left' | 'centre' | 'right' }
    | { type: 'corner'; team: Side; taker: string }
    | { type: 'freeKick'; team: Side; taker: string; dangerous: boolean }
    | { type: 'penalty'; team: Side; taker: string; fouled: string }
    | { type: 'foul'; team: Side; player: string; victim: string }
    | { type: 'card'; team: Side; player: string; color: 'yellow' | 'red'; secondYellow: boolean; reason: string }
    | { type: 'offside'; team: Side; player: string }
    | { type: 'sub'; team: Side; out: string; in: string }
    | { type: 'notice'; team: Side; kind: 'tacticalChange' }
    | { type: 'shoutGiven'; team: Side; shout: string; reaction: 'positive' | 'neutral' | 'negative' }
    | { type: 'teamTalk'; team: Side; tone: string; reaction: 'positive' | 'neutral' | 'negative' }
    | { type: 'subQueued'; team: Side; out: string; in: string }
    | { type: 'subRejected'; team: Side; reason: string }
    | { type: 'save'; team: Side; gk: string; shooter: string; held: boolean }
    | { type: 'shootoutKick'; team: Side; player: string; scored: boolean; outcome: 'goal' | 'saved' | 'missed'; tally: [number, number] }
    | { type: 'fullTime'; score: [number, number]; pens?: [number, number]; winner: Side }
  );
export type MatchEventType = MatchEvent['type'];

// ---------------------------------------------------------------- stats & frames

export interface TeamStats {
  goals: number;
  shots: number;
  onTarget: number;
  xg: number;
  possessionTicks: number;
  passes: number;
  passesCompleted: number;
  corners: number;
  fouls: number;
  yellows: number;
  reds: number;
  offsides: number;
  saves: number;
  tackles: number;
}

export function emptyTeamStats(): TeamStats {
  return { goals: 0, shots: 0, onTarget: 0, xg: 0, possessionTicks: 0, passes: 0, passesCompleted: 0, corners: 0, fouls: 0, yellows: 0, reds: 0, offsides: 0, saves: 0, tackles: 0 };
}

/** One rendered moment. Positions in metres (pitch frame: x 0..105 left→right, y 0..68 top→bottom), 1 decimal. */
export interface Frame {
  t: number;
  /** match clock, seconds */
  c: number;
  /** ball x, y, z */
  b: [number, number, number];
  /** pitch index of the ball owner, -1 when loose/in flight */
  o: number;
  /** flat [x0, y0, x1, y1, …] for the 22 pitch indices; NaN-free, -1 = not on pitch */
  p: number[];
}

/** Who stands at each pitch index (0..10 home, 11..21 away). */
export interface RosterEntry {
  idx: number;
  playerId: string | null;
  number: number;
  name: string;
  isGk: boolean;
}

export interface PublicMatchState {
  tick: number;
  clock: number;
  period: Period;
  phase: MatchPhase;
  breakKind: BreakKind | null;
  score: [number, number];
  pens: [number, number] | null;
  stats: [TeamStats, TeamStats];
  /** home attacks towards +x when true */
  homeAttacksRight: boolean;
  stoppageMinutes: number;
  ready: [boolean, boolean];
  /** Set by the host during breaks: real milliseconds left before play resumes. */
  breakRemainingMs?: number;
}

/** What only one side can see about itself. */
export interface PrivateTeamState {
  side: Side;
  tactic: Tactic;
  bench: string[];
  subsUsed: number;
  subsAllowed: number;
  windowsUsed: number;
  windowsAllowed: number;
  pendingSubs: { out: string; in: string }[];
  subbedOff: string[];
  players: { id: string; condition: number; morale: number; yellow: boolean; sentOff: boolean; onPitch: boolean; rating: number }[];
  shoutCooldownUntil: number;
  activeShout: string | null;
  teamTalkGiven: boolean;
  penaltyOrder: string[];
}

export interface ReplayFile {
  format: 'touchline-replay';
  engineVersion: number;
  seed: number;
  home: import('./tactic').TeamSheet;
  away: import('./tactic').TeamSheet;
  commands: LoggedCommand[];
  checksums: [number, number][];
  result: { score: [number, number]; pens: [number, number] | null; winner: Side };
}
