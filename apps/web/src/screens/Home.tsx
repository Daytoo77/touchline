import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { RoomClient, loadSession, serverUrl } from '../net/online';
import { matchListener, useMatch } from '../matchStore';

export function Home() {
  const { set, go, matchSeconds } = useApp();
  const [name, setName] = useState(() => loadSession()?.name ?? '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const resumable = loadSession();

  // Wake the (free-tier) server early so it's warm by kickoff.
  useEffect(() => {
    fetch(`${serverUrl()}/health`, { mode: 'cors' }).catch(() => {});
  }, []);

  const playLocal = () => {
    set({ mode: 'local', pickFor: 'me', myClubId: null, oppClubId: null, sheet: null });
    go('pick');
  };

  const online = async (kind: 'create' | 'join' | 'resume') => {
    setErr('');
    const n = name.trim() || 'Manager';
    if (kind === 'join' && code.trim().length !== 4) return setErr('Enter the 4-letter room code.');
    setBusy(true);
    useMatch.getState().reset();
    const client = new RoomClient({
      ...matchListener,
      room: (v) => {
        useApp.getState().set({ room: v });
        const st = useApp.getState();
        if (v.phase === 'match' && st.screen !== 'match') {
          st.set({ conn: client.matchConnection() });
          st.go('match');
        }
      },
      closed: (r) => {
        useMatch.getState().toast(`Room closed: ${r}`, 'bad');
        useApp.getState().set({ room: null, client: null });
        useApp.getState().go('home');
      },
      status: (s) => useApp.getState().set({ netStatus: s }),
    });
    const ack =
      kind === 'create' ? await client.create(n) : kind === 'join' ? await client.join(code.trim(), n) : await client.join(resumable!.code, resumable!.name, resumable!.token);
    setBusy(false);
    if (!ack.ok) {
      client.close();
      return setErr(ack.error);
    }
    set({ mode: 'online', client, myClubId: null, sheet: null });
    go('online');
  };

  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <div className="stack" style={{ alignItems: 'center', textAlign: 'center', margin: '12px 0 8px' }}>
        <div className="brand">
          Touch<span>line</span>
        </div>
        <div className="muted">One final. Two managers. Tactics only.</div>
      </div>

      <div className="card stack">
        <button className="btn primary block" onClick={playLocal}>
          ▶ Play vs AI (this phone)
        </button>
        <div className="row small muted">
          <span>Match length</span>
          <div className="seg grow">
            {[300, 600, 900].map((s) => (
              <button key={s} className={matchSeconds === s ? 'on' : ''} onClick={() => set({ matchSeconds: s })}>
                {s / 60} min
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card stack">
        <div className="field">
          <label htmlFor="mgr">Your name</label>
          <input id="mgr" className="input" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="Manager" autoComplete="nickname" />
        </div>
        <button className="btn block" disabled={busy} onClick={() => online('create')}>
          Create online room
        </button>
        <div className="row">
          <input
            className="input code grow"
            aria-label="Room code"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            placeholder="CODE"
          />
          <button className="btn" disabled={busy} onClick={() => online('join')}>
            Join
          </button>
        </div>
        {resumable && (
          <button className="btn small" disabled={busy} onClick={() => online('resume')}>
            Rejoin room {resumable.code}
          </button>
        )}
        {err && <div className="issue error small">{err}</div>}
      </div>
      <p className="muted small" style={{ textAlign: 'center' }}>
        Clubs are the 2026-27 European league-phase sides. Ratings are our own estimates; no crests or logos.
      </p>
    </div>
  );
}
