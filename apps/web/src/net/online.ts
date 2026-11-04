import { io, type Socket } from 'socket.io-client';
import type { Ack, ClientToServer, JoinAck, MatchCommand, RoomView, ServerToClient, TeamSheet } from '@touchline/shared';
import type { MatchConnection, MatchStreamListener } from './types';

export function serverUrl(): string {
  const env = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (env) return env;
  // Production: the game server also serves the app, so use the same origin. Dev: the server runs on :3001.
  if (import.meta.env.PROD) return location.origin;
  return `${location.protocol}//${location.hostname}:3001`;
}

const KEY = 'touchline.session';

export interface Session {
  code: string;
  seat: 0 | 1;
  token: string;
  name: string;
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(s: Session | null): void {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode: rejoin by code still works */
  }
}

export interface RoomHandlers extends MatchStreamListener {
  room(v: RoomView): void;
  closed(reason: string): void;
  status(s: 'connecting' | 'online' | 'offline'): void;
}

/** Socket.IO client for rooms: lobby, team sheets, live match commands, automatic rejoin. */
export class RoomClient {
  readonly socket: Socket<ServerToClient, ClientToServer>;
  session: Session | null = null;

  constructor(private readonly h: RoomHandlers) {
    this.socket = io(serverUrl(), { transports: ['websocket', 'polling'], reconnection: true, reconnectionDelay: 500, reconnectionDelayMax: 3000 });
    h.status('connecting');
    this.socket.on('connect', () => {
      h.status('online');
      if (this.session) void this.join(this.session.code, this.session.name, this.session.token);
    });
    this.socket.on('disconnect', () => h.status('offline'));
    this.socket.on('connect_error', () => h.status('offline'));
    this.socket.on('room:state', (v) => h.room(v));
    this.socket.on('room:closed', (r) => {
      saveSession(null);
      this.session = null;
      h.closed(r);
    });
    this.socket.on('match:init', (v) => h.init(v));
    this.socket.on('match:frames', (v) => h.frames(v));
    this.socket.on('match:events', (v) => h.events(v));
    this.socket.on('match:public', (v) => h.publicState(v));
    this.socket.on('match:private', (v) => h.privateState(v));
    this.socket.on('match:roster', (v) => h.roster(v));
    this.socket.on('match:pause', (v) => h.pause(v));
    this.socket.on('match:replay', (v) => h.replay(v));
  }

  private remember(ack: JoinAck, name: string): JoinAck {
    if (ack.ok) {
      this.session = { code: ack.code, seat: ack.seat, token: ack.token, name };
      saveSession(this.session);
    }
    return ack;
  }

  create(name: string): Promise<JoinAck> {
    return new Promise((res) => this.socket.emit('room:create', { name }, (a) => res(this.remember(a, name))));
  }

  join(code: string, name: string, token?: string): Promise<JoinAck> {
    return new Promise((res) => this.socket.emit('room:join', { code: code.toUpperCase(), name, token }, (a) => res(this.remember(a, name))));
  }

  pickClub(clubId: string): Promise<Ack> {
    return new Promise((res) => this.socket.emit('lobby:club', { clubId }, res));
  }

  submitSheet(sheet: TeamSheet): Promise<Ack> {
    return new Promise((res) => this.socket.emit('lobby:sheet', { sheet }, res));
  }

  setReady(ready: boolean): Promise<Ack> {
    return new Promise((res) => this.socket.emit('lobby:ready', { ready }, res));
  }

  rematch(): Promise<Ack> {
    return new Promise((res) => this.socket.emit('room:rematch', res));
  }

  leave(): void {
    this.socket.emit('room:leave');
    saveSession(null);
    this.session = null;
  }

  close(): void {
    this.socket.close();
  }

  private seq = 0;

  matchConnection(): MatchConnection {
    return {
      kind: 'online',
      send: (cmd: MatchCommand) =>
        new Promise((res) => {
          const timer = setTimeout(() => res({ ok: false, error: 'No answer from the server.' }), 6000);
          this.socket.emit('match:cmd', { seq: this.seq++, cmd }, (a) => {
            clearTimeout(timer);
            res(a.ok ? { ok: true } : { ok: false, error: a.error });
          });
        }),
      close: () => {},
    };
  }
}
