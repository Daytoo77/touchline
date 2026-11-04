/**
 * Seeded PRNG (sfc32). Only 32-bit integer ops, so the sequence is identical in every JS engine.
 */
export class Rng {
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  constructor(seed: number, salt = 0) {
    // splitmix32 to spread the seed over the four words
    let s = (seed ^ Math.imul(salt | 0, 0x9e3779b9)) >>> 0;
    const next = () => {
      s = (s + 0x9e3779b9) | 0;
      let z = s;
      z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
      z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
      return (z ^ (z >>> 16)) >>> 0;
    };
    this.a = next();
    this.b = next();
    this.c = next();
    this.d = next();
    for (let i = 0; i < 12; i++) this.next();
  }

  /** Uniform in [0, 1). */
  next(): number {
    const a = this.a | 0, b = this.b | 0, c = this.c | 0, d = this.d | 0;
    const t = (((a + b) | 0) + d) | 0;
    this.d = (d + 1) | 0;
    this.a = b ^ (b >>> 9);
    this.b = (c + (c << 3)) | 0;
    const c2 = (c << 21) | (c >>> 11);
    this.c = (c2 + t) | 0;
    return (t >>> 0) / 4294967296;
  }

  range(lo: number, hi: number): number {
    return lo + (hi - lo) * this.next();
  }

  int(n: number): number {
    return Math.floor(this.next() * n);
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Roughly normal(0, 1) via a sum of uniforms (Irwin–Hall, n = 4). */
  normal(): number {
    return (this.next() + this.next() + this.next() + this.next() - 2) * 1.7320508075688772;
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.int(arr.length)]!;
  }

  /** Sample an index from non-negative weights. Returns -1 if all weights are 0. */
  weighted(weights: ArrayLike<number>, n = weights.length): number {
    let total = 0;
    for (let i = 0; i < n; i++) total += weights[i]!;
    if (total <= 0) return -1;
    let r = this.next() * total;
    for (let i = 0; i < n; i++) {
      r -= weights[i]!;
      if (r < 0) return i;
    }
    return n - 1;
  }

  state(): [number, number, number, number] {
    return [this.a >>> 0, this.b >>> 0, this.c >>> 0, this.d >>> 0];
  }
}

/** FNV-1a 32-bit string hash. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Independent stream derived from the match seed and a label. */
export function forkRng(seed: number, label: string): Rng {
  return new Rng(seed, hashString(label));
}
