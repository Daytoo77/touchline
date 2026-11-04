/// <reference lib="webworker" />
// Runs the authoritative MatchHost inside a Web Worker for single-device games against the AI.
import { MatchHost, visibleTo } from '@touchline/host';
import type { TeamInput } from '@touchline/engine';

declare const self: DedicatedWorkerGlobalScope;

let host: MatchHost | null = null;

type In =
  | { type: 'start'; seed: number; home: TeamInput; away: TeamInput; targetSeconds: number; speed: number }
  | { type: 'cmd'; id: number; cmd: import('@touchline/shared').MatchCommand }
  | { type: 'pause'; paused: boolean }
  | { type: 'speed'; speed: number }
  | { type: 'stop' };

self.onmessage = (e: MessageEvent<In>) => {
  const msg = e.data;
  if (msg.type === 'start') {
    host = new MatchHost(
      { seed: msg.seed, home: msg.home, away: msg.away, ai: [false, true], targetSeconds: msg.targetSeconds, speed: msg.speed, pauseBudgetMs: 24 * 3600 * 1000 },
      {
        frames: (v) => self.postMessage({ type: 'frames', v }),
        events: (v) => self.postMessage({ type: 'events', v: visibleTo(v, 0) }),
        publicState: (v) => self.postMessage({ type: 'publicState', v }),
        privateState: (side, v) => {
          if (side === 0) self.postMessage({ type: 'privateState', v });
        },
        roster: (v) => self.postMessage({ type: 'roster', v }),
        pause: (v) => self.postMessage({ type: 'pause', v }),
        ended: (v) => self.postMessage({ type: 'replay', v }),
      },
    );
    host.start(50);
  } else if (msg.type === 'cmd' && host) {
    const r = host.command(0, msg.cmd);
    self.postMessage({ type: 'ack', id: msg.id, ok: r.ok, error: r.error });
  } else if (msg.type === 'pause' && host) {
    host.setConnected(0, !msg.paused);
  } else if (msg.type === 'speed' && host) {
    (host.opts as { speed: number }).speed = msg.speed;
  } else if (msg.type === 'stop') {
    host?.stop();
    host = null;
  }
};
