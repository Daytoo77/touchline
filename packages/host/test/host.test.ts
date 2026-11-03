import { describe, expect, it } from 'vitest';
import { synthClub } from '@touchline/data';
import { autoSheet, runReplay } from '@touchline/engine';
import type { MatchEvent, ReplayFile } from '@touchline/shared';
import { MatchHost, visibleTo, type HostListener } from '../src';

const A = synthClub('host-a', 14);
const B = synthClub('host-b', 14);

function makeHost(opts: Partial<ConstructorParameters<typeof MatchHost>[0]> = {}) {
  let now = 0;
  const events: MatchEvent[] = [];
  let replay: ReplayFile | null = null;
  const pauses: boolean[] = [];
  const listener: HostListener = {
    frames: () => {},
    events: (e) => events.push(...e),
    publicState: () => {},
    privateState: () => {},
    roster: () => {},
    pause: (p) => pauses.push(p.paused),
    ended: (r) => (replay = r),
  };
  const host = new MatchHost(
    { seed: 11, home: { club: A, sheet: autoSheet(A) }, away: { club: B, sheet: autoSheet(B) }, ai: [true, true], now: () => now, ...opts },
    listener,
  );
  return {
    host,
    events,
    pauses,
    get replay() {
      return replay;
    },
    advance(ms: number) {
      now += ms;
      host.pump();
    },
    get now() {
      return now;
    },
  };
}

describe('MatchHost pacing', () => {
  it('plays 90 minutes in roughly the target real time (variable pacing + governor)', () => {
    const h = makeHost({ ai: [true, true], targetSeconds: 600 });
    let firstHalfEnd = -1;
    let secondHalfEnd = -1;
    for (let i = 0; i < 40_000 && secondHalfEnd < 0; i++) {
      h.advance(50);
      if (firstHalfEnd < 0 && h.events.some((e) => e.type === 'periodEnd' && e.period === 1)) firstHalfEnd = h.now;
      if (h.events.some((e) => e.type === 'periodEnd' && e.period === 2)) secondHalfEnd = h.now;
    }
    const playSeconds = (secondHalfEnd - 0) / 1000; // AI seats skip the half-time break immediately
    console.log(`90 minutes took ${playSeconds.toFixed(0)} s of wall time (first half ${(firstHalfEnd / 1000).toFixed(0)} s)`);
    expect(playSeconds).toBeGreaterThan(480);
    expect(playSeconds).toBeLessThan(760);
  });
});

describe('MatchHost commands, pause and replay', () => {
  it('a human seat can command; the AI seat cannot be commanded', () => {
    const h = makeHost({ ai: [false, true] });
    h.advance(50);
    const t = h.host.match.teams[0];
    const tac = structuredClone(t.tactic);
    tac.instructions.tempo = 2;
    expect(h.host.command(0, { type: 'tactic', tactic: tac }).ok).toBe(true);
    expect(h.host.command(1, { type: 'tactic', tactic: tac }).ok).toBe(false);
  });

  it('auto-pauses while a manager is disconnected, up to the budget, then plays on', () => {
    const h = makeHost({ ai: [false, true], pauseBudgetMs: 3000 });
    for (let i = 0; i < 40; i++) h.advance(50);
    const tick0 = h.host.match.s.tick;
    h.host.setConnected(0, false);
    expect(h.host.paused).toBe(true);
    for (let i = 0; i < 40; i++) h.advance(50); // 2 s
    expect(h.host.match.s.tick).toBe(tick0);
    for (let i = 0; i < 40; i++) h.advance(50); // budget exhausted
    expect(h.host.paused).toBe(false);
    for (let i = 0; i < 40; i++) h.advance(50);
    expect(h.host.match.s.tick).toBeGreaterThan(tick0);
    h.host.setConnected(0, true);
    expect(h.host.pauseInfo().budgetMs[0]).toBe(0);
  });

  it('the replay produced by a live host re-simulates exactly', () => {
    const h = makeHost({ ai: [false, true], speed: 8 });
    let commanded = false;
    for (let i = 0; i < 100_000 && !h.host.isOver; i++) {
      h.advance(50);
      const m = h.host.match;
      if (!commanded && m.s.tick > 4000) {
        commanded = true;
        const tac = structuredClone(m.teams[0].tactic);
        tac.instructions.mentality = 2;
        h.host.command(0, { type: 'tactic', tactic: tac });
        h.host.command(0, { type: 'shout', shout: 'encourage' });
      }
      if (m.s.phase === 'break') h.host.command(0, { type: 'ready' });
    }
    expect(h.replay).not.toBeNull();
    const r = runReplay(JSON.parse(JSON.stringify(h.replay)), { home: A, away: B });
    expect(r.ok).toBe(true);
    expect(r.match.s.score).toEqual(h.host.match.s.score);
  });

  it('private events are filtered per side', () => {
    const ev: MatchEvent[] = [
      { type: 'shoutGiven', team: 0, shout: 'focus', reaction: 'neutral', vis: 0, t: 1, clock: 0 },
      { type: 'notice', team: 0, kind: 'tacticalChange', t: 1, clock: 0 },
    ];
    expect(visibleTo(ev, 1).map((e) => e.type)).toEqual(['notice']);
    expect(visibleTo(ev, 0)).toHaveLength(2);
  });
});
