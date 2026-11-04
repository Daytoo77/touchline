import type { Frame } from '@touchline/shared';

interface Timed {
  f: Frame;
  at: number;
}

/** Buffers server frames with arrival timestamps and samples them with a small delay for smooth motion. */
export class FrameBuffer {
  private frames: Timed[] = [];
  private lastBatchAt = 0;
  delayMs = 140;

  reset(): void {
    this.frames = [];
    this.lastBatchAt = 0;
  }

  push(batch: Frame[]): void {
    if (!batch.length) return;
    const now = performance.now();
    const span = this.lastBatchAt ? Math.min(220, Math.max(16, now - this.lastBatchAt)) : 16;
    this.lastBatchAt = now;
    const last = this.frames[this.frames.length - 1];
    batch.forEach((f, i) => {
      if (last && f.t <= last.f.t) return;
      this.frames.push({ f, at: now - span + (span * (i + 1)) / batch.length });
    });
    while (this.frames.length > 3 && this.frames[1]!.at < now - 2000) this.frames.shift();
  }

  latest(): Frame | null {
    return this.frames[this.frames.length - 1]?.f ?? null;
  }

  /** Interpolated positions at render time. Big jumps (restarts, subs) snap instead of sliding. */
  sample(out: { p: number[]; b: [number, number, number]; o: number; c: number }): boolean {
    const n = this.frames.length;
    if (!n) return false;
    const t = performance.now() - this.delayMs;
    let i = n - 1;
    while (i > 0 && this.frames[i - 1]!.at > t) i--;
    const b = this.frames[i]!;
    const a = this.frames[Math.max(0, i - 1)]!;
    const k = b.at === a.at ? 1 : Math.max(0, Math.min(1, (t - a.at) / (b.at - a.at)));
    const fa = a.f;
    const fb = b.f;
    if (out.p.length !== fb.p.length) out.p = new Array(fb.p.length).fill(0);
    for (let j = 0; j < fb.p.length; j += 2) {
      const ax = fa.p[j]!;
      const ay = fa.p[j + 1]!;
      const bx = fb.p[j]!;
      const by = fb.p[j + 1]!;
      if (ax < 0 || bx < 0 || Math.abs(ax - bx) + Math.abs(ay - by) > 14) {
        out.p[j] = bx;
        out.p[j + 1] = by;
      } else {
        out.p[j] = ax + (bx - ax) * k;
        out.p[j + 1] = ay + (by - ay) * k;
      }
    }
    const jump = Math.abs(fa.b[0] - fb.b[0]) + Math.abs(fa.b[1] - fb.b[1]) > 40;
    const kk = jump ? 1 : k;
    out.b = [fa.b[0] + (fb.b[0] - fa.b[0]) * kk, fa.b[1] + (fb.b[1] - fa.b[1]) * kk, fa.b[2] + (fb.b[2] - fa.b[2]) * kk];
    out.o = k < 0.5 ? fa.o : fb.o;
    out.c = fa.c + (fb.c - fa.c) * k;
    return true;
  }
}

export const frameBuffer = new FrameBuffer();
