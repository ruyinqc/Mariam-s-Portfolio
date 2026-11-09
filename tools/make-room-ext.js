#!/usr/bin/env node
/**
 * Renders assets/img/desk/room-wide-ext.webp: the room photo with its left
 * and right edges carried on, soft and dimmed, for screens wider than the
 * photo. On those screens the desk keeps the proportions it has at 16:10, so
 * the photo sits in the middle, and this fills either side of it.
 *
 * Each side is the photo's own edge, mirrored outwards, blurred and dimmed
 * towards the outside, so the wall, the stripe and the desk carry on at the
 * same heights. Re-run it after replacing room-wide.webp.
 *
 *   npm install --no-save playwright
 *   node tools/make-room-ext.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'img', 'desk', 'room-wide.webp');
const OUT = path.join(ROOT, 'assets', 'img', 'desk', 'room-wide-ext.webp');
const SIDE = 0.2;          // each side, as a fraction of the photo's width

(async () => {
  const browser = await chromium.launch(
    process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {});
  const page = await browser.newPage();
  const src = 'data:image/webp;base64,' + fs.readFileSync(SRC).toString('base64');
  const data = await page.evaluate(async ({ src, SIDE }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight, s = Math.round(w * SIDE);
    const c = document.createElement('canvas');
    c.width = w + 2 * s; c.height = h;
    const g = c.getContext('2d');

    // the sides: the photo's edge, mirrored outwards, then blurred
    const side = document.createElement('canvas');
    side.width = c.width; side.height = h;
    const k = side.getContext('2d');
    k.save(); k.translate(s, 0); k.scale(-1, 1); k.drawImage(img, 0, 0, s, h, 0, 0, s, h); k.restore();
    k.save(); k.translate(s + w + s, 0); k.scale(-1, 1); k.drawImage(img, w - s, 0, s, h, 0, 0, s, h); k.restore();
    k.drawImage(img, s, 0);
    g.filter = 'blur(26px)';
    g.drawImage(side, 0, 0);
    g.filter = 'none';

    // dimmed towards the outside, as if the room falls into shadow there
    const dim = (x0, x1) => {
      const gr = g.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, 'rgba(32, 14, 4, 0)');
      gr.addColorStop(1, 'rgba(32, 14, 4, .55)');
      g.fillStyle = gr;
      g.fillRect(Math.min(x0, x1), 0, Math.abs(x1 - x0), h);
    };
    dim(s, 0);
    dim(s + w, c.width);

    // the photo itself in the middle (it sits under the sharp one on the page)
    g.drawImage(img, s, 0);
    return c.toDataURL('image/webp', 0.72);
  }, { src, SIDE });
  fs.writeFileSync(OUT, Buffer.from(data.split(',')[1], 'base64'));
  await browser.close();
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(`wrote ${path.relative(ROOT, OUT)} — ${kb} KB`);
})().catch(e => { console.error(e); process.exit(1); });
