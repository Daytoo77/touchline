import { z } from 'zod';
import type { Kit } from './schema/club';
import { MatchCommand, type Frame, type MatchEvent, type PrivateTeamState, type PublicMatchState, type ReplayFile, type RosterEntry, type Seat } from './schema/match';
import { TeamSheet } from './schema/tactic';
import type { Position } from './schema/player';

/** 23 letters: no I, L, O (and no digits) so codes are easy to read aloud. */
export const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ';
export const RoomCode = z.string().length(4).regex(/^[ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);

// ------------------------------------------------------------ client → server payloads

export const CreateRoomReq = z.object({ name: z.string().trim().min(1).max(20) }).strict();
export const JoinRoomReq = z
  .object({ code: RoomCode, name: z.string().trim().min(1).max(20), token: z.string().max(64).optional() })
  .strict();
export const PickClubReq = z.object({ clubId: z.string().max(40) }).strict();
export const SubmitSheetReq = z.object({ sheet: TeamSheet }).strict();
export const ReadyReq = z.object({ ready: z.boolean() }).strict();
export const CommandReq = z.object({ seq: z.number().int().min(0), cmd: MatchCommand }).strict();

export type Ack<T = object> = ({ ok: true } & T) | { ok: false; error: string };
export type JoinAck = Ack<{ code: string; seat: Seat; token: string }>;
export type CommandAck = Ack<{ seq: number; tick: number }>;

// ------------------------------------------------------------ server → client payloads

export type RoomPhase = 'lobby' | 'match' | 'ended';

export interface SeatView {
  name: string | null;
  connected: boolean;
  clubId: string | null;
  sheetSubmitted: boolean;
  ready: boolean;
}

export interface RoomView {
  code: string;
  you: Seat;
  phase: RoomPhase;
  seats: [SeatView, SeatView];
  /** Wall-clock ms the server will auto-wake… not used by clients except for display. */
  serverTime: number;
}

export interface PublicSquadPlayer {
  id: string;
  name: string;
  shortName: string;
  number: number;
  positions: Position[];
}

export interface PublicTeamInfo {
  clubId: string;
  name: string;
  shortName: string;
  abbr: string;
  kit: Kit;
  gkKit: Kit;
  /** Starting XI ids in pitch-index order (0 = GK) — public, like a real team sheet. */
  xi: string[];
  bench: string[];
  players: PublicSquadPlayer[];
}

export interface MatchInit {
  you: Seat;
  teams: [PublicTeamInfo, PublicTeamInfo];
  /** Target real-time length of 90 minutes, in seconds. */
  targetSeconds: number;
}

export interface PauseInfo {
  paused: boolean;
  /** Seat whose disconnection caused the pause. */
  by: Seat | null;
  /** Remaining pause budget per seat, ms. */
  budgetMs: [number, number];
}

export interface ServerToClient {
  'room:state': (v: RoomView) => void;
  'match:init': (v: MatchInit) => void;
  'match:frames': (v: Frame[]) => void;
  'match:events': (v: MatchEvent[]) => void;
  'match:public': (v: PublicMatchState) => void;
  'match:private': (v: PrivateTeamState) => void;
  'match:roster': (v: RosterEntry[]) => void;
  'match:pause': (v: PauseInfo) => void;
  'match:replay': (v: ReplayFile) => void;
  'room:closed': (reason: string) => void;
}

export interface ClientToServer {
  'room:create': (req: z.infer<typeof CreateRoomReq>, ack: (r: JoinAck) => void) => void;
  'room:join': (req: z.infer<typeof JoinRoomReq>, ack: (r: JoinAck) => void) => void;
  'lobby:club': (req: z.infer<typeof PickClubReq>, ack: (r: Ack) => void) => void;
  'lobby:sheet': (req: z.infer<typeof SubmitSheetReq>, ack: (r: Ack) => void) => void;
  'lobby:ready': (req: z.infer<typeof ReadyReq>, ack: (r: Ack) => void) => void;
  'match:cmd': (req: z.infer<typeof CommandReq>, ack: (r: CommandAck) => void) => void;
  'room:rematch': (ack: (r: Ack) => void) => void;
  'room:leave': () => void;
}
