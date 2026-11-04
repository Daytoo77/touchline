import { getClub } from '../lib/clubs';
import { KitSwatch } from '../components/Kit';
import { useApp } from '../store';
import { useMatch } from '../matchStore';

export function OnlineLobby() {
  const app = useApp();
  const room = app.room;
  if (!room) {
    return (
      <div className="screen">
        <div className="muted">Connecting to the room…</div>
      </div>
    );
  }
  const me = room.seats[room.you];
  const them = room.seats[1 - room.you]!;
  const myClub = me.clubId ? getClub(me.clubId) : undefined;
  const theirClub = them.clubId ? getClub(them.clubId) : undefined;

  const leave = () => {
    app.client?.leave();
    app.client?.close();
    useMatch.getState().reset();
    app.set({ client: null, room: null });
    app.go('home');
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" aria-label="Leave room" onClick={leave}>
          ←
        </button>
        <h2>Online room</h2>
        <span className={`pill ${app.netStatus === 'online' ? '' : 'flag'}`}>{app.netStatus}</span>
      </div>
      <div className="card stack" style={{ textAlign: 'center' }}>
        <div className="muted small">Room code: share it with your opponent</div>
        <div className="big-code">{room.code}</div>
        {navigator.share && (
          <button className="btn small" onClick={() => navigator.share({ title: 'Touchline', text: `Join my Touchline final: room ${room.code}`, url: location.href }).catch(() => {})}>
            Share
          </button>
        )}
      </div>
      {[me, them].map((s, i) => {
        const club = i === 0 ? myClub : theirClub;
        return (
          <div key={i} className="card row">
            {club ? <KitSwatch kit={club.kits.home} /> : <span className="swatch" />}
            <div className="grow">
              <div style={{ fontWeight: 700 }}>
                {s.name ?? (i === 1 ? 'Waiting for opponent…' : 'You')} {i === 0 && <span className="pill">you</span>}
              </div>
              <div className="muted small">
                {club ? club.name : 'No club yet'} · {s.connected ? 'connected' : 'offline'}
              </div>
            </div>
            <span className={`pill ${s.ready ? '' : 'flag'}`}>{s.ready ? 'ready' : s.sheetSubmitted ? 'sheet in' : 'setting up'}</span>
          </div>
        );
      })}
      <div className="stack">
        <button
          className="btn block"
          onClick={() => {
            app.set({ pickFor: 'me' });
            app.go('pick');
          }}
        >
          {myClub ? `Change club (${myClub.shortName})` : 'Choose your club'}
        </button>
        {myClub && (
          <button className="btn primary block" onClick={() => app.go('setup')}>
            {me.ready ? 'Edit team sheet' : 'Set up your team'}
          </button>
        )}
        {me.ready && <div className="muted small">You’re ready. The match starts as soon as both managers are ready. Your tactics stay hidden from your opponent.</div>}
        {room.phase === 'ended' && (
          <button className="btn block" onClick={() => app.client?.rematch()}>
            Rematch
          </button>
        )}
      </div>
    </div>
  );
}
