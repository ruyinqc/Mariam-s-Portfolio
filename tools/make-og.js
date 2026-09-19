#!/usr/bin/env node
/**
 * Renders assets/img/og-cover.png — the 1200×630 card that Google, LinkedIn,
 * Slack, WhatsApp and X show when the site is shared.
 *
 * It's built by screenshotting a real HTML page so it uses the site's own
 * fonts and colour tokens: change tokens.css and re-run, and the card follows.
 *
 *   npm install --no-save playwright
 *   node tools/make-og.js
 *
 * Set BROWSER_PATH to reuse a Chromium you already have.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img', 'og-cover.png');

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/tokens.css">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px;
    display: grid; grid-template-columns: 1.15fr 0.85fr;
    background: var(--paper); color: var(--ink);
    font-family: var(--font-sans);
    overflow: hidden;
  }
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, var(--line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--line) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(110% 90% at 80% 30%, #000 0%, transparent 70%);
  }
  .copy { position: relative; padding: 72px 0 72px 76px; align-self: center; }
  .pill {
    display: inline-flex; align-items: center; gap: 12px;
    padding: 10px 22px; margin-bottom: 30px;
    background: var(--paper-raised); border: 1px solid var(--line);
    border-radius: 999px; font-size: 20px; color: var(--muted);
  }
  .pill i { width: 12px; height: 12px; border-radius: 50%; background: var(--lime-deep); }
  .pill b { color: var(--ink); font-weight: 700; }
  h1 { font-size: 92px; font-weight: 800; line-height: .92; letter-spacing: -.05em; }
  .role {
    margin-top: 26px; font-family: var(--font-mono); font-size: 22px;
    font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
    color: var(--blue);
  }
  .facts { display: flex; gap: 34px; margin-top: 34px; font-size: 21px; color: var(--muted); }
  .facts b { font-size: 30px; font-weight: 800; letter-spacing: -.03em; color: var(--ink); }
  .facts span { display: flex; align-items: baseline; gap: 9px; }
  .shot { position: relative; overflow: hidden; }
  .shot img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%;
  }
  .edge { position: absolute; inset: 0 auto 0 0; width: 8px; background: var(--blue); }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="copy">
    <div class="pill"><i></i>Based in Egypt · <b>Open to relocation</b></div>
    <h1>Mariam<br>Emad Nabih</h1>
    <div class="role">Mid-Senior Product Designer</div>
    <div class="facts">
      <span><b>6</b> years in tech</span>
      <span><b>3.5</b> in product design</span>
      <span><b>B2B</b> SaaS</span>
    </div>
  </div>
  <div class="shot">
    <div class="edge"></div>
    <img src="assets/img/mariam-frame.webp" alt="">
  </div>
</body>
</html>`;

(async () => {
  const tmp = path.join(ROOT, '__og.html');
  fs.writeFileSync(tmp, HTML);
  try {
    const browser = await chromium.launch(
      process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {});
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);        // let the webfonts settle
    await page.screenshot({ path: OUT });
    await browser.close();
    const kb = Math.round(fs.statSync(OUT).size / 1024);
    console.log(`wrote ${path.relative(ROOT, OUT)} — 1200×630, ${kb} KB`);
  } finally {
    fs.unlinkSync(tmp);
  }
})().catch(e => { console.error(e); process.exit(1); });
