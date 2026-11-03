import { FORMATIONS, isRoleValid, rolesForPosition, type MatchCommand, type Side, type Tactic, type TalkTone } from '@touchline/shared';
import { abilityAt } from '../ability';
import type { Match } from '../match';
import { forkRng, type Rng } from '../rng';
import { TICKS_PER_MIN, type PlayerRt } from '../types';
import { defaultPenaltyOrder } from '../restarts';

/**
 * Basic AI manager. It only ever acts through the same commands a human sends,
 * so its decisions land in the command log and replays don't need to re-run it.
 */
export class AiManager {
  private readonly rng: Rng;
  private nextCheck = TICKS_PER_MIN * 5;
  private lastBreak: string | null = null;
  private mentalityBoost = 0;
  private lastRedCount = 0;

  constructor(
    readonly side: Side,
    seed: number,
  ) {
    this.rng = forkRng(seed, `ai:${side}`);
  }

  update(m: Match): MatchCommand[] {
    const s = m.s;
    const t = m.teams[this.side];
    const out: MatchCommand[] = [];
    if (s.phase === 'ended' || s.phase === 'shootout') return out;
    if (s.phase === 'break') {
      const key = `${s.breakKind}:${s.tick}`;
      if (this.lastBreak === key) return out;
      this.lastBreak = key;
      if (s.breakKind !== 'preShootout') {
        out.push({ type: 'teamTalk', tone: this.pickTalk(m) });
        out.push(...this.fatigueSubs(m, 2, 0.7));
      } else {
        out.push({ type: 'penaltyOrder', order: defaultPenaltyOrder(m, this.side) });
      }
      out.push({ type: 'ready' });
      return out;
    }
    // React to red cards immediately.
    const reds = t.players.filter((p) => p.sentOff).length;
    if (reds > this.lastRedCount) {
      this.lastRedCount = reds;
      out.push(...this.reactToRed(m));
    }
    if (s.tick < this.nextCheck) return out;
    this.nextCheck = s.tick + TICKS_PER_MIN * (2 + this.rng.int(2));
    const minute = s.clock / 60;
    const diff = s.score[this.side] - s.score[1 - this.side];
    // Substitutions from the hour mark.
    if (minute >= 57 && t.pendingSubs.length === 0) {
      const threshold = minute > 80 ? 0.72 : minute > 70 ? 0.66 : 0.6;
      const max = minute > 75 ? 3 : 2;
      out.push(...this.fatigueSubs(m, max, threshold));
    }
    // Mentality changes.
    let wanted = 0;
    if (diff < 0 && minute > 65) wanted = minute > 80 ? 2 : 1;
    else if (diff > 0 && minute > 78) wanted = -1;
    if (wanted !== this.mentalityBoost) {
      const tac = structuredClone(t.tactic);
      const base = m.sources[this.side].sheet.tactic.instructions;
      tac.instructions.mentality = Math.max(-3, Math.min(3, base.mentality + wanted));
      tac.instructions.timeWasting = wanted < 0 ? Math.max(base.timeWasting, 2) : base.timeWasting;
      tac.instructions.pressing = Math.max(-2, Math.min(2, base.pressing + (wanted > 0 ? 1 : 0)));
      this.mentalityBoost = wanted;
      out.push({ type: 'tactic', tactic: tac });
    }
    // Occasional shouts.
    if (s.tick >= t.shoutCdUntil && this.rng.chance(0.25)) {
      if (diff < 0 && minute > 55) out.push({ type: 'shout', shout: this.rng.chance(0.5) ? 'demandMore' : 'encourage' });
      else if (diff > 0 && minute > 75) out.push({ type: 'shout', shout: this.rng.chance(0.5) ? 'focus' : 'tightenUp' });
    }
    return out;
  }

  private pickTalk(m: Match): TalkTone {
    const d = m.s.score[this.side] - m.s.score[1 - this.side];
    if (d >= 2) return 'calm';
    if (d === 1) return this.rng.chance(0.5) ? 'praise' : 'calm';
    if (d === 0) return m.teams[this.side].strength < m.teams[1 - this.side]!.strength - 0.6 ? 'noPressure' : 'encourage';
    if (d === -1) return this.rng.chance(0.5) ? 'passion' : 'encourage';
    return 'demand';
  }

  private fatigueSubs(m: Match, max: number, threshold: number): MatchCommand[] {
    const t = m.teams[this.side];
    const left = t.subsAllowed - t.subsUsed - t.pendingSubs.length;
    const windowsLeft = t.windowsAllowed - t.windowsUsed;
    if (left <= 0 || (windowsLeft <= 0 && m.s.phase !== 'break')) return [];
    // Keep one sub in reserve until late unless it's the last window.
    const usable = m.s.clock < 80 * 60 && windowsLeft > 1 ? Math.min(max, left - 1) : Math.min(max, left);
    const tired = t.players
      .filter((p) => p.onPitch && p.slot !== 0 && (p.cond < threshold || (p.yellow && p.base.aggression > 0.6 && m.s.clock > 60 * 60)))
      .sort((a, b) => a.cond - b.cond);
    const cmds: MatchCommand[] = [];
    const usedIn = new Set<string>();
    for (const p of tired.slice(0, Math.max(0, usable))) {
      const repl = this.bestReplacement(m, p, usedIn);
      if (!repl) continue;
      usedIn.add(repl);
      cmds.push({ type: 'sub', out: p.def.id, in: repl });
    }
    return cmds;
  }

  private bestReplacement(m: Match, out: PlayerRt, usedIn: Set<string>): string | null {
    const t = m.teams[this.side];
    const pos = t.formation.slots[out.slot]!.pos;
    let best: string | null = null;
    let bs = -1;
    for (const id of t.bench) {
      if (usedIn.has(id) || t.pendingSubs.some((x) => x.in === id)) continue;
      const p = t.club.players.find((q) => q.id === id);
      if (!p || (p.positions[0] === 'GK') !== (pos === 'GK')) continue;
      const s = abilityAt(p, pos);
      if (s > bs) {
        bs = s;
        best = id;
      }
    }
    // Only bring on someone not much worse than an exhausted starter.
    if (best && bs < abilityAt(out.def, pos) * (0.72 + 0.28 * out.cond) - 1.5) return null;
    return best;
  }

  /** After a red card: bring a keeper on if needed, and fill the hole by sacrificing the most advanced player. */
  private reactToRed(m: Match): MatchCommand[] {
    const t = m.teams[this.side];
    const cmds: MatchCommand[] = [];
    const gk = t.players.find((p) => p.onPitch && p.slot === 0);
    const left = t.subsAllowed - t.subsUsed - t.pendingSubs.length;
    if (gk && gk.def.positions[0] !== 'GK' && left > 0) {
      const benchGk = t.bench.find((id) => t.club.players.find((p) => p.id === id)?.positions[0] === 'GK');
      // Take off the most advanced outfielder and bring on the keeper; then the stand-in returns outfield.
      const f = t.formation;
      const adv = t.players.filter((p) => p.onPitch && p.slot > 0).sort((a, b) => f.slots[b.slot]!.u - f.slots[a.slot]!.u)[0];
      if (benchGk && adv) {
        cmds.push({ type: 'sub', out: adv.def.id, in: benchGk });
        return cmds;
      }
    }
    // Reshape: move the most advanced player into the vacant slot if it is more important.
    const tac: Tactic = structuredClone(t.tactic);
    const f = FORMATIONS[tac.formation];
    const empty = tac.slots.findIndex((s) => !s.playerId);
    if (empty <= 0) return cmds;
    let advSlot = -1;
    for (let i = 1; i < 11; i++) {
      if (!tac.slots[i]!.playerId) continue;
      if (advSlot < 0 || f.slots[i]!.u > f.slots[advSlot]!.u) advSlot = i;
    }
    if (advSlot > 0 && f.slots[advSlot]!.u > f.slots[empty]!.u + 8) {
      const pid = tac.slots[advSlot]!.playerId;
      const posE = f.slots[empty]!.pos;
      tac.slots[empty] = { ...tac.slots[empty]!, playerId: pid };
      if (!isRoleValid(tac.slots[empty]!.role, tac.slots[empty]!.duty, posE)) {
        const r = rolesForPosition(posE)[0]!;
        tac.slots[empty] = { playerId: pid, role: r.id, duty: r.duties.includes('D') ? 'D' : r.duties[0]! };
      }
      tac.slots[advSlot] = { ...tac.slots[advSlot]!, playerId: null };
      cmds.push({ type: 'tactic', tactic: tac });
    }
    return cmds;
  }
}
