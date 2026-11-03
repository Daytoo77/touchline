import type { Club, Kit } from './schema/club';

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToLab([r, g, b]: [number, number, number]): [number, number, number] {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = lin(r), G = lin(g), B = lin(b);
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIE76 colour distance; < ~35 reads as a clash on a small phone screen. */
export function colourDistance(a: string, b: string): number {
  const A = rgbToLab(hexToRgb(a));
  const B = rgbToLab(hexToRgb(b));
  return Math.sqrt((A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2 + (A[2] - B[2]) ** 2);
}

function kitDistance(a: Kit, b: Kit): number {
  return Math.min(colourDistance(a.shirt, b.shirt), colourDistance(a.shirt, b.trim) + 15, colourDistance(a.trim, b.shirt) + 15);
}

/** Home side always wears home; the away side wears whichever of its kits contrasts best. */
export function resolveKits(home: Club, away: Club): [Kit, Kit] {
  const h = home.kits.home;
  const candidates = [away.kits.home, away.kits.away];
  let best = candidates[0]!;
  if (home.id === away.id || kitDistance(h, best) < 40) {
    best = kitDistance(h, candidates[1]!) >= kitDistance(h, candidates[0]!) ? candidates[1]! : candidates[0]!;
  }
  if (kitDistance(h, best) < 25) {
    // Both kits clash (rare): fall back to a neutral contrasting kit.
    const light = rgbToLab(hexToRgb(h.shirt))[0] > 55;
    best = light
      ? { shirt: '#1d2433', trim: '#1d2433', shorts: '#1d2433', number: '#ffffff', pattern: 'plain' }
      : { shirt: '#f4f4f4', trim: '#f4f4f4', shorts: '#f4f4f4', number: '#111111', pattern: 'plain' };
  }
  return [h, best];
}

/** Readable text colour on top of a background colour. */
export function textOn(bg: string): string {
  return rgbToLab(hexToRgb(bg))[0] > 60 ? '#111111' : '#ffffff';
}
