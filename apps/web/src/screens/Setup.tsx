import { useMemo, useState } from 'react';
import { validateSheet, type TeamSheet } from '@touchline/shared';
import { autoSheet } from '@touchline/engine';
import { getClub } from '../lib/clubs';
import { applyMove, changeFormation, fixSetPieces, toggleBench } from '../lib/sheet';
import { DragGhost, LineupBoard, SquadRow, useMoveGestures } from '../components/LineupBoard';
import { FormationSelect, InstructionsPanel, RolesPanel, SetPiecesPanel } from '../components/TacticPanels';
import { useApp } from '../store';
import { useMatch, matchListener } from '../matchStore';
import { startLocalMatch } from '../net/local';

type Tab = 'lineup' | 'roles' | 'instructions' | 'setpieces';

export function Setup() {
  const app = useApp();
  const club = getClub(app.myClubId!)!;
  const sheet = app.sheet!;
  const [tab, setTab] = useState<Tab>('lineup');
  const [submitting, setSubmitting] = useState(false);
  const setSheet = (s: TeamSheet) => app.set({ sheet: fixSetPieces(s, club) });
  const g = useMoveGestures((a, b) => setSheet(applyMove(useApp.getState().sheet!, club, a, b)));
  const issues = useMemo(() => validateSheet(club, sheet), [club, sheet]);
  const errors = issues.filter((i) => i.level === 'error');
  const inXi = new Set(sheet.tactic.slots.map((s) => s.playerId));
  const reserves = club.players.filter((p) => !inXi.has(p.id) && !sheet.bench.includes(p.id));
  const opp = app.mode === 'local' ? getClub(app.oppClubId!) : app.room ? getClub(app.room.seats[1 - app.room.you]!.clubId ?? '') : undefined;
  const mySeat = app.room?.seats[app.room.you];

  const kickOff = async () => {
    if (errors.length) return;
    if (app.mode === 'local') {
      const oppClub = getClub(app.oppClubId!)!;
      useMatch.getState().reset();
      const conn = startLocalMatch({ club, sheet }, { club: oppClub, sheet: autoSheet(oppClub) }, matchListener, {
        seed: (Math.random() * 2 ** 32) >>> 0,
        targetSeconds: app.matchSeconds,
      });
      app.set({ conn });
      app.go('match');
    } else {
      setSubmitting(true);
      const r = await app.client!.submitSheet(sheet);
      if (r.ok) await app.client!.setReady(true);
      setSubmitting(false);
      if (!r.ok) useMatch.getState().toast(r.error, 'bad');
      else app.go('online');
    }
  };

  return (
    <div className="screen" style={{ paddingBottom: 0 }}>
      <div className="topbar">
        <button className="icon-btn" aria-label="Back" onClick={() => (app.mode === 'local' ? app.set({ screen: 'pick', pickFor: 'opponent' }) : app.go('online'))}>
          ←
        </button>
        <h2>{club.name}</h2>
        {opp && <span className="muted small">vs {opp.shortName}</span>}
      </div>
      <div className="tabs" role="tablist">
        {(
          [
            ['lineup', 'Lineup'],
            ['roles', 'Roles'],
            ['instructions', 'Instructions'],
            ['setpieces', 'Set pieces'],
          ] as [Tab, string][]
        ).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'lineup' && (
        <div className="stack">
          <div className="row">
            <div className="grow">
              <FormationSelect value={sheet.tactic.formation} onChange={(f) => setSheet({ ...sheet, tactic: changeFormation(sheet.tactic, club.players, f) })} />
            </div>
            <button className="btn small" onClick={() => setSheet(autoSheet(club, sheet.tactic.formation, sheet.tactic.instructions))}>
              Auto-pick
            </button>
          </div>
          <LineupBoard club={club} tactic={sheet.tactic} kit={club.kits.home} gkKit={club.kits.gk} g={g} />
          <div className="muted small">Drag players between positions, or tap one player then another to swap. Ring colour = familiarity with the position.</div>
          <div className="pot-h">Bench ({sheet.bench.length}/12)</div>
          <div className="stack" style={{ gap: 4 }}>
            {sheet.bench.map((id) => (
              <SquadRow
                key={id}
                club={club}
                id={id}
                g={g}
                right={
                  <button className="icon-btn" aria-label="Remove from bench" onClick={() => setSheet(toggleBench(sheet, id))}>
                    −
                  </button>
                }
              />
            ))}
          </div>
          <div className="pot-h">Not in squad</div>
          <div className="stack" style={{ gap: 4 }}>
            {reserves.map((p) => (
              <SquadRow
                key={p.id}
                club={club}
                id={p.id}
                g={g}
                right={
                  <button className="icon-btn" aria-label="Add to bench" disabled={sheet.bench.length >= 12} onClick={() => setSheet(toggleBench(sheet, p.id))}>
                    +
                  </button>
                }
              />
            ))}
          </div>
        </div>
      )}
      {tab === 'roles' && <RolesPanel club={club} tactic={sheet.tactic} onChange={(t) => setSheet({ ...sheet, tactic: t })} />}
      {tab === 'instructions' && <InstructionsPanel value={sheet.tactic.instructions} onChange={(v) => setSheet({ ...sheet, tactic: { ...sheet.tactic, instructions: v } })} />}
      {tab === 'setpieces' && <SetPiecesPanel club={club} tactic={sheet.tactic} onChange={(t) => setSheet({ ...sheet, tactic: t })} />}

      <div className="sticky-foot stack">
        {issues.length > 0 && (
          <div className="issues">
            {issues.slice(0, 3).map((i, k) => (
              <div key={k} className={`issue ${i.level}`}>
                {i.level === 'error' ? '✗' : '!'} {i.message}
              </div>
            ))}
          </div>
        )}
        <button className="btn primary block" disabled={errors.length > 0 || submitting} onClick={kickOff}>
          {app.mode === 'local' ? 'Kick off ▶' : mySeat?.ready ? 'Update team sheet' : 'Submit team sheet & ready'}
        </button>
      </div>
      <DragGhost g={g} />
    </div>
  );
}
