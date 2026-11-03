import type { Club, MatchInit, TeamSheet } from '@touchline/shared';
import { resolveKits } from '@touchline/shared';
import { publicTeam } from '../lib/teams';
import type { CommandResult, MatchConnection, MatchStreamListener } from './types';

/** Single-device match against the AI: the engine runs in a Web Worker on the phone. */
export function startLocalMatch(
  me: { club: Club; sheet: TeamSheet },
  ai: { club: Club; sheet: TeamSheet },
  listener: MatchStreamListener,
  opts: { seed: number; targetSeconds: number; speed?: number },
): MatchConnection {
  const worker = new Worker(new URL('./localWorker.ts', import.meta.url), { type: 'module' });
  const pending = new Map<number, (r: CommandResult) => void>();
  let nextId = 1;
  const [k0, k1] = resolveKits(me.club, ai.club);
  const init: MatchInit = {
    you: 0,
    teams: [publicTeam(me.club, me.sheet, k0), publicTeam(ai.club, ai.sheet, k1)],
    targetSeconds: opts.targetSeconds,
  };
  listener.init(init);
  worker.onmessage = (e: MessageEvent) => {
    const m = e.data as { type: string; v?: unknown; id?: number; ok?: boolean; error?: string };
    switch (m.type) {
      case 'frames':
        return listener.frames(m.v as never);
      case 'events':
        return listener.events(m.v as never);
      case 'publicState':
        return listener.publicState(m.v as never);
      case 'privateState':
        return listener.privateState(m.v as never);
      case 'roster':
        return listener.roster(m.v as never);
      case 'pause':
        return listener.pause(m.v as never);
      case 'replay':
        return listener.replay(m.v as never);
      case 'ack': {
        const cb = pending.get(m.id!);
        pending.delete(m.id!);
        cb?.({ ok: !!m.ok, error: m.error });
      }
    }
  };
  worker.postMessage({ type: 'start', seed: opts.seed, home: me, away: ai, targetSeconds: opts.targetSeconds, speed: opts.speed ?? 1 });
  return {
    kind: 'local',
    send(cmd) {
      return new Promise((resolve) => {
        const id = nextId++;
        pending.set(id, resolve);
        worker.postMessage({ type: 'cmd', id, cmd });
      });
    },
    close() {
      worker.postMessage({ type: 'stop' });
      worker.terminate();
    },
    setPaused(paused) {
      worker.postMessage({ type: 'pause', paused });
    },
    setSpeed(speed) {
      worker.postMessage({ type: 'speed', speed });
    },
  };
}
