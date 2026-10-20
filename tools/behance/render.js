#!/usr/bin/env node
/**
 * Renders the Klaxs case study as Behance image modules.
 *
 *   python3 -m http.server 8080 &        # from the repository root
 *   node tools/behance/render.js
 *
 * Every <section data-file> in tools/behance/klaxs.html becomes
 * behance/klaxs/<data-file>.png, 1400px wide drawn at 2× (2800px), so text
 * stays sharp on a retina screen once Behance scales it down.
 *
 * Set BROWSER_PATH to use a Chromium you already have installed.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const OUT = path.join(__dirname, '..', '..', 'behance', 'klaxs');
const EXE = process.env.BROWSER_PATH || undefined;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto(BASE + 'tools/behance/klaxs.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // one panel on the page at a time, at the top-left corner, so no edge of
  // the page behind it lands in the image
  await page.addStyleTag({ content: 'body { margin: 0 } section[data-file] { margin: 0 !important }' });
  const names = await page.$$eval('section[data-file]', els => els.map(e => e.dataset.file));
  for (const name of names) {
    const box = await page.evaluate(n => {
      document.querySelectorAll('section[data-file]').forEach(s => {
        s.style.display = s.dataset.file === n ? '' : 'none';
      });
      const r = document.querySelector('section[data-file="' + n + '"]').getBoundingClientRect();
      return { x: 0, y: 0, width: Math.round(r.width), height: Math.floor(r.height) };
    }, name);
    await page.screenshot({ path: path.join(OUT, name + '.png'), clip: box, fullPage: true });
    console.log('✓', name);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
