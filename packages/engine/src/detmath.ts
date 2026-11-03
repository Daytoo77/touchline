/**
 * Deterministic math. Only + − × ÷ and Math.sqrt are guaranteed bit-identical across JS engines
 * (V8 in Node/Chrome vs JavaScriptCore in iOS Safari). Math.exp, Math.sin, Math.pow, Math.atan2,
 * Math.hypot… are NOT, so the engine uses these polynomial versions instead.
 */

const LN2 = 0.6931471805599453;
const INV_LN2 = 1.4426950408889634;

// Exact powers of two (multiplying by 2 is exact in IEEE-754).
const POW2: number[] = [];
const POW2_OFFSET = 60;
{
  let v = 1;
  for (let i = 0; i < POW2_OFFSET; i++) v /= 2;
  for (let k = -POW2_OFFSET; k <= POW2_OFFSET; k++) {
    POW2.push(v);
    v *= 2;
  }
}

/** e^x, relative error < 2e-10 on [-40, 40]. */
export function dexp(x: number): number {
  if (x > 40) x = 40;
  else if (x < -40) x = -40;
  const k = Math.round(x * INV_LN2);
  const r = x - k * LN2; // |r| <= ln2/2
  // Taylor series to r^10 (Horner form).
  let p = 2.505210838544172e-8;
  p = p * r + 2.755731922398589e-7;
  p = p * r + 2.7557319223985893e-6;
  p = p * r + 2.48015873015873e-5;
  p = p * r + 1.984126984126984e-4;
  p = p * r + 1.388888888888889e-3;
  p = p * r + 8.333333333333333e-3;
  p = p * r + 4.1666666666666664e-2;
  p = p * r + 0.16666666666666666;
  p = p * r + 0.5;
  p = p * r + 1;
  p = p * r + 1;
  return p * POW2[k + POW2_OFFSET]!;
}

export function sigmoid(x: number): number {
  return 1 / (1 + dexp(-x));
}

/** atan for any x; max error ≈ 1e-5 rad. */
export function datan(x: number): number {
  const neg = x < 0;
  let a = neg ? -x : x;
  let inv = false;
  if (a > 1) {
    a = 1 / a;
    inv = true;
  }
  // Minimax-style odd polynomial on [0, 1].
  const a2 = a * a;
  let r = a * (0.99997726 + a2 * (-0.33262347 + a2 * (0.19354346 + a2 * (-0.11643287 + a2 * (0.05265332 + a2 * -0.0117212)))));
  if (inv) r = 1.5707963267948966 - r;
  return neg ? -r : r;
}

export function datan2(y: number, x: number): number {
  if (x > 0) return datan(y / x);
  if (x < 0) return y >= 0 ? datan(y / x) + 3.141592653589793 : datan(y / x) - 3.141592653589793;
  if (y > 0) return 1.5707963267948966;
  if (y < 0) return -1.5707963267948966;
  return 0;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/** Distance from point P to segment AB, and the parameter s∈[0,1] of the closest point. */
export function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): { d: number; s: number } {
  const abx = bx - ax;
  const aby = by - ay;
  const len2 = abx * abx + aby * aby;
  let s = len2 > 1e-9 ? ((px - ax) * abx + (py - ay) * aby) / len2 : 0;
  s = clamp(s, 0, 1);
  const cx = ax + abx * s;
  const cy = ay + aby * s;
  return { d: dist(px, py, cx, cy), s };
}

/** Round to one decimal (for frames). */
export function r1(v: number): number {
  return Math.round(v * 10) / 10;
}
