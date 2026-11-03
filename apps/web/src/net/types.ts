import type { Frame, MatchCommand, MatchEvent, MatchInit, PauseInfo, PrivateTeamState, PublicMatchState, ReplayFile, RosterEntry } from '@touchline/shared';

export interface MatchStreamListener {
  init(v: MatchInit): void;
  frames(v: Frame[]): void;
  events(v: MatchEvent[]): void;
  publicState(v: PublicMatchState): void;
  privateState(v: PrivateTeamState): void;
  roster(v: RosterEntry[]): void;
  pause(v: PauseInfo): void;
  replay(v: ReplayFile): void;
}

export interface CommandResult {
  ok: boolean;
  error?: string;
}

/** A live match, local (Web Worker) or online (Socket.IO). The UI only ever talks to this. */
export interface MatchConnection {
  readonly kind: 'local' | 'online';
  send(cmd: MatchCommand): Promise<CommandResult>;
  close(): void;
  /** Local only: pause/resume and speed. */
  setPaused?(paused: boolean): void;
  setSpeed?(speed: number): void;
}
