import { positionFit } from '@touchline/shared';
import { clamp } from './detmath';
import type { Match } from './match';
import type { PlayerRt } from './types';
import { refreshEffective } from './shape';

export function addRating(p: PlayerRt, delta: number): void {
  p.st.rating = clamp(p.st.rating + delta, 3, 10);
}

/** Red card (direct or second yellow). The slot is left empty; a sent-off keeper is replaced by an outfielder. */
export function sendOff(m: Match, p: PlayerRt, reason: string, secondYellow: boolean): void {
  const t = m.teams[p.side];
  t.stats.reds++;
  if (secondYellow) t.stats.yellows++;
  m.s.cardsThisPeriod++;
  addRating(p, -1.5);
  m.emit({ type: 'card', team: p.side, player: p.def.id, color: 'red', secondYellow, reason });
  const slot = p.slot;
  p.onPitch = false;
  p.sentOff = true;
  p.slot = -1;
  p.x = -5;
  p.y = -5;
  p.vx = 0;
  p.vy = 0;
  if (m.ball.owner === p.idx) m.ball.owner = -1;
  m.assign[p.idx] = null;
  t.pendingSubs = t.pendingSubs.filter((s) => s.out !== p.def.id);
  t.tactic.slots[slot]!.playerId = null;
  if (slot === 0) {
    // Emergency keeper: the most suitable outfielder goes in goal.
    let best: PlayerRt | null = null;
    let bs = -1;
    for (const q of t.players) {
      if (!q.onPitch) continue;
      const sc = q.base.jumping * 0.4 + q.base.positioning * 0.3 + q.base.bravery * 0.3 + (q.def.positions[0] === 'GK' ? 5 : 0);
      if (sc > bs) {
        bs = sc;
        best = q;
      }
    }
    if (best) {
      t.tactic.slots[best.slot]!.playerId = null;
      best.slot = 0;
      t.tactic.slots[0]!.playerId = best.def.id;
      best.fit = positionFit(best.def.positions, 'GK');
      refreshEffective(m, best);
    }
  }
  fixSetPieces(m, p.side);
  m.rosterVersion++;
}

/** Reassign set-piece duties whose player is no longer on the pitch. */
export function fixSetPieces(m: Match, side: 0 | 1): void {
  const t = m.teams[side];
  const on = t.players.filter((q) => q.onPitch);
  if (on.length === 0) return;
  const sp = t.tactic.setPieces;
  const has = (id: string) => on.some((q) => q.def.id === id);
  const best = (f: (q: PlayerRt) => number) => on.reduce((a, b) => (f(b) > f(a) ? b : a)).def.id;
  if (!has(sp.captain)) sp.captain = best((q) => q.base.leadership + q.def.age / 100);
  if (!has(sp.penalty)) sp.penalty = best((q) => q.base.penalties * 0.7 + q.base.composure * 0.3 - (q.slot === 0 ? 1 : 0));
  if (!has(sp.freeKick)) sp.freeKick = best((q) => q.base.freeKicks - (q.slot === 0 ? 1 : 0));
  if (!has(sp.cornerLeft)) sp.cornerLeft = best((q) => q.base.corners - (q.slot === 0 ? 1 : 0));
  if (!has(sp.cornerRight)) sp.cornerRight = best((q) => q.base.corners - (q.slot === 0 ? 1 : 0));
}
