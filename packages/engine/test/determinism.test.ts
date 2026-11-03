import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AiManager, Match, runReplay, simulate } from '../src';
import { AWAY, HOME, fingerprint, inputs, runScripted } from './helpers';

const here = dirname(fileURLToPath(import.meta.url));

describe('determinism', () => {
  it('same seed + same commands => identical match (in-process, run twice)', () => {
    const a = runScripted(4242);
    const b = runScripted(4242);
    expect(a.m.checksums.length).toBeGreaterThan(40);
    expect(fingerprint(a.m)).toBe(fingerprint(b.m));
    expect(JSON.stringify(a.replay.commands)).toBe(JSON.stringify(b.replay.commands));
  });

  it('different seeds give different matches', () => {
    const a = simulate(1, inputs().home, inputs().away);
    const b = simulate(2, inputs().home, inputs().away);
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });

  it('a replay file (seed + sheets + command log) reproduces the match exactly, after a JSON round-trip', () => {
    const { m, replay } = runScripted(777);
    const file = JSON.parse(JSON.stringify(replay));
    const r = runReplay(file, { home: HOME, away: AWAY });
    expect(r.firstMismatch).toBeNull();
    expect(r.ok).toBe(true);
    expect(r.match.s.score).toEqual(m.s.score);
    expect(r.match.s.pens).toEqual(m.s.pens);
    expect(fingerprint(r.match)).toBe(fingerprint(m));
  });

  it('is identical in a fresh Node process (no hidden module state)', () => {
    const { m } = runScripted(31337);
    const out = execFileSync(process.execPath, ['--import', 'tsx', resolve(here, 'fixtures/run-seed.ts'), '31337'], {
      cwd: resolve(here, '../../..'),
      encoding: 'utf8',
    });
    expect(out.trim()).toBe(fingerprint(m));
  });

  it('two matches interleaved in one process do not affect each other', () => {
    const solo = simulate(99, inputs().home, inputs().away);
    const x = new Match(99, inputs().home, inputs().away);
    const y = new Match(100, inputs().home, inputs().away);
    // Drive x exactly like simulate() would, while y runs in lockstep.
    const ax = [new AiManager(0, 99), new AiManager(1, 99)];
    const ay = [new AiManager(0, 100), new AiManager(1, 100)];
    while (!x.isOver()) {
      for (const ai of ax) for (const c of ai.update(x)) x.command(ai.side, c);
      for (const ai of ay) for (const c of ai.update(y)) y.command(ai.side, c);
      if (x.s.phase === 'break') {
        x.command(-1, { type: 'endBreak' });
        continue;
      }
      x.step();
      if (y.s.phase === 'break') y.command(-1, { type: 'endBreak' });
      else y.step();
    }
    expect(fingerprint(x)).toBe(fingerprint(solo));
  });
});
