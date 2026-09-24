#!/usr/bin/env node
/**
 * Renders the card thumbnails that are pictures of the site's own content:
 *
 *   assets/img/work/localisation-card.webp   the Western and Chinese dashboards
 *                                            from mockups.js, split down the middle
 *   assets/img/work/vibe-coding-card.webp    the projects listed in data.js
 *                                            (Vibe Coding), as browser windows
 *
 * Like make-og.js it screenshots a real HTML page, so the thumbnails use the
 * site's own fonts, tokens, screens and content. Change a dashboard in
 * mockups.js, or a project's image or link in data.js, re-run, and the card
 * follows.
 *
 *   npm install --no-save playwright
 *   node tools/make-thumbs.js
 *
 * Set BROWSER_PATH to reuse a Chromium you already have.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img', 'work');

// Drawn at 800×500 CSS pixels (the card's 16:10) and saved at 1.5×.
const W = 800, H = 500, SCALE = 1.5;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/reader.css">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { background: #fff; font-family: var(--font-sans); color: var(--ink); }
  .scene { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; }

  /* ---- localisation: one window, two markets ---------------------------- */
  #loc { background: var(--paper-sunk); }
  .half { position: absolute; top: 0; bottom: 0; overflow: hidden; }
  .half--cairo   { left: 0; width: 50%; background: var(--paper-sunk); }
  .half--beijing { right: 0; width: 50%; background: #1A1F33; }
  /* the same window in both halves, at the same place, so the split reads
     as one screen in two skins */
  .dash { position: absolute; top: 90px; left: 44px; width: 960px; container-type: inline-size; }
  .half--beijing .dash { left: calc(44px - ${W / 2}px); }
  .dash .mk-mark { display: none; }
  .dash .mk-frame { box-shadow: 0 18px 48px rgba(20,20,26,.22); }
  .half--beijing .mk-frame { box-shadow: 0 18px 48px rgba(0,0,0,.5); }

  .split {
    position: absolute; top: 0; bottom: 0; left: 50%;
    width: 4px; margin-left: -2px; background: #fff;
    box-shadow: 0 0 0 1px rgba(20,20,26,.08), 0 0 24px rgba(0,0,0,.25);
  }
  .knob {
    position: absolute; top: 50%; left: 50%;
    display: grid; place-items: center;
    width: 76px; height: 76px; margin: -38px 0 0 -38px;
    border-radius: 50%; background: #fff; color: var(--ink);
    box-shadow: 0 6px 20px rgba(20,20,26,.28);
  }
  .knob svg { width: 40px; height: 40px; fill: none; stroke: currentColor; stroke-width: 2.4;
              stroke-linecap: round; stroke-linejoin: round; }
  .place {
    position: absolute; top: 16px;
    padding: 10px 22px; border-radius: 999px;
    font-family: var(--font-mono); font-size: 26px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
  }
  .place--cairo   { left: 44px; background: #fff; color: var(--ink); box-shadow: 0 0 0 1px var(--line), var(--sh-2); }
  .place--beijing { right: 28px; background: #EE1C25; color: #fff; box-shadow: 0 8px 22px rgba(0,0,0,.4); }

  /* ---- vibe coding: three live projects, three windows ------------------ */
  #vibe {
    background:
      radial-gradient(120% 80% at 100% 0%, rgba(217,242,75,.55), transparent 55%),
      radial-gradient(90% 90% at 0% 100%, rgba(59,37,245,.22), transparent 60%),
      var(--blue-wash);
  }
  .win {
    position: absolute; top: 50%; left: 50%;
    width: 262px; padding: 0 0 10px;
    border-radius: 18px; background: #fff;
    box-shadow: 0 0 0 1px rgba(20,20,26,.06), 0 22px 50px rgba(20,20,26,.2);
  }
  .win__bar { display: flex; align-items: center; gap: 6px; padding: 12px 14px; }
  .win__bar i { width: 10px; height: 10px; border-radius: 50%; background: #DDDAE3; }
  .win__bar span {
    flex: 1; margin-left: 6px; padding: 4px 10px; border-radius: 999px;
    background: #F0EFF4; font-family: var(--font-mono); font-size: 12px; color: #6B6B78;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .win img { display: block; width: calc(100% - 20px); margin: 0 10px; aspect-ratio: 1; object-fit: cover; border-radius: 10px; }
  .win--1 { transform: translate(-50%, -50%) translate(-205px, 26px) rotate(-8deg); }
  .win--3 { transform: translate(-50%, -50%) translate(205px, 26px) rotate(8deg); }
  .win--2 { transform: translate(-50%, -50%) translate(0, -6px) scale(1.08); z-index: 1;
            box-shadow: 0 0 0 1px rgba(20,20,26,.06), 0 30px 64px rgba(20,20,26,.28); }
  .live {
    position: absolute; top: 22px; left: 26px;
    display: inline-flex; align-items: center; gap: 12px;
    padding: 10px 22px; border-radius: 999px; background: #fff;
    box-shadow: 0 0 0 1px var(--blue-line), var(--sh-2);
    font-family: var(--font-mono); font-size: 24px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
  }
  .live i { width: 14px; height: 14px; border-radius: 50%; background: #16A34A; box-shadow: 0 0 0 4px rgba(22,163,74,.18); }
</style>
</head>
<body>
  <div class="scene" id="loc">
    <div class="half half--cairo"><div class="dash" id="cairo"></div></div>
    <div class="half half--beijing"><div class="dash" id="beijing"></div></div>
    <div class="split"></div>
    <div class="knob"><svg viewBox="0 0 24 24"><path d="m9 7-5 5 5 5M15 7l5 5-5 5"/></svg></div>
    <span class="place place--cairo">Western</span>
    <span class="place place--beijing">Chinese</span>
  </div>

  <div class="scene" id="vibe"></div>

  <script src="assets/js/mockups.js"></script>
  <script src="assets/js/data.js"></script>
  <script>
    document.getElementById('cairo').innerHTML = Mockups['dash-cairo']();
    document.getElementById('beijing').innerHTML = Mockups['dash-beijing']();

    // The first three projects that have a picture, fanned out left, centre, right.
    var vibe = WORK.filter(function (w) { return w.slug === 'vibe-coding'; })[0];
    var items = [].concat.apply([], vibe.blocks.map(function (b) {
      return b.type === 'projects' ? b.items : [];
    })).filter(function (p) { return p.img; }).slice(0, 3);
    var live = items.filter(function (p) { return p.url; }).length;
    document.getElementById('vibe').innerHTML = items.map(function (p, i) {
      return '<figure class="win win--' + (i + 1) + '">' +
        '<div class="win__bar"><i></i><i></i><i></i><span>' +
          (p.url || p.name).replace(/^https?:\\/\\//, '').replace(/\\/$/, '') + '</span></div>' +
        '<img src="' + p.img + '" alt="">' +
      '</figure>';
    }).join('') +
    (live ? '<span class="live"><i></i>' + live + ' live project' + (live > 1 ? 's' : '') + '</span>' : '');
  </script>
</body>
</html>`;

async function toWebp(page, png, quality) {
  const data = await page.evaluate(async ({ src, q }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', q).split(',')[1];
  }, { src: 'data:image/png;base64,' + png.toString('base64'), q: quality });
  return Buffer.from(data, 'base64');
}

(async () => {
  const tmp = path.join(ROOT, '__thumbs.html');
  fs.writeFileSync(tmp, HTML);
  try {
    const browser = await chromium.launch(
      process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {});
    const page = await browser.newPage({
      viewport: { width: W, height: H * 2 }, deviceScaleFactor: SCALE });
    await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);        // let the webfonts settle

    for (const [id, name] of [['loc', 'localisation-card'], ['vibe', 'vibe-coding-card']]) {
      const png = await (await page.$('#' + id)).screenshot();
      const file = path.join(OUT, name + '.webp');
      fs.writeFileSync(file, await toWebp(page, png, 0.86));
      const kb = Math.round(fs.statSync(file).size / 1024);
      console.log(`wrote ${path.relative(ROOT, file)} — ${W * SCALE}×${H * SCALE}, ${kb} KB`);
    }
    await browser.close();
  } finally {
    fs.unlinkSync(tmp);
  }
})().catch(e => { console.error(e); process.exit(1); });
