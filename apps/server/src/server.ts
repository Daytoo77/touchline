import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { Server } from 'socket.io';
import type { ClientToServer, ServerToClient } from '@touchline/shared';
import { RoomManager, type RoomOptions } from './rooms';

export interface ServerOptions extends Partial<RoomOptions> {
  port?: number;
  /** Allowed browser origins for Socket.IO (comma-separated in CORS_ORIGIN). Default: any. */
  corsOrigin?: string | string[];
  /** Optional folder with the built web app to serve from the same origin. */
  webDir?: string;
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveStatic(dir: string, req: IncomingMessage, res: ServerResponse): boolean {
  const url = new URL(req.url ?? '/', 'http://x');
  let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  if (p === '/' || p === '') p = '/index.html';
  let file = resolve(join(dir, p));
  if (!file.startsWith(resolve(dir))) return false;
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(dir, 'index.html');
  if (!existsSync(file)) return false;
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'cache-control': file.endsWith('index.html') || file.endsWith('sw.js') ? 'no-cache' : 'public, max-age=31536000, immutable' });
  res.end(readFileSync(file));
  return true;
}

export function startServer(opts: ServerOptions = {}) {
  const roomOpts: RoomOptions = {
    targetSeconds: opts.targetSeconds ?? 600,
    breakSeconds: opts.breakSeconds ?? 90,
    shootoutBreakSeconds: opts.shootoutBreakSeconds ?? 40,
    pauseBudgetMs: opts.pauseBudgetMs ?? 120_000,
    speed: opts.speed ?? 1,
  };
  const started = Date.now();
  const http = createServer((req, res) => {
    if (req.url?.startsWith('/health')) {
      res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
      res.end(JSON.stringify({ ok: true, rooms: manager.rooms.size, uptimeS: Math.round((Date.now() - started) / 1000) }));
      return;
    }
    if (opts.webDir && req.method === 'GET' && serveStatic(opts.webDir, req, res)) return;
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Touchline server. Open the web app to play.');
  });
  const io = new Server<ClientToServer, ServerToClient>(http, {
    cors: { origin: opts.corsOrigin ?? '*' },
    pingInterval: 10_000,
    pingTimeout: 8_000,
    maxHttpBufferSize: 256 * 1024,
  });
  const manager = new RoomManager(io, roomOpts);
  return new Promise<{ port: number; close(): Promise<void>; manager: RoomManager }>((resolveP) => {
    http.listen(opts.port ?? 0, () => {
      const addr = http.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolveP({
        port,
        manager,
        close: () =>
          new Promise<void>((r) => {
            manager.stop();
            void io.close();
            http.close(() => r());
          }),
      });
    });
  });
}
