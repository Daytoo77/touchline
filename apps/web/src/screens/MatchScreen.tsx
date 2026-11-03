import { useEffect, useState } from 'react';
import type { MatchCommand } from '@touchline/shared';
import { getClub } from '../lib/clubs';
import { useApp } from '../store';
import { useMatch } from '../matchStore';
import { PitchCanvas } from '../components/PitchCanvas';
import { BreakSheet, Feed, LiveTactics, Scorebar, ShootoutTally, ShoutsPanel, StatsPanel, SubsPanel } from '../components/MatchPanels';

type Tab = 'live' | 'stats' | 'tactics' | 'subs' | 'shouts';

export function MatchScreen() {
  const app = useApp();
  const init = useMatch((s) => s.init);
  const pub = useMatch((s) => s.pub);
  const pause = useMatch((s) => s.pause);
  const replay = useMatch((s) => s.replay);
  const goalAt = useMatch((s) => s.goalAt);
  const lines = useMatch((s) => s.lines);
  const [tab, setTab] = useState<Tab>('live');
  const [menu, setMenu] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pausedLocal, setPausedLocal] = useState(false);
  const [vh, setVh] = useState(() => window.innerHeight);
  const [, force] = useState(0);

  useEffect(() => {
    const onR = () => setVh(window.innerHeight);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  // Re-render the goal banner timer.
  useEffect(() => {
    if (!goalAt) return;
    const t = setTimeout(() => force((x) => x + 1), 1700);
    return () => clearTimeout(t);
  }, [goalAt]);

  if (!init) return <div className="screen muted">Connecting to the match…</div>;
  const club = getClub(init.teams[init.you].clubId)!;
  const conn = app.conn!;
  const send = (c: MatchCommand) => conn.send(c);
  const showGoal = goalAt && performance.now() - goalAt < 1600;
  const ended = pub?.phase === 'ended';

  return (
    <div className="match">
      <Scorebar onMenu={() => setMenu(true)} />
      <div style={{ position: 'relative' }}>
        <PitchCanvas maxHeight={Math.round(vh * 0.5)} />
        {showGoal ? <div className="banner">GOAL!</div> : null}
        {pub?.phase === 'shootout' && (
          <div style={{ position: 'absolute', left: 8, right: 8, bottom: 8 }}>
            <ShootoutTally />
          </div>
        )}
      </div>
      <div className="ticker">{lines[0] ? `${lines[0].minute} ${lines[0].text}` : 'Waiting for kick-off…'}</div>
      <div className="match-panel">
        <div className="tabs" role="tablist">
          {(
            [
              ['live', 'Live'],
              ['stats', 'Stats'],
              ['tactics', 'Tactics'],
              ['subs', 'Subs'],
              ['shouts', 'Shouts'],
            ] as [Tab, string][]
          ).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
        {tab === 'live' && <Feed limit={80} />}
        {tab === 'stats' && <StatsPanel />}
        {tab === 'tactics' && <LiveTactics club={club} send={send} />}
        {tab === 'subs' && <SubsPanel club={club} send={send} />}
        {tab === 'shouts' && <ShoutsPanel send={send} />}
        {ended && (
          <button className="btn primary block" onClick={() => app.go('fulltime')} disabled={!replay}>
            Full-time report →
          </button>
        )}
      </div>

      {!ended && (
        <BreakSheet
          club={club}
          send={send}
          onOpen={(t) => {
            setTab(t);
            window.scrollTo({ top: 0 });
          }}
        />
      )}

      {pause?.paused && conn.kind === 'online' && (
        <div className="overlay" style={{ alignItems: 'center' }}>
          <div className="card stack" style={{ maxWidth: 340, textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>Match paused</h3>
            <div className="muted">
              {pause.by === init.you ? 'You were disconnected.' : `Waiting for ${init.teams[pause.by ?? 0].shortName}'s manager to reconnect…`}
            </div>
            <div className="big-code" style={{ fontSize: '2rem', letterSpacing: 0 }}>
              {Math.ceil((pause.budgetMs[pause.by ?? 0] ?? 0) / 1000)}s
            </div>
            <div className="muted small">The match resumes automatically when they return or when their pause allowance runs out.</div>
          </div>
        </div>
      )}

      {menu && (
        <div className="overlay" onClick={() => setMenu(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>Match</h3>
            {conn.kind === 'local' && (
              <>
                <button
                  className="btn block"
                  onClick={() => {
                    conn.setPaused?.(!pausedLocal);
                    setPausedLocal(!pausedLocal);
                  }}
                >
                  {pausedLocal ? '▶ Resume' : '⏸ Pause'}
                </button>
                <div className="field">
                  <label>Speed</label>
                  <div className="seg">
                    {[1, 2, 4, 8].map((s) => (
                      <button
                        key={s}
                        className={speed === s ? 'on' : ''}
                        onClick={() => {
                          conn.setSpeed?.(s);
                          setSpeed(s);
                        }}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {conn.kind === 'online' && app.room && <div className="muted small">Room {app.room.code}. If your phone locks, the match pauses for up to two minutes while you reconnect.</div>}
            <button
              className="btn danger block"
              onClick={() => {
                if (!confirm('Leave this match?')) return;
                conn.close();
                if (conn.kind === 'online') {
                  app.client?.leave();
                  app.client?.close();
                }
                app.set({ conn: null, client: null, room: null });
                useMatch.getState().reset();
                app.go('home');
              }}
            >
              Leave match
            </button>
            <button className="btn block" onClick={() => setMenu(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
