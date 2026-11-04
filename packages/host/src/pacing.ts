import { DT, type Match } from '@touchline/engine';

/**
 * Variable pacing: how many match-seconds pass per real second right now.
 * Slow around the boxes and on shots/set pieces, fast when the ball is recycled or dead.
 * Pacing never affects the simulation itself, only how quickly the host steps it.
 */
export function baseRate(m: Match): number {
  const s = m.s;
  if (s.phase === 'shootout') return 1.5;
  const b = m.ball;
  if (s.dead) {
    const r = s.dead.restart;
    const ticksLeft = s.dead.at - s.tick;
    const setPiece = r.kind === 'corner' || r.kind === 'penalty' || (r.kind === 'freeKick' && r.direct);
    if (setPiece && ticksLeft < 25) return 3; // the delivery itself
    if (r.kind === 'kickoff' && ticksLeft > 30) return 26; // celebrations / walking back
    return 28;
  }
  if (b.flight?.kind === 'shot') return 2.2;
  if (b.flight?.kind === 'cross') return 3.2;
  const side = s.possession;
  const u = m.u(side, b.x);
  if (u > 86) return 3.4;
  if (u > 72) return 6;
  if (u > 45) return 13;
  return 17;
}

const PERIOD_LEN: Record<number, number> = { 1: 2700, 2: 2700, 3: 900, 4: 900 };

/**
 * Keeps each period close to its real-time budget: if the match is running slow (lots of action),
 * speed the dull phases up a little, and vice versa.
 */
export class PacingGovernor {
  private smoothed = 10;
  private periodWallStart = 0;
  private period = 0;
  constructor(private readonly targetSeconds: number) {}

  /** match-seconds per real second, given wall-clock seconds `now` and the current speed multiplier. */
  rate(m: Match, nowSec: number, speed = 1): number {
    if (m.s.period !== this.period) {
      this.period = m.s.period;
      this.periodWallStart = nowSec;
    }
    let r = baseRate(m);
    const len = PERIOD_LEN[m.s.period];
    if (len && m.s.phase === 'play') {
      const budget = (this.targetSeconds * len) / 5400 / Math.max(0.1, speed);
      const elapsedMatch = m.s.periodTick * DT;
      const expectedWall = (Math.min(elapsedMatch, len) / len) * budget;
      const actualWall = nowSec - this.periodWallStart;
      const lag = actualWall - expectedWall; // > 0: behind schedule
      const k = Math.max(0.55, Math.min(2.4, 1 + lag / 25));
      // Only stretch the fast phases; keep the drama readable.
      r = r >= 10 ? r * k : r * Math.max(0.85, Math.min(1.35, k));
    }
    r *= speed;
    this.smoothed += (r - this.smoothed) * (r < this.smoothed ? 0.6 : 0.25);
    return this.smoothed;
  }
}
