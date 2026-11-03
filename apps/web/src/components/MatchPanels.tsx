import { useMemo, useState } from 'react';
import { clockLabel } from '@touchline/commentary';
import { SHOUTS, SHOUT_HINT, SHOUT_LABEL, TALK_LABEL, TALK_TONES, colourDistance, type Club, type Kit, type MatchCommand, type Side, type Tactic, type TeamStats } from '@touchline/shared';
import { playerName, useMatch } from '../matchStore';
import { KitSwatch } from './Kit';
import { DragGhost, LineupBoard, SquadRow, useMoveGestures } from './LineupBoard';
import { FormationSelect, InstructionsPanel, RolesPanel, SetPiecesPanel } from './TacticPanels';
import { applyMove, changeFormation } from '../lib/sheet';

export function Scorebar({ onMenu }: { onMenu?: () => void }) {
  const init = useMatch((s) => s.init);
  const pub = useMatch((s) => s.pub);
  if (!init) return null;
  const score = pub?.score ?? [0, 0];
  const t = init.teams;
  const clock = pub ? (pub.phase === 'break' ? (pub.breakKind === 'halfTime' ? 'HT' : pub.breakKind === 'preExtraTime' ? 'FT · ET next' : 'Penalties') : pub.phase === 'ended' ? 'FT' : clockLabel(pub.clock, pub.period)) : '';
  return (
    <div className="scorebar">
      <div className="team">
        <KitSwatch kit={t[0].kit} size={18} />
        <span>{t[0].abbr}</span>
        {init.you === 0 && <span className="pill">you</span>}
      </div>
      <div>
        <div className="score">
          {score[0]}–{score[1]}
        </div>
        <div className="clock">
          {clock}
          {pub?.pens ? ` (${pub.pens[0]}–${pub.pens[1]} p)` : ''}
          {pub && pub.stoppageMinutes > 0 && pub.phase === 'play' && pub.period < 5 ? ` · +${pub.stoppageMinutes}` : ''}
        </div>
      </div>
      <div className="team away">
        {init.you === 1 && <span className="pill">you</span>}
        <span>{t[1].abbr}</span>
        <KitSwatch kit={t[1].kit} size={18} />
        {onMenu && (
          <button className="icon-btn" aria-label="Match menu" onClick={onMenu} style={{ minWidth: 32 }}>
            ⋯
          </button>
        )}
      </div>
    </div>
  );
}

export function Feed({ limit }: { limit?: number }) {
  const lines = useMatch((s) => s.lines);
  const shown = limit ? lines.slice(0, limit) : lines;
  return (
    <div className="feed" aria-live="polite">
      {shown.length === 0 && <div className="muted small">Kick-off is moments away…</div>}
      {shown.map((l, i) => (
        <div key={i} className={`line ${l.tone}`}>
          <span className="min">{l.minute}</span>
          <span>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

/** A team colour that stays visible on the dark UI. */
function uiColour(k: Kit): string {
  const bg = '#0f2418';
  if (colourDistance(k.shirt, bg) > 30) return k.shirt;
  if (colourDistance(k.trim, bg) > 30) return k.trim;
  return '#cbd5e1';
}

function StatRow({ label, a, b, fmt = (v: number) => String(v), colors }: { label: string; a: number; b: number; fmt?: (v: number) => string; colors: [string, string] }) {
  const tot = a + b || 1;
  return (
    <div>
      <div className="stat lbl" style={{ display: 'block' }}>
        {label}
      </div>
      <div className="stat">
        <span>{fmt(a)}</span>
        <div className="bar">
          <div style={{ width: `${(100 * a) / tot}%`, background: colors[0] }} />
          <div style={{ width: `${(100 * b) / tot}%`, background: colors[1] }} />
        </div>
        <span style={{ textAlign: 'right' }}>{fmt(b)}</span>
      </div>
    </div>
  );
}

export function StatsPanel() {
  const pub = useMatch((s) => s.pub);
  const init = useMatch((s) => s.init);
  if (!pub || !init) return null;
  const [a, b] = pub.stats as [TeamStats, TeamStats];
  const colors: [string, string] = [uiColour(init.teams[0].kit), uiColour(init.teams[1].kit)];
  const poss = a.possessionTicks + b.possessionTicks || 1;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <StatRow label="Possession" a={Math.round((100 * a.possessionTicks) / poss)} b={Math.round((100 * b.possessionTicks) / poss)} fmt={(v) => `${v}%`} colors={colors} />
      <StatRow label="Shots" a={a.shots} b={b.shots} colors={colors} />
      <StatRow label="On target" a={a.onTarget} b={b.onTarget} colors={colors} />
      <StatRow label="Expected goals (xG)" a={a.xg} b={b.xg} fmt={(v) => v.toFixed(2)} colors={colors} />
      <StatRow label="Passes completed" a={a.passesCompleted} b={b.passesCompleted} colors={colors} />
      <StatRow label="Corners" a={a.corners} b={b.corners} colors={colors} />
      <StatRow label="Fouls" a={a.fouls} b={b.fouls} colors={colors} />
      <StatRow label="Offsides" a={a.offsides} b={b.offsides} colors={colors} />
      <StatRow label="Yellow cards" a={a.yellows} b={b.yellows} colors={colors} />
      <StatRow label="Red cards" a={a.reds} b={b.reds} colors={colors} />
    </div>
  );
}

export function ShoutsPanel({ send }: { send(c: MatchCommand): Promise<unknown> }) {
  const priv = useMatch((s) => s.priv);
  const pub = useMatch((s) => s.pub);
  const cooling = !!priv && !!pub && pub.tick < priv.shoutCooldownUntil;
  const left = cooling && priv && pub ? Math.ceil(((priv.shoutCooldownUntil - pub.tick) * 0.2) / 60) : 0;
  return (
    <div className="stack">
      <div className="muted small">
        {priv?.activeShout ? `Active: ${SHOUT_LABEL[priv.activeShout as keyof typeof SHOUT_LABEL]}. ` : ''}
        {cooling ? `Players are still taking in the last shout (~${left} match min).` : 'Shouts last about 10 match minutes. Your opponent only sees that you changed something.'}
      </div>
      <div className="shout-grid">
        {SHOUTS.map((s) => (
          <button key={s} className="btn" disabled={cooling || pub?.phase !== 'play'} onClick={() => send({ type: 'shout', shout: s })}>
            <strong>{SHOUT_LABEL[s]}</strong>
            <span className="muted small" style={{ fontWeight: 400 }}>
              {SHOUT_HINT[s]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Live tactic editor: same panels as pre-match, but only the players on the pitch can be moved. */
export function LiveTactics({ club, send }: { club: Club; send(c: MatchCommand): Promise<{ ok: boolean; error?: string }> }) {
  const priv = useMatch((s) => s.priv);
  const init = useMatch((s) => s.init);
  const [draft, setDraft] = useState<Tactic | null>(null);
  const [sub, setSub] = useState<'board' | 'roles' | 'instructions' | 'setpieces'>('board');
  const base = priv?.tactic ?? null;
  const tactic = draft ?? base;
  const g = useMoveGestures((a, b) => {
    if (a.kind !== 'slot' || b.kind !== 'slot' || !tactic) return;
    const fake = { clubId: club.id, tactic, bench: [] };
    setDraft(applyMove(fake, club, a, b).tactic);
  });
  if (!tactic || !priv || !init) return null;
  const meta = (id: string) => {
    const p = priv.players.find((x) => x.id === id);
    return p ? { cond: p.condition, yellow: p.yellow } : undefined;
  };
  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(base);
  const apply = async () => {
    if (!draft) return;
    const r = await send({ type: 'tactic', tactic: draft });
    if (r.ok) setDraft(null);
    else useMatch.getState().toast(r.error ?? 'Rejected', 'bad');
  };
  return (
    <div className="stack">
      <div className="tabs">
        {(
          [
            ['board', 'Shape'],
            ['roles', 'Roles'],
            ['instructions', 'Instructions'],
            ['setpieces', 'Set pieces'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} className={sub === k ? 'on' : ''} onClick={() => setSub(k)}>
            {l}
          </button>
        ))}
      </div>
      {sub === 'board' && (
        <>
          <FormationSelect value={tactic.formation} onChange={(f) => setDraft(changeFormation(tactic, club.players.filter((p) => tactic.slots.some((s) => s.playerId === p.id)), f))} />
          <LineupBoard club={club} tactic={tactic} kit={init.teams[init.you].kit} gkKit={init.teams[init.you].gkKit} g={g} meta={meta} />
          <div className="muted small">Swap positions by dragging or tapping two players. Use the Subs tab to bring players on.</div>
        </>
      )}
      {sub === 'roles' && <RolesPanel club={club} tactic={tactic} onChange={setDraft} />}
      {sub === 'instructions' && <InstructionsPanel value={tactic.instructions} onChange={(v) => setDraft({ ...tactic, instructions: v })} />}
      {sub === 'setpieces' && <SetPiecesPanel club={club} tactic={tactic} onChange={setDraft} />}
      <div className="row sticky-foot">
        <button className="btn grow" disabled={!dirty} onClick={() => setDraft(null)}>
          Discard
        </button>
        <button className="btn primary grow" disabled={!dirty} onClick={apply}>
          Apply changes
        </button>
      </div>
      <DragGhost g={g} />
    </div>
  );
}

export function SubsPanel({ club, send }: { club: Club; send(c: MatchCommand): Promise<{ ok: boolean; error?: string }> }) {
  const priv = useMatch((s) => s.priv);
  const pub = useMatch((s) => s.pub);
  const [out, setOut] = useState<string | null>(null);
  const noop = useMoveGestures(() => {});
  const onPitch = useMemo(() => (priv ? priv.players.filter((p) => p.onPitch) : []), [priv]);
  if (!priv) return null;
  const bench = priv.bench.filter((id) => !priv.subbedOff.includes(id));
  const pendingOut = new Set(priv.pendingSubs.map((p) => p.out));
  const pendingIn = new Set(priv.pendingSubs.map((p) => p.in));
  const left = priv.subsAllowed - priv.subsUsed - priv.pendingSubs.length;
  const windows = priv.windowsAllowed - priv.windowsUsed;
  const inBreak = pub?.phase === 'break';
  const doSub = async (inId: string) => {
    if (!out) return;
    const r = await send({ type: 'sub', out, in: inId });
    if (!r.ok) useMatch.getState().toast(r.error ?? 'Rejected', 'bad');
    setOut(null);
  };
  return (
    <div className="stack">
      <div className="card small" style={{ padding: 10 }}>
        <strong>{left}</strong> of {priv.subsAllowed} subs left · <strong>{windows}</strong> of {priv.windowsAllowed} windows left
        <div className="muted">{inBreak ? 'Changes made during the break are immediate and do not use a window.' : 'Subs happen at the next stoppage. Several subs at once use one window.'}</div>
      </div>
      {priv.pendingSubs.length > 0 && (
        <div className="stack" style={{ gap: 4 }}>
          <div className="pot-h">Waiting for a stoppage</div>
          {priv.pendingSubs.map((p) => (
            <div key={p.out} className="row card" style={{ padding: 8 }}>
              <span className="grow small">
                {playerName(p.in)} ↔ {playerName(p.out)}
              </span>
              <button className="btn small" onClick={() => send({ type: 'cancelSub', out: p.out })}>
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="pot-h">{out ? `Who replaces ${playerName(out)}?` : '1 · Choose who comes off'}</div>
      {!out && (
        <div className="stack" style={{ gap: 4 }}>
          {onPitch.map((p) => (
            <div key={p.id} onClick={() => !pendingOut.has(p.id) && left > 0 && setOut(p.id)} style={{ opacity: pendingOut.has(p.id) ? 0.4 : 1 }}>
              <SquadRow club={club} id={p.id} g={noop} meta={{ cond: p.condition }} note={`${p.rating.toFixed(1)}${p.yellow ? ' · 🟨' : ''}`} />
            </div>
          ))}
        </div>
      )}
      {out && (
        <div className="stack" style={{ gap: 4 }}>
          {bench.map((id) => (
            <div key={id} onClick={() => !pendingIn.has(id) && doSub(id)} style={{ opacity: pendingIn.has(id) ? 0.4 : 1 }}>
              <SquadRow club={club} id={id} g={noop} />
            </div>
          ))}
          <button className="btn" onClick={() => setOut(null)}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}

export function BreakSheet({ club, send, onOpen }: { club: Club; send(c: MatchCommand): Promise<{ ok: boolean; error?: string }>; onOpen(tab: 'tactics' | 'subs'): void }) {
  const pub = useMatch((s) => s.pub);
  const priv = useMatch((s) => s.priv);
  const init = useMatch((s) => s.init);
  const [tone, setTone] = useState<string | null>(null);
  if (!pub || pub.phase !== 'break' || !priv || !init) return null;
  const you = init.you;
  const kind = pub.breakKind;
  const secs = Math.ceil((pub.breakRemainingMs ?? 0) / 1000);
  const ready = pub.ready[you];
  const oppReady = pub.ready[(1 - you) as Side];
  if (kind === 'preShootout') return <ShootoutSheet club={club} send={send} />;
  return (
    <div className="overlay">
      <div className="sheet">
        <div className="row">
          <h2 className="grow" style={{ margin: 0 }}>
            {kind === 'halfTime' ? 'Half-time' : 'Before extra time'}
          </h2>
          <span className="pill">{secs > 0 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : '…'}</span>
        </div>
        <div className="muted small">
          {pub.score[0]}–{pub.score[1]} · {oppReady ? 'Your opponent is ready.' : 'Your opponent is in the dressing room.'}
        </div>
        <div className="pot-h">Team talk</div>
        {priv.teamTalkGiven ? (
          <div className="card small">{tone ? `You chose: ${TALK_LABEL[tone as keyof typeof TALK_LABEL]}` : 'Team talk given.'} Check the commentary for their reaction.</div>
        ) : (
          <div className="stack" style={{ gap: 6 }}>
            {TALK_TONES.map((t) => (
              <button
                key={t}
                className="btn"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={async () => {
                  setTone(t);
                  await send({ type: 'teamTalk', tone: t });
                }}
              >
                {TALK_LABEL[t]}
              </button>
            ))}
          </div>
        )}
        <div className="row">
          <button className="btn grow" onClick={() => onOpen('subs')}>
            Substitutions
          </button>
          <button className="btn grow" onClick={() => onOpen('tactics')}>
            Tactics
          </button>
        </div>
        <button className="btn primary block" disabled={ready} onClick={() => send({ type: 'ready' })}>
          {ready ? 'Waiting for the other manager…' : 'Ready for the restart'}
        </button>
        <div className="muted small">Subs made now are immediate and don’t use one of your windows.</div>
      </div>
    </div>
  );
}

function ShootoutSheet({ club, send }: { club: Club; send(c: MatchCommand): Promise<{ ok: boolean; error?: string }> }) {
  const pub = useMatch((s) => s.pub);
  const priv = useMatch((s) => s.priv);
  const init = useMatch((s) => s.init);
  const onPitch = priv ? priv.players.filter((p) => p.onPitch).map((p) => p.id) : [];
  const [order, setOrder] = useState<string[]>(() => {
    const pen = (id: string) => {
      const p = club.players.find((q) => q.id === id);
      return p ? p.technical.penalties * 0.6 + p.mental.composure * 0.4 - (p.positions[0] === 'GK' ? 8 : 0) : 0;
    };
    return [...onPitch].sort((a, b) => pen(b) - pen(a));
  });
  if (!pub || !priv || !init) return null;
  const secs = Math.ceil((pub.breakRemainingMs ?? 0) / 1000);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const o = [...order];
    [o[i], o[j]] = [o[j]!, o[i]!];
    setOrder(o);
  };
  return (
    <div className="overlay">
      <div className="sheet">
        <div className="row">
          <h2 className="grow" style={{ margin: 0 }}>
            Penalty shootout
          </h2>
          <span className="pill">{secs}s</span>
        </div>
        <div className="muted small">Set your kicking order. The first five take the regulation kicks.</div>
        <div className="stack" style={{ gap: 4 }}>
          {order.map((id, i) => {
            const p = club.players.find((q) => q.id === id)!;
            return (
              <div key={id} className="row card" style={{ padding: 6 }}>
                <span className="pill">{i + 1}</span>
                <span className="grow small">
                  {p.name} <span className="muted">pen {p.technical.penalties} · comp {p.mental.composure}</span>
                </span>
                <button className="icon-btn" aria-label="Move up" onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button className="icon-btn" aria-label="Move down" onClick={() => move(i, 1)}>
                  ↓
                </button>
              </div>
            );
          })}
        </div>
        <button
          className="btn primary block"
          disabled={pub.ready[init.you]}
          onClick={async () => {
            await send({ type: 'penaltyOrder', order });
            await send({ type: 'ready' });
          }}
        >
          {pub.ready[init.you] ? 'Waiting for the other manager…' : 'Confirm order'}
        </button>
      </div>
    </div>
  );
}

export function ShootoutTally() {
  const events = useMatch((s) => s.events);
  const init = useMatch((s) => s.init);
  const kicks = events.filter((e) => e.type === 'shootoutKick') as Extract<(typeof events)[number], { type: 'shootoutKick' }>[];
  if (!kicks.length || !init) return null;
  return (
    <div className="card stack" style={{ padding: 10, gap: 6 }}>
      {[0, 1].map((side) => (
        <div key={side} className="row">
          <span style={{ width: 44, fontWeight: 700 }}>{init.teams[side as Side].abbr}</span>
          <div className="tally">
            {kicks
              .filter((k) => k.team === side)
              .map((k, i) => (
                <span key={i} className={k.scored ? 'g' : 'm'} title={playerName(k.player)} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
