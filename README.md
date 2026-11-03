# Touchline

A 2D, tactics-only football management game for two people: each manager picks one of the 36 clubs from the 2026-27 European league phase, sets up formation, roles, instructions and set pieces on their own phone, then manages one knockout final live. Managers never control players directly: the match is simulated from player attributes and tactics, with shouts, tactical changes, substitutions, a half-time team talk, extra time and penalties.

- **Mobile-first PWA** (React + Vite + Canvas 2D), installable from the browser: no app store.
- **Authoritative, deterministic engine** in TypeScript: the same seed plus the same command log replays any match exactly.
- **Single device vs AI**: the engine runs in a Web Worker on the phone, so it works offline.
- **Online rooms**: two phones join a 4-letter room on a Node + Socket.IO server that runs the match.

> Club names only: no crests, logos or official marks. Player ratings are Touchline's own estimates from each player's level and role, not copied from any game or ratings database. Players whose 2026-27 status couldn't be confirmed carry a `flag` in the data and a **?** in the UI.

## Quick start

Requires Node 20+ (22 recommended).

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. To play on your phone on the same Wi-Fi, open `http://<your-computer's-LAN-IP>:5173` (Vite prints it). Over plain `http` on a LAN the app works but can't be installed; the deployed HTTPS version can.

Online rooms need the server too, in a second terminal:

```bash
npm run dev:server
```

The web app looks for the server at `http://<same host>:3001` unless `VITE_SERVER_URL` is set.

## Tests

```bash
npm test
```

Fast suite (~20 s): determinism, rules, sanity, host pacing/pause/replay, RNG/math, server rooms.

```bash
npm run test:balance
```

300 simulated knockouts (~2–3 min): an XI with every attribute +3 must win at least 140 of 200 and must lose some; +1 must be a smaller edge.

```bash
npm run calibrate -- 40
```

Prints match averages (goals, shots, xG, passes, fouls, cards…) used for balancing.

Other checks: `npm run typecheck`, `npm run lint`, `npm run data:check`.

## How a match works

- **Engine** (`packages/engine`): agent-based positional simulation at 5 ticks per match-second. Every player moves towards a target built from formation slot, role/duty, team instructions and ball position; the ball carrier chooses between passes, through balls, carries, crosses, shots, clearances and holding by weighing value against risk (better `decisions` → better choices). xG comes from a fixed model of distance, angle, body part, pressure and bodies in the lane; finishing and goalkeeping skill move the outcome around it.
- **Determinism**: a seeded `sfc32` RNG, and only `+ − × ÷` and `Math.sqrt` in the engine. `Math.exp/sin/atan2/pow` are not bit-identical across V8 and Safari's JavaScriptCore, so the engine uses its own polynomial versions (`detmath.ts`). ESLint forbids `Math.random`, `Date`, timers and those functions inside the engine.
- **Replays**: a replay file is `{ seed, team sheets, command log, checksums }`. Download one at full time and verify it with `npm run replay -- path/to/file.json`.
- **Pacing** (`packages/host`): 90 minutes take about 10 real minutes. The clock races through midfield and dead balls and slows near the boxes, on shots and on set pieces. Pacing only decides how fast the simulation is stepped, never what happens.
- **Rules**: UEFA substitutions (5 subs in 3 windows; half-time and the break before extra time don't use a window; extra time adds a 6th sub and a 4th window), subs made in open play happen at the next stoppage, and a second yellow card means a red.

## Editing player data

Each club lives in one typed file: `packages/data/src/clubs/<club>.ts`. Edit any attribute (1–20), then run:

```bash
npm run data:check
```

The schema is `packages/shared/src/schema/player.ts` (zod; your editor autocompletes and type-checks the files).

Club files were generated from compact scouting lines in `packages/data/scouting/` (level + archetype + signature traits) by `npm run squads:expand`. Once generated, the club file is the source of truth: the generator never overwrites it unless you pass `--force`.

## Deploy (free tiers)

### Web app → GitHub Pages

1. Repository **Settings → Pages → Source: GitHub Actions**.
2. Push to `main` (or run the "Deploy web app to GitHub Pages" workflow by hand). The app is served at `https://<user>.github.io/<repo>/`.
3. Once the server is deployed, add a repository variable **`SERVER_URL`** (Settings → Secrets and variables → Actions → Variables) with the server's URL, and re-run the workflow.

On the phone, open the Pages URL, then use **Share → Add to Home Screen** (iOS) or **Install app** (Android).

### Server → Render (free web service)

1. On [render.com](https://render.com) choose **New → Blueprint** and point it at this repository; `render.yaml` defines the service. Or create a Web Service manually:
   - build command: `npm ci && npm run build:server`
   - start command: `npm start`
2. Set the environment variable `CORS_ORIGIN` to your Pages origin, e.g. `https://<user>.github.io`.
3. Copy the service URL into the `SERVER_URL` repository variable (see above).

Free Render instances sleep after 15 idle minutes and take about a minute to wake. The app pings `/health` as soon as it opens, so the server is usually awake by kickoff. Since February 2026, WebSocket traffic keeps a free instance awake during a match. A free instance can still restart at any time, and that loses rooms in progress.

## Project layout

```
packages/shared      zod schemas & types (players, clubs, tactics, commands, events), formations, roles, rules, socket protocol
packages/data        club files, scouting lines, attribute generator, kit colours
packages/engine      deterministic match engine, AI manager, replays
packages/host        wall-clock runner: variable pacing, breaks, AI seats, disconnect pause
packages/commentary  event → commentary text (outside the simulation)
apps/web             React PWA: club picker, tactics board, live match, management
apps/server          Node + Socket.IO rooms (4-letter codes), authoritative match host
tools/               squad expansion, data check, calibration, replay verification
```
