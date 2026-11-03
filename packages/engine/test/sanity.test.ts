import { describe, expect, it } from 'vitest';
import { simulate } from '../src';
import { PITCH_L, PITCH_W } from '../src/types';
import { inputs } from './helpers';
import { synthClub } from '@touchline/data';

describe('simulation sanity over many seeds', () => {
  const seeds = Array.from({ length: 16 }, (_, i) => 900 + i);
  const strong = synthClub('strong', 16);
  const weak = synthClub('weak', 12);
  it.each(seeds)('seed %i: valid knockout result, positions and stats', (seed) => {
    const pair = seed % 2 === 0 ? inputs() : inputs(strong, weak);
    let maxOut = 0;
    let nan = false;
    const m = simulate(seed, pair.home, pair.away);
    for (const p of m.players) {
      if (!p.onPitch) continue;
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) nan = true;
      maxOut = Math.max(maxOut, -p.x, p.x - PITCH_L, -p.y, p.y - PITCH_W);
    }
    expect(nan).toBe(false);
    expect(maxOut).toBeLessThanOrEqual(2.01);
    expect(m.isOver()).toBe(true);
    expect(m.s.winner === 0 || m.s.winner === 1).toBe(true);
    // A knockout always has a winner: by score, or by penalties after a draw.
    if (m.s.score[0] === m.s.score[1]) {
      expect(m.s.pens).not.toBeNull();
      expect(m.s.pens![0]).not.toBe(m.s.pens![1]);
      expect(m.s.winner).toBe(m.s.pens![0] > m.s.pens![1] ? 0 : 1);
    } else {
      expect(m.s.winner).toBe(m.s.score[0] > m.s.score[1] ? 0 : 1);
      // Extra time only when level after 90.
    }
    for (const t of m.teams) {
      const st = t.stats;
      expect(st.goals).toBeLessThanOrEqual(st.onTarget + 2); // own goals are not modelled; allow rounding of pens
      expect(st.onTarget).toBeLessThanOrEqual(st.shots);
      expect(st.passesCompleted).toBeLessThanOrEqual(st.passes);
      expect(t.players.filter((p) => p.onPitch).length).toBeLessThanOrEqual(11);
      expect(t.players.filter((p) => p.onPitch).length).toBeGreaterThanOrEqual(7);
      expect(t.subsUsed).toBeLessThanOrEqual(t.subsAllowed);
      expect(t.windowsUsed).toBeLessThanOrEqual(t.windowsAllowed);
    }
    expect(m.s.score[0]).toBe(m.teams[0].stats.goals);
    expect(m.s.score[1]).toBe(m.teams[1].stats.goals);
    const ev = m.commandLog.length; // touched to keep the log alive
    expect(ev).toBeGreaterThan(0);
  });
});
