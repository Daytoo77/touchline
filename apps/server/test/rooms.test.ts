import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as ioc, type Socket } from 'socket.io-client';
import { autoSheet } from '@touchline/engine';
import { getClub } from '@touchline/data';
import type { ClientToServer, JoinAck, MatchInit, PrivateTeamState, RoomView, ServerToClient } from '@touchline/shared';
import { startServer } from '../src/server';

type C = Socket<ServerToClient, ClientToServer>;

let srv: Awaited<ReturnType<typeof startServer>>;
let url = '';

beforeAll(async () => {
  srv = await startServer({ port: 0, speed: 30, targetSeconds: 600, breakSeconds: 2, pauseBudgetMs: 1500 });
  url = `http://localhost:${srv.port}`;
});
afterAll(async () => {
  await srv.close();
});

interface Client {
  s: C;
  log: { ev: string; data: unknown }[];
  last<T>(ev: string): T | undefined;
  wait<T>(ev: string, pred?: (d: T) => boolean, ms?: number): Promise<T>;
}

function client(): Promise<Client> {
  const s: C = ioc(url, { transports: ['websocket'], forceNew: true, reconnection: false });
  const log: Client['log'] = [];
  s.onAny((ev, data) => log.push({ ev, data }));
  const c: Client = {
    s,
    log,
    last: <T,>(ev: string) => [...log].reverse().find((l) => l.ev === ev)?.data as T | undefined,
    wait: <T,>(ev: string, pred: (d: T) => boolean = () => true, ms = 8000) =>
      new Promise<T>((res, rej) => {
        const hit = log.find((l) => l.ev === ev && pred(l.data as T));
        if (hit) return res(hit.data as T);
        const t = setTimeout(() => rej(new Error(`timeout waiting for ${ev}`)), ms);
        const h = (e: string, d: unknown) => {
          if (e === ev && pred(d as T)) {
            clearTimeout(t);
            s.offAny(h);
            res(d as T);
          }
        };
        s.onAny(h);
      }),
  };
  return new Promise((res) => s.on('connect', () => res(c)));
}

const emitAck = <T,>(s: C, ev: string, payload?: unknown) =>
  new Promise<T>((res) => (payload === undefined ? (s.emit as (...a: unknown[]) => void)(ev, res) : (s.emit as (...a: unknown[]) => void)(ev, payload, res)));

async function lobbyToMatch(a: Client, b: Client, clubs = ['real-madrid', 'como']) {
  const created = await emitAck<JoinAck>(a.s, 'room:create', { name: 'Alice' });
  expect(created.ok).toBe(true);
  if (!created.ok) throw new Error();
  expect(created.code).toMatch(/^[A-Z]{4}$/);
  const joined = await emitAck<JoinAck>(b.s, 'room:join', { code: created.code, name: 'Bob' });
  expect(joined.ok && joined.seat).toBe(1);
  for (const [c, id] of [
    [a, clubs[0]!],
    [b, clubs[1]!],
  ] as const) {
    expect((await emitAck<{ ok: boolean }>(c.s, 'lobby:club', { clubId: id })).ok).toBe(true);
    const sheet = autoSheet(getClub(id)!);
    expect((await emitAck<{ ok: boolean }>(c.s, 'lobby:sheet', { sheet })).ok).toBe(true);
    expect((await emitAck<{ ok: boolean }>(c.s, 'lobby:ready', { ready: true })).ok).toBe(true);
  }
  const ia = await a.wait<MatchInit>('match:init');
  const ib = await b.wait<MatchInit>('match:init');
  return { created, joined, ia, ib };
}

describe('online rooms', () => {
  it('rejects unknown codes and full rooms', async () => {
    const a = await client();
    const bad = await emitAck<JoinAck>(a.s, 'room:join', { code: 'ZZZZ', name: 'X' });
    expect(bad.ok).toBe(false);
    const created = await emitAck<JoinAck>(a.s, 'room:create', { name: 'A' });
    const b = await client();
    const c = await client();
    if (!created.ok) throw new Error();
    expect((await emitAck<JoinAck>(b.s, 'room:join', { code: created.code, name: 'B' })).ok).toBe(true);
    const full = await emitAck<JoinAck>(c.s, 'room:join', { code: created.code, name: 'C' });
    expect(full.ok).toBe(false);
    for (const x of [a, b, c]) x.s.close();
  });

  it('two phones share one live match; tactics stay private; disconnect pauses and reconnect resumes', async () => {
    const a = await client();
    const b = await client();
    const { created, ia, ib } = await lobbyToMatch(a, b);
    expect(ia.you).toBe(0);
    expect(ib.you).toBe(1);
    expect(ia.teams[0].clubId).toBe('real-madrid');

    // Both receive frames for the same ticks with identical positions.
    await a.wait('match:frames', (f: { t: number }[]) => f.some((x) => x.t > 200));
    await b.wait('match:frames', (f: { t: number }[]) => f.some((x) => x.t > 200));
    const framesA = a.log.filter((l) => l.ev === 'match:frames').flatMap((l) => l.data as { t: number; p: number[] }[]);
    const framesB = b.log.filter((l) => l.ev === 'match:frames').flatMap((l) => l.data as { t: number; p: number[] }[]);
    const common = framesA.find((fa) => framesB.some((fb) => fb.t === fa.t && fa.t > 0));
    expect(common).toBeDefined();
    expect(framesB.find((fb) => fb.t === common!.t)!.p).toEqual(common!.p);

    // Seat 0 changes tactics with a distinctive combination and shouts.
    const priv = await a.wait<PrivateTeamState>('match:private');
    const tactic = structuredClone(priv.tactic);
    tactic.instructions = { mentality: 3, pressing: -2, line: 2, width: -2, tempo: 2, directness: -2, timeWasting: 4 };
    const ack = await emitAck<{ ok: boolean; error?: string }>(a.s, 'match:cmd', { seq: 1, cmd: { type: 'tactic', tactic } });
    expect(ack.ok).toBe(true);
    await emitAck(a.s, 'match:cmd', { seq: 2, cmd: { type: 'shout', shout: 'showPassion' } });
    await b.wait('match:events', (ev: { type: string; team: number }[]) => ev.some((e) => e.type === 'notice' && e.team === 0));
    await new Promise((r) => setTimeout(r, 300));
    // Nothing seat 1 received may contain seat 0's tactic or shout contents.
    const privB = b.log.filter((l) => l.ev === 'match:private').map((l) => l.data as PrivateTeamState);
    expect(privB.every((p) => p.side === 1)).toBe(true);
    const allB = JSON.stringify(b.log);
    expect(allB).not.toContain('"timeWasting":4');
    expect(allB).not.toContain('showPassion');
    expect(JSON.stringify(a.log)).toContain('showPassion');

    // Malformed commands are rejected without hurting the room.
    const badAck = await emitAck<{ ok: boolean }>(a.s, 'match:cmd', { seq: 3, cmd: { type: 'teleport' } });
    expect(badAck.ok).toBe(false);

    // Seat 1 drops: the match pauses; it resumes when the pause budget runs out.
    const joinedB = b.log.find((l) => l.ev === 'room:state') as { data: RoomView } | undefined;
    expect(joinedB?.data.code).toBe(created.ok ? created.code : '');
    b.s.close();
    const paused = await a.wait<{ paused: boolean; by: number }>('match:pause', (p) => p.paused && p.by === 1);
    expect(paused.paused).toBe(true);
    await a.wait<{ paused: boolean }>('match:pause', (p) => !p.paused, 6000);

    a.s.close();
  });

  it('a manager who reloads reclaims the seat with the token and gets a snapshot', async () => {
    const a = await client();
    const b = await client();
    const { created } = await lobbyToMatch(a, b, ['napoli', 'borussia-dortmund']);
    if (!created.ok) throw new Error();
    const b2 = await client();
    // Wrong token can't steal a seat in a full room.
    const steal = await emitAck<JoinAck>(b2.s, 'room:join', { code: created.code, name: 'Eve', token: 'f'.repeat(32) });
    expect(steal.ok).toBe(false);
    const back = await emitAck<JoinAck>(b2.s, 'room:join', { code: created.code, name: 'Alice', token: created.token });
    expect(back.ok && back.seat).toBe(0);
    const init = await b2.wait<MatchInit>('match:init');
    expect(init.you).toBe(0);
    await b2.wait('match:roster');
    await b2.wait('match:public');
    for (const x of [a, b, b2]) x.s.close();
  });

  it('serves /health for wake-up pings', async () => {
    const r = await fetch(`${url}/health`);
    expect(r.status).toBe(200);
    expect((await r.json()).ok).toBe(true);
  });
});
