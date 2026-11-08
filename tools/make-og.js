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
  /* The desk from the top of the site, framed for a 1200×630 card:
     the room, Mariam in her chair, her name on the desk front. */
  * { box-sizing: border-box; margin: 0; }
  body {
    position: relative;
    width: 1200px; height: 630px;
    overflow: hidden;
    background: #5E2A0D;
    font-family: var(--font-sans);
  }
  .room { position: absolute; left: 0; top: -45px; width: 1200px; }
  .me {
    position: absolute; left: 612px; top: 176px; width: 300px;
    transform: translateX(-50%);
    filter: sepia(.14) saturate(1.06) brightness(.96) contrast(1.02);
  }
  .shadow {
    position: absolute; left: 612px; top: 525px; width: 280px; height: 18px;
    transform: translate(-50%, -50%); border-radius: 50%;
    background: rgba(25,10,2,.55); filter: blur(10px);
  }
  .light {
    position: absolute; inset: 0; mix-blend-mode: soft-light;
    background: linear-gradient(100deg, rgba(255,196,110,.55), rgba(255,196,110,0) 55%);
  }
  .blend {
    position: absolute; left: 0; right: 0; bottom: 0; height: 150px;
    background: linear-gradient(180deg, transparent, rgba(94,42,13,.92) 60%);
  }
  .plate { position: absolute; left: 0; right: 0; bottom: 34px; text-align: center; }
  h1 {
    font-family: var(--font-display);
    font-variation-settings: "SOFT" 100, "WONK" 1, "opsz" 144;
    font-weight: 700; font-size: 66px; line-height: 1; color: #F6ECD9;
    text-shadow: 0 2px 0 rgba(0,0,0,.3), 0 10px 30px rgba(0,0,0,.4);
  }
  .role { margin-top: 10px; font-size: 22px; color: rgba(246,236,217,.9); }
  .role b { color: var(--mustard); font-weight: 600; }
  .pill {
    position: absolute; left: 40px; top: 36px;
    display: inline-flex; align-items: center; gap: 12px;
    padding: 10px 20px; border-radius: 999px;
    background: rgba(246,236,217,.92); color: var(--ink);
    font-size: 19px; box-shadow: 0 6px 20px rgba(0,0,0,.25);
  }
  .pill i { width: 12px; height: 12px; border-radius: 50%; background: var(--green); }
  .pill b { font-weight: 700; }
</style>
</head>
<body>
  <img class="room" src="assets/img/desk/room-wide.webp" alt="">
  <div class="shadow"></div>
  <img class="me" src="assets/img/desk/mariam-front.webp" alt="">
  <div class="light"></div>
  <div class="blend"></div>
  <div class="pill"><i></i>Based in Egypt · <b>Open to relocation</b></div>
  <div class="plate">
    <h1>Mariam Emad Nabih</h1>
    <p class="role">Mid-Senior Product Designer · <b>6 years</b> in tech · <b>3.5 years</b> in product design</p>
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
