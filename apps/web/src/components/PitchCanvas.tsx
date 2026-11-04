import { useEffect, useRef } from 'react';
import type { Kit } from '@touchline/shared';
import { frameBuffer } from '../lib/frames';
import { useMatch } from '../matchStore';

const L = 105;
const W = 68;

/** Top-down pitch. Your team always attacks upwards; the view rotates at half-time with the teams. */
export function PitchCanvas({ maxHeight }: { maxHeight: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let cssW = 0;
    let cssH = 0;
    let s = 1;
    const sample = { p: [] as number[], b: [52.5, 34, 0] as [number, number, number], o: -1, c: 0 };

    const resize = () => {
      const box = boxRef.current!;
      const w = box.clientWidth;
      const h = Math.min(maxHeight, (w * L) / W);
      s = Math.min(w / W, h / L);
      cssW = Math.round(W * s);
      cssH = Math.round(L * s);
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(boxRef.current!);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const st = useMatch.getState();
      const init = st.init;
      if (!init) return;
      const you = init.you;
      const homeRight = st.pub?.homeAttacksRight ?? true;
      // +1: my team attacks towards x = 105, which we draw at the top.
      const myDirUp = (you === 0) === homeRight;
      const X = (x: number, y: number) => (myDirUp ? y : W - y) * s;
      const Y = (x: number) => (myDirUp ? L - x : x) * s;

      // Pitch
      const bands = 12;
      for (let i = 0; i < bands; i++) {
        ctx.fillStyle = i % 2 ? '#2f7d45' : '#2a733f';
        ctx.fillRect(0, (i * cssH) / bands, cssW, cssH / bands + 1);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = Math.max(1, s * 0.18);
      const m = 0.6 * s;
      ctx.strokeRect(m, m, cssW - 2 * m, cssH - 2 * m);
      ctx.beginPath();
      ctx.moveTo(m, cssH / 2);
      ctx.lineTo(cssW - m, cssH / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cssW / 2, cssH / 2, 9.15 * s, 0, Math.PI * 2);
      ctx.stroke();
      for (const top of [true, false]) {
        const y0 = top ? m : cssH - m;
        const dir = top ? 1 : -1;
        ctx.strokeRect(cssW / 2 - 20.16 * s, y0, 40.32 * s, dir * 16.5 * s);
        ctx.strokeRect(cssW / 2 - 9.16 * s, y0, 18.32 * s, dir * 5.5 * s);
        ctx.beginPath();
        ctx.arc(cssW / 2, y0 + dir * 11 * s, 9.15 * s, top ? 0.2 * Math.PI : 1.2 * Math.PI, top ? 0.8 * Math.PI : 1.8 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(cssW / 2, y0 + dir * 11 * s, Math.max(1.2, 0.25 * s), 0, Math.PI * 2);
        ctx.fill();
        // goal
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(cssW / 2 - 3.66 * s, top ? 0 : cssH - m, 7.32 * s, m);
      }

      if (!frameBuffer.sample(sample)) return;
      const roster = st.roster;
      const r = Math.max(7, 1.3 * s);
      ctx.font = `800 ${Math.round(r * 1.05)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 22; i++) {
        const x = sample.p[i * 2]!;
        const y = sample.p[i * 2 + 1]!;
        if (x === undefined || x < 0) continue;
        const side = i < 11 ? 0 : 1;
        const isGk = roster[i]?.isGk ?? false;
        const kit: Kit = isGk ? init.teams[side].gkKit : init.teams[side].kit;
        const px = X(x, y);
        const py = Y(x);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = kit.shirt;
        ctx.fill();
        if (kit.pattern !== 'plain') {
          ctx.save();
          ctx.clip();
          ctx.fillStyle = kit.trim;
          if (kit.pattern === 'stripes') for (let k = -1; k <= 1; k += 2) ctx.fillRect(px + k * r * 0.45 - r * 0.15, py - r, r * 0.3, 2 * r);
          else if (kit.pattern === 'hoops') ctx.fillRect(px - r, py - r * 0.2, 2 * r, r * 0.4);
          else if (kit.pattern === 'halves') ctx.fillRect(px, py - r, r, 2 * r);
          else if (kit.pattern === 'sash') {
            ctx.beginPath();
            ctx.moveTo(px - r, py - r * 0.6);
            ctx.lineTo(px - r * 0.4, py - r);
            ctx.lineTo(px + r, py + r * 0.6);
            ctx.lineTo(px + r * 0.4, py + r);
            ctx.fill();
          }
          ctx.restore();
        }
        ctx.lineWidth = i === sample.o ? 2.5 : 1.2;
        ctx.strokeStyle = i === sample.o ? '#f5c542' : side === you ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = kit.number;
        ctx.fillText(String(roster[i]?.number ?? ''), px, py + 0.5);
      }
      // Ball (shadow on the ground, ball lifted by height)
      const [bx, by, bz] = sample.b;
      const gx = X(bx, by);
      const gy = Y(bx);
      const br = Math.max(3.2, 0.42 * s) * (1 + bz * 0.08);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(gx + bz * 0.25 * s, gy + bz * 0.15 * s, br, br * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gx, gy - bz * 0.55 * s, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Name of the player on the ball
      if (sample.o >= 0) {
        const name = roster[sample.o]?.name;
        if (name) {
          const x = sample.p[sample.o * 2]!;
          const y = sample.p[sample.o * 2 + 1]!;
          ctx.font = `700 ${Math.max(10, Math.round(r * 0.95))}px system-ui, sans-serif`;
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(0,0,0,0.7)';
          ctx.strokeText(name, X(x, y), Y(x) + r + 9);
          ctx.fillStyle = '#fff';
          ctx.fillText(name, X(x, y), Y(x) + r + 9);
          ctx.font = `800 ${Math.round(r * 1.05)}px system-ui, sans-serif`;
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [maxHeight]);

  return (
    <div ref={boxRef} className="pitch-box" style={{ width: '100%' }}>
      <canvas ref={ref} aria-label="Live match view" role="img" />
    </div>
  );
}
