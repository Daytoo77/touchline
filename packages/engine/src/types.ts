import type { BreakKind, Club, Formation, Instructions, MatchPhase, Period, Player, RoleParams, Shout, Side, Tactic, TeamStats } from '@touchline/shared';
import type { Norm } from './ability';

/** Pitch: x 0..105 (left→right on a landscape view), y 0..68. */
export const PITCH_L = 105;
export const PITCH_W = 68;
export const HALF_L = 52.5;
export const GOAL_HALF = 3.66;
export const BOX_DEPTH = 16.5;
export const BOX_HALF = 20.16;
/** Match seconds per tick. */
export const DT = 0.2;
export const TICKS_PER_MIN = 300;

export interface PStats {
  passes: number;
  passesOk: number;
  shots: number;
  onTarget: number;
  goals: number;
  assists: number;
  tackles: number;
  interceptions: number;
  fouls: number;
  saves: number;
  keyPasses: number;
  dribbles: number;
  rating: number;
}

export interface PlayerRt {
  /** Pitch index 0..21; the slot on the pitch, kept by substitutes. */
  idx: number;
  side: Side;
  def: Player;
  /** Formation slot index 0..10 in the team's current tactic, -1 when off the pitch. */
  slot: number;
  onPitch: boolean;
  sentOff: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  /** 0..1 fraction of top speed wanted this tick. */
  urg: number;
  cond: number;
  morale: number;
  yellow: boolean;
  base: Norm;
  /** Effective normalised attributes (fatigue, morale, familiarity, shouts). */
  e: Norm;
  topSpeed: number;
  accel: number;
  fit: number;
  rp: RoleParams;
  runUntil: number;
  runX: number;
  runY: number;
  tackleCd: number;
  stunUntil: number;
  st: PStats;
}

export interface TeamParams {
  risk: number; // -1..1
  line: number; // -2..2 (fractional with shouts)
  press: number; // -2..2
  width: number; // -2..2
  tempo: number; // -2..2
  direct: number; // -2..2
  waste: number; // 0..4
  aggression: number; // additive to aggression, normalised units
  conc: number; // additive concentration
  workRate: number; // additive
  decisions: number; // additive
  composure: number; // additive
}

export interface ActiveShout {
  kind: Shout;
  until: number;
}

export interface TeamRt {
  side: Side;
  club: Club;
  tactic: Tactic;
  formation: Formation;
  instr: Instructions;
  tp: TeamParams;
  /** Pitch-index order: players[k] has idx side*11 + k. */
  players: PlayerRt[];
  bench: string[];
  subbedOff: string[];
  /** out → in, for reconciling tactics drafted before a substitution happened. */
  replacedBy: Record<string, string>;
  subsUsed: number;
  windowsUsed: number;
  subsAllowed: number;
  windowsAllowed: number;
  pendingSubs: { out: string; in: string }[];
  shout: ActiveShout | null;
  shoutCdUntil: number;
  lastShout: Shout | null;
  talkGiven: boolean;
  penaltyOrder: string[];
  ready: boolean;
  /** +1: attacks towards x = 105. */
  dir: 1 | -1;
  stats: TeamStats;
  strength: number;
  /** Match-day form: small seeded offset on every effective attribute (an off day, or a great one). */
  form: number;
}

export type FlightKind = 'pass' | 'through' | 'long' | 'cross' | 'shot' | 'clear' | 'header' | 'kick' | 'throw';

export type FlightEnd =
  | { k: 'receive'; idx: number }
  | { k: 'intercept'; idx: number; deflect: boolean }
  | { k: 'loose' }
  | { k: 'out'; restart: Restart }
  | { k: 'goal'; scorer: number; assist: number; xg: number; kind: import('@touchline/shared').GoalKind }
  | { k: 'save'; gk: number; held: boolean; shooter: number; corner: boolean }
  | { k: 'shotOff'; shooter: number }
  | { k: 'blocked'; blocker: number; corner: boolean }
  | { k: 'post'; shooter: number }
  | { k: 'claim'; gk: number }
  | { k: 'aerial'; winner: number; att: boolean; crosser: number }
  | { k: 'offside'; idx: number };

export interface Flight {
  kind: FlightKind;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  t0: number;
  t1: number;
  peak: number;
  by: number;
  end: FlightEnd;
}

export type RestartKind = 'kickoff' | 'throwIn' | 'goalKick' | 'corner' | 'freeKick' | 'penalty' | 'dropBall';

export interface Restart {
  kind: RestartKind;
  side: Side;
  x: number;
  y: number;
  /** Direct free kick within shooting range. */
  direct?: boolean;
  /** Player who was fouled (for penalty/free kick commentary). */
  fouled?: number;
}

export interface BallRt {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  owner: number;
  flight: Flight | null;
  lastTouch: number;
  lastSide: Side;
  /** Last player of the team in possession to pass (for assists). */
  lastPasser: number;
  lastPasserTick: number;
}

export interface DeadBall {
  restart: Restart;
  /** Tick at which the restart is taken. */
  at: number;
  /** Player taking it. */
  taker: number;
  freeWindow: boolean;
}

export interface ShootoutRt {
  kicks: { side: Side; player: string; scored: boolean }[];
  next: Side;
  first: Side;
  orderPos: [number, number];
  /** Tick when the current kick is struck. */
  strikeAt: number;
  /** Tick when the next kick starts. */
  nextAt: number;
  pending: { side: Side; taker: number; gk: number; scored: boolean; outcome: 'goal' | 'saved' | 'missed' } | null;
}

export interface MatchCore {
  tick: number;
  clock: number;
  period: Period;
  periodTick: number;
  phase: MatchPhase;
  breakKind: BreakKind | null;
  dead: DeadBall | null;
  stoppage: number;
  stoppageAnnounced: boolean;
  score: [number, number];
  pens: [number, number] | null;
  possession: Side;
  /** Ticks until the carrier makes a decision. */
  decideAt: number;
  carryX: number;
  carryY: number;
  refStrict: number;
  wastedTicks: number;
  goalsThisPeriod: number;
  cardsThisPeriod: number;
  subsThisPeriod: number;
  shootout: ShootoutRt | null;
  winner: Side | null;
  lastAttackEvent: number;
}
