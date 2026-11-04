import { create } from 'zustand';
import { describe, type CommentaryLine } from '@touchline/commentary';
import type { MatchEvent, MatchInit, PauseInfo, PrivateTeamState, PublicMatchState, ReplayFile, RosterEntry, Side } from '@touchline/shared';
import { frameBuffer } from './lib/frames';
import type { MatchStreamListener } from './net/types';

export interface Toast {
  id: number;
  text: string;
  tone: 'info' | 'goal' | 'bad';
}

interface MatchState {
  init: MatchInit | null;
  pub: PublicMatchState | null;
  priv: PrivateTeamState | null;
  roster: RosterEntry[];
  lines: CommentaryLine[];
  events: MatchEvent[];
  pause: PauseInfo | null;
  replay: ReplayFile | null;
  toasts: Toast[];
  goalAt: number;
  goalSide: Side | null;
  reset(): void;
  toast(text: string, tone?: Toast['tone']): void;
  dismiss(id: number): void;
}

let toastId = 1;
const names = new Map<string, string>();

export const useMatch = create<MatchState>((set, get) => ({
  init: null,
  pub: null,
  priv: null,
  roster: [],
  lines: [],
  events: [],
  pause: null,
  replay: null,
  toasts: [],
  goalAt: 0,
  goalSide: null,
  reset() {
    frameBuffer.reset();
    names.clear();
    set({ init: null, pub: null, priv: null, roster: [], lines: [], events: [], pause: null, replay: null, toasts: [], goalAt: 0, goalSide: null });
  },
  toast(text, tone = 'info') {
    const id = toastId++;
    set({ toasts: [...get().toasts.slice(-2), { id, text, tone }] });
    setTimeout(() => get().dismiss(id), tone === 'goal' ? 4500 : 3500);
  },
  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export function playerName(id: string): string {
  return names.get(id) ?? id;
}

/** Listener that feeds the match store from any connection (local worker or socket). */
export const matchListener: MatchStreamListener = {
  init(v) {
    names.clear();
    for (const t of v.teams) for (const p of t.players) names.set(p.id, p.shortName);
    frameBuffer.reset();
    useMatch.setState({ init: v, lines: [], events: [], replay: null, pause: null });
  },
  frames(v) {
    frameBuffer.push(v);
  },
  events(v) {
    const st = useMatch.getState();
    const init = st.init;
    if (!init) return;
    const period = st.pub?.period ?? 1;
    const ctx = { name: playerName, team: (s: Side) => init.teams[s].shortName, you: init.you };
    const newLines: CommentaryLine[] = [];
    for (const e of v) {
      const p = e.type === 'kickoff' ? e.period : e.type === 'shootoutKick' ? 5 : e.type === 'periodEnd' ? e.period : period;
      const line = describe(e, ctx, p as never);
      if (line) newLines.push(line);
      if (e.type === 'goal') {
        useMatch.setState({ goalAt: performance.now(), goalSide: e.team });
        st.toast(`GOAL! ${playerName(e.player)} (${init.teams[e.team].abbr}) ${e.score[0]}–${e.score[1]}`, 'goal');
      } else if (e.type === 'notice' && e.team !== init.you) {
        st.toast(`${init.teams[e.team].shortName} made a tactical change.`);
      } else if (e.type === 'card' && e.color === 'red') {
        st.toast(`Red card: ${playerName(e.player)} (${init.teams[e.team].abbr})`, 'bad');
      } else if (e.type === 'sub' && e.team !== init.you) {
        st.toast(`${init.teams[e.team].abbr} sub: ${playerName(e.in)} on for ${playerName(e.out)}`);
      } else if (e.type === 'subRejected') {
        st.toast(e.reason, 'bad');
      }
    }
    useMatch.setState({ lines: [...newLines.reverse(), ...st.lines].slice(0, 300), events: [...st.events, ...v] });
  },
  publicState(v) {
    useMatch.setState({ pub: v });
  },
  privateState(v) {
    useMatch.setState({ priv: v });
  },
  roster(v) {
    useMatch.setState({ roster: v });
  },
  pause(v) {
    useMatch.setState({ pause: v });
  },
  replay(v) {
    useMatch.setState({ replay: v });
  },
};
