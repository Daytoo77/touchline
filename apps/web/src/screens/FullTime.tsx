import { clockLabel } from '@touchline/commentary';
import { SHOUT_LABEL, TALK_LABEL, type LoggedCommand, type MatchEvent, type Period, type Side } from '@touchline/shared';
import { useApp } from '../store';
import { playerName, useMatch } from '../matchStore';
import { Scorebar, StatsPanel } from '../components/MatchPanels';

function minuteOf(tick: number): string {
  const sec = tick * 0.2;
  return `~${Math.floor(sec / 60) + 1}'`;
}

function describeCommand(c: LoggedCommand): string | null {
  const cmd = c.cmd;
  switch (cmd.type) {
    case 'tactic':
      return `Tactics: ${cmd.tactic.formation}, mentality ${cmd.tactic.instructions.mentality >= 0 ? '+' : ''}${cmd.tactic.instructions.mentality}, pressing ${cmd.tactic.instructions.pressing}, line ${cmd.tactic.instructions.line}`;
    case 'shout':
      return `Shout: ${SHOUT_LABEL[cmd.shout]}`;
    case 'sub':
      return `Sub: ${playerName(cmd.in)} for ${playerName(cmd.out)}`;
    case 'teamTalk':
      return `Team talk: ${TALK_LABEL[cmd.tone].split(':')[0]}`;
    case 'penaltyOrder':
      return `Penalty order: ${cmd.order.slice(0, 5).map(playerName).join(', ')}`;
    default:
      return null;
  }
}

export function FullTime() {
  const app = useApp();
  const init = useMatch((s) => s.init);
  const pub = useMatch((s) => s.pub);
  const replay = useMatch((s) => s.replay);
  const events = useMatch((s) => s.events);
  if (!init || !pub) return null;
  const goals = events.filter((e) => e.type === 'goal') as Extract<MatchEvent, { type: 'goal' }>[];
  const periodOf = (clock: number): Period => (clock < 2700 ? 1 : clock < 5400 ? 2 : clock < 6300 ? 3 : 4);
  const winner = pub.pens ? (pub.pens[0] > pub.pens[1] ? 0 : 1) : pub.score[0] > pub.score[1] ? 0 : 1;

  const download = () => {
    if (!replay) return;
    const blob = new Blob([JSON.stringify(replay, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `touchline-${init.teams[0].abbr}-${init.teams[1].abbr}-${replay.seed}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const again = async () => {
    if (app.mode === 'local') {
      useMatch.getState().reset();
      app.set({ conn: null });
      app.go('setup');
    } else {
      await app.client?.rematch();
      useMatch.getState().reset();
      app.go('online');
    }
  };

  return (
    <div className="screen" style={{ padding: 0 }}>
      <Scorebar />
      <div className="screen">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="muted small">Winner</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{init.teams[winner].name}</div>
          {pub.pens && (
            <div className="muted small">
              on penalties, {pub.pens[0]}–{pub.pens[1]}
            </div>
          )}
        </div>
        <div className="card stack">
          <strong>Goals</strong>
          {goals.length === 0 && <div className="muted small">No goals.</div>}
          {goals.map((g, i) => (
            <div key={i} className="row small">
              <span className="pill">{init.teams[g.team].abbr}</span>
              <span className="grow">
                {playerName(g.player)}
                {g.kind === 'penalty' ? ' (pen)' : ''}
                {g.assist ? <span className="muted"> · {playerName(g.assist)}</span> : null}
              </span>
              <span className="muted">{clockLabel(g.clock, periodOf(g.clock))}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <StatsPanel />
        </div>
        {replay && (
          <div className="card stack">
            <strong>Touchline decisions (now revealed)</strong>
            {([0, 1] as Side[]).map((side) => {
              const cmds = replay.commands.filter((c) => c.seat === side).map((c) => ({ c, t: describeCommand(c) })).filter((x) => x.t);
              return (
                <div key={side} className="stack" style={{ gap: 4 }}>
                  <div className="pot-h">{init.teams[side].name}</div>
                  {cmds.length === 0 && <div className="muted small">No changes.</div>}
                  {cmds.slice(0, 30).map(({ c, t }, i) => (
                    <div key={i} className="small row">
                      <span className="muted" style={{ width: 44 }}>
                        {minuteOf(c.tick)}
                      </span>
                      <span className="grow">{t}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
        <div className="stack">
          <button className="btn primary block" onClick={again}>
            {app.mode === 'local' ? 'Play again' : 'Rematch'}
          </button>
          <button className="btn block" onClick={download} disabled={!replay}>
            Download replay (seed + command log)
          </button>
          <button
            className="btn block"
            onClick={() => {
              app.conn?.close();
              if (app.mode === 'online') {
                app.client?.leave();
                app.client?.close();
              }
              useMatch.getState().reset();
              app.set({ conn: null, client: null, room: null });
              app.go('home');
            }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
