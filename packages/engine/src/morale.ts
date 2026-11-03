import type { Shout, TalkTone } from '@touchline/shared';
import { clamp } from './detmath';
import type { Match } from './match';
import type { TeamRt } from './types';
import { deriveTeamParams } from './commands';
import { refreshEffective } from './shape';

type Reaction = 'positive' | 'neutral' | 'negative';

/** 0: winning by 2+, 1: winning by 1, 2: level, 3: losing by 1, 4: losing by 2+ */
function scoreState(m: Match, t: TeamRt): number {
  const d = m.s.score[t.side] - m.s.score[1 - t.side];
  return d >= 2 ? 0 : d === 1 ? 1 : d === 0 ? 2 : d === -1 ? 3 : 4;
}

const TALK: Record<TalkTone, number[]> = {
  praise: [0.6, 0.4, 0.1, -0.3, -0.5],
  encourage: [0.2, 0.3, 0.4, 0.5, 0.3],
  calm: [0.45, 0.4, 0.2, 0.0, -0.1],
  demand: [-0.5, -0.2, 0.25, 0.45, 0.35],
  passion: [-0.1, 0.1, 0.3, 0.5, 0.5],
  noPressure: [0.0, 0.1, 0.2, 0.2, 0.4],
  disappointed: [-0.8, -0.5, -0.1, 0.25, 0.35],
};

const SHOUT: Record<Shout, number[]> = {
  encourage: [0.1, 0.15, 0.3, 0.45, 0.4],
  demandMore: [-0.25, -0.1, 0.2, 0.4, 0.3],
  tightenUp: [0.05, 0.1, 0.0, -0.15, -0.25],
  focus: [0.1, 0.1, 0.1, 0.05, 0.0],
  showPassion: [-0.05, 0.05, 0.2, 0.35, 0.35],
  calmDown: [0.15, 0.15, 0.1, 0.0, -0.1],
};

function captainFactor(t: TeamRt): number {
  const cap = t.players.find((p) => p.onPitch && p.def.id === t.tactic.setPieces.captain);
  return 0.85 + 0.3 * (cap?.base.leadership ?? 0.5);
}

function classify(avg: number): Reaction {
  return avg > 0.14 ? 'positive' : avg < -0.08 ? 'negative' : 'neutral';
}

export function applyTeamTalk(m: Match, t: TeamRt, tone: TalkTone): Reaction {
  const st = scoreState(m, t);
  const opp = m.teams[1 - t.side]!;
  const underdog = t.strength < opp.strength - 0.6;
  let base = TALK[tone][st]!;
  if (tone === 'noPressure' && underdog) base += 0.2;
  if (tone === 'praise' && st >= 3 && underdog) base += 0.2;
  const cf = captainFactor(t);
  let sum = 0;
  let n = 0;
  for (const p of t.players) {
    if (!p.onPitch) continue;
    const det = p.base.determination;
    let d = base;
    if (tone === 'demand' || tone === 'disappointed') {
      d = base >= 0 ? base * (0.4 + 1.2 * det) : base * (1.4 - det);
      if (det < 0.4) d -= 0.2;
    } else if (tone === 'passion') d = base * (0.6 + 0.8 * det);
    d = d * cf + m.rng.normal() * 0.07;
    p.morale = clamp(p.morale + d, -3, 3);
    refreshEffective(m, p);
    sum += d;
    n++;
  }
  return classify(n ? sum / n : 0);
}

export function applyShout(m: Match, t: TeamRt, shout: Shout): Reaction {
  const st = scoreState(m, t);
  const repeat = t.lastShout === shout && m.s.tick < t.shoutCdUntil + 3000;
  const k = repeat ? 0.45 : 1;
  const cf = captainFactor(t);
  let sum = 0;
  let n = 0;
  for (const p of t.players) {
    if (!p.onPitch) continue;
    const det = p.base.determination;
    let d = SHOUT[shout][st]! * k;
    if (shout === 'demandMore') d = d >= 0 ? d * (0.4 + 1.2 * det) : d * (1.4 - det);
    if (shout === 'calmDown' && p.morale < -0.5) d += 0.2;
    d = d * cf + m.rng.normal() * 0.05;
    p.morale = clamp(p.morale + d, -3, 3);
    sum += d;
    n++;
  }
  t.shout = { kind: shout, until: m.s.tick + 3000 };
  t.lastShout = shout;
  t.shoutCdUntil = m.s.tick + 1500;
  t.tp = deriveTeamParams(t);
  for (const p of t.players) if (p.onPitch) refreshEffective(m, p);
  return classify(n ? sum / n : 0);
}
