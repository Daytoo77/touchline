import { useMemo, useState } from 'react';
import { autoSheet } from '@touchline/engine';
import { CLUBS, getClub, starText, stars } from '../lib/clubs';
import { ClubBadge } from '../components/Kit';
import { useApp } from '../store';

export function ClubPicker() {
  const { pickFor, set, go, mode, myClubId, room, client } = useApp();
  const [q, setQ] = useState('');
  const taken = mode === 'online' && room ? room.seats.find((_, i) => i !== room.you)?.clubId : pickFor === 'opponent' ? myClubId : null;
  const list = useMemo(() => CLUBS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())), [q]);
  const pots = [1, 2, 3, 4].map((pot) => list.filter((c) => c.pot === pot));

  const choose = async (id: string) => {
    const club = getClub(id)!;
    if (pickFor === 'opponent') {
      set({ oppClubId: id });
      go('setup');
      return;
    }
    set({ myClubId: id, sheet: autoSheet(club) });
    if (mode === 'local') {
      set({ pickFor: 'opponent' });
      setQ('');
    } else {
      await client?.pickClub(id);
      go('setup');
    }
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" aria-label="Back" onClick={() => (pickFor === 'opponent' ? set({ pickFor: 'me' }) : go(mode === 'online' ? 'online' : 'home'))}>
          ←
        </button>
        <h2>{pickFor === 'me' ? 'Choose your club' : 'Choose your opponent'}</h2>
      </div>
      <input className="input" placeholder="Search clubs" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="club-list">
        {pots.map((clubs, i) =>
          clubs.length ? (
            <div key={i} className="stack" style={{ gap: 6 }}>
              <div className="pot-h">Pot {i + 1}</div>
              {clubs.map((c) => {
                const n = stars(c);
                const isTaken = taken === c.id;
                const flagged = c.players.filter((p) => p.flag).length;
                return (
                  <button key={c.id} className={`club-row ${isTaken ? 'taken' : ''}`} onClick={() => choose(c.id)} disabled={isTaken && mode === 'online'}>
                    <ClubBadge clubId={c.id} kit={c.kits.home} />
                    <div className="grow">
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div className="muted small">
                        {c.country} · {c.players.length} players{flagged ? ` · ${flagged} unconfirmed` : ''}
                      </div>
                    </div>
                    <span className="stars" aria-label={`${n} stars`}>
                      {starText(n)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
