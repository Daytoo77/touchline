import type { GoalKind, Side } from '@touchline/shared';
import { clamp, datan2, dexp, dist, segDist, sigmoid } from './detmath';
import type { Match } from './match';
import { nearestTo, offsideLineU } from './shape';
import { DT, PITCH_L, PITCH_W, type Flight, type FlightEnd, type FlightKind, type PlayerRt, type Restart } from './types';
import { sendOff, addRating } from './discipline';
import { kickoffAfterGoal } from './restarts';

// ======================================================================= value model

/** Threat of having the ball at (u, v) in the attacking team's frame (≈ P(goal) over the next few actions). */
export function V(u: number, v: number): number {
  const dx = PITCH_L - u;
  const dy = v - 34;
  const d = Math.sqrt(dx * dx + dy * dy);
  const cosA = dx / (d + 0.5);
  const uu = u / PITCH_L;
  return 0.004 + 0.022 * uu * uu + 0.3 * dexp(-d / 9) * (0.35 + 0.65 * (cosA > 0 ? cosA : 0));
}

/** Threat for the opponent if they win the ball at (u, v) given in OUR frame. */
function Vopp(u: number, v: number): number {
  return V(PITCH_L - u, PITCH_W - v);
}

/** Time (s) for a player starting roughly from rest to cover `d` metres, accounting for acceleration. */
export function reachTime(p: PlayerRt, d: number): number {
  if (d <= 0) return 0;
  const v = p.topSpeed;
  const a = p.accel;
  const dAcc = (v * v) / (2 * a);
  if (d <= dAcc) return Math.sqrt((2 * d) / a);
  return v / a + (d - dAcc) / v;
}

// ======================================================================= main play step

export function stepPlay(m: Match): void {
  const b = m.ball;
  const s = m.s;
  if (s.tick % 5 === 0) updateRuns(m);
  if (b.flight) {
    stepFlight(m);
    return;
  }
  if (b.owner >= 0) {
    const c = m.players[b.owner]!;
    if (!c.onPitch) {
      b.owner = -1;
      return;
    }
    // Keep the carrier inside the pitch.
    if (c.x < 0.8 || c.x > PITCH_L - 0.8 || c.y < 0.8 || c.y > PITCH_W - 0.8) {
      s.carryX = clamp(s.carryX, 3, PITCH_L - 3);
      s.carryY = clamp(s.carryY, 3, PITCH_W - 3);
    }
    attackFlavour(m, c);
    {
      const u = m.u(c.side, c.x);
      const v = m.v(c.side, c.y);
      const inBox = u > 88.5 && Math.abs(v - 34) < 20;
      if (inBox && !m.carrierInBox) {
        m.dbg['boxEntry:carry'] = (m.dbg['boxEntry:carry'] ?? 0) + 1;
        let nd = 0;
        let near = 99;
        for (const d of m.teams[m.opp(c.side)].players) {
          if (!d.onPitch || d.slot === 0) continue;
          const du = m.u(c.side, d.x);
          if (du > u - 1) nd++;
          near = Math.min(near, dist(d.x, d.y, c.x, c.y));
        }
        m.dbg['entry:defsGoalSide'] = (m.dbg['entry:defsGoalSide'] ?? 0) + nd;
        m.dbg['entry:nearestDef'] = (m.dbg['entry:nearestDef'] ?? 0) + near;
        m.dbg['entry:fromTransition'] = (m.dbg['entry:fromTransition'] ?? 0) + (m.s.tick - m.lastTurnover < 50 ? 1 : 0);
      }
      m.carrierInBox = inBox;
    }
    if (tryTackles(m, c)) return;
    const pressure = nearestOppDist(m, c);
    if (s.tick >= s.decideAt || (pressure < 3 && m.rng.chance(pressure < 1.7 ? 0.45 : 0.15))) decide(m, c);
    return;
  }
  stepLoose(m);
}

function attackFlavour(m: Match, c: PlayerRt): void {
  const u = m.u(c.side, c.x);
  if (u > 72 && m.s.tick - m.s.lastAttackEvent > 200 && c.slot !== 0) {
    m.s.lastAttackEvent = m.s.tick;
    const v = m.v(c.side, c.y);
    m.emit({ type: 'attack', team: c.side, player: c.def.id, zone: v < 22 ? 'left' : v > 46 ? 'right' : 'centre' });
  }
}

/** Opponent standing goal-side of `p` within `r` metres (marking him tightly), if any. */
function tightMarker(m: Match, p: PlayerRt, r: number): PlayerRt | null {
  const pu = m.u(p.side, p.x);
  let best: PlayerRt | null = null;
  let bd = r;
  for (const o of m.teams[m.opp(p.side)].players) {
    if (!o.onPitch || o.slot === 0) continue;
    if (m.u(p.side, o.x) < pu - 0.2) continue;
    const d = dist(o.x, o.y, p.x, p.y);
    if (d < bd) {
      bd = d;
      best = o;
    }
  }
  return best;
}

function nearestOppDist(m: Match, c: PlayerRt): number {
  let best = 99;
  for (const p of m.teams[m.opp(c.side)].players) {
    if (!p.onPitch) continue;
    const d = dist(p.x, p.y, c.x, c.y);
    if (d < best) best = d;
  }
  return best;
}

function nearestOppTo(m: Match, side: Side, x: number, y: number, excludeGk = false): { p: PlayerRt | null; d: number } {
  let best: PlayerRt | null = null;
  let bd = 999;
  for (const p of m.teams[m.opp(side)].players) {
    if (!p.onPitch || (excludeGk && p.slot === 0)) continue;
    const d = dist(p.x, p.y, x, y);
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return { p: best, d: bd };
}

// ======================================================================= runs

function updateRuns(m: Match): void {
  const s = m.s;
  const b = m.ball;
  if (b.owner < 0) return;
  const side = m.players[b.owner]!.side;
  const ballU = m.u(side, b.x);
  if (ballU < 32) return;
  const offLine = offsideLineU(m, side);
  for (const p of m.teams[side].players) {
    if (!p.onPitch || p.slot === 0 || p.idx === b.owner || p.runUntil > s.tick) continue;
    if (p.rp.run <= 0.05) continue;
    const pu = m.u(side, p.x);
    if (pu < offLine - 18) continue;
    const pStart = p.rp.run * (0.25 + 0.55 * p.e.offTheBall) * 0.22 * (1 + 0.1 * m.teams[side].tp.risk);
    if (!m.rng.chance(pStart)) continue;
    const ru = Math.min(offLine + 5 + m.rng.next() * 9, 101);
    const pv = m.v(side, p.y);
    const rv = clamp(pv + (34 - pv) * 0.3 + (m.rng.next() - 0.5) * 6, 4, 64);
    p.runX = m.toX(side, ru);
    p.runY = m.toY(side, rv);
    p.runUntil = s.tick + 14 + m.rng.int(8);
  }
}

// ======================================================================= tackles & fouls

function tryTackles(m: Match, c: PlayerRt): boolean {
  const s = m.s;
  const dside = m.opp(c.side);
  const tpress = m.teams[dside].tp.press;
  const cu = m.u(c.side, c.x);
  for (const d of m.teams[dside].players) {
    if (!d.onPitch || d.tackleCd > s.tick || d.stunUntil > s.tick) continue;
    if (d.slot === 0 && m.u(dside, d.x) > 18) continue;
    const dd = dist(d.x, d.y, c.x, c.y);
    if (dd < 3) m.dbg['tk:within3'] = (m.dbg['tk:within3'] ?? 0) + 1;
    if (dd > 2.2) continue;
    const goalSide = m.u(c.side, d.x) > cu - 0.3;
    const pAttempt = (goalSide ? 0.3 : 0.1) * (0.7 + 0.5 * d.e.aggression + 0.07 * tpress) * (dd < 1.2 ? 1.25 : 1) * (d.yellow ? 0.7 : 1);
    if (!m.rng.chance(pAttempt)) continue;
    d.tackleCd = s.tick + 4;
    m.dbg['tk:attempt:' + (goalSide ? 'front' : 'behind')] = (m.dbg['tk:attempt:' + (goalSide ? 'front' : 'behind')] ?? 0) + 1;
    if (resolveTackle(m, d, c, goalSide)) return true;
    m.dbg['tk:beaten'] = (m.dbg['tk:beaten'] ?? 0) + 1;
  }
  return false;
}

/** Returns true when possession changed or play stopped. */
function resolveTackle(m: Match, d: PlayerRt, c: PlayerRt, goalSide: boolean): boolean {
  const de = d.e;
  const ce = c.e;
  const defScore = 0.42 * de.tackling + 0.15 * de.strength + 0.15 * de.anticipation + 0.13 * de.positioning + 0.15 * de.agility;
  const attScore = 0.38 * ce.dribbling + 0.18 * ce.agility + 0.14 * ce.balance + 0.12 * ce.technique + 0.08 * ce.flair + 0.1 * ce.strength;
  const pFoul = (0.022 + 0.042 * de.aggression + 0.035 * (1 - de.tackling) + 0.04 * Math.max(0, attScore - defScore)) * (d.slot === 0 ? 0.9 : 1) * (goalSide ? 1 : 1.7) * (1 + m.teams[d.side].tp.aggression * 2) * (d.yellow ? 0.55 : 0.8);
  // Defenders are far more careful inside their own box.
  const cu = m.u(c.side, c.x);
  const inBox = cu > 88.5 && Math.abs(m.v(c.side, c.y) - 34) < 20.2;
  if (m.rng.chance(pFoul * (inBox ? 0.17 : 1))) {
    commitFoul(m, d, c);
    return true;
  }
  const pWin = sigmoid(3.2 * (defScore - attScore) + (goalSide ? 0.55 : -0.3));
  if (m.rng.chance(pWin)) {
    d.st.tackles++;
    m.teams[d.side].stats.tackles++;
    addRating(d, 0.08);
    if (m.rng.chance(0.62)) {
      m.giveBall(d.idx);
    } else {
      looseFrom(m, c.x, c.y, 2 + m.rng.next() * 3, d.side);
    }
    return true;
  }
  // Beaten: the carrier bursts past.
  d.stunUntil = m.s.tick + 4 + m.rng.int(3);
  d.tackleCd = m.s.tick + 8;
  c.st.dribbles++;
  const dir = m.teams[c.side].dir;
  m.s.carryX = clamp(c.x + dir * 5, 2, PITCH_L - 2);
  m.s.decideAt = Math.min(m.s.decideAt, m.s.tick + 2);
  addRating(c, 0.05);
  return false;
}

export function commitFoul(m: Match, off: PlayerRt, victim: PlayerRt): void {
  const s = m.s;
  const ot = m.teams[off.side];
  ot.stats.fouls++;
  off.st.fouls++;
  addRating(off, -0.1);
  m.emit({ type: 'foul', team: off.side, player: off.def.id, victim: victim.def.id });
  const vSide = victim.side;
  const vu = m.u(vSide, victim.x);
  const vv = m.v(vSide, victim.y);
  const inBox = vu > PITCH_L - 16.5 && Math.abs(vv - 34) < 20.16;
  // Promising attack / DOGSO context.
  let between = 0;
  for (const p of m.teams[off.side].players) {
    if (!p.onPitch || p.idx === off.idx) continue;
    if (m.u(vSide, p.x) > vu) between++;
  }
  const dGoal = dist(vu, vv, PITCH_L, 34);
  const dogso = between <= 1 && dGoal < 26 && Math.abs(vv - 34) < 14 && victim.idx === m.ball.owner;
  const tactical = vu > 40 && between <= 3;
  const strict = s.refStrict;
  const pRed = (inBox ? 0 : dogso ? 0.4 : 0.0008 + 0.0025 * off.e.aggression) * strict;
  const pYellow = (0.06 + 0.12 * off.e.aggression + (tactical ? 0.22 : 0) + (dogso && inBox ? 0.6 : 0)) * strict;
  const r = m.refRng.next();
  if (r < pRed) {
    sendOff(m, off, dogso ? 'denying an obvious goal-scoring opportunity' : 'serious foul play', false);
  } else if (r < pRed + pYellow) {
    if (off.yellow) {
      sendOff(m, off, 'a second bookable offence', true);
    } else {
      off.yellow = true;
      ot.stats.yellows++;
      s.cardsThisPeriod++;
      addRating(off, -0.3);
      m.emit({ type: 'card', team: off.side, player: off.def.id, color: 'yellow', secondYellow: false, reason: tactical ? 'stopping a promising attack' : 'a reckless challenge' });
    }
  }
  let restart: Restart;
  if (inBox) {
    restart = { kind: 'penalty', side: vSide, x: m.toX(vSide, PITCH_L - 11), y: 34, fouled: victim.idx };
  } else {
    const direct = dGoal < 31 && Math.abs(vv - 34) < 17;
    restart = { kind: 'freeKick', side: vSide, x: clamp(victim.x, 1, PITCH_L - 1), y: clamp(victim.y, 1, PITCH_W - 1), direct, fouled: victim.idx };
  }
  const delay = inBox ? 140 + m.rng.int(40) : 55 + m.rng.int(45);
  m.dead(restart, delay);
}

// ======================================================================= loose ball

export function looseFrom(m: Match, x: number, y: number, speed: number, lastSide: Side): void {
  const b = m.ball;
  // Random unit vector by rejection sampling (no sin/cos needed).
  let ux = 0;
  let uy = 0;
  for (let i = 0; i < 8; i++) {
    ux = m.rng.next() * 2 - 1;
    uy = m.rng.next() * 2 - 1;
    const l = ux * ux + uy * uy;
    if (l > 0.05 && l <= 1) {
      const n = Math.sqrt(l);
      ux /= n;
      uy /= n;
      break;
    }
  }
  b.owner = -1;
  b.flight = null;
  b.x = x;
  b.y = y;
  b.z = 0;
  b.vx = ux * speed;
  b.vy = uy * speed;
  b.lastSide = lastSide;
  m.assign.fill(null);
}

function stepLoose(m: Match): void {
  const b = m.ball;
  b.x += b.vx * DT;
  b.y += b.vy * DT;
  b.vx *= 0.92;
  b.vy *= 0.92;
  b.z = Math.max(0, b.z - 1.2);
  if (isOut(b.x, b.y)) {
    ballOut(m, b.x, b.y, b.lastSide);
    return;
  }
  let a: PlayerRt | null = null;
  let ad = 1.25;
  let bP: PlayerRt | null = null;
  let bd = 1.25;
  for (const p of m.players) {
    if (!p.onPitch) continue;
    const d = dist(p.x, p.y, b.x, b.y);
    if (p.side === 0 && d < ad) {
      ad = d;
      a = p;
    } else if (p.side === 1 && d < bd) {
      bd = d;
      bP = p;
    }
  }
  if (!a && !bP) return;
  let winner: PlayerRt;
  if (a && bP) {
    const sa = 0.3 * a.e.strength + 0.25 * a.e.balance + 0.25 * a.e.anticipation + 0.2 * a.e.bravery - ad * 0.15;
    const sb = 0.3 * bP.e.strength + 0.25 * bP.e.balance + 0.25 * bP.e.anticipation + 0.2 * bP.e.bravery - bd * 0.15;
    winner = m.rng.chance(sigmoid(4 * (sa - sb))) ? a : bP;
  } else winner = (a ?? bP)!;
  if (winner.side !== m.s.possession) {
    winner.st.interceptions++;
    addRating(winner, 0.04);
  }
  m.giveBall(winner.idx, 2 + m.rng.int(3));
}

function isOut(x: number, y: number): boolean {
  return x < 0 || x > PITCH_L || y < 0 || y > PITCH_W;
}

/** Ball crossed a line: work out the restart. `lastSide` touched it last. */
export function ballOut(m: Match, x: number, y: number, lastSide: Side): void {
  const recv = m.opp(lastSide);
  if (y < 0 || y > PITCH_W) {
    m.dead({ kind: 'throwIn', side: recv, x: clamp(x, 1, PITCH_L - 1), y: y < 0 ? 0 : PITCH_W }, 35 + m.rng.int(30));
    return;
  }
  // Goal line: which side attacks this end?
  const attacking: Side = m.teams[0].dir > 0 === x > PITCH_L / 2 ? 0 : 1;
  const defending = m.opp(attacking);
  if (lastSide === attacking) {
    const gx = x > PITCH_L / 2 ? PITCH_L - 5.5 : 5.5;
    m.dead({ kind: 'goalKick', side: defending, x: gx, y: 34 + (y < 34 ? -4 : 4) }, 70 + m.rng.int(40));
  } else {
    m.teams[attacking].stats.corners++;
    m.dead({ kind: 'corner', side: attacking, x: x > PITCH_L / 2 ? PITCH_L : 0, y: y < 34 ? 0 : PITCH_W }, 90 + m.rng.int(50));
  }
}

// ======================================================================= flights

export function launch(m: Match, kind: FlightKind, by: number, tx: number, ty: number, speed: number, peak: number, end: FlightEnd): Flight {
  const b = m.ball;
  const d = dist(b.x, b.y, tx, ty);
  const dur = Math.max(1, Math.round(d / speed / DT));
  const f: Flight = { kind, fx: b.x, fy: b.y, tx, ty, t0: m.s.tick, t1: m.s.tick + dur, peak, by, end };
  b.flight = f;
  b.owner = -1;
  b.lastTouch = by;
  b.lastSide = m.players[by]!.side;
  return f;
}

function stepFlight(m: Match): void {
  const b = m.ball;
  const f = b.flight!;
  const tau = clamp((m.s.tick - f.t0) / (f.t1 - f.t0), 0, 1);
  const sTau = f.kind === 'pass' || f.kind === 'through' ? tau * (1.3 - 0.3 * tau) : tau;
  b.x = f.fx + (f.tx - f.fx) * sTau;
  b.y = f.fy + (f.ty - f.fy) * sTau;
  b.z = 4 * f.peak * tau * (1 - tau);
  if (m.s.tick >= f.t1) endFlight(m, f);
}

function endFlight(m: Match, f: Flight): void {
  const b = m.ball;
  b.flight = null;
  b.x = f.tx;
  b.y = f.ty;
  b.z = 0;
  const by = m.players[f.by]!;
  const e = f.end;
  switch (e.k) {
    case 'receive': {
      const r = m.players[e.idx]!;
      if (!r.onPitch || dist(r.x, r.y, b.x, b.y) > 3.8) {
        m.dbg['farRecv:' + f.kind] = (m.dbg['farRecv:' + f.kind] ?? 0) + 1;
        looseFrom(m, b.x, b.y, 1.5, by.side);
        return;
      }
      const near = nearestOppTo(m, r.side, r.x, r.y).d;
      const fe = r.e.firstTouch;
      const tm = tightMarker(m, r, 1.7);
      if (tm) {
        const pSteal = clamp(0.12 + 0.45 * (0.5 * tm.e.marking + 0.5 * tm.e.anticipation) - 0.3 * fe - 0.12 * r.e.strength + (m.u(r.side, r.x) > 85 ? 0.08 : 0), 0.04, 0.5);
        if (m.rng.chance(pSteal)) {
          m.dbg['steal'] = (m.dbg['steal'] ?? 0) + 1;
          tm.st.interceptions++;
          addRating(tm, 0.06);
          if (m.rng.chance(0.55)) m.giveBall(tm.idx);
          else looseFrom(m, b.x, b.y, 3, tm.side);
          return;
        }
      }
      let pCtrl = 0.915 + 0.075 * fe - (near < 2 ? 0.16 * (1 - fe) : 0);
      if (f.kind === 'long' || f.kind === 'cross') pCtrl -= 0.07;
      if (f.kind === 'through') pCtrl -= 0.03;
      if (m.rng.chance(pCtrl)) {
        m.dbg['ok:' + f.kind] = (m.dbg['ok:' + f.kind] ?? 0) + 1;
        m.dbg['zoneOk:' + m.passZone] = (m.dbg['zoneOk:' + m.passZone] ?? 0) + 1;
        by.st.passesOk++;
        m.teams[by.side].stats.passesCompleted++;
        addRating(by, 0.004);
        b.lastPasser = by.idx;
        b.lastPasserTick = m.s.tick;
        m.giveBall(r.idx);
      } else {
        m.dbg['ctrlFail:' + f.kind] = (m.dbg['ctrlFail:' + f.kind] ?? 0) + 1;
        looseFrom(m, b.x, b.y, 2 + m.rng.next() * 2.5, r.side);
      }
      return;
    }
    case 'intercept': {
      m.dbg['int:' + f.kind] = (m.dbg['int:' + f.kind] ?? 0) + 1;
      const p = m.players[e.idx]!;
      addRating(by, -0.03);
      if (!p.onPitch || dist(p.x, p.y, b.x, b.y) > 3.8 || e.deflect) {
        looseFrom(m, b.x, b.y, 3 + m.rng.next() * 3, p.side);
        return;
      }
      p.st.interceptions++;
      addRating(p, 0.06);
      m.giveBall(p.idx);
      return;
    }
    case 'loose':
      looseFrom(m, b.x, b.y, 1 + m.rng.next() * 2, by.side);
      return;
    case 'out':
      m.dead(e.restart, restartDelay(m, e.restart));
      return;
    case 'offside': {
      const p = m.players[e.idx]!;
      m.teams[p.side].stats.offsides++;
      m.emit({ type: 'offside', team: p.side, player: p.def.id });
      m.dead({ kind: 'freeKick', side: m.opp(p.side), x: clamp(p.x, 1, PITCH_L - 1), y: clamp(p.y, 1, PITCH_W - 1), direct: false }, 45 + m.rng.int(25));
      return;
    }
    case 'goal':
      scoreGoal(m, by.side, e.scorer, e.assist, e.xg, e.kind);
      return;
    case 'save': {
      const gk = m.players[e.gk]!;
      gk.st.saves++;
      m.teams[gk.side].stats.saves++;
      addRating(gk, 0.25);
      m.emit({ type: 'shot', team: by.side, player: by.def.id, xg: m.lastShotXg, outcome: 'saved', kind: m.lastShotKind, gk: gk.def.id });
      m.emit({ type: 'save', team: gk.side, gk: gk.def.id, shooter: by.def.id, held: e.held });
      if (e.held) m.giveBall(gk.idx, 12 + m.rng.int(15));
      else if (e.corner) {
        m.teams[by.side].stats.corners++;
        const cx = m.goalX(by.side);
        m.dead({ kind: 'corner', side: by.side, x: cx, y: b.y < 34 ? 0 : PITCH_W }, 90 + m.rng.int(50));
      } else {
        const ux = m.u(by.side, b.x) - 4 - m.rng.next() * 6;
        looseFrom(m, m.toX(by.side, ux), b.y + (m.rng.next() - 0.5) * 10, 2.5, gk.side);
      }
      return;
    }
    case 'shotOff':
      m.emit({ type: 'shot', team: by.side, player: by.def.id, xg: m.lastShotXg, outcome: 'off', kind: m.lastShotKind });
      ballOut(m, f.tx, f.ty, by.side);
      return;
    case 'post':
      m.emit({ type: 'shot', team: by.side, player: by.def.id, xg: m.lastShotXg, outcome: 'post', kind: m.lastShotKind });
      looseFrom(m, m.toX(by.side, PITCH_L - 3 - m.rng.next() * 6), clamp(b.y + (m.rng.next() - 0.5) * 8, 20, 48), 3, by.side);
      return;
    case 'blocked': {
      const bl = m.players[e.blocker]!;
      m.emit({ type: 'shot', team: by.side, player: by.def.id, xg: m.lastShotXg, outcome: 'blocked', kind: m.lastShotKind });
      addRating(bl, 0.05);
      if (e.corner) {
        m.teams[by.side].stats.corners++;
        m.dead({ kind: 'corner', side: by.side, x: m.goalX(by.side), y: b.y < 34 ? 0 : PITCH_W }, 90 + m.rng.int(50));
      } else looseFrom(m, b.x, b.y, 3.5, bl.side);
      return;
    }
    case 'claim': {
      const gk = m.players[e.gk]!;
      m.giveBall(gk.idx, 12 + m.rng.int(15));
      return;
    }
    case 'aerial': {
      const w = m.players[e.winner]!;
      if (!w.onPitch) {
        looseFrom(m, b.x, b.y, 2, by.side);
        return;
      }
      if (e.att) {
        b.lastPasser = e.crosser;
        b.lastPasserTick = m.s.tick;
        w.x = b.x;
        w.y = b.y;
        shoot(m, w, true);
      } else {
        addRating(w, 0.05);
        if (m.rng.chance(0.16)) {
          m.teams[by.side].stats.corners++;
          m.dead({ kind: 'corner', side: by.side, x: m.goalX(by.side), y: b.y < 34 ? 0 : PITCH_W }, 90 + m.rng.int(50));
        } else {
          // Headed clear towards the edge of the box.
          const cu = m.u(w.side, b.x) + 14 + m.rng.next() * 18;
          b.lastTouch = w.idx;
          looseFrom(m, m.toX(w.side, clamp(cu, 5, 70)), clamp(b.y + (m.rng.next() - 0.5) * 26, 3, 65), 2.5, w.side);
        }
      }
      return;
    }
  }
}

function restartDelay(m: Match, r: Restart): number {
  switch (r.kind) {
    case 'throwIn':
      return 35 + m.rng.int(30);
    case 'goalKick':
      return 70 + m.rng.int(40);
    case 'corner':
      return 90 + m.rng.int(50);
    default:
      return 60 + m.rng.int(40);
  }
}

// ======================================================================= goals

function scoreGoal(m: Match, side: Side, scorer: number, assist: number, xg: number, kind: GoalKind): void {
  const s = m.s;
  s.score[side]++;
  s.goalsThisPeriod++;
  const t = m.teams[side];
  t.stats.goals++;
  const sc = m.players[scorer]!;
  sc.st.goals++;
  addRating(sc, 1.0);
  let assistId: string | undefined;
  if (assist >= 0 && assist !== scorer && m.players[assist]!.side === side) {
    const a = m.players[assist]!;
    a.st.assists++;
    addRating(a, 0.6);
    assistId = a.def.id;
  }
  const gk = m.gkOf(m.opp(side));
  if (gk) addRating(gk, -0.3);
  const dt = m.teams[m.opp(side)];
  for (const p of dt.players) if (p.onPitch && p.slot > 0 && dt.formation.slots[p.slot]!.u < 30) addRating(p, -0.12);
  // Morale swings.
  for (const p of t.players) if (p.onPitch) p.morale = clamp(p.morale + 0.45, -3, 3);
  for (const p of m.teams[m.opp(side)].players) if (p.onPitch) p.morale = clamp(p.morale - 0.4 * (1.2 - p.base.determination * 0.6), -3, 3);
  m.emit({ type: 'goal', team: side, player: sc.def.id, assist: assistId, xg: Math.round(xg * 100) / 100, kind, score: [...s.score] as [number, number] });
  kickoffAfterGoal(m, m.opp(side));
}

// ======================================================================= shots

export interface ShotInfo {
  xg: number;
  logit: number;
  lane: number;
  oneOnOne: boolean;
  d: number;
}

export function shotInfo(m: Match, sh: PlayerRt, header: boolean): ShotInfo {
  const side = sh.side;
  const u = m.u(side, sh.x);
  const v = m.v(side, sh.y);
  const dx = Math.max(0.5, PITCH_L - u);
  const d = Math.sqrt(dx * dx + (v - 34) * (v - 34));
  const a1 = datan2(34 - 3.66 - v, dx);
  const a2 = datan2(34 + 3.66 - v, dx);
  const theta = Math.abs(a2 - a1);
  let logit = -1.05 - 0.1 * d + 1.6 * theta;
  // Defenders in the shooting lane and pressure.
  let lane = 0;
  let nearest = 99;
  for (const p of m.teams[m.opp(side)].players) {
    if (!p.onPitch || p.slot === 0) continue;
    const pu = m.u(side, p.x);
    const pv = m.v(side, p.y);
    const dd = dist(pu, pv, u, v);
    if (dd < nearest) nearest = dd;
    if (pu <= u) continue;
    const sd = segDist(pu, pv, u, v, PITCH_L, 34);
    if (sd.d < 0.8 + 3.0 * sd.s) lane++;
  }
  logit -= 0.42 * lane;
  if (nearest < 1.5) logit -= 0.55;
  else if (nearest < 3) logit -= 0.28;
  const oneOnOne = lane === 0 && d < 18 && nearest > 3;
  if (oneOnOne) logit += 0.3;
  if (header) logit -= 1.0;
  const xg = clamp(sigmoid(logit), 0.004, 0.93);
  return { xg, logit, lane, oneOnOne, d };
}

/** Take a shot now from the shooter's position. */
export function shoot(m: Match, sh: PlayerRt, header: boolean, setKind?: GoalKind): void {
  const side = sh.side;
  const info = shotInfo(m, sh, header);
  const gk = m.gkOf(m.opp(side));
  const e = sh.e;
  let S: number;
  let kind: GoalKind = setKind ?? (header ? 'header' : info.d > 22 ? 'longShot' : 'open');
  if (header) S = 0.65 * e.heading + 0.1 * e.jumping + 0.25 * e.composure;
  else if (info.d > 22) S = 0.6 * e.longShots + 0.25 * e.technique + 0.15 * e.composure;
  else S = 0.55 * e.finishing + 0.25 * e.composure + 0.2 * e.technique;
  let logit = info.logit;
  let xg = info.xg;
  if (setKind === 'freeKick') {
    S = 0.7 * e.freeKicks + 0.2 * e.technique + 0.1 * e.composure;
    logit = -2.75 - 0.05 * (info.d - 18);
    xg = sigmoid(logit);
    kind = 'freeKick';
  }
  let G = 0.3;
  if (gk) {
    const g = gk.e;
    G = 0.4 * g.reflexes + 0.15 * g.handling + 0.2 * (info.oneOnOne ? g.oneOnOnes : g.positioning) + 0.15 * g.agility + 0.1 * g.concentration;
  }
  const pGoal = sigmoid(logit + 2.4 * (S - 0.7) - 2.0 * (G - 0.76));
  m.dbg['sh:n'] = (m.dbg['sh:n'] ?? 0) + 1;
  m.dbg['sh:S'] = (m.dbg['sh:S'] ?? 0) + S;
  m.dbg['sh:G'] = (m.dbg['sh:G'] ?? 0) + G;
  m.dbg['sh:xg'] = (m.dbg['sh:xg'] ?? 0) + xg;
  m.dbg['sh:pGoal'] = (m.dbg['sh:pGoal'] ?? 0) + pGoal;
  m.dbg['sh:header'] = (m.dbg['sh:header'] ?? 0) + (header ? 1 : 0);
  const t = m.teams[side];
  t.stats.shots++;
  t.stats.xg += xg;
  sh.st.shots++;
  m.lastShotXg = Math.round(xg * 100) / 100;
  m.lastShotKind = kind;
  const b = m.ball;
  if (b.lastPasser >= 0 && m.players[b.lastPasser]!.side === side && m.s.tick - b.lastPasserTick < 60) {
    m.players[b.lastPasser]!.st.keyPasses++;
    addRating(m.players[b.lastPasser]!, 0.12);
  }
  if (xg >= 0.3) m.emit({ type: 'bigChance', team: side, player: sh.def.id });
  b.x = sh.x;
  b.y = sh.y;
  const gx = m.goalX(side);
  const r = m.rng.next();
  const speed = header ? 15 : 24 + 6 * e.technique;
  const assist = b.lastPasser >= 0 && m.s.tick - b.lastPasserTick < 60 ? b.lastPasser : -1;
  if (r < pGoal) {
    t.stats.onTarget++;
    sh.st.onTarget++;
    const gy = 34 + (m.rng.next() - 0.5) * 6.4;
    launch(m, 'shot', sh.idx, gx, gy, speed, header ? 1.2 : 0.5 + m.rng.next() * 1.2, { k: 'goal', scorer: sh.idx, assist, xg, kind });
    if (gk) m.assign[gk.idx] = { x: gx - m.teams[side].dir * 0.8, y: gy + (gy > 34 ? -1.5 : 1.5), until: m.s.tick + 10, urg: 1 };
    return;
  }
  const rest = m.rng.next();
  const pBlock = Math.min(0.6, 0.1 + 0.2 * info.lane);
  const pSaved = clamp(0.4 + 0.3 * (S - 0.6) - (info.d > 25 ? 0.08 : 0), 0.2, 0.6);
  if (rest < pBlock) {
    // Blocked by a defender in the lane.
    let blocker: PlayerRt | null = null;
    let bd = 99;
    for (const p of m.teams[m.opp(side)].players) {
      if (!p.onPitch || p.slot === 0) continue;
      const pu = m.u(side, p.x);
      if (pu <= m.u(side, sh.x)) continue;
      const dd = dist(p.x, p.y, sh.x, sh.y);
      if (dd < bd) {
        bd = dd;
        blocker = p;
      }
    }
    if (blocker) {
      launch(m, 'shot', sh.idx, blocker.x, blocker.y, speed, 0.4, { k: 'blocked', blocker: blocker.idx, corner: m.rng.chance(0.2) });
      return;
    }
  }
  if (rest < pBlock + (1 - pBlock) * 0.03) {
    launch(m, 'shot', sh.idx, gx, 34 + (m.rng.chance(0.5) ? 3.66 : -3.66), speed, 1.2, { k: 'post', shooter: sh.idx });
    t.stats.onTarget++;
    return;
  }
  if (gk && rest < pBlock + (1 - pBlock) * pSaved) {
    t.stats.onTarget++;
    sh.st.onTarget++;
    const gy = 34 + (m.rng.next() - 0.5) * 6;
    const held = m.rng.chance(0.3 + 0.45 * gk.e.handling - (info.d < 12 ? 0.15 : 0));
    const sx = gx - m.teams[side].dir * 1.2;
    m.assign[gk.idx] = { x: sx, y: gy, until: m.s.tick + 10, urg: 1 };
    launch(m, 'shot', sh.idx, sx, gy, speed, 0.4 + m.rng.next(), { k: 'save', gk: gk.idx, held, shooter: sh.idx, corner: !held && m.rng.chance(0.25) });
    return;
  }
  // Off target.
  const side2 = m.rng.chance(0.5) ? 1 : -1;
  const gy = 34 + side2 * (3.9 + m.rng.next() * 6);
  launch(m, 'shot', sh.idx, gx + m.teams[side].dir * 1.5, gy, speed, 0.8 + m.rng.next() * 2.5, { k: 'shotOff', shooter: sh.idx });
}

// ======================================================================= decisions

interface Option {
  kind: 'pass' | 'long' | 'through' | 'shoot' | 'cross' | 'carry' | 'hold' | 'clear';
  U: number;
  r: number; // receiver idx
  x: number;
  y: number;
}

const OPTS: Option[] = [];
const W = new Float64Array(64);

export function decide(m: Match, c: PlayerRt): void {
  const side = c.side;
  const t = m.teams[side];
  const tp = t.tp;
  const uC = m.u(side, c.x);
  const vC = m.v(side, c.y);
  const near = nearestOppTo(m, side, c.x, c.y);
  const dNear = near.d;
  const risk = clamp(tp.risk + c.rp.risk * 0.5, -1.5, 1.5);
  const Lw = 1.15 - 0.25 * risk;
  const hereV = V(uC, vC);
  const lossHere = Vopp(uC, vC);
  const isGk = c.slot === 0;
  const tight = isGk ? null : tightMarker(m, c, 1.6);
  const turnPenalty = tight ? clamp(0.35 + 0.5 * tight.e.marking - 0.35 * (0.5 * c.e.strength + 0.5 * c.e.agility), 0.15, 0.7) : 0;
  OPTS.length = 0;

  // Hold / shield
  const ph = clamp(0.42 * (1 - dNear / 3), 0, 0.42) * (1.25 - 0.5 * c.e.strength - 0.3 * c.e.balance);
  OPTS.push({ kind: 'hold', U: 100 * ((1 - ph) * hereV * 0.97 - ph * Lw * lossHere), r: -1, x: c.x, y: c.y });

  // Carry / dribble in three directions
  if (!isGk) {
    for (let k = -1; k <= 1; k++) {
      const du = 7;
      const dv = k * 5;
      const nu = clamp(uC + du, 1, 103);
      const nv = clamp(vC + dv + (34 - vC) * 0.15 * (nu > 80 ? 1 : 0), 2, 66);
      const nx = m.toX(side, nu);
      const ny = m.toY(side, nv);
      let pc = 0;
      for (const o of m.teams[m.opp(side)].players) {
        if (!o.onPitch) continue;
        const sd = segDist(o.x, o.y, c.x, c.y, nx, ny);
        if (sd.d > 5) continue;
        const ahead = m.u(side, o.x) > uC ? 1 : 0.45;
        const ci = 0.66 * (1 - sd.d / 5) * ahead * (0.9 + o.e.tackling - 0.75 * c.e.dribbling);
        pc = 1 - (1 - pc) * (1 - clamp(ci, 0, 0.8));
      }
      const bias = 1 + 0.12 * (c.rp.dribble - 1) + 0.12 * (c.e.flair - 0.5);
      const crowd = (nu > 88 ? 0.12 : 0) + turnPenalty;
      const pc2 = 1 - (1 - pc) * (1 - clamp(crowd, 0, 0.85));
      OPTS.push({ kind: 'carry', U: 100 * ((1 - pc2) * V(nu, nv) * bias - pc2 * (Lw * lossHere + 0.5 * hereV + 0.003)), r: -1, x: nx, y: ny });
    }
  }

  // Passes
  const offLine = offsideLineU(m, side);
  for (const r of t.players) {
    if (!r.onPitch || r.idx === c.idx) continue;
    const d = dist(c.x, c.y, r.x, r.y);
    if (d < 4 || d > 62) continue;
    const ru = m.u(side, r.x);
    if (ru > offLine + 0.3 && ru > uC) continue; // offside position, ignore pass to feet
    if (isGk && d < 10) continue;
    const kinds: ('pass' | 'long')[] = d <= 34 ? (d >= 24 ? ['pass', 'long'] : ['pass']) : ['long'];
    for (const kind of kinds) {
      const ev = evalPass(m, c, r, r.x + r.vx * 0.6, r.y + r.vy * 0.6, kind);
      const du = m.u(side, ev.x);
      const dvv = m.v(side, ev.y);
      const space = 0.55 + 0.45 * clamp(nearestOppTo(m, side, ev.x, ev.y).d / 7, 0, 1);
      let U = 100 * (ev.p * V(du, dvv) * space - (1 - ev.p) * (Lw * Vopp((uC + du) / 2, (vC + dvv) / 2) + 0.5 * hereV + 0.003));
      U += (r.rp.focus - 1) * 0.6;
      if (kind === 'long') U += -0.7 + tp.direct * 0.35 + r.rp.hold * 0.5;
      else if (d < 15) U -= tp.direct * 0.12;
      if (Math.abs(dvv - 34) > 22) U += tp.width * 0.08;
      OPTS.push({ kind, U, r: r.idx, x: ev.x, y: ev.y });
    }
    // Through balls to runners / forwards near the line
    if (!isGk && (r.runUntil > m.s.tick || r.rp.run > 0.25) && ru > offLine - 5 && ru > uC - 5 && uC > 30) {
      const tu = Math.min(offLine + 6 + 6 * r.e.pace, 102);
      const tv = clamp(m.v(side, r.y) + (34 - m.v(side, r.y)) * 0.2, 4, 64);
      const tx = m.toX(side, tu);
      const ty = m.toY(side, tv);
      const ev = evalThrough(m, c, r, tx, ty);
      let U = 100 * (ev.p * V(tu, tv) * 1.35 - (1 - ev.p) * (Lw * Vopp((uC + tu) / 2, (vC + tv) / 2) + 0.4 * hereV + 0.003));
      U += 0.25 * risk + 0.4 * (c.e.vision - 0.6);
      if (ru > offLine + 0.3) U -= 5 * c.e.decisions; // already offside: good decision makers avoid it
      OPTS.push({ kind: 'through', U, r: r.idx, x: tx, y: ty });
    }
  }

  // Shot
  const shotWindow = clamp(0.3 + 0.32 * (dNear - 1), 0.18, 1);
  if (!isGk && uC > 66 && m.rng.chance(shotWindow * (tight ? 0.35 : 1))) {
    const info = shotInfo(m, c, false);
    let U = 100 * info.xg * c.rp.shoot * (0.92 + 0.05 * t.instr.mentality) * (dNear < 2 ? 0.85 : 1) * (tight ? 0.3 : 1);
    if (info.d > 20) U *= 0.3 + 0.75 * c.e.longShots;
    OPTS.push({ kind: 'shoot', U, r: -1, x: c.x, y: c.y });
  }

  // Cross
  if (!isGk && uC > 72 && Math.abs(vC - 34) > 12) {
    let best = 0;
    for (const r of t.players) {
      if (!r.onPitch || r.idx === c.idx) continue;
      const ru = m.u(side, r.x);
      const rv = m.v(side, r.y);
      if (ru < 86 || Math.abs(rv - 34) > 16) continue;
      const def = nearestOppTo(m, side, r.x, r.y, true);
      const aw = aerialScore(r) - (def.p ? aerialScore(def.p) * 0.9 : 0) + (def.d - 1.5) * 0.06;
      const pWin = sigmoid(3 * aw - 0.4);
      const dd = dist(ru, rv, PITCH_L, 34);
      const xgH = sigmoid(-1.05 - 0.1 * dd + 0.9 - 1.0);
      const val = pWin * xgH;
      if (val > best) best = val;
    }
    const pReach = 0.5 + 0.35 * (c.e.crossing - 0.6);
    const U = 100 * (pReach * best * 1.7 + 0.012) * c.rp.cross * (1 + 0.1 * tp.width);
    OPTS.push({ kind: 'cross', U, r: -1, x: c.x, y: c.y });
  }

  // Clearance
  if (uC < 28 && dNear < 4) {
    const cu = uC + 40;
    OPTS.push({ kind: 'clear', U: 100 * (0.55 * V(cu, 34) - 0.45 * Vopp(cu, 34)) + 0.35 - 0.4 * risk, r: -1, x: c.x, y: c.y });
  }

  // Softmax choice
  const T = 0.35 + 0.8 * (1 - c.e.decisions);
  let umax = -1e9;
  for (const o of OPTS) if (o.U > umax) umax = o.U;
  for (let i = 0; i < OPTS.length; i++) W[i] = dexp((OPTS[i]!.U - umax) / T);
  const pick = m.rng.weighted(W, OPTS.length);
  const o = OPTS[Math.max(0, pick)]!;
  m.dbg['opt:' + o.kind] = (m.dbg['opt:' + o.kind] ?? 0) + 1;
  if (m.trace) m.trace.push(`t${m.s.tick} ${c.side}:${c.def.positions[0]} u=${uC.toFixed(0)} v=${vC.toFixed(0)} dNear=${dNear.toFixed(1)} -> ${o.kind}${o.r >= 0 ? ' to ' + m.players[o.r]!.def.positions[0] + ' at u=' + m.u(side, o.x).toFixed(0) : ''} U=${o.U.toFixed(1)}`);
  if (o.kind === 'shoot') {
    const held = m.s.tick - m.ownedSince;
    const ok = held <= 2 ? 'shotFrom:firstTime' : held <= 8 ? 'shotFrom:quick' : 'shotFrom:carried';
    m.dbg[ok] = (m.dbg[ok] ?? 0) + 1;
    m.dbg['shotFrom:prevLoose'] = (m.dbg['shotFrom:prevLoose'] ?? 0) + (m.ball.lastPasser < 0 ? 1 : 0);
    const band = uC > 94 ? 'shot<11' : uC > 87 ? 'shot<18' : uC > 80 ? 'shot<25' : 'shot>25';
    m.dbg[band] = (m.dbg[band] ?? 0) + 1;
  }
  execute(m, c, o);
}

function aerialScore(p: PlayerRt): number {
  const e = p.e;
  return 0.35 * e.heading + 0.35 * e.jumping + 0.15 * e.strength + 0.15 * e.bravery;
}

interface PassEval {
  p: number;
  x: number;
  y: number;
  /** Probability of interception (subset of 1-p). */
  pInt: number;
  /** Accuracy probability. */
  pAcc: number;
}

/** Ground / lofted pass to (x, y) for receiver r. */
function evalPass(m: Match, c: PlayerRt, r: PlayerRt, x: number, y: number, kind: 'pass' | 'long'): PassEval {
  x = clamp(x, 0.5, PITCH_L - 0.5);
  y = clamp(y, 0.5, PITCH_W - 0.5);
  const d = dist(c.x, c.y, x, y);
  const e = c.e;
  let pAcc: number;
  if (kind === 'pass') {
    pAcc = (d < 20 ? 0.975 - 0.003 * d : 0.915 - 0.006 * (d - 20)) + 0.22 * (e.passing - 0.62) + 0.04 * (e.technique - 0.6);
  } else {
    pAcc = 0.88 - 0.0055 * (d - 20) + 0.3 * (0.5 * e.passing + 0.2 * e.technique + 0.3 * e.vision - 0.62);
  }
  const press = nearestOppTo(m, c.side, c.x, c.y).d;
  if (press < 2.5) pAcc -= 0.08 * (1 - e.composure);
  pAcc = clamp(pAcc, 0.2, 0.995);
  let pInt = 0;
  if (kind === 'pass') {
    const vb = clamp(10 + 0.45 * d, 11, 24) * 0.85;
    const T = d / vb;
    let notInt = 1;
    for (const o of m.teams[m.opp(c.side)].players) {
      if (!o.onPitch) continue;
      const sd = segDist(o.x, o.y, c.x, c.y, x, y);
      if (sd.d > 7) continue;
      let q = 0;
      for (const sv of SAMPLES) {
        const px = c.x + (x - c.x) * sv;
        const py = c.y + (y - c.y) * sv;
        const to = reachTime(o, dist(o.x, o.y, px, py) - 1.0) + 0.2 - 0.25 * (o.e.anticipation - 0.5);
        const qq = sigmoid(5 * (sv * T - to) - 0.95);
        if (qq > q) q = qq;
      }
      notInt *= 1 - q;
    }
    pInt = 1 - notInt;
  } else {
    // Lofted: defenders converge during the flight; contest at the landing point.
    const T = d / 21 + 0.3;
    const tr = reachTime(r, dist(r.x, r.y, x, y));
    let notInt = 1;
    let k = 0;
    for (const o of nearestTo(m, m.opp(c.side), x, y, 2)) {
      const td = reachTime(o, dist(o.x, o.y, x, y) - 1) + 0.2;
      if (td > T + 0.6) continue;
      const aw = aerialScore(r) - aerialScore(o) + r.rp.hold * 0.12;
      const q = sigmoid(-3.2 * aw + 0.9 * clamp(tr - td, -1.5, 1.5) - (k === 0 ? 0.25 : 0.9));
      notInt *= 1 - q;
      k++;
    }
    pInt = 1 - notInt;
  }
  return { p: pAcc * (1 - pInt), x, y, pInt, pAcc };
}
const SAMPLES = [0.3, 0.55, 0.8];

function evalThrough(m: Match, c: PlayerRt, r: PlayerRt, x: number, y: number): PassEval {
  const d = dist(c.x, c.y, x, y);
  const e = c.e;
  let pAcc = 0.86 - 0.004 * d + 0.25 * (0.5 * e.passing + 0.5 * e.vision - 0.62) + 0.05 * (e.technique - 0.6);
  pAcc = clamp(pAcc, 0.25, 0.97);
  const vb = clamp(12 + 0.4 * d, 13, 24) * 0.85;
  const T = d / vb;
  const tr = reachTime(r, dist(r.x, r.y, x, y)) * 0.85 + 0.1;
  const arrive = Math.max(T, tr);
  const head = r.runUntil > m.s.tick ? 0.45 : 0.15;
  let notInt = 1;
  for (const o of nearestTo(m, m.opp(c.side), x, y, 3)) {
    const turn = o.slot === 0 ? 0 : 0.3;
    const to = reachTime(o, dist(o.x, o.y, x, y) - 1.2) + 0.25 + turn - 0.25 * (o.e.anticipation - 0.5) - (o.slot === 0 ? 0.2 * o.e.rushingOut : 0);
    const q = sigmoid(4 * (arrive - head - to) - 0.6);
    const sd = segDist(o.x, o.y, c.x, c.y, x, y);
    const qLane = sd.d < 4 ? sigmoid(5 * (sd.s * T - (reachTime(o, sd.d - 1) + 0.2)) - 1.0) : 0;
    notInt *= (1 - q) * (1 - qLane);
  }
  const pInt = 1 - notInt;
  return { p: pAcc * (1 - pInt), x, y, pInt, pAcc };
}

// ======================================================================= execution

function execute(m: Match, c: PlayerRt, o: Option): void {
  const s = m.s;
  const side = c.side;
  switch (o.kind) {
    case 'hold': {
      const sp = 1.5 + m.rng.next() * 2;
      s.carryX = clamp(c.x + m.teams[side].dir * sp * 0.5, 2, PITCH_L - 2);
      s.carryY = clamp(c.y + (m.rng.next() - 0.5) * sp, 2, PITCH_W - 2);
      s.decideAt = s.tick + 2 + m.rng.int(3);
      return;
    }
    case 'carry':
      s.carryX = o.x;
      s.carryY = o.y;
      s.decideAt = s.tick + 3 + m.rng.int(4);
      return;
    case 'shoot':
      shoot(m, c, false);
      return;
    case 'cross':
      cross(m, c, false);
      return;
    case 'clear': {
      const cu = clamp(m.u(side, c.x) + 35 + m.rng.next() * 20, 20, 95);
      const cv = clamp(m.v(side, c.y) + (m.rng.next() - 0.5) * 40, 2, 66);
      const tx = m.toX(side, cu);
      const ty = m.toY(side, cv);
      const out = isOut(tx, ty);
      launch(m, 'clear', c.idx, tx, ty, 22, 9 + m.rng.next() * 6, out ? { k: 'out', restart: outRestartFor(m, tx, ty, side) } : { k: 'loose' });
      return;
    }
    case 'pass':
    case 'long':
    case 'through': {
      const r = m.players[o.r]!;
      const t = m.teams[side];
      t.stats.passes++;
      c.st.passes++;
      const ev = o.kind === 'through' ? evalThrough(m, c, r, o.x, o.y) : evalPass(m, c, r, o.x, o.y, o.kind);
      m.dbg['pred:' + o.kind] = (m.dbg['pred:' + o.kind] ?? 0) + ev.p;
      {
        const du = m.u(side, o.x);
        m.passZone = du > 70 ? 'FT' : du > 35 ? 'MID' : 'OWN';
        m.dbg['zone:' + m.passZone] = (m.dbg['zone:' + m.passZone] ?? 0) + 1;
      }
      m.dbg['n:' + o.kind] = (m.dbg['n:' + o.kind] ?? 0) + 1;
      m.lastPassKind = o.kind;
      const d = dist(c.x, c.y, o.x, o.y);
      const speed = o.kind === 'long' ? 21 : o.kind === 'through' ? clamp(12 + 0.4 * d, 13, 24) * 0.85 : clamp(10 + 0.45 * d, 11, 24) * 0.85;
      const peak = o.kind === 'long' ? 3 + d * 0.09 : 0.15;
      const fk: FlightKind = o.kind;
      // Offside check for through balls.
      if (o.kind === 'through') {
        const off = offsideLineU(m, side);
        const ru = m.u(side, r.x);
        const pOff = ru > off + 0.3 ? 0.85 : clamp(0.075 * (1.35 - r.e.offTheBall - 0.35 * r.e.anticipation) * (1 + 0.3 * m.teams[m.opp(side)].tp.line), 0.01, 0.25);
        if (m.rng.chance(pOff)) {
          launch(m, fk, c.idx, o.x, o.y, speed, peak, { k: 'offside', idx: r.idx });
          m.assign[r.idx] = { x: o.x, y: o.y, until: s.tick + 30, urg: 1 };
          return;
        }
      }
      if (!m.rng.chance(ev.pAcc)) {
        // Misplaced: lands 4-10 m off target.
        const ex = o.x + (m.rng.next() - 0.5) * 14;
        const ey = o.y + (m.rng.next() - 0.5) * 14;
        if (isOut(ex, ey)) launch(m, fk, c.idx, ex, ey, speed, peak, { k: 'out', restart: outRestartFor(m, ex, ey, side) });
        else launch(m, fk, c.idx, ex, ey, speed, peak, { k: 'loose' });
        return;
      }
      const intR = ev.pAcc > 0 ? ev.pInt : 0;
      if (m.rng.chance(intR)) {
        // Choose the interceptor: the opponent who gets to the line first.
        let best: PlayerRt | null = null;
        let bx = o.x;
        let by = o.y;
        let bestT = 99;
        for (const op of m.teams[m.opp(side)].players) {
          if (!op.onPitch) continue;
          const sd = segDist(op.x, op.y, c.x, c.y, o.x, o.y);
          const tt = reachTime(op, sd.d) - 0.1 * op.e.anticipation;
          if (tt < bestT) {
            bestT = tt;
            best = op;
            bx = c.x + (o.x - c.x) * Math.max(0.25, sd.s);
            by = c.y + (o.y - c.y) * Math.max(0.25, sd.s);
          }
        }
        if (best) {
          const deflect = m.rng.chance(0.3);
          const f = launch(m, fk, c.idx, bx, by, speed, o.kind === 'long' ? peak : 0.15, { k: 'intercept', idx: best.idx, deflect });
          m.assign[best.idx] = { x: bx, y: by, until: f.t1 + 2, urg: 1 };
          return;
        }
      }
      const f = launch(m, fk, c.idx, o.x, o.y, speed, peak, { k: 'receive', idx: r.idx });
      m.assign[r.idx] = { x: o.x, y: o.y, until: f.t1 + 2, urg: 1 };
      return;
    }
  }
}

function outRestartFor(m: Match, x: number, y: number, lastSide: Side): Restart {
  const recv = m.opp(lastSide);
  if (y < 0 || y > PITCH_W) return { kind: 'throwIn', side: recv, x: clamp(x, 1, PITCH_L - 1), y: y < 0 ? 0 : PITCH_W };
  const attacking: Side = m.teams[0].dir > 0 === x > PITCH_L / 2 ? 0 : 1;
  if (lastSide === attacking) return { kind: 'goalKick', side: m.opp(attacking), x: x > PITCH_L / 2 ? PITCH_L - 5.5 : 5.5, y: 34 + (y < 34 ? -4 : 4) };
  m.teams[attacking].stats.corners++;
  return { kind: 'corner', side: attacking, x: x > PITCH_L / 2 ? PITCH_L : 0, y: y < 34 ? 0 : PITCH_W };
}

/** Cross (open play) or corner delivery into the box. */
export function cross(m: Match, c: PlayerRt, corner: boolean): void {
  const side = c.side;
  const t = m.teams[side];
  const e = c.e;
  const q = corner ? 0.6 * e.corners + 0.2 * e.technique + 0.2 * e.vision : 0.6 * e.crossing + 0.2 * e.technique + 0.2 * e.vision;
  t.stats.passes++;
  c.st.passes++;
  // Target zone
  const zone = m.rng.next();
  const tu = zone < 0.35 ? 99.5 : zone < 0.7 ? 94 : 98;
  const cv = m.v(side, c.y);
  const near = cv < 34 ? -1 : 1;
  const tv = zone < 0.35 ? 34 + near * 3.5 : zone < 0.7 ? 34 + (m.rng.next() - 0.5) * 6 : 34 - near * 5;
  const tx = m.toX(side, tu);
  const ty = m.toY(side, tv);
  const pBad = clamp(0.44 - 0.4 * (q - 0.55) - (corner ? 0.06 : 0), 0.14, 0.62);
  const speed = 20;
  const peak = 3.5 + m.rng.next() * 2;
  if (m.rng.chance(pBad)) {
    if (!corner && m.rng.chance(0.45)) {
      const def = nearestOppTo(m, side, c.x, c.y, true);
      if (def.p && def.d < 4) {
        launch(m, 'cross', c.idx, def.p.x, def.p.y, 14, 1, { k: 'blocked', blocker: def.p.idx, corner: m.rng.chance(0.3) });
        return;
      }
    }
    // Overhit: goes out for a goal kick, or a defender heads clear.
    if (m.rng.chance(0.45)) {
      const ox = m.goalX(side) + t.dir * 2;
      const oy = ty + (m.rng.next() - 0.5) * 20;
      launch(m, 'cross', c.idx, ox, oy, speed, peak, { k: 'out', restart: outRestartFor(m, ox, oy, side) });
      return;
    }
  }
  // Goalkeeper claims?
  const gk = m.gkOf(m.opp(side));
  if (gk) {
    const pClaim = clamp(0.12 + 0.3 * (0.5 * gk.e.commandOfArea + 0.5 * gk.e.aerialReach - 0.6) + (tu > 99 ? 0.12 : 0), 0.04, 0.45);
    if (m.rng.chance(pClaim)) {
      m.assign[gk.idx] = { x: tx, y: ty, until: m.s.tick + 15, urg: 1 };
      launch(m, 'cross', c.idx, tx, ty, speed, peak, { k: 'claim', gk: gk.idx });
      return;
    }
  }
  // Aerial duel: best-placed attacker vs nearest defender.
  let att: PlayerRt | null = null;
  let attScore = -9;
  for (const p of t.players) {
    if (!p.onPitch || p.idx === c.idx || p.slot === 0) continue;
    const d = dist(p.x, p.y, tx, ty);
    if (d > 14) continue;
    const sc = aerialScore(p) - d * 0.03;
    if (sc > attScore) {
      attScore = sc;
      att = p;
    }
  }
  let defP: PlayerRt | null = null;
  let defScore = -9;
  for (const p of m.teams[m.opp(side)].players) {
    if (!p.onPitch || p.slot === 0) continue;
    const d = dist(p.x, p.y, tx, ty);
    if (d > 14) continue;
    const sc = aerialScore(p) * 0.85 + 0.15 * p.e.marking - d * 0.03;
    if (sc > defScore) {
      defScore = sc;
      defP = p;
    }
  }
  if (!att) {
    if (defP) {
      m.assign[defP.idx] = { x: tx, y: ty, until: m.s.tick + 15, urg: 1 };
      launch(m, 'cross', c.idx, tx, ty, speed, peak, { k: 'aerial', winner: defP.idx, att: false, crosser: c.idx });
    } else launch(m, 'cross', c.idx, tx, ty, speed, peak, { k: 'loose' });
    return;
  }
  const pAtt = defP ? sigmoid(3.2 * (attScore - defScore) - 0.35) : 0.85;
  const winner = m.rng.chance(pAtt) ? att : (defP ?? att);
  const isAtt = winner.side === side;
  m.assign[winner.idx] = { x: tx, y: ty, until: m.s.tick + 15, urg: 1 };
  if (!isAtt) m.assign[att.idx] = { x: tx, y: ty, until: m.s.tick + 15, urg: 1 };
  launch(m, 'cross', c.idx, tx, ty, speed, peak, { k: 'aerial', winner: winner.idx, att: isAtt, crosser: c.idx });
}

export { nearestTo };
