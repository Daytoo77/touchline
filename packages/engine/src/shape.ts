import type { Side } from '@touchline/shared';
import { clamp, dist, dist2 } from './detmath';
import type { Match } from './match';
import { DT, PITCH_L, PITCH_W, type PlayerRt } from './types';
import { deadBallOverrides } from './restarts';
import type { Norm } from './ability';

const PHYS = ['acceleration', 'agility', 'balance', 'jumping', 'pace', 'stamina', 'strength'] as const;
const MENTAL_FAT = ['decisions', 'concentration', 'composure', 'anticipation'] as const;
const FIT_KEYS = ['positioning', 'marking', 'decisions', 'anticipation', 'offTheBall', 'tackling', 'crossing'] as const;

/** Explicit field copy (much faster than keyed access in V8). */
function copyNorm(e: Norm, b: Norm): void {
  e.corners = b.corners;
  e.crossing = b.crossing;
  e.dribbling = b.dribbling;
  e.finishing = b.finishing;
  e.firstTouch = b.firstTouch;
  e.freeKicks = b.freeKicks;
  e.heading = b.heading;
  e.longShots = b.longShots;
  e.marking = b.marking;
  e.passing = b.passing;
  e.penalties = b.penalties;
  e.tackling = b.tackling;
  e.technique = b.technique;
  e.aggression = b.aggression;
  e.anticipation = b.anticipation;
  e.bravery = b.bravery;
  e.composure = b.composure;
  e.concentration = b.concentration;
  e.decisions = b.decisions;
  e.determination = b.determination;
  e.flair = b.flair;
  e.leadership = b.leadership;
  e.offTheBall = b.offTheBall;
  e.positioning = b.positioning;
  e.teamwork = b.teamwork;
  e.vision = b.vision;
  e.workRate = b.workRate;
  e.acceleration = b.acceleration;
  e.agility = b.agility;
  e.balance = b.balance;
  e.jumping = b.jumping;
  e.naturalFitness = b.naturalFitness;
  e.pace = b.pace;
  e.stamina = b.stamina;
  e.strength = b.strength;
  e.aerialReach = b.aerialReach;
  e.commandOfArea = b.commandOfArea;
  e.communication = b.communication;
  e.handling = b.handling;
  e.kicking = b.kicking;
  e.oneOnOnes = b.oneOnOnes;
  e.reflexes = b.reflexes;
  e.rushingOut = b.rushingOut;
  e.throwing = b.throwing;
}

/** Recompute effective attributes from base + fatigue + morale + familiarity + team modifiers. */
export function refreshEffective(m: Match, p: PlayerRt): void {
  const e = p.e;
  const b = p.base;
  copyNorm(e, b);
  const c = p.cond;
  const physMult = 0.7 + 0.3 * Math.sqrt(clamp(c, 0, 1));
  for (const k of PHYS) e[k] = b[k] * physMult;
  const mentMult = 0.9 + 0.1 * c;
  for (const k of MENTAL_FAT) e[k] = b[k] * mentMult;
  const fitMult = 0.55 + 0.45 * p.fit;
  for (const k of FIT_KEYS) e[k] = e[k] * fitMult;
  const tp = m.teams[p.side].tp;
  const mor = p.morale * 0.013;
  e.composure = clamp(e.composure + mor + tp.composure, 0, 1);
  e.decisions = clamp(e.decisions + mor * 0.7 + tp.decisions, 0, 1);
  e.concentration = clamp(e.concentration + mor * 0.6 + tp.conc, 0, 1);
  e.workRate = clamp(e.workRate + mor * 0.8 + tp.workRate, 0, 1);
  e.aggression = clamp(e.aggression + tp.aggression, 0, 1);
  // Technical touch slightly suffers when exhausted.
  const techMult = 0.94 + 0.06 * c;
  e.passing *= techMult;
  e.firstTouch *= techMult;
  e.finishing *= techMult;
  e.technique *= techMult;
  e.dribbling *= techMult;
  p.topSpeed = 5.5 + 3.5 * e.pace;
  p.accel = 2.6 + 2.8 * e.acceleration;
}

/** Set every on-pitch player's target position and urgency for this tick. */
export function computeTargets(m: Match): void {
  const s = m.s;
  if (s.tick % 5 === 0) assignMarking(m);
  const b = m.ball;
  const attSide = s.possession;
  for (const side of [0, 1] as Side[]) {
    const t = m.teams[side];
    const has = side === attSide && !s.dead ? true : s.dead ? s.dead.restart.side === side : false;
    const ballU = m.u(side, b.x);
    const ballV = m.v(side, b.y);
    const offLine = offsideLineU(m, side);
    const tp = t.tp;
    for (const p of t.players) {
      if (!p.onPitch) continue;
      const fs = t.formation.slots[p.slot]!;
      const rp = p.rp;
      let u: number;
      let v: number;
      let urg: number;
      if (p.slot === 0) {
        // Goalkeeper
        const sweeper = t.tactic.slots[0]!.role === 'sk';
        if (has) {
          u = 6 + (sweeper ? 8 : 2) + clamp(ballU - 50, 0, 40) * 0.12;
          v = 34 + (ballV - 34) * 0.15;
        } else {
          const dGoal = dist(ballU, ballV, 0, 34);
          const depth = clamp(1.2 + dGoal * 0.055, 1.2, 6) + (sweeper && tp.line > 0 && ballU > 45 ? clamp(ballU - 45, 0, 20) * 0.35 : 0);
          const k = depth / Math.max(dGoal, 1);
          u = depth > 0 ? ballU * k : 1;
          v = 34 + (ballV - 34) * k;
          u = clamp(u, 0.5, 18);
        }
        urg = 0.6;
      } else if (has) {
        const shift = clamp(ballU - 45, -18, 32) * 0.62 + tp.risk * 3;
        u = fs.u + shift + rp.attU * (1 + 0.1 * t.instr.mentality);
        const wAtt = 1 + 0.1 * tp.width;
        v = 34 + (fs.v - 34) * wAtt;
        if (rp.attIn !== 0) {
          const towardsCentre = v < 34 ? 1 : -1;
          v += towardsCentre * rp.attIn * (ballU > 40 ? 1 : 0.6);
        }
        v += (ballV - v) * 0.1 * (1 + rp.roam);
        // Support: come towards the ball carrier when close.
        if (rp.support > 0 && b.owner >= 0 && b.owner !== p.idx) {
          const bd = dist(fs.u + shift, fs.v, ballU, ballV);
          if (bd < 28) {
            const w = rp.support * 0.3;
            u += (ballU - 6 - u) * w;
            v += (ballV - v) * w * 0.6;
          }
        }
        // Defenders keep a safety margin behind the ball.
        if (fs.u < 30) u = Math.min(u, Math.max(ballU - 6, fs.u));
        // Stay onside unless on a run.
        if (p.runUntil > s.tick) {
          u = m.u(side, p.runX);
          v = m.v(side, p.runY);
        } else {
          u = Math.min(u, Math.max(offLine - 0.6, ballU - 2));
        }
        urg = p.runUntil > s.tick ? 1 : 0.55 + 0.25 * p.e.workRate;
      } else {
        const line = tp.line;
        const lineU = clamp(ballU - 25 + line * 4, 13 + line, 36 + line * 5);
        const span = 0.74 - 0.03 * tp.press;
        u = lineU + (fs.u - 21) * span + rp.defU + (fs.u > 50 ? tp.press * 2 : 0);
        const wDef = ballU < 36 ? 0.64 : 0.8 + 0.04 * tp.width;
        v = 34 + (fs.v - 34) * wDef + (ballV - 34) * (ballU < 36 ? 0.36 : 0.42);
        const backLine = fs.u < 28;
        urg = 0.6 + 0.25 * p.e.workRate;
        const mk = m.markOf[p.idx]!;
        if (mk >= 0) {
          const a = m.players[mk]!;
          if (a.onPitch) {
            const au = m.u(side, a.x) - 1.8;
            const av = m.v(side, a.y) + (34 - m.v(side, a.y)) * 0.08;
            if (backLine) {
              // Hold the line; track laterally, drop only if the runner is deeper than the line.
              const w = clamp(0.3 + 0.3 * p.e.marking, 0, 0.6);
              v += (av - v) * w;
              if (au < u) u = au;
            } else {
              const w = clamp(0.35 + 0.45 * p.e.marking, 0, 0.85);
              u += (au - u) * w;
              v += (av - v) * w;
            }
            urg = Math.max(urg, 0.75);
          }
        }
        // Low block near our box: everyone but the forwards gets goal-side of the ball and squeezes in.
        if (ballU < 40 && fs.u < 56) {
          u = Math.min(u, ballU - 2.5 - (backLine ? 3 : 0));
          v += (ballV - v) * 0.22;
        }
        // Ball in or near our box: the back line protects the goal mouth.
        if (backLine && ballU < 22) {
          v += (34 - v) * 0.35;
          u = Math.min(u, 9);
        }
        // Recovery run: caught ahead of the ball, get back goal-side.
        const pu = m.u(side, p.x);
        if (pu > ballU - 1 && fs.u < 50) {
          u = Math.min(u, ballU - 4);
          urg = 0.85 + 0.15 * p.e.workRate;
        } else if (pu > ballU + 4 && ballU < 45) {
          urg = Math.max(urg, 0.7 + 0.25 * p.e.workRate);
        }
      }
      p.tx = m.toX(side, clamp(u, 0.5, PITCH_L - 0.5));
      p.ty = m.toY(side, clamp(v, 1, PITCH_W - 1));
      p.urg = urg;
    }
  }

  if (s.dead) {
    if (s.dead.restart.kind === 'kickoff') {
      for (const p of m.players) {
        if (!p.onPitch) continue;
        const t = m.teams[p.side];
        const fs = t.formation.slots[p.slot]!;
        p.tx = m.toX(p.side, p.slot === 0 ? 4 : Math.min(fs.u * 0.8, 51));
        p.ty = m.toY(p.side, fs.v);
        p.urg = 0.6;
      }
    }
    deadBallOverrides(m);
    return;
  }
  // Pressing: the nearest defenders close the ball down.
  if (!s.dead && b.owner >= 0) applyPress(m, b.owner);
  // Loose ball: nearest two of each team chase.
  if (!s.dead && b.owner < 0) {
    const tx = b.flight ? b.flight.tx : b.x + b.vx * 0.5;
    const ty = b.flight ? b.flight.ty : b.y + b.vy * 0.5;
    if (!b.flight) {
      for (const side of [0, 1] as Side[]) {
        const near = nearestTo(m, side, tx, ty, 2);
        for (const p of near) {
          p.tx = tx;
          p.ty = ty;
          p.urg = 1;
        }
      }
    }
  }
  // Explicit assignments (receivers, interceptors) win.
  for (let i = 0; i < 22; i++) {
    const a = m.assign[i];
    if (!a) continue;
    if (a.until < s.tick) {
      m.assign[i] = null;
      continue;
    }
    const p = m.players[i]!;
    p.tx = a.x;
    p.ty = a.y;
    p.urg = a.urg;
  }
  // The carrier moves towards his carry target.
  if (!s.dead && b.owner >= 0) {
    const c = m.players[b.owner]!;
    c.tx = s.carryX;
    c.ty = s.carryY;
    c.urg = 0.6 + 0.2 * c.e.dribbling;
    // Jockeyed: a goal-side defender close in front slows the carrier down.
    const cu = m.u(c.side, c.x);
    const cv = m.v(c.side, c.y);
    for (const d of m.teams[m.opp(c.side)].players) {
      if (!d.onPitch || d.stunUntil > s.tick) continue;
      const du = m.u(c.side, d.x) - cu;
      if (du < -0.3 || du > 3) continue;
      if (Math.abs(m.v(c.side, d.y) - cv) > 2.6) continue;
      c.urg = Math.min(c.urg, 0.42);
      break;
    }
  }
}

function applyPress(m: Match, carrierIdx: number): void {
  const c = m.players[carrierIdx]!;
  const dside = m.opp(c.side);
  const t = m.teams[dside];
  const ballU = m.u(dside, c.x); // distance from the defending team's own goal
  const press = t.tp.press;
  const zone = press <= -2 ? 30 : press <= -1 ? 45 : press < 1 ? 58 : press < 2 ? 74 : 110;
  let n = 0;
  if (ballU < zone) n = 1 + (press >= 1 ? 1 : 0);
  else if (ballU < zone + 15) n = 1;
  if (ballU < 25) n = Math.max(n, 2);
  if (ballU < 18) n = 3;
  // Keeper comes off his line to close down a 1-v-1.
  const gk = m.gkOf(dside);
  if (gk && ballU < 15) {
    const cu = m.u(c.side, c.x);
    let cover = false;
    for (const d of t.players) {
      if (!d.onPitch || d.slot === 0) continue;
      if (m.u(c.side, d.x) > cu && dist(d.x, d.y, c.x, c.y) < 3.5) cover = true;
    }
    if (!cover) {
      const gx = m.toX(dside, 0);
      const k = clamp(0.35 + 0.3 * gk.e.rushingOut, 0.3, 0.75);
      gk.tx = gx + (c.x - gx) * k;
      gk.ty = 34 + (c.y - 34) * k;
      gk.urg = 1;
    }
  }
  if (n === 0) return;
  // Midfielders press first; back-line players only step out near the box or when very close.
  const near = nearestTo(m, dside, c.x, c.y, 8).filter((p) => {
    if (p.slot === 0) return false;
    const back = t.formation.slots[p.slot]!.u < 28;
    return !back || ballU < 32 || dist(p.x, p.y, c.x, c.y) < 7;
  });
  for (let i = 0; i < Math.min(n, near.length); i++) {
    const p = near[i]!;
    // Close down to just in front of the carrier (goal side).
    const gx = m.toX(dside, 0);
    const dx = gx - c.x;
    const dy = 34 - c.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    p.tx = c.x + (dx / d) * 0.9;
    p.ty = c.y + (dy / d) * 0.9;
    p.urg = clamp(0.8 + 0.12 * press + 0.15 * p.e.workRate * p.rp.press, 0.6, 1);
  }
}

export function nearestTo(m: Match, side: Side, x: number, y: number, n: number): PlayerRt[] {
  const arr: { p: PlayerRt; d: number }[] = [];
  for (const p of m.teams[side].players) {
    if (!p.onPitch) continue;
    arr.push({ p, d: dist2(p.x, p.y, x, y) });
  }
  arr.sort((a, b) => a.d - b.d || a.p.idx - b.p.idx);
  return arr.slice(0, n).map((a) => a.p);
}

/** u (in `side`'s frame) of the opponents' second-last player: the offside line for `side`'s attackers. */
export function offsideLineU(m: Match, side: Side): number {
  let first = 0;
  let second = 0;
  for (const p of m.teams[m.opp(side)].players) {
    if (!p.onPitch) continue;
    const u = m.u(side, p.x);
    if (u > first) {
      second = first;
      first = u;
    } else if (u > second) second = u;
  }
  return Math.max(second, 52.5);
}

function assignMarking(m: Match): void {
  m.markOf.fill(-1);
  const att = m.s.possession;
  const dside = m.opp(att);
  const defenders = m.teams[dside].players.filter((p) => p.onPitch && p.slot !== 0);
  const attackers = m.teams[att].players
    .filter((p) => p.onPitch && p.slot !== 0 && p.idx !== m.ball.owner && m.u(dside, p.x) < 62)
    .sort((a, b) => m.u(dside, a.x) - m.u(dside, b.x) || a.idx - b.idx);
  const used = new Set<number>();
  for (const a of attackers) {
    let best: PlayerRt | null = null;
    let bd = 16 * 16;
    for (const d of defenders) {
      if (used.has(d.idx)) continue;
      const dd = dist2(d.tx || d.x, d.ty || d.y, a.x, a.y);
      if (dd < bd) {
        bd = dd;
        best = d;
      }
    }
    if (best) {
      used.add(best.idx);
      m.markOf[best.idx] = a.idx;
    }
  }
}

/** Integrate player motion towards targets with speed/acceleration limits. */
export function movePlayers(m: Match): void {
  for (const p of m.players) {
    if (!p.onPitch) continue;
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const stunned = p.stunUntil > m.s.tick;
    let want = p.topSpeed * clamp(p.urg, 0, 1) * (stunned ? 0.45 : 1);
    want = Math.min(want, d * 1.6);
    let dvx = (d > 1e-6 ? (dx / d) * want : 0) - p.vx;
    let dvy = (d > 1e-6 ? (dy / d) * want : 0) - p.vy;
    const dv = Math.sqrt(dvx * dvx + dvy * dvy);
    const maxDv = p.accel * DT * 1.6;
    if (dv > maxDv) {
      dvx = (dvx / dv) * maxDv;
      dvy = (dvy / dv) * maxDv;
    }
    p.vx += dvx;
    p.vy += dvy;
    p.x = clamp(p.x + p.vx * DT, -2, PITCH_L + 2);
    p.y = clamp(p.y + p.vy * DT, -2, PITCH_W + 2);
  }
  const b = m.ball;
  if (b.owner >= 0 && !b.flight) {
    const c = m.players[b.owner]!;
    const sp = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
    const lead = sp > 0.3 ? 0.55 : 0.3;
    b.x = c.x + (sp > 0.3 ? (c.vx / sp) * lead : 0);
    b.y = c.y + (sp > 0.3 ? (c.vy / sp) * lead : 0);
    b.z = 0;
  }
}

export function updateFatigue(m: Match): void {
  const dead = m.s.dead !== null;
  for (const p of m.players) {
    if (!p.onPitch) continue;
    const sp2 = p.vx * p.vx + p.vy * p.vy;
    const r2 = sp2 / (p.topSpeed * p.topSpeed);
    const t = m.teams[p.side];
    let drain = DT * 3.1e-4 * (0.3 + 1.1 * r2) * (1.38 - 0.75 * p.base.stamina) * (1 + 0.06 * t.tp.press + 0.04 * t.tp.tempo);
    if (p.slot === 0) drain *= 0.35;
    if (dead) drain = -DT * 0.15e-4 * (0.5 + 0.5 * p.base.naturalFitness);
    p.cond = clamp(p.cond - drain, 0.2, 1);
  }
}
