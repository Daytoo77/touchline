import { randomBytes, randomInt } from 'node:crypto';
import type { Server, Socket } from 'socket.io';
import { getClub } from '@touchline/data';
import { MatchHost, visibleTo } from '@touchline/host';
import {
  CommandReq,
  CreateRoomReq,
  JoinRoomReq,
  PickClubReq,
  ROOM_ALPHABET,
  ReadyReq,
  SubmitSheetReq,
  resolveKits,
  sheetErrors,
  shortNameOf,
  type ClientToServer,
  type Club,
  type MatchInit,
  type PublicTeamInfo,
  type ReplayFile,
  type RoomPhase,
  type RoomView,
  type Seat,
  type ServerToClient,
  type TeamSheet,
} from '@touchline/shared';

export interface RoomOptions {
  targetSeconds: number;
  breakSeconds: number;
  shootoutBreakSeconds: number;
  pauseBudgetMs: number;
  speed: number;
}

interface SeatState {
  name: string | null;
  token: string | null;
  socketId: string | null;
  connected: boolean;
  clubId: string | null;
  sheet: TeamSheet | null;
  ready: boolean;
}

type IO = Server<ClientToServer, ServerToClient>;
type Sock = Socket<ClientToServer, ServerToClient>;

const emptySeat = (): SeatState => ({ name: null, token: null, socketId: null, connected: false, clubId: null, sheet: null, ready: false });

function publicTeam(club: Club, sheet: TeamSheet, kit: Club['kits']['home']): PublicTeamInfo {
  return {
    clubId: club.id,
    name: club.name,
    shortName: club.shortName,
    abbr: club.abbr,
    kit,
    gkKit: club.kits.gk,
    xi: sheet.tactic.slots.map((s) => s.playerId ?? ''),
    bench: [...sheet.bench],
    players: club.players.map((p) => ({ id: p.id, name: p.name, shortName: shortNameOf(p), number: p.number, positions: p.positions })),
  };
}

export class Room {
  readonly seats: [SeatState, SeatState] = [emptySeat(), emptySeat()];
  phase: RoomPhase = 'lobby';
  host: MatchHost | null = null;
  init: [MatchInit, MatchInit] | null = null;
  replay: ReplayFile | null = null;
  lastActive = Date.now();
  endedAt = 0;

  constructor(
    readonly code: string,
    private readonly io: IO,
    private readonly opts: RoomOptions,
  ) {}

  touch(): void {
    this.lastActive = Date.now();
  }

  view(you: Seat): RoomView {
    return {
      code: this.code,
      you,
      phase: this.phase,
      serverTime: Date.now(),
      seats: this.seats.map((s) => ({ name: s.name, connected: s.connected, clubId: s.clubId, sheetSubmitted: !!s.sheet, ready: s.ready })) as RoomView['seats'],
    };
  }

  socketOf(seat: Seat): Sock | undefined {
    const id = this.seats[seat].socketId;
    return id ? (this.io.sockets.sockets.get(id) as Sock | undefined) : undefined;
  }

  broadcast(): void {
    for (const seat of [0, 1] as Seat[]) this.socketOf(seat)?.emit('room:state', this.view(seat));
  }

  seatOf(socketId: string): Seat | null {
    if (this.seats[0].socketId === socketId) return 0;
    if (this.seats[1].socketId === socketId) return 1;
    return null;
  }

  isEmpty(): boolean {
    return !this.seats[0].connected && !this.seats[1].connected;
  }

  startMatch(): void {
    const [a, b] = this.seats;
    const home = getClub(a.clubId!)!;
    const away = getClub(b.clubId!)!;
    const [k0, k1] = resolveKits(home, away);
    const teams: [PublicTeamInfo, PublicTeamInfo] = [publicTeam(home, a.sheet!, k0), publicTeam(away, b.sheet!, k1)];
    this.init = [
      { you: 0, teams, targetSeconds: this.opts.targetSeconds },
      { you: 1, teams, targetSeconds: this.opts.targetSeconds },
    ];
    this.phase = 'match';
    this.replay = null;
    const seed = randomInt(0, 2 ** 32 - 1);
    const host = new MatchHost(
      {
        seed,
        home: { club: home, sheet: a.sheet! },
        away: { club: away, sheet: b.sheet! },
        ai: [false, false],
        targetSeconds: this.opts.targetSeconds,
        breakSeconds: this.opts.breakSeconds,
        shootoutBreakSeconds: this.opts.shootoutBreakSeconds,
        pauseBudgetMs: this.opts.pauseBudgetMs,
        speed: this.opts.speed,
      },
      {
        frames: (f) => this.io.to(this.code).volatile.emit('match:frames', f),
        events: (ev) => {
          for (const seat of [0, 1] as Seat[]) {
            const mine = visibleTo(ev, seat);
            if (mine.length) this.socketOf(seat)?.emit('match:events', mine);
          }
        },
        publicState: (p) => this.io.to(this.code).emit('match:public', p),
        privateState: (side, p) => this.socketOf(side)?.emit('match:private', p),
        roster: (r) => this.io.to(this.code).emit('match:roster', r),
        pause: (p) => this.io.to(this.code).emit('match:pause', p),
        ended: (replay) => {
          this.replay = replay;
          this.phase = 'ended';
          this.endedAt = Date.now();
          this.io.to(this.code).emit('match:replay', replay);
          this.broadcast();
        },
      },
    );
    this.host = host;
    for (const seat of [0, 1] as Seat[]) {
      this.socketOf(seat)?.emit('match:init', this.init[seat]);
      host.setConnected(seat, this.seats[seat].connected);
    }
    this.broadcast();
    host.start(50);
  }

  /** Everything a (re)connecting manager needs to pick the live match back up. */
  sendSnapshot(seat: Seat): void {
    const s = this.socketOf(seat);
    const host = this.host;
    if (!s || !host || !this.init) return;
    s.emit('match:init', this.init[seat]);
    s.emit('match:roster', host.match.roster());
    s.emit('match:events', visibleTo(host.history, seat));
    s.emit('match:public', host.publicState());
    s.emit('match:private', host.match.privateState(seat));
    s.emit('match:frames', [host.lastFrame ?? host.match.frame()]);
    s.emit('match:pause', host.pauseInfo());
    if (this.replay) s.emit('match:replay', this.replay);
  }

  rematch(): void {
    this.host?.stop();
    this.host = null;
    this.init = null;
    this.phase = 'lobby';
    for (const s of this.seats) s.ready = false;
    this.broadcast();
  }

  close(reason: string): void {
    this.host?.stop();
    this.io.to(this.code).emit('room:closed', reason);
    this.io.in(this.code).socketsLeave(this.code);
  }
}

export class RoomManager {
  readonly rooms = new Map<string, Room>();
  private gcTimer: ReturnType<typeof setInterval>;

  constructor(
    private readonly io: IO,
    private readonly opts: RoomOptions,
  ) {
    this.gcTimer = setInterval(() => this.gc(), 60_000);
    io.on('connection', (socket) => this.attach(socket));
  }

  stop(): void {
    clearInterval(this.gcTimer);
    for (const r of this.rooms.values()) r.host?.stop();
  }

  newCode(): string {
    for (let i = 0; i < 1000; i++) {
      let c = '';
      for (let k = 0; k < 4; k++) c += ROOM_ALPHABET[randomInt(0, ROOM_ALPHABET.length)];
      if (!this.rooms.has(c)) return c;
    }
    throw new Error('no free room codes');
  }

  private gc(): void {
    const now = Date.now();
    for (const [code, r] of this.rooms) {
      const idle = now - r.lastActive;
      const stale =
        (r.phase === 'lobby' && idle > 30 * 60_000) ||
        (r.phase === 'ended' && now - r.endedAt > 15 * 60_000 && r.isEmpty()) ||
        (r.phase === 'match' && r.isEmpty() && idle > 10 * 60_000);
      if (stale) {
        r.close('Room expired.');
        this.rooms.delete(code);
      }
    }
  }

  private attach(socket: Sock): void {
    let room: Room | null = null;
    let seat: Seat | null = null;
    let cmdWindowStart = Date.now();
    let cmdCount = 0;

    const bindSeat = (r: Room, s: Seat, name: string) => {
      room = r;
      seat = s;
      const st = r.seats[s];
      st.name = name;
      st.socketId = socket.id;
      st.connected = true;
      void socket.join(r.code);
      r.touch();
      r.host?.setConnected(s, true);
    };

    socket.on('room:create', (req, ack) => {
      const p = CreateRoomReq.safeParse(req);
      if (!p.success || typeof ack !== 'function') return ack?.({ ok: false, error: 'Bad request.' });
      if (room) this.leave(socket, room, seat);
      const r = new Room(this.newCode(), this.io, this.opts);
      this.rooms.set(r.code, r);
      const token = randomBytes(16).toString('hex');
      r.seats[0].token = token;
      bindSeat(r, 0, p.data.name);
      ack({ ok: true, code: r.code, seat: 0, token });
      r.broadcast();
    });

    socket.on('room:join', (req, ack) => {
      const p = JoinRoomReq.safeParse(req);
      if (!p.success || typeof ack !== 'function') return ack?.({ ok: false, error: 'Bad request.' });
      const r = this.rooms.get(p.data.code);
      if (!r) return ack({ ok: false, error: 'No room with that code.' });
      // Reclaim a seat with its token (reconnect / page reload).
      let s: Seat | null = null;
      if (p.data.token) s = r.seats[0].token === p.data.token ? 0 : r.seats[1].token === p.data.token ? 1 : null;
      let token = p.data.token ?? '';
      if (s === null) {
        const free = r.seats.findIndex((x) => x.token === null);
        if (free < 0) return ack({ ok: false, error: 'This room is full.' });
        s = free as Seat;
        token = randomBytes(16).toString('hex');
        r.seats[s].token = token;
      }
      // Kick a stale socket that still holds the seat.
      const old = r.seats[s].socketId;
      if (old && old !== socket.id) this.io.sockets.sockets.get(old)?.disconnect(true);
      bindSeat(r, s, p.data.name);
      ack({ ok: true, code: r.code, seat: s, token });
      r.broadcast();
      if (r.phase !== 'lobby') r.sendSnapshot(s);
    });

    socket.on('lobby:club', (req, ack) => {
      if (typeof ack !== 'function') return;
      const p = PickClubReq.safeParse(req);
      if (!p.success || !room || seat === null) return ack({ ok: false, error: 'Not in a room.' });
      if (room.phase !== 'lobby') return ack({ ok: false, error: 'The match has already started.' });
      if (!getClub(p.data.clubId)) return ack({ ok: false, error: 'Unknown club.' });
      const st = room.seats[seat];
      if (st.clubId !== p.data.clubId) {
        st.clubId = p.data.clubId;
        st.sheet = null;
        st.ready = false;
      }
      room.touch();
      ack({ ok: true });
      room.broadcast();
    });

    socket.on('lobby:sheet', (req, ack) => {
      if (typeof ack !== 'function') return;
      const p = SubmitSheetReq.safeParse(req);
      if (!p.success) return ack({ ok: false, error: 'Invalid team sheet.' });
      if (!room || seat === null) return ack({ ok: false, error: 'Not in a room.' });
      if (room.phase !== 'lobby') return ack({ ok: false, error: 'The match has already started.' });
      const st = room.seats[seat];
      const club = st.clubId ? getClub(st.clubId) : undefined;
      if (!club || p.data.sheet.clubId !== club.id) return ack({ ok: false, error: 'Pick your club first.' });
      const errs = sheetErrors(club, p.data.sheet);
      if (errs.length) return ack({ ok: false, error: errs[0]! });
      st.sheet = p.data.sheet;
      room.touch();
      ack({ ok: true });
      room.broadcast();
    });

    socket.on('lobby:ready', (req, ack) => {
      if (typeof ack !== 'function') return;
      const p = ReadyReq.safeParse(req);
      if (!p.success || !room || seat === null) return ack({ ok: false, error: 'Not in a room.' });
      if (room.phase !== 'lobby') return ack({ ok: false, error: 'The match has already started.' });
      const st = room.seats[seat];
      if (p.data.ready && !st.sheet) return ack({ ok: false, error: 'Submit your team sheet first.' });
      st.ready = p.data.ready;
      room.touch();
      ack({ ok: true });
      if (room.seats[0].ready && room.seats[1].ready && room.seats[0].sheet && room.seats[1].sheet) room.startMatch();
      else room.broadcast();
    });

    socket.on('match:cmd', (req, ack) => {
      if (typeof ack !== 'function') return;
      const now = Date.now();
      if (now - cmdWindowStart > 1000) {
        cmdWindowStart = now;
        cmdCount = 0;
      }
      if (++cmdCount > 20) return ack({ ok: false, error: 'Too many commands.' });
      const p = CommandReq.safeParse(req);
      if (!p.success) return ack({ ok: false, error: 'Invalid command.' });
      if (!room || seat === null || !room.host || room.phase !== 'match') return ack({ ok: false, error: 'No live match.' });
      room.touch();
      const r = room.host.command(seat, p.data.cmd);
      ack(r.ok ? { ok: true, seq: p.data.seq, tick: r.tick } : { ok: false, error: r.error ?? 'Rejected.' });
    });

    socket.on('room:rematch', (ack) => {
      if (typeof ack !== 'function') return;
      if (!room || room.phase !== 'ended') return ack({ ok: false, error: 'No finished match to replay.' });
      room.rematch();
      ack({ ok: true });
    });

    socket.on('room:leave', () => {
      if (room) this.leave(socket, room, seat);
      room = null;
      seat = null;
    });

    socket.on('disconnect', () => {
      const r = room as Room | null;
      if (!r || seat === null) return;
      const st = r.seats[seat];
      if (st.socketId !== socket.id) return;
      st.connected = false;
      st.socketId = null;
      r.host?.setConnected(seat, false);
      r.touch();
      r.broadcast();
    });
  }

  private leave(socket: Sock, r: Room, seat: Seat | null): void {
    void socket.leave(r.code);
    if (seat === null) return;
    const st = r.seats[seat];
    if (r.phase === 'lobby') r.seats[seat] = emptySeat();
    else {
      st.connected = false;
      st.socketId = null;
      r.host?.setConnected(seat, false);
    }
    if (!r.seats[0].token && !r.seats[1].token) {
      r.close('Everyone left.');
      this.rooms.delete(r.code);
      return;
    }
    r.broadcast();
  }
}
