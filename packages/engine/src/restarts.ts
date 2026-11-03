import type { Side } from '@touchline/shared';
import { clamp, dist, sigmoid } from './detmath';
import type { Match } from './match';
import { cross, shoot } from './play';
import { addRating } from './discipline';
import { executePendingSubs } from './commands';
import { HALF_L, PITCH_L, PITCH_W, type PlayerRt, type Restart } from './types';

// ======================================================================= dead balls

export function setDead(m: Match, restart: Restart, delayTicks: number, freeWindow = false): void {
  const s = m.s;
  const b = m.ball;
  b.owner = -1;
  b.flight = null;
  b.vx = 0;
  b.vy = 0;
  b.z = 0;
  b.x = restart.x;
  b.y = restart.y;
  b.lastPasser = -1;
  m.assign.fill(null);
  for (const p of m.players) p.runUntil = 0;
  let delay = delayTicks;
  // Time wasting by the side taking the restart.
  const waste = m.teams[restart.side].tp.waste;
  if (waste > 0 && restart.kind !== 'kickoff' && restart.kind !== 'penalty') {
    const extra = Math.round(delay * 0.13 * waste);
    delay += extra;
    s.wastedTicks += extra;
  }
  s.dead = { restart, at: s.tick + delay, taker: chooseTaker(m, restart), freeWindow };
  s.possession = restart.side;
  if (restart.kind === 'penalty') {
    const tk = m.players[s.dead.taker]!;
    m.emit({ type: 'penalty', team: restart.side, taker: tk.def.id, fouled: restart.fouled !== undefined ? m.players[restart.fouled]!.def.id : tk.def.id });
  }
  // Substitutions happen at stoppages.
  const subbed = executePendingSubs(m, freeWindow);
  if (subbed > 0) s.dead.at += 60 + 20 * subbed;
  // Time-wasting bookings (rare, cumulative).
  if (waste >= 3 && restart.kind !== 'kickoff' && m.refRng.chance(0.004 * waste * s.refStrict)) {
    const tk = m.players[s.dead.taker]!;
    if (!tk.yellow) {
      tk.yellow = true;
      m.teams[tk.side].stats.yellows++;
      s.cardsThisPeriod++;
      addRating(tk, -0.3);
      m.emit({ type: 'card', team: tk.side, player: tk.def.id, color: 'yellow', secondYellow: false, reason: 'time-wasting' });
    }
  }
}

function chooseTaker(m: Match, r: Restart): number {
  const t = m.teams[r.side];
  const on = t.players.filter((p) => p.onPitch);
  const byId = (id: string) => on.find((p) => p.def.id === id);
  const nearest = (excludeGk: boolean) => {
    let best = on[0]!;
    let bd = 1e9;
    for (const p of on) {
      if (excludeGk && p.slot === 0) continue;
      const d = dist(p.x, p.y, r.x, r.y);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    return best;
  };
  const sp = t.tactic.setPieces;
  switch (r.kind) {
    case 'goalKick':
      return (m.gkOf(r.side) ?? nearest(false)).idx;
    case 'kickoff': {
      let best = on[0]!;
      for (const p of on) if (t.formation.slots[p.slot]!.u > t.formation.slots[best.slot]!.u) best = p;
      return best.idx;
    }
    case 'corner': {
      const v = m.v(r.side, r.y);
      const id = v < 34 ? sp.cornerLeft : sp.cornerRight;
      return (byId(id) ?? nearest(true)).idx;
    }
    case 'penalty':
      return (byId(sp.penalty) ?? nearest(true)).idx;
    case 'freeKick': {
      if (r.direct) return (byId(sp.freeKick) ?? nearest(true)).idx;
      if (m.u(r.side, r.x) < 20) return (m.gkOf(r.side) ?? nearest(false)).idx;
      return nearest(true).idx;
    }
    default:
      return nearest(true).idx;
  }
}

export function stepDead(m: Match): void {
  const s = m.s;
  maybeSnapKickoff(m);
  const d = s.dead!;
  const b = m.ball;
  b.x = d.restart.x;
  b.y = d.restart.y;
  b.z = 0;
  if (s.tick >= d.at) executeRestart(m);
}

function executeRestart(m: Match): void {
  const s = m.s;
  const d = s.dead!;
  s.dead = null;
  const r = d.restart;
  const tk = m.players[d.taker]!;
  if (!tk.onPitch) {
    // Taker left (sub/red): pick again.
    d.taker = chooseTaker(m, r);
  }
  const taker = m.players[d.taker]!;
  const dir = m.teams[r.side].dir;
  const b = m.ball;
  b.x = clamp(r.x, 0, PITCH_L);
  b.y = clamp(r.y, 0, PITCH_W);
  taker.x = clamp(r.x - dir * 0.4, -1, PITCH_L + 1);
  taker.y = r.y;
  taker.vx = 0;
  taker.vy = 0;
  b.lastTouch = taker.idx;
  b.lastSide = r.side;
  switch (r.kind) {
    case 'kickoff':
      m.emit({ type: 'kickoff', team: r.side, period: s.period });
      m.giveBall(taker.idx, 1);
      return;
    case 'throwIn':
    case 'goalKick':
    case 'dropBall':
      m.giveBall(taker.idx, 2 + m.rng.int(3));
      return;
    case 'corner': {
      m.emit({ type: 'corner', team: r.side, taker: taker.def.id });
      if (m.rng.chance(0.12)) {
        m.giveBall(taker.idx, 1);
        return;
      }
      b.x = r.x;
      b.y = r.y;
      cross(m, taker, true);
      return;
    }
    case 'freeKick': {
      if (r.direct) {
        const u = m.u(r.side, r.x);
        const v = m.v(r.side, r.y);
        const dGoal = dist(u, v, PITCH_L, 34);
        const pShoot = clamp(0.25 + 0.6 * taker.e.freeKicks - (dGoal - 20) * 0.03, 0.15, 0.85);
        m.emit({ type: 'freeKick', team: r.side, taker: taker.def.id, dangerous: true });
        if (m.rng.chance(pShoot)) {
          shoot(m, taker, false, 'freeKick');
          return;
        }
        if (Math.abs(v - 34) > 10 || dGoal > 24) {
          cross(m, taker, false);
          return;
        }
      }
      m.giveBall(taker.idx, 2 + m.rng.int(3));
      return;
    }
    case 'penalty':
      penaltyKick(m, taker);
      return;
  }
}

function penaltyKick(m: Match, taker: PlayerRt): void {
  const side = taker.side;
  const t = m.teams[side];
  const gk = m.gkOf(m.opp(side));
  const G = gk ? 0.5 * gk.e.reflexes + 0.2 * gk.e.oneOnOnes + 0.3 * gk.e.agility : 0.1;
  const S = 0.6 * taker.e.penalties + 0.4 * taker.e.composure;
  const pGoal = sigmoid(1.266 + 1.6 * (S - 0.65) - 1.3 * (G - 0.6));
  t.stats.shots++;
  t.stats.xg += 0.78;
  taker.st.shots++;
  m.lastShotXg = 0.78;
  m.lastShotKind = 'penalty';
  const gx = m.goalX(side);
  const r = m.rng.next();
  m.ball.lastPasser = -1;
  if (r < pGoal) {
    t.stats.onTarget++;
    taker.st.onTarget++;
    const gy = 34 + (m.rng.chance(0.5) ? 1 : -1) * (1 + m.rng.next() * 2.3);
    launchShot(m, taker, gx, gy, { k: 'goal', scorer: taker.idx, assist: -1, xg: 0.78, kind: 'penalty' });
    if (gk) m.assign[gk.idx] = { x: gx - m.teams[side].dir * 0.5, y: 34 + (gy > 34 ? -2 : 2), until: m.s.tick + 8, urg: 1 };
  } else if (gk && r < pGoal + (1 - pGoal) * 0.68) {
    t.stats.onTarget++;
    taker.st.onTarget++;
    const gy = 34 + (m.rng.chance(0.5) ? 1 : -1) * (0.8 + m.rng.next() * 2);
    m.assign[gk.idx] = { x: gx - m.teams[side].dir * 0.8, y: gy, until: m.s.tick + 8, urg: 1 };
    launchShot(m, taker, gx - m.teams[side].dir * 0.8, gy, { k: 'save', gk: gk.idx, held: m.rng.chance(0.35), shooter: taker.idx, corner: m.rng.chance(0.3) });
  } else {
    const gy = 34 + (m.rng.chance(0.5) ? 1 : -1) * (3.9 + m.rng.next() * 2);
    launchShot(m, taker, gx + m.teams[side].dir * 1.5, gy, { k: 'shotOff', shooter: taker.idx });
  }
}

function launchShot(m: Match, taker: PlayerRt, x: number, y: number, end: import('./types').FlightEnd): void {
  const b = m.ball;
  b.x = taker.x + m.teams[taker.side].dir * 0.4;
  b.y = taker.y;
  const d = dist(b.x, b.y, x, y);
  const dur = Math.max(1, Math.round(d / 26 / 0.2));
  b.flight = { kind: 'shot', fx: b.x, fy: b.y, tx: x, ty: y, t0: m.s.tick, t1: m.s.tick + dur, peak: 0.6, by: taker.idx, end };
  b.owner = -1;
  b.lastTouch = taker.idx;
  b.lastSide = taker.side;
}

// ======================================================================= kickoffs

export function kickoffPositions(m: Match, side: Side): void {
  const t = m.teams[side];
  for (const p of t.players) {
    if (!p.onPitch) continue;
    const fs = t.formation.slots[p.slot]!;
    const u = p.slot === 0 ? 4 : Math.min(fs.u * 0.8, HALF_L - 1.5);
    p.x = m.toX(side, u);
    p.y = m.toY(side, fs.v);
    p.vx = 0;
    p.vy = 0;
    p.tx = p.x;
    p.ty = p.y;
  }
}

export function startKickoff(m: Match, side: Side, freeWindow: boolean, delay = 10): void {
  kickoffPositions(m, 0);
  kickoffPositions(m, 1);
  const k = m.teams[side].players.filter((p) => p.onPitch);
  // Kicker on the centre spot.
  let kicker = k[0]!;
  for (const p of k) if (m.teams[side].formation.slots[p.slot]!.u > m.teams[side].formation.slots[kicker.slot]!.u) kicker = p;
  kicker.x = HALF_L - m.teams[side].dir * 0.3;
  kicker.y = 34;
  setDead(m, { kind: 'kickoff', side, x: HALF_L, y: 34 }, delay, freeWindow);
}

export function kickoffAfterGoal(m: Match, side: Side): void {
  const s = m.s;
  setDead(m, { kind: 'kickoff', side, x: HALF_L, y: 34 }, 210 + m.rng.int(80));
  s.dead!.taker = -1;
  m.pendingKickoffSnap = true;
}

/** Called each dead tick: when a post-goal kickoff is about to be taken, snap everyone into place. */
export function maybeSnapKickoff(m: Match): void {
  const d = m.s.dead;
  if (!d || d.restart.kind !== 'kickoff' || !m.pendingKickoffSnap) return;
  if (m.s.tick < d.at - 1) return;
  m.pendingKickoffSnap = false;
  startKickoff(m, d.restart.side, d.freeWindow, 1);
}

// ======================================================================= dead-ball shapes

/** Override shape targets for set pieces. Called from computeTargets when the ball is dead. */
export function deadBallOverrides(m: Match): void {
  const d = m.s.dead!;
  const r = d.restart;
  const att = r.side;
  const def = m.opp(att);
  if (d.taker >= 0) {
    const tk = m.players[d.taker]!;
    tk.tx = r.x - m.teams[att].dir * 0.4;
    tk.ty = clamp(r.y, 0, PITCH_W);
    tk.urg = 0.9;
  }
  if (r.kind === 'corner' || (r.kind === 'freeKick' && m.u(att, r.x) > 70)) {
    // Attackers into the box: best in the air.
    const atk = m.teams[att].players
      .filter((p) => p.onPitch && p.slot !== 0 && p.idx !== d.taker)
      .sort((a, b) => aerial(b) - aerial(a) || a.idx - b.idx);
    const nIn = 4 + (m.teams[att].instr.mentality > 0 ? 1 : 0);
    const spots: [number, number][] = [
      [99, 30], [98, 37], [94, 34], [96, 41], [93, 28], [100, 34],
    ];
    atk.slice(0, nIn).forEach((p, i) => {
      const [u, v] = spots[i]!;
      p.tx = m.toX(att, u);
      p.ty = m.toY(att, v);
      p.urg = 0.8;
    });
    // Defenders mark zonally in the box.
    const dfd = m.teams[def].players
      .filter((p) => p.onPitch && p.slot !== 0)
      .sort((a, b) => aerial(b) - aerial(a) || a.idx - b.idx);
    const dspots: [number, number][] = [
      [101, 31], [101, 37], [97, 34], [97, 29], [97, 40], [94, 34], [99, 25], [92, 39],
    ];
    dfd.slice(0, 8).forEach((p, i) => {
      const [u, v] = dspots[i]!;
      p.tx = m.toX(att, u);
      p.ty = m.toY(att, v);
      p.urg = 0.8;
    });
  } else if (r.kind === 'penalty') {
    for (const p of m.players) {
      if (!p.onPitch || p.idx === d.taker) continue;
      if (p.side === def && p.slot === 0) {
        p.tx = m.goalX(att) - m.teams[att].dir * 0.3;
        p.ty = 34;
        continue;
      }
      const u = m.u(att, p.tx);
      if (u > 86) {
        p.tx = m.toX(att, 84 + (p.idx % 3));
        p.ty = clamp(p.ty, 14, 54);
      }
    }
  } else if (r.kind === 'freeKick' && r.direct) {
    // Wall of three between ball and goal.
    const dfd = m.teams[def].players.filter((p) => p.onPitch && p.slot !== 0).slice(0, 3);
    const gx = m.goalX(att);
    const dx = gx - r.x;
    const dy = 34 - r.y;
    const dd = Math.sqrt(dx * dx + dy * dy) || 1;
    dfd.forEach((p, i) => {
      p.tx = r.x + (dx / dd) * 9.15 + (-dy / dd) * (i - 1) * 0.8;
      p.ty = r.y + (dy / dd) * 9.15 + (dx / dd) * (i - 1) * 0.8;
      p.urg = 0.8;
    });
  }
}

function aerial(p: PlayerRt): number {
  return p.base.heading + p.base.jumping + p.base.strength * 0.5;
}

// ======================================================================= shootout

export function startShootout(m: Match): void {
  const s = m.s;
  s.phase = 'shootout';
  s.period = 5;
  s.pens = [0, 0];
  const first: Side = m.rng.chance(0.5) ? 0 : 1;
  s.shootout = { kicks: [], next: first, first, orderPos: [0, 0], strikeAt: s.tick + 20, nextAt: s.tick + 5, pending: null };
  for (const t of m.teams) if (t.penaltyOrder.length === 0) t.penaltyOrder = defaultPenaltyOrder(m, t.side);
  m.ball.owner = -1;
  m.ball.flight = null;
  shootoutPositions(m);
}

export function defaultPenaltyOrder(m: Match, side: Side): string[] {
  return m.teams[side].players
    .filter((p) => p.onPitch)
    .sort((a, b) => penScore(b) - penScore(a) || a.idx - b.idx)
    .map((p) => p.def.id);
}

function penScore(p: PlayerRt): number {
  return p.base.penalties * 0.6 + p.base.composure * 0.4 - (p.slot === 0 ? 0.5 : 0);
}

function shootoutPositions(m: Match): void {
  for (const p of m.players) {
    if (!p.onPitch) continue;
    const k = p.idx % 11;
    const ang = k / 11;
    p.x = HALF_L + (p.side === 0 ? -1 : 1) * (2 + ang * 6);
    p.y = 28 + (k % 6) * 2.4;
    p.vx = 0;
    p.vy = 0;
  }
  for (const side of [0, 1] as Side[]) {
    const gk = m.gkOf(side);
    if (gk) {
      gk.x = HALF_L + (side === 0 ? -9 : 9);
      gk.y = 34;
    }
  }
}

function nextTaker(m: Match, side: Side): PlayerRt {
  const t = m.teams[side];
  const sh = m.s.shootout!;
  const order = t.penaltyOrder.map((id) => t.players.find((p) => p.def.id === id && p.onPitch)).filter((p): p is PlayerRt => !!p);
  const pool = order.length > 0 ? order : t.players.filter((p) => p.onPitch);
  const p = pool[sh.orderPos[side] % pool.length]!;
  sh.orderPos[side]++;
  return p;
}

export function stepShootout(m: Match): void {
  const s = m.s;
  const sh = s.shootout!;
  const b = m.ball;
  if (!sh.pending && s.tick >= sh.nextAt) {
    shootoutPositions(m);
    const side = sh.next;
    const taker = nextTaker(m, side);
    const gk = m.gkOf(m.opp(side));
    // All shootout kicks at the right-hand goal.
    taker.x = PITCH_L - 11.6;
    taker.y = 34;
    if (gk) {
      gk.x = PITCH_L - 0.4;
      gk.y = 34;
    }
    b.x = PITCH_L - 11;
    b.y = 34;
    b.z = 0;
    const kicks = sh.kicks;
    const taken = [kicks.filter((k) => k.side === 0).length, kicks.filter((k) => k.side === 1).length];
    const mustScore = taken[side]! >= 4 || taken[m.opp(side)]! >= 5;
    const G = gk ? 0.5 * gk.e.reflexes + 0.2 * gk.e.oneOnOnes + 0.3 * gk.e.agility : 0.1;
    const S = 0.6 * taker.e.penalties + 0.4 * taker.e.composure;
    const pGoal = sigmoid(1.2 + 1.6 * (S - 0.65) - 1.3 * (G - 0.6) - (mustScore ? 0.25 * (1 - taker.e.composure) + 0.1 : 0));
    const r = m.rng.next();
    const outcome: 'goal' | 'saved' | 'missed' = r < pGoal ? 'goal' : r < pGoal + (1 - pGoal) * 0.7 ? 'saved' : 'missed';
    sh.pending = { side, taker: taker.idx, gk: gk?.idx ?? -1, scored: outcome === 'goal', outcome };
    sh.strikeAt = s.tick + 10;
    return;
  }
  if (sh.pending) {
    const p = sh.pending;
    if (s.tick >= sh.strikeAt && s.tick < sh.strikeAt + 4) {
      const k = (s.tick - sh.strikeAt + 1) / 4;
      const ty = p.outcome === 'missed' ? 34 + 5 : p.outcome === 'saved' ? 34 - 1.5 : 34 + 2.2;
      b.x = PITCH_L - 11 + 11.2 * k;
      b.y = 34 + (ty - 34) * k;
      b.z = p.outcome === 'missed' ? 2.8 * k : 0.6 * k;
      if (p.gk >= 0) {
        const g = m.players[p.gk]!;
        g.y = 34 + (p.outcome === 'saved' ? -1.5 : p.outcome === 'goal' ? -2.2 : 1) * k;
      }
    }
    if (s.tick >= sh.strikeAt + 5) {
      sh.kicks.push({ side: p.side, player: m.players[p.taker]!.def.id, scored: p.scored });
      if (p.scored) s.pens![p.side]++;
      m.emit({ type: 'shootoutKick', team: p.side, player: m.players[p.taker]!.def.id, scored: p.scored, outcome: p.outcome, tally: [...s.pens!] as [number, number] });
      sh.pending = null;
      sh.next = m.opp(p.side);
      sh.nextAt = s.tick + 14;
      if (shootoutDecided(m)) m.finish();
    }
  }
}

function shootoutDecided(m: Match): boolean {
  const sh = m.s.shootout!;
  const pens = m.s.pens!;
  const a = sh.kicks.filter((k) => k.side === 0).length;
  const b = sh.kicks.filter((k) => k.side === 1).length;
  if (a <= 5 && b <= 5) {
    const remA = 5 - a;
    const remB = 5 - b;
    if (pens[0] + remA < pens[1] || pens[1] + remB < pens[0]) return true;
    if (a === 5 && b === 5 && pens[0] !== pens[1]) return true;
    return false;
  }
  return a === b && pens[0] !== pens[1];
}
