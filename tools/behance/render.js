#!/usr/bin/env node
/**
 * The Klaxs case study, photographed from the site itself, as Behance images.
 *
 *   python3 -m http.server 8080 &        # from the repository root
 *   node tools/behance/render.js
 *
 * Opens index.html#case/klaxs at 1400px, Behance's own width, lets the reader
 * grow to its full height, and cuts it into one image per part of the study.
 * The browser draws each image fresh at 3× (4200px wide), so text and shapes
 * stay sharp however far Behance or a viewer zooms in. The cover comes from
 * tools/behance/thumb.html, at Behance's 808 × 632, drawn at 2× (1616 × 1264).
 * The closing thank-you is tools/behance/thanks.html, at 1400px and 3×.
 * Everything lands in behance/klaxs/.
 *
 * The title and standfirst are not among the images: the opening video
 * carries them (see frame-video.js), so the first image starts at the facts.
 *
 * Set BROWSER_PATH to use a Chromium you already have installed.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const OUT = path.join(__dirname, '..', '..', 'behance', 'klaxs');
const EXE = process.env.BROWSER_PATH || undefined;
const WIDTH = 1400;
const EDGE = 96;   // space above the first part of each image and below the last

// Which parts of the study go in which image, by the section number on the
// site. 'title' is the pill, title and standfirst; 'facts' the Role / Timeline
// row and the Play Klaxs card; 'cover' the two pictures. A decisions section
// is cut again, one image per decision.
const IMAGES = [
  ['01-facts', ['facts']],
  ['02-cover', ['cover']],
  ['03-where-it-started', ['01', 'pull']],
  ['04-writing-the-language-down', ['02']],
  ['05-who-its-for', ['03']],
  ['06-how-it-plays', ['04']],
  ['07-the-ux-behind-the-fun', ['05']],
  ['08-ux-writing', ['06']],
  ['09-how-it-spread', ['07']],
  ['10-real-players-real-numbers', ['08']],
  ['11-what-players-told-me', ['09']],
  ['12-what-i-learned', ['10', 'pull']]
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (f.endsWith('.png')) fs.unlinkSync(path.join(OUT, f));

  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});

  // the cover
  const cover = await browser.newPage({ viewport: { width: 808, height: 632 }, deviceScaleFactor: 2 });
  await cover.goto(BASE + 'tools/behance/thumb.html', { waitUntil: 'networkidle' });
  await cover.evaluate(() => document.fonts.ready);
  await cover.screenshot({ path: path.join(OUT, '00-behance-cover.png') });
  await cover.close();
  console.log('✓ 00-behance-cover');

  // the thank-you that closes the project, in the site's own contact panel
  const thanks = await browser.newPage({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
  await thanks.goto(BASE + 'tools/behance/thanks.html', { waitUntil: 'networkidle' });
  await thanks.evaluate(() => document.fonts.ready);
  await (await thanks.$('.contact')).screenshot({ path: path.join(OUT, '13-thank-you.png') });
  await thanks.close();
  console.log('✓ 13-thank-you');

  // the study, opened in the site's own reader
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: 1000 }, deviceScaleFactor: 3, reducedMotion: 'reduce'
  });
  await page.goto(BASE + '#case/klaxs', { waitUntil: 'networkidle' });
  await page.waitForSelector('#readerTitle');
  // let the reader grow to its full height, on the page's own paper, with
  // nothing of the site's chrome around it
  await page.addStyleTag({ content: `
    body > *:not(#reader) { display: none !important; }
    html, body { overflow: visible !important; height: auto !important; background: var(--paper) !important; }
    .reader { position: static !important; }
    .reader__scrim, .reader__bar, .reader__progress, .cs__foot { display: none !important; }
    .reader__panel { position: static !important; inset: auto !important; overflow: visible !important;
                     border-radius: 0 !important; box-shadow: none !important; display: block !important; }
    .reader__scroll { overflow: visible !important; height: auto !important; }
    .reader__body { padding-top: 200px !important; padding-bottom: 200px !important; }
    .behance-off { visibility: hidden !important; }
  ` });
  await page.evaluate(async () => {
    // the reader loads its pictures lazily; load every one now, and wait
    // until each is decoded, or it photographs as an empty box
    const imgs = [...document.querySelectorAll('#readerBody img')];
    imgs.forEach(i => { i.loading = 'eager'; i.decoding = 'sync'; i.src = i.src; });
    await Promise.all(imgs.map(i => i.decode().catch(() => {})));
    await document.fonts.ready;
  });

  // where each part of the study sits on the page
  const parts = await page.evaluate(() => {
    const body = document.getElementById('readerBody');
    const box = el => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; };
    const out = [];
    let head = null;
    // every piece that can be hidden gets a name, so each image shows only its own
    let n = 0;
    const tag = el => { el.dataset.part = 'p' + (n++); return el.dataset.part; };
    // the top of the study comes in two runs of elements: the title, then the facts
    const run = el => el.matches('.cs__kind, .cs__title, .cs__standfirst') ? 'title'
      : el.matches('.cs__meta, .cs__projects') ? 'facts' : null;
    for (const el of body.children) {
      const key = run(el);
      if (head && head.key !== key) { out.push(head); head = null; }
      if (key) {
        const b = box(el);
        head = head ? { ...head, bottom: b.bottom, ids: [...head.ids, tag(el)] } : { key, ...b, ids: [tag(el)] };
        continue;
      }
      if (el.matches('.cs__cover')) out.push({ key: 'cover', ...box(el), ids: [tag(el)] });
      else if (el.matches('.cs__pull')) out.push({ key: 'pull', ...box(el), ids: [tag(el)] });
      else if (el.matches('section')) {
        const num = (el.querySelector('.cs__h span') || {}).textContent || '';
        const decs = [...el.querySelectorAll('.dec__item')];
        if (!decs.length) { out.push({ key: num.trim(), ...box(el), ids: [tag(el)] }); continue; }
        // a decisions section: its heading and intro, then each decision on its own
        const headIds = [...el.children].filter(c => !c.contains(decs[0])).map(tag);
        const items = decs.map(d => ({ ...box(d), ids: [tag(d)] }));
        out.push({ key: num.trim(), ...box(el), headIds, items });
      }
    }
    return out;
  });

  const all = parts.flatMap(p => [...(p.ids || []), ...(p.headIds || []), ...(p.items || []).flatMap(d => d.ids)]);
  const shoot = async (name, top, bottom, ids) => {
    await page.evaluate(([all, keep]) => all.forEach(id =>
      document.querySelector('[data-part="' + id + '"]').classList.toggle('behance-off', !keep.includes(id))), [all, ids]);
    const clip = { x: 0, y: Math.floor(top - EDGE), width: WIDTH, height: Math.ceil(bottom - top + 2 * EDGE) };
    await page.screenshot({ path: path.join(OUT, name + '.png'), clip, fullPage: true });
    console.log('✓', name);
  };

  let i = 0;
  for (const [name, keys] of IMAGES) {
    const group = [];
    for (const k of keys) {
      while (i < parts.length && parts[i].key !== k) i++;
      if (i === parts.length) throw new Error('No part "' + k + '" for ' + name);
      group.push(parts[i++]);
    }
    const first = group[0], last = group[group.length - 1];
    if (first.items && first.items.length) {
      // the section's heading rides with its first decision
      await shoot(name + '-1', first.top, first.items[0].bottom, [...first.headIds, ...first.items[0].ids]);
      for (let d = 1; d < first.items.length; d++) {
        await shoot(name + '-' + (d + 1), first.items[d].top, first.items[d].bottom, first.items[d].ids);
      }
    } else {
      await shoot(name, first.top, last.bottom, group.flatMap(g => g.ids));
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
