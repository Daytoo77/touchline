import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './server';

const here = dirname(fileURLToPath(import.meta.url));
// Serve the built web app too when it sits next to the server (single-service deploys).
const webDir = [resolve(here, '../../web/dist'), resolve(here, '../web')].find((d) => existsSync(resolve(d, 'index.html')));

const port = Number(process.env.PORT ?? 3001);
const cors = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : '*';

startServer({
  port,
  corsOrigin: cors,
  webDir: process.env.SERVE_WEB === '0' ? undefined : webDir,
  targetSeconds: Number(process.env.MATCH_SECONDS ?? 600),
  breakSeconds: Number(process.env.BREAK_SECONDS ?? 90),
  // Dev/test only: run matches faster than real time.
  speed: Number(process.env.SPEED ?? 1),
}).then(({ port: p }) => {
  console.log(`Touchline server listening on :${p}${webDir ? ` (serving ${webDir})` : ''}`);
});
