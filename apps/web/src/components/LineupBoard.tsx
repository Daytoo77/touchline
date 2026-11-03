import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { FORMATIONS, shortNameOf, textOn, type Club, type Kit, type Tactic } from '@touchline/shared';
import { bestAbility } from '@touchline/engine';
import { fitOf, parseRef, refKey, type Ref } from '../lib/sheet';

// ------------------------------------------------------------------ drag & drop / tap-to-move

export function useMoveGestures(onMove: (a: Ref, b: Ref) => void) {
  const [selected, setSelected] = useState<Ref | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; label: string } | null>(null);
  const st = useRef<{ ref: Ref; x: number; y: number; id: number; dragging: boolean; label: string } | null>(null);
  const live = useRef({ onMove, selected });
  live.current = { onMove, selected };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const s = st.current;
      if (!s || e.pointerId !== s.id) return;
      if (!s.dragging && Math.abs(e.clientX - s.x) + Math.abs(e.clientY - s.y) > 9) s.dragging = true;
      if (s.dragging) {
        setGhost({ x: e.clientX, y: e.clientY, label: s.label });
        if (e.cancelable) e.preventDefault();
      }
    };
    const up = (e: PointerEvent) => {
      const s = st.current;
      if (!s || e.pointerId !== s.id) return;
      st.current = null;
      setGhost(null);
      const { onMove: mv, selected: sel } = live.current;
      if (s.dragging) {
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop]');
        const target = parseRef(el?.getAttribute('data-drop'));
        if (target && refKey(target) !== refKey(s.ref)) mv(s.ref, target);
        setSelected(null);
        return;
      }
      if (!sel) setSelected(s.ref);
      else if (refKey(sel) === refKey(s.ref)) setSelected(null);
      else {
        mv(sel, s.ref);
        setSelected(null);
      }
    };
    const cancel = (e: PointerEvent) => {
      if (st.current && e.pointerId === st.current.id) {
        st.current = null;
        setGhost(null);
      }
    };
    const touchMove = (e: TouchEvent) => {
      if (st.current?.dragging && e.cancelable) e.preventDefault();
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('touchmove', touchMove, { passive: false });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('touchmove', touchMove);
    };
  }, []);

  const bind = (ref: Ref, label: string) => ({
    'data-drop': refKey(ref),
    onPointerDown: (e: RPointerEvent) => {
      if (e.button !== 0) return;
      st.current = { ref, x: e.clientX, y: e.clientY, id: e.pointerId, dragging: false, label };
    },
  });
  const isSel = (ref: Ref) => !!selected && refKey(selected) === refKey(ref);
  return { bind, ghost, selected, setSelected, isSel };
}

export type Gestures = ReturnType<typeof useMoveGestures>;

export function DragGhost({ g }: { g: Gestures }) {
  if (!g.ghost) return null;
  return (
    <div className="drag-ghost" style={{ left: g.ghost.x, top: g.ghost.y }}>
      {g.ghost.label}
    </div>
  );
}

// ------------------------------------------------------------------ pitch board

const H = 78; // visible depth in metres (own goal line at the bottom)

export interface SlotMeta {
  cond?: number;
  yellow?: boolean;
  pending?: boolean;
}

export function LineupBoard(props: { club: Club; tactic: Tactic; kit: Kit; gkKit: Kit; g: Gestures; meta?: (id: string) => SlotMeta | undefined }) {
  const { club, tactic, kit, gkKit, g, meta } = props;
  const f = FORMATIONS[tactic.formation];
  const byId = new Map(club.players.map((p) => [p.id, p]));
  return (
    <div className="board-wrap">
      <svg viewBox={`0 0 68 ${H}`} role="img" aria-label="Formation board">
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="0" y={i * (H / 8)} width="68" height={H / 8} fill={i % 2 ? 'var(--pitch-a)' : 'var(--pitch-b)'} />
        ))}
        <g fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="0.35">
          <rect x="0.4" y="-1" width="67.2" height={H + 0.6} />
          <line x1="0" y1={H - 52.5} x2="68" y2={H - 52.5} />
          <circle cx="34" cy={H - 52.5} r="9.15" />
          <rect x={34 - 20.16} y={H - 16.5} width="40.32" height="16.5" />
          <rect x={34 - 9.16} y={H - 5.5} width="18.32" height="5.5" />
          <path d={`M ${34 - 7.3} ${H - 16.5} A 9.15 9.15 0 0 1 ${34 + 7.3} ${H - 16.5}`} />
        </g>
        {f.slots.map((slot, i) => {
          const pid = tactic.slots[i]!.playerId;
          const p = pid ? byId.get(pid) : undefined;
          const x = slot.v;
          const y = H - slot.u;
          const fit = fitOf(club, pid, tactic.formation, i);
          const ring = !p ? 'rgba(255,255,255,.4)' : fit >= 0.95 ? 'var(--good)' : fit >= 0.8 ? 'var(--warn)' : 'var(--bad)';
          const k = i === 0 ? gkKit : kit;
          const ref: Ref = { kind: 'slot', i };
          const m = pid ? meta?.(pid) : undefined;
          return (
            <g key={i} className={`chip ${g.isSel(ref) ? 'sel' : ''}`} transform={`translate(${x} ${y})`} {...g.bind(ref, p ? shortNameOf(p) : slot.pos)} style={{ touchAction: 'none' }}>
              <circle r="5.2" fill="transparent" />
              <circle className="ring" r="3.6" fill={p ? k.shirt : 'rgba(0,0,0,.25)'} stroke={g.isSel(ref) ? 'var(--accent)' : ring} strokeWidth={g.isSel(ref) ? 0.9 : 0.6} strokeDasharray={p ? undefined : '1 0.8'} />
              <text y="1.2" textAnchor="middle" fontSize="3" fontWeight="800" fill={p ? textOn(k.shirt) : '#fff'}>
                {p ? p.number : '+'}
              </text>
              <text y="6.6" textAnchor="middle" fontSize="2.3" fontWeight="700" fill="#fff" stroke="rgba(0,0,0,.55)" strokeWidth="0.5" paintOrder="stroke">
                {p ? shortNameOf(p) : 'empty'}
              </text>
              <text y="-4.6" textAnchor="middle" fontSize="1.8" fill="rgba(255,255,255,.85)">
                {slot.pos}
              </text>
              {m?.cond !== undefined && (
                <rect x="-3.5" y="7.6" width={7 * Math.max(0, Math.min(1, m.cond))} height="0.8" fill={m.cond > 0.75 ? 'var(--good)' : m.cond > 0.6 ? 'var(--warn)' : 'var(--bad)'} />
              )}
              {m?.yellow && <rect x="2.6" y="-4" width="1.6" height="2.2" fill="#facc15" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ------------------------------------------------------------------ squad list

export function SquadRow(props: { club: Club; id: string; g: Gestures; right?: React.ReactNode; meta?: SlotMeta; note?: string }) {
  const p = props.club.players.find((q) => q.id === props.id);
  if (!p) return null;
  const ref: Ref = { kind: 'player', id: p.id };
  const b = props.g.bind(ref, shortNameOf(p));
  return (
    <div className={`squad-row ${props.g.isSel(ref) ? 'sel' : ''}`} data-drop={b['data-drop']} onPointerDown={b.onPointerDown} style={{ touchAction: 'pan-y' }}>
      <span aria-hidden="true" style={{ touchAction: 'none', padding: '8px 2px', color: 'var(--faint)', cursor: 'grab' }} onPointerDown={b.onPointerDown}>
        ⋮⋮
      </span>
      <span className="num">{p.number}</span>
      <span className="name">
        {p.name}
        {p.flag && (
          <span className="pill flag" title={p.flag} style={{ marginLeft: 6 }}>
            ?
          </span>
        )}
        {props.note && <span className="muted small"> · {props.note}</span>}
      </span>
      <span className="pill">{p.positions.slice(0, 2).join(' ')}</span>
      {props.meta?.cond !== undefined && (
        <div className="cond" title={`Condition ${Math.round(props.meta.cond * 100)}%`}>
          <div style={{ width: `${props.meta.cond * 100}%`, background: props.meta.cond > 0.75 ? 'var(--good)' : props.meta.cond > 0.6 ? 'var(--warn)' : 'var(--bad)' }} />
        </div>
      )}
      <span className="rating">{bestAbility(p).toFixed(1)}</span>
      {props.right}
    </div>
  );
}
