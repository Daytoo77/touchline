import { create } from 'zustand';
import type { RoomView, TeamSheet } from '@touchline/shared';
import type { MatchConnection } from './net/types';
import type { RoomClient } from './net/online';

export type Screen = 'home' | 'pick' | 'setup' | 'online' | 'match' | 'fulltime';

interface AppState {
  screen: Screen;
  mode: 'local' | 'online';
  /** Club picker purpose. */
  pickFor: 'me' | 'opponent';
  myClubId: string | null;
  oppClubId: string | null;
  sheet: TeamSheet | null;
  conn: MatchConnection | null;
  room: RoomView | null;
  client: RoomClient | null;
  netStatus: 'connecting' | 'online' | 'offline';
  /** Real seconds for 90 minutes in local games. */
  matchSeconds: number;
  go(screen: Screen): void;
  set(p: Partial<AppState>): void;
}

export const useApp = create<AppState>((set) => ({
  screen: 'home',
  mode: 'local',
  pickFor: 'me',
  myClubId: null,
  oppClubId: null,
  sheet: null,
  conn: null,
  room: null,
  client: null,
  netStatus: 'offline',
  matchSeconds: 600,
  go: (screen) => set({ screen }),
  set: (p) => set(p),
}));
