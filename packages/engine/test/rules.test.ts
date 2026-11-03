import { describe, expect, it } from 'vitest';
import { Match, simulate } from '../src';
import { sendOff } from '../src/discipline';
import { inputs } from './helpers';

function newMatch(seed = 5): Match {
  const { home, away } = inputs();
  return new Match(seed, home, away);
}

/** Step until the ball is dead (a stoppage) and its restart hasn't been taken yet. */
function toStoppage(m: Match): void {
  for (let i = 0; i < 20_000 && !(m.s.dead && m.s.dead.at - m.s.tick > 2 && m.s.phase === 'play'); i++) {
    if (m.s.phase === 'break') m.command(-1, { type: 'endBreak' });
    else m.step();
  }
  expect(m.s.dead).not.toBeNull();
}

/** Step through any stoppage into open play. */
function toOpenPlay(m: Match): void {
  for (let i = 0; i < 5000 && (m.s.dead || m.s.phase !== 'play'); i++) {
    if (m.s.phase === 'break') m.command(-1, { type: 'endBreak' });
    else m.step();
  }
}

function toBreak(m: Match, kind: string): void {
  for (let i = 0; i < 60_000 && !(m.s.phase === 'break' && m.s.breakKind === kind); i++) m.step();
  expect(m.s.breakKind).toBe(kind);
}

const benchOutfield = (m: Match, side: 0 | 1) => m.teams[side].bench.filter((id) => m.teams[side].club.players.find((p) => p.id === id)!.positions[0] !== 'GK');
const onPitchOutfield = (m: Match, side: 0 | 1) => m.teams[side].players.filter((p) => p.onPitch && p.slot > 0).map((p) => p.def.id);

describe('substitution rules (UEFA: 5 subs, 3 windows, breaks are free)', () => {
  it('a sub queued in open play happens at the next stoppage and uses one window', () => {
    const m = newMatch();
    toOpenPlay(m);
    for (let i = 0; i < 400; i++) m.step();
    toOpenPlay(m);
    const out = onPitchOutfield(m, 0)[3]!;
    const inn = benchOutfield(m, 0)[0]!;
    expect(m.command(0, { type: 'sub', out, in: inn })).toBeNull();
    expect(m.teams[0].pendingSubs).toHaveLength(1);
    toStoppage(m);
    expect(m.teams[0].subsUsed).toBe(1);
    expect(m.teams[0].windowsUsed).toBe(1);
    expect(m.teams[0].players.some((p) => p.def.id === inn && p.onPitch)).toBe(true);
    expect(m.teams[0].subbedOff).toContain(out);
  });

  it('several subs at the same stoppage share one window', () => {
    const m = newMatch(6);
    toOpenPlay(m);
    const outs = onPitchOutfield(m, 0).slice(2, 4);
    const ins = benchOutfield(m, 0).slice(0, 2);
    expect(m.command(0, { type: 'sub', out: outs[0]!, in: ins[0]! })).toBeNull();
    expect(m.command(0, { type: 'sub', out: outs[1]!, in: ins[1]! })).toBeNull();
    toStoppage(m);
    expect(m.teams[0].subsUsed).toBe(2);
    expect(m.teams[0].windowsUsed).toBe(1);
  });

  it('half-time subs do not use a window; the 4th window is refused; the 6th sub is refused', () => {
    const m = newMatch(7);
    toBreak(m, 'halfTime');
    const ins = benchOutfield(m, 0);
    for (let k = 0; k < 2; k++) {
      expect(m.command(0, { type: 'sub', out: onPitchOutfield(m, 0)[k]!, in: ins[k]! })).toBeNull();
    }
    expect(m.teams[0].subsUsed).toBe(2);
    expect(m.teams[0].windowsUsed).toBe(0);
    m.command(-1, { type: 'endBreak' });
    // Three in-play windows, one sub each.
    for (let w = 0; w < 3; w++) {
      toOpenPlay(m);
      expect(m.command(0, { type: 'sub', out: onPitchOutfield(m, 0)[4 + w]!, in: ins[2 + w]! })).toBeNull();
      toStoppage(m);
    }
    expect(m.teams[0].subsUsed).toBe(5);
    expect(m.teams[0].windowsUsed).toBe(3);
    toOpenPlay(m);
    expect(m.command(0, { type: 'sub', out: onPitchOutfield(m, 0)[8]!, in: ins[5]! })).toMatch(/substitutions used/);
  });

  it('no re-entry, and players not on the bench cannot come on', () => {
    const m = newMatch(8);
    toBreak(m, 'halfTime');
    const out = onPitchOutfield(m, 0)[0]!;
    expect(m.command(0, { type: 'sub', out, in: benchOutfield(m, 0)[0]! })).toBeNull();
    expect(m.command(0, { type: 'sub', out: onPitchOutfield(m, 0)[1]!, in: out })).toMatch(/not on the bench/);
    expect(m.command(0, { type: 'sub', out: 'nobody', in: benchOutfield(m, 0)[1]! })).toMatch(/not on the pitch/);
  });

  it('extra time grants a 6th sub and a 4th window', () => {
    // Find a seed that goes to extra time.
    for (let seed = 1; seed < 200; seed++) {
      const m = newMatch(seed);
      for (let i = 0; i < 60_000 && !m.isOver() && !(m.s.phase === 'break' && m.s.breakKind === 'preExtraTime'); i++) {
        if (m.s.phase === 'break') m.command(-1, { type: 'endBreak' });
        else m.step();
      }
      if (m.s.breakKind === 'preExtraTime') {
        expect(m.teams[0].subsAllowed).toBe(6);
        expect(m.teams[0].windowsAllowed).toBe(4);
        expect(m.teams[1].subsAllowed).toBe(6);
        return;
      }
    }
    throw new Error('no extra time in 200 seeds');
  });
});

describe('discipline', () => {
  it('a sent-off player leaves the pitch, cannot be substituted, and the slot stays empty', () => {
    const m = newMatch(9);
    toOpenPlay(m);
    const p = m.teams[1].players.find((q) => q.slot === 4)!;
    sendOff(m, p, 'test', false);
    expect(p.onPitch).toBe(false);
    expect(m.teams[1].players.filter((q) => q.onPitch)).toHaveLength(10);
    expect(m.teams[1].tactic.slots[4]!.playerId).toBeNull();
    expect(m.teams[1].stats.reds).toBe(1);
    expect(m.command(1, { type: 'sub', out: p.def.id, in: m.teams[1].bench[0]! })).toMatch(/not on the pitch/);
  });

  it('a sent-off goalkeeper is replaced in goal by an outfielder', () => {
    const m = newMatch(10);
    const gk = m.gkOf(0)!;
    sendOff(m, gk, 'test', false);
    const newGk = m.gkOf(0)!;
    expect(newGk).toBeDefined();
    expect(newGk.def.id).not.toBe(gk.def.id);
    expect(m.teams[0].tactic.slots[0]!.playerId).toBe(newGk.def.id);
  });

  it('second yellow cards are reported as reds in the event log', () => {
    let seen = 0;
    for (let seed = 1; seed < 80 && seen === 0; seed++) {
      const { home, away } = inputs();
      const m = simulate(seed, home, away);
      const evs = m.events;
      for (const e of evs) {
        if (e.type === 'card' && e.secondYellow) {
          seen++;
          expect(e.color).toBe('red');
          const earlier = evs.find((x) => x.type === 'card' && x.player === e.player && x.color === 'yellow');
          expect(earlier).toBeDefined();
        }
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe('in-match management', () => {
  it('shouts have a cooldown and team talks are once per break', () => {
    const m = newMatch(11);
    toOpenPlay(m);
    expect(m.command(0, { type: 'shout', shout: 'encourage' })).toBeNull();
    expect(m.command(0, { type: 'shout', shout: 'focus' })).toMatch(/still taking in/);
    expect(m.command(0, { type: 'teamTalk', tone: 'praise' })).toMatch(/half-time/);
    toBreak(m, 'halfTime');
    expect(m.command(0, { type: 'teamTalk', tone: 'praise' })).toBeNull();
    expect(m.command(0, { type: 'teamTalk', tone: 'praise' })).toMatch(/already/);
  });

  it('a tactic must place exactly the players on the pitch, and the opponent only sees a notice', () => {
    const m = newMatch(12);
    toOpenPlay(m);
    const bad = structuredClone(m.teams[0].tactic);
    bad.slots[5]!.playerId = m.teams[0].bench[0]!;
    expect(m.command(0, { type: 'tactic', tactic: bad })).toMatch(/exactly the players/);
    const good = structuredClone(m.teams[0].tactic);
    good.instructions.mentality = 2;
    m.drainEvents();
    expect(m.command(0, { type: 'tactic', tactic: good })).toBeNull();
    const ev = m.drainEvents();
    expect(ev).toEqual([expect.objectContaining({ type: 'notice', team: 0, kind: 'tacticalChange' })]);
    expect(m.teams[0].instr.mentality).toBe(2);
  });

  it('both managers ready ends the break immediately', () => {
    const m = newMatch(13);
    toBreak(m, 'halfTime');
    m.command(0, { type: 'ready' });
    expect(m.s.phase).toBe('break');
    m.command(1, { type: 'ready' });
    expect(m.s.phase).toBe('play');
    expect(m.s.period).toBe(2);
  });
});

describe('penalty shootout', () => {
  it('ends as soon as it is decided, with a consistent tally', () => {
    let checked = 0;
    for (let seed = 1; seed < 300 && checked < 3; seed++) {
      const { home, away } = inputs();
      const m = simulate(seed, home, away);
      if (!m.s.pens) continue;
      checked++;
      const kicks = m.events.filter((e) => e.type === 'shootoutKick') as Extract<(typeof m.events)[number], { type: 'shootoutKick' }>[];
      const goals = [0, 0];
      for (const k of kicks) if (k.scored) goals[k.team]!++;
      expect(goals).toEqual(m.s.pens);
      const n = [kicks.filter((k) => k.team === 0).length, kicks.filter((k) => k.team === 1).length];
      expect(Math.abs(n[0]! - n[1]!)).toBeLessThanOrEqual(1);
      expect(Math.min(n[0]!, n[1]!)).toBeGreaterThanOrEqual(3);
      if (n[0]! > 5 || n[1]! > 5) expect(n[0]).toBe(n[1]); // sudden death goes in pairs
      expect(m.s.winner).toBe(m.s.pens[0] > m.s.pens[1] ? 0 : 1);
    }
    expect(checked).toBe(3);
  });
});
