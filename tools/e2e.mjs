// Two-phone end-to-end smoke test: builds the web app, starts the server (which also serves the app),
// and plays a fast online match between two emulated iPhones in Playwright.
//   npm run test:e2e            (SHOTS=dir to save screenshots)
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const { chromium, devices } = createRequire(import.meta.url)('playwright');
const shots = process.env.SHOTS;
if (shots) mkdirSync(shots, { recursive: true });
const PORT = 3123;

execSync('npm run build', { stdio: 'inherit', env: { ...process.env, VITE_SERVER_URL: `http://localhost:${PORT}` } });
execSync('npm run build:server', { stdio: 'inherit' });
const server = spawn('node', ['apps/server/dist/server.mjs'], { env: { ...process.env, PORT: String(PORT), SPEED: '10', BREAK_SECONDS: '30' }, stdio: 'inherit' });
await new Promise((r) => setTimeout(r, 1200));

const browser = await chromium.launch();
const errors = [];
async function phone(name) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(`http://localhost:${PORT}/`);
  await page.getByLabel('Your name').fill(name);
  return page;
}
const snap = async (page, file) => shots && page.screenshot({ path: `${shots}/${file}` });

try {
  const a = await phone('Alice');
  const b = await phone('Bob');
  await a.getByText('Create online room').click();
  const code = (await a.locator('.big-code').textContent()).trim();
  console.log('room', code);
  await b.getByLabel('Room code').fill(code);
  await b.getByRole('button', { name: 'Join', exact: true }).click();
  await b.locator('.big-code').waitFor();
  await snap(a, 'online-1-lobby.png');

  for (const [page, club] of [[a, 'Real Madrid'], [b, 'Como 1907']]) {
    await page.getByText('Choose your club').click();
    await page.getByText(club, { exact: true }).click();
    await page.getByText('Submit team sheet & ready').click();
  }
  await a.locator('canvas').waitFor({ timeout: 15000 });
  await b.locator('canvas').waitFor({ timeout: 15000 });
  await a.waitForTimeout(4000);
  await snap(a, 'online-2-match-alice.png');
  await snap(b, 'online-3-match-bob.png');

  // Alice changes mentality: Bob gets only a notice.
  await a.getByRole('tab', { name: 'Tactics' }).click();
  await a.getByRole('button', { name: 'Instructions' }).click();
  await a.getByRole('radio', { name: 'Att', exact: true }).click();
  await a.getByText('Apply changes').click();
  await b.getByText('made a tactical change').first().waitFor({ timeout: 8000 });
  console.log('opponent notified of tactical change ✓');

  // Half-time and any later breaks: whoever sees the dialog confirms (breaks also end on a timer).
  let sawBreak = false;
  // Play on to the end; confirm any further breaks (extra time / penalty order).
  for (let i = 0; i < 120; i++) {
    for (const page of [a, b]) {
      for (const label of ['Ready for the restart', 'Confirm order']) {
        const btn = page.getByText(label);
        if (await btn.isVisible().catch(() => false)) {
          if (!sawBreak) await snap(page, 'online-4-halftime.png');
          sawBreak = true;
          await btn.click().catch(() => {});
        }
      }
    }
    if (await a.getByText('Full-time report').isVisible().catch(() => false)) break;
    await a.waitForTimeout(1000);
  }
  await a.getByText('Full-time report').click({ timeout: 30000 });
  await b.getByText('Full-time report').click({ timeout: 30000 });
  await snap(a, 'online-5-fulltime.png');
  const decisions = await b.getByText('Touchline decisions').isVisible();
  console.log(`full time reached on both phones ✓; break dialog seen: ${sawBreak}; decisions revealed: ${decisions}`);
} catch (e) {
  for (const [i, ctx] of browser.contexts().entries()) await ctx.pages()[0]?.screenshot({ path: `${shots ?? '.'}/e2e-failure-${i}.png` }).catch(() => {});
  throw e;
} finally {
  await browser.close();
  server.kill();
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('e2e OK');
