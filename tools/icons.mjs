// Renders apps/web/public/icon.svg into the PNG icons the PWA manifest and iOS need.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
const svg = readFileSync('apps/web/public/icon.svg', 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [size, name, pad] of [[192, 'icon-192.png', 0], [512, 'icon-512.png', 0], [512, 'icon-512-maskable.png', 0.12], [180, 'apple-touch-icon.png', 0]]) {
  await page.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * (1 - 2 * pad));
  await page.setContent(`<html><body style="margin:0;background:#0b1d13;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</body></html>`);
  await page.screenshot({ path: `apps/web/public/${name}`, omitBackground: false });
}
await browser.close();
console.log('icons written');
