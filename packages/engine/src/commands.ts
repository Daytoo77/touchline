import {
  FORMATIONS,
  Tactic as TacticZ,
  isRoleValid,
  positionFit,
  roleParams,
  type MatchCommand,
  type Seat,
  type Side,
  type Tactic,
} from '@touchline/shared';
import type { Match } from './match';
import type { PlayerRt, TeamParams, TeamRt } from './types';
import { refreshEffective } from './shape';
import { fixSetPieces } from './discipline';
import { applyShout, applyTeamTalk } from './morale';
import { HALF_L, PITCH_W } from './types';

export function deriveTeamParams(t: TeamRt): TeamParams {
  const i = t.instr;
  const tp: TeamParams = {
    risk: i.mentality / 3,
    line: i.line + (i.mentality >= 2 ? 0.5 : i.mentality <= -2 ? -0.5 : 0),
    press: i.pressing,
    width: i.width,
    tempo: i.tempo,
    direct: i.directness,
    waste: i.timeWasting,
    aggression: 0,
    conc: 0,
    workRate: 0,
    decisions: 0,
    composure: 0,
  };
  const sh = t.shout?.kind;
  if (sh === 'tightenUp') {
    tp.line -= 1;
    tp.width -= 1;
    tp.risk -= 0.4;
    tp.conc += 0.04;
  } else if (sh === 'focus') {
    tp.conc += 0.08;
    tp.decisions += 0.03;
  } else if (sh === 'showPassion') {
    tp.aggression += 0.12;
    tp.workRate += 0.08;
    tp.press += 0.6;
  } else if (sh === 'calmDown') {
    tp.aggression -= 0.12;
    tp.composure += 0.05;
  } else if (sh === 'demandMore') {
    tp.workRate += 0.06;
    tp.press += 0.3;
  } else if (sh === 'encourage') {
    tp.composure += 0.03;
  }
  return tp;
}

export function applyCommand(m: Match, seat: Seat, cmd: MatchCommand): string | null {
  const side = seat as Side;
  const t = m.teams[side];
  const s = m.s;
  if (s.phase === 'ended') return 'The match is over.';
  switch (cmd.type) {
    case 'tactic': {
      if (s.phase === 'shootout') return 'Tactics are locked during the shootout.';
      const tactic = reconcileTactic(t, cmd.tactic);
      const err = validateTactic(m, t, tactic);
      if (err) return err;
      applyTactic(m, t, tactic);
      m.emit({ type: 'notice', team: side, kind: 'tacticalChange' });
      return null;
    }
    case 'shout': {
      if (s.phase !== 'play') return 'Shouts only work while the ball is in play.';
      if (s.tick < t.shoutCdUntil) return 'Your players are still taking in the last instruction.';
      const reaction = applyShout(m, t, cmd.shout);
      m.emit({ type: 'shoutGiven', team: side, shout: cmd.shout, reaction, vis: side });
      m.emit({ type: 'notice', team: side, kind: 'tacticalChange' });
      return null;
    }
    case 'sub': {
      if (s.phase === 'shootout') return 'No substitutions during the shootout.';
      const out = t.players.find((p) => p.def.id === cmd.out);
      if (!out || !out.onPitch) return 'That player is not on the pitch.';
      if (!t.bench.includes(cmd.in)) return 'That player is not on the bench.';
      if (t.pendingSubs.some((x) => x.in === cmd.in || x.out === cmd.out)) return 'Already queued.';
      if (t.subsUsed + t.pendingSubs.length >= t.subsAllowed) return `All ${t.subsAllowed} substitutions used.`;
      if (s.phase === 'break') {
        doSub(m, t, cmd.out, cmd.in, true);
        return null;
      }
      if (t.pendingSubs.length === 0 && t.windowsUsed >= t.windowsAllowed && !(s.dead && s.dead.freeWindow)) {
        return 'No substitution windows left (you can still change at the next break).';
      }
      t.pendingSubs.push({ out: cmd.out, in: cmd.in });
      m.emit({ type: 'subQueued', team: side, out: cmd.out, in: cmd.in, vis: side });
      // Ball already dead and not about to restart: make the change now.
      if (s.dead && s.dead.at - s.tick > 8 && s.dead.restart.kind !== 'penalty') {
        const n = executePendingSubs(m, s.dead.freeWindow, side);
        if (n > 0) s.dead.at += 40;
      }
      return null;
    }
    case 'cancelSub': {
      const before = t.pendingSubs.length;
      t.pendingSubs = t.pendingSubs.filter((x) => x.out !== cmd.out);
      return before === t.pendingSubs.length ? 'No such pending substitution.' : null;
    }
    case 'teamTalk': {
      if (s.phase !== 'break' || s.breakKind === 'preShootout') return 'Team talks happen at half-time and before extra time.';
      if (t.talkGiven) return 'You have already spoken to the players.';
      t.talkGiven = true;
      const reaction = applyTeamTalk(m, t, cmd.tone);
      m.emit({ type: 'teamTalk', team: side, tone: cmd.tone, reaction, vis: side });
      return null;
    }
    case 'penaltyOrder': {
      const on = new Set(t.players.filter((p) => p.onPitch).map((p) => p.def.id));
      const order = cmd.order.filter((id) => on.has(id));
      if (order.length === 0) return 'Choose players who are on the pitch.';
      t.penaltyOrder = order;
      return null;
    }
    case 'ready': {
      if (s.phase !== 'break') return 'Nothing to be ready for.';
      t.ready = true;
      if (m.teams[0].ready && m.teams[1].ready) m.endBreak();
      return null;
    }
  }
}

/**
 * A manager may have drafted the tactic before a substitution or red card happened. Swap subbed-off players
 * for their replacements and clear sent-off players, so the change still applies to the current XI.
 */
function reconcileTactic(t: TeamRt, tactic0: Tactic): Tactic {
  const tactic = structuredClone(tactic0);
  const on = new Set(t.players.filter((p) => p.onPitch).map((p) => p.def.id));
  const sentOff = new Set(t.players.filter((p) => p.sentOff).map((p) => p.def.id));
  for (const slot of tactic.slots) {
    let id = slot.playerId;
    if (!id || on.has(id)) continue;
    let guard = 0;
    while (id && !on.has(id) && t.replacedBy[id] && guard++ < 12) id = t.replacedBy[id]!;
    if (id && on.has(id)) slot.playerId = id;
    else if (sentOff.has(slot.playerId!) || (id && sentOff.has(id))) slot.playerId = null;
    // Anything else (a bench player, an unknown id) is left as is and rejected by validation.
  }
  // Anyone on the pitch but missing from the draft (e.g. the GK stand-in after a red card) fills an empty slot.
  const placed = new Set(tactic.slots.map((s) => s.playerId).filter(Boolean));
  for (const p of t.players) {
    if (!p.onPitch || placed.has(p.def.id)) continue;
    const empty = tactic.slots.findIndex((s, i) => !s.playerId && (i > 0 || p.slot === 0));
    if (empty >= 0) {
      tactic.slots[empty]!.playerId = p.def.id;
      placed.add(p.def.id);
    }
  }
  return tactic;
}

function validateTactic(m: Match, t: TeamRt, tactic: Tactic): string | null {
  const parsed = TacticZ.safeParse(tactic);
  if (!parsed.success) return 'Malformed tactic.';
  const f = FORMATIONS[tactic.formation];
  const on = t.players.filter((p) => p.onPitch).map((p) => p.def.id);
  const placed = tactic.slots.map((s) => s.playerId).filter((x): x is string => x !== null);
  if (placed.length !== on.length || new Set(placed).size !== placed.length || !placed.every((id) => on.includes(id))) {
    return 'The tactic must place exactly the players currently on the pitch.';
  }
  if (!tactic.slots[0]!.playerId) return 'Someone has to play in goal.';
  for (let i = 0; i < 11; i++) {
    const s = tactic.slots[i]!;
    if (!isRoleValid(s.role, s.duty, f.slots[i]!.pos)) return `Invalid role for ${f.slots[i]!.pos}.`;
  }
  void m;
  return null;
}

export function applyTactic(m: Match, t: TeamRt, tactic: Tactic): void {
  const keepSp = t.tactic.setPieces;
  t.tactic = structuredClone(tactic);
  t.formation = FORMATIONS[tactic.formation];
  t.instr = { ...tactic.instructions };
  tactic.slots.forEach((s, k) => {
    if (!s.playerId) return;
    const p = t.players.find((q) => q.def.id === s.playerId)!;
    p.slot = k;
    p.rp = roleParams(s.role, s.duty);
    p.fit = positionFit(p.def.positions, t.formation.slots[k]!.pos);
  });
  t.tp = deriveTeamParams(t);
  if (!t.tactic.setPieces) t.tactic.setPieces = keepSp;
  fixSetPieces(m, t.side);
  for (const p of t.players) if (p.onPitch) refreshEffective(m, p);
}

/** Execute queued substitutions at a stoppage. Returns the number made. */
export function executePendingSubs(m: Match, freeWindow: boolean, only?: Side): number {
  let total = 0;
  for (const t of m.teams) {
    if (only !== undefined && t.side !== only) continue;
    if (t.pendingSubs.length === 0) continue;
    if (!freeWindow && t.windowsUsed >= t.windowsAllowed) {
      for (const _x of t.pendingSubs) m.emit({ type: 'subRejected', team: t.side, reason: 'No substitution windows left.', vis: t.side });
      t.pendingSubs = [];
      continue;
    }
    let made = 0;
    for (const x of t.pendingSubs) {
      if (t.subsUsed >= t.subsAllowed) break;
      if (doSub(m, t, x.out, x.in, freeWindow)) made++;
    }
    t.pendingSubs = [];
    if (made > 0 && !freeWindow) t.windowsUsed++;
    total += made;
  }
  m.s.subsThisPeriod += total;
  return total;
}

function doSub(m: Match, t: TeamRt, outId: string, inId: string, _free: boolean): boolean {
  const k = t.players.findIndex((p) => p.def.id === outId && p.onPitch);
  if (k < 0 || !t.bench.includes(inId)) return false;
  const def = t.club.players.find((p) => p.id === inId);
  if (!def) return false;
  const out = t.players[k]!;
  const slot = out.slot;
  const np: PlayerRt = m.makePlayer(t.side, out.idx, def, slot, t);
  np.cond = 1;
  np.morale = 0.3;
  // Enters from the touchline at halfway when play is live/dead; during breaks just take the spot.
  if (m.s.phase === 'break') {
    np.x = out.x;
    np.y = out.y;
  } else {
    np.x = HALF_L;
    np.y = out.y < PITCH_W / 2 ? 0.5 : PITCH_W - 0.5;
  }
  t.players[k] = np;
  m.players[out.idx] = np;
  t.bench = t.bench.filter((b) => b !== inId);
  t.subbedOff.push(outId);
  t.replacedBy[outId] = inId;
  t.tactic.slots[slot]!.playerId = inId;
  t.subsUsed++;
  refreshEffective(m, np);
  if (m.ball.owner === out.idx) m.ball.owner = -1;
  m.assign[out.idx] = null;
  m.emit({ type: 'sub', team: t.side, out: outId, in: inId });
  fixSetPieces(m, t.side);
  // If he was on the penalty list, the incoming player takes his place.
  t.penaltyOrder = t.penaltyOrder.map((id) => (id === outId ? inId : id));
  m.rosterVersion++;
  return true;
}
