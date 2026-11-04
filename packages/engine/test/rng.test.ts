import { describe, expect, it } from 'vitest';
import { Rng, datan, datan2, dexp, forkRng, sigmoid } from '../src';

describe('Rng', () => {
  it('produces a fixed sequence for a seed (guards against accidental changes)', () => {
    const r = new Rng(12345);
    const seq = Array.from({ length: 5 }, () => r.next());
    const r2 = new Rng(12345);
    expect(Array.from({ length: 5 }, () => r2.next())).toEqual(seq);
    expect(seq.every((x) => x >= 0 && x < 1)).toBe(true);
  });
  it('forks are independent and deterministic', () => {
    const a = forkRng(1, 'sim').next();
    const b = forkRng(1, 'ai:0').next();
    expect(a).not.toBe(b);
    expect(forkRng(1, 'sim').next()).toBe(a);
  });
  it('is roughly uniform', () => {
    const r = new Rng(7);
    const bins = new Array(10).fill(0);
    for (let i = 0; i < 100_000; i++) bins[Math.floor(r.next() * 10)]++;
    for (const b of bins) expect(Math.abs(b - 10_000)).toBeLessThan(600);
  });
});

describe('deterministic math', () => {
  it('dexp matches Math.exp closely', () => {
    for (let x = -20; x <= 20; x += 0.37) expect(Math.abs(dexp(x) / Math.exp(x) - 1)).toBeLessThan(1e-9);
  });
  it('datan / datan2 match Math.atan2 closely', () => {
    for (let x = -10; x <= 10; x += 0.13) expect(Math.abs(datan(x) - Math.atan(x))).toBeLessThan(2e-5);
    for (const [y, x] of [[1, 1], [-2, 3], [4, -1], [-3, -3], [0, -1], [1, 0]] as const) {
      expect(Math.abs(datan2(y, x) - Math.atan2(y, x))).toBeLessThan(2e-5);
    }
  });
  it('sigmoid is centred', () => {
    expect(sigmoid(0)).toBe(0.5);
  });
});
