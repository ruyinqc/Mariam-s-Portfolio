#!/usr/bin/env node
/**
 * End-to-end checks: accessibility, the reader's dialog behaviour, the
 * contact form (both delivery paths), reduced motion, and a no-JavaScript
 * fallback. Drives a real browser, because half of this is unobservable
 * from the source.
 *
 * The site itself has no dependencies. This file does:
 *
 *   npm  install --no-save playwright
 *   npx  playwright install chromium        # skip if a browser is already set up
 *   python3 -m http.server 8080 &           # from the repository root
 *   node tools/check.js
 *
 * Exits non-zero on any failure, so it works as a CI gate.
 *
 * Set BROWSER_PATH to use a Chromium you already have installed.
 */

const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const RELAY = 'https://relay.test/';
const EXE = process.env.BROWSER_PATH || undefined;

const results = [];
const check = (name, pass, detail = '') =>
  results.push({ name, pass, detail });

async function run() {
  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});

  /* ==================================================================
     1 — Keyboard and structure
     ================================================================== */
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  let page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') pageErrors.push('console: ' + m.text()); });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  await page.keyboard.press('Tab');
  await page.waitForTimeout(450);
  const skip = await page.evaluate(() => {
    const a = document.activeElement;
    return { cls: a.className, top: a.getBoundingClientRect().top };
  });
  check('skip link is the first tab stop', skip.cls === 'skip-link');
  check('skip link is visible once focused', skip.top > -10, `top=${Math.round(skip.top)}`);

  const noRing = await page.evaluate(() => {
    const sel = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const bad = [];
    for (const el of document.querySelectorAll(sel)) {
      if (!el.offsetParent && el.className !== 'skip-link') continue;
      // the nav is deliberately hidden while the desk fills the screen
      if (getComputedStyle(el).visibility === 'hidden') continue;
      el.focus();
      const cs = getComputedStyle(el);
      const ring = (cs.boxShadow && cs.boxShadow !== 'none') ||
                   (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0);
      if (!ring) bad.push(el.className || el.tagName);
    }
    return bad;
  });
  check('every control shows a focus ring', noRing.length === 0, noRing.slice(0, 5).join(', '));

  const small = await page.evaluate(() =>
    [...document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea')]
      .filter(e => e.offsetParent)
      .map(e => { const r = e.getBoundingClientRect();
                  return { n: e.className || e.tagName, w: Math.round(r.width), h: Math.round(r.height) }; })
      .filter(x => x.w < 24 || x.h < 24));
  check('all targets clear 24×24 (SC 2.5.8)', small.length === 0, JSON.stringify(small.slice(0, 3)));

  const heads = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3,h4')].map(h => +h.tagName[1]));
  const jump = heads.find((h, i) => i > 0 && h - heads[i - 1] > 1);
  check('no skipped heading levels', !jump);
  check('exactly one h1', heads.filter(h => h === 1).length === 1);

  const noAlt = await page.evaluate(() =>
    [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length);
  check('every image has an alt attribute', noAlt === 0);

  const overflow = await page.evaluate(() => ({
    s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  check('no horizontal overflow at 1440', overflow.s <= overflow.c);

  /* ------------------------------------------------------------------
     The desk: six folders, her eyes, the cursor, folders that open over it
     ------------------------------------------------------------------ */
  await page.evaluate(() => { document.activeElement.blur(); document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); });
  await page.waitForTimeout(500);
  const desk = await page.evaluate(() => {
    const links = [...document.querySelectorAll('#folders .folder')];
    return {
      count: links.length,
      targets: links.every(a => document.querySelector(a.getAttribute('href'))),
      curved: links.some(a => getComputedStyle(a.parentElement).position === 'absolute'),
      navHidden: getComputedStyle(document.getElementById('nav')).display === 'none',
      fits: document.documentElement.scrollHeight <= innerHeight + 1
    };
  });
  check('the desk has six folders', desk.count === 6);
  check('every folder links to a section that exists', desk.targets);
  check('the folders are laid on a curve', desk.curved);
  check('the whole desk fits on one screen', desk.fits);

  const geo = await page.evaluate(() => {
    const box = el => el.getBoundingClientRect();
    const range = el => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
    const name = range(document.querySelector('.desk__name'));
    const role = range(document.querySelector('.desk__role'));
    const me = box(document.querySelector('.desk__me'));
    const f = [...document.querySelectorAll('.folders__item')].map(box);
    const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    let overlap = 0;
    for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) if (hit(f[i], f[j])) overlap++;
    const end = f[0], last = f[f.length - 1];
    return {
      nameMid: Math.round((name.top + name.bottom) / 2 - me.bottom),
      roleTop: Math.round(role.top - me.bottom),
      coversText: f.filter(r => hit(r, name) || hit(r, role)).length,
      overlap,
      beside: end.right < me.left && last.left > me.right &&
              end.top < me.bottom && last.top < me.bottom,
      width: Math.round(f[2].width),
      overHead: Math.round(me.top),
      underFolders: Math.round(innerHeight - Math.max(...f.map(r => r.bottom)))
    };
  });
  // her arms meet the desk at the bottom of her photo (.desk__me)
  check('her name sits across the desk, in front of her arms', geo.nameMid < -20 && geo.nameMid > -140, `${geo.nameMid}px from her arms`);
  check('the subtitle sits just under her hands', geo.roleTop >= -4 && geo.roleTop < 30, `${geo.roleTop}px`);
  check('no folder covers her name', geo.coversText === 0, String(geo.coversText));
  check('no two folders overlap', geo.overlap === 0, String(geo.overlap));
  check('the end folders sit beside her, up at the desk', geo.beside);
  check('the folders are big', geo.width >= 180, `${geo.width}px`);
  check('the folders keep clear of the bottom of the screen', geo.underFolders >= 36, `${geo.underFolders}px`);
  check('no big empty band over her head', geo.overHead <= 950 * 0.1, `${geo.overHead}px`);

  const corner = await page.evaluate(() => {
    const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const tag = document.querySelector('.desk__status');
    const t = tag && tag.getBoundingClientRect();
    const f = [...document.querySelectorAll('.folders__item')].map(el => el.getBoundingClientRect());
    // the four folders in the row under her hands, left to right
    const row = f.slice(1, -1).sort((a, b) => a.left - b.left);
    return {
      tag: !!t && t.width > 0 && innerWidth - t.right < 48 && t.top < 48 && /Open to relocation/.test(tag.textContent),
      tagAt: t ? `${Math.round(innerWidth - t.right)}px from the right, ${Math.round(t.top)}px from the top` : 'missing',
      tagClear: !!t && f.every(b => !hit(b, t)),
      roleSize: parseFloat(getComputedStyle(document.querySelector('.desk__role')).fontSize),
      gaps: row.slice(1).map((b, i) => Math.round(b.left - row[i].right))
    };
  });
  check('the "open to relocation" tag sits in the top-right corner', corner.tag, corner.tagAt);
  check('no folder covers that tag', corner.tagClear);
  check('the subtitle is big enough to read', corner.roleSize >= 20, `${corner.roleSize}px`);
  check('the folders in the row sit close together', corner.gaps.length === 3 && corner.gaps.every(g => g >= 8 && g <= 40),
        `${corner.gaps.join(', ')}px`);

  // Nothing should run while nobody is touching the page.
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  const busy = async () => (await cdp.send('Performance.getMetrics')).metrics.find(m => m.name === 'TaskDuration').value;
  await page.mouse.move(700, 120);
  await page.waitForTimeout(600);
  const b0 = await busy();
  await page.waitForTimeout(2000);
  const idle = Math.round((await busy() - b0) * 1000);
  // An idle desk measures ~3ms. Anything that repaints every frame (a
  // box-shadow pulse did) costs ~150ms, so the bar sits well under that.
  check('the desk does no work while idle', idle < 50, `${idle}ms busy in 2s`);
  check('the folders are the navigation (no nav bar over the desk)', desk.navHidden);

  const certFolder = await page.$('#folders .folder[href="#proof"]');
  const cb = await certFolder.boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.waitForTimeout(500);
  const hover = await page.evaluate(() => ({
    frame: document.getElementById('deskSel').classList.contains('is-on'),
    label: document.querySelector('.desk__sel-name').textContent
  }));
  check('the selection frame wraps that folder', hover.frame && /Certificates/.test(hover.label), hover.label);

  await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.waitForTimeout(1400);
  const folio = await page.evaluate(() => {
    const root = document.getElementById('folio'), sheet = document.getElementById('folioSheet');
    return {
      open: !root.hidden, folder: root.dataset.folder, hash: location.hash,
      holds: sheet.contains(document.getElementById('proof')),
      dialog: sheet.getAttribute('role') === 'dialog' && sheet.getAttribute('aria-modal') === 'true',
      name: sheet.getAttribute('aria-label'),
      deskInert: document.getElementById('top').inert === true,
      focusInside: sheet.contains(document.activeElement),
      scrolled: scrollY
    };
  });
  check('a folder opens over the desk, not down the page', folio.open && folio.folder === 'proof' && folio.holds && folio.scrolled === 0,
        `${folio.hash} folder=${folio.folder} scrollY=${folio.scrolled}`);
  check('the open folder is a named modal dialog', folio.dialog && folio.name === 'Certificates', folio.name);
  check('the desk behind it is inert', folio.deskInert);
  check('focus moves into the folder', folio.focusInside);

  let left = false;
  for (let i = 0; i < 30 && !left; i++) {
    await page.keyboard.press('Tab');
    left = !await page.evaluate(() => document.getElementById('folioSheet').contains(document.activeElement));
  }
  check('focus is trapped in the open folder', !left);

  await page.click('.folio__tab[href="#contact"]');
  await page.waitForTimeout(500);
  const tab = await page.evaluate(() => ({ folder: document.getElementById('folio').dataset.folder, hash: location.hash,
    holds: document.getElementById('folioSheet').contains(document.getElementById('contact')) }));
  check('a tab switches folder without closing it', tab.folder === 'contact' && tab.holds && tab.hash === '#contact', tab.hash);

  await page.goBack();
  await page.waitForTimeout(800);
  const shut = await page.evaluate(() => ({
    hidden: document.getElementById('folio').hidden, hash: location.hash,
    home: document.getElementById('proof').parentElement.id === 'main',
    focus: document.activeElement.getAttribute('href'),
    deskInert: document.getElementById('top').inert
  }));
  check('Back closes the folder in one step', shut.hidden && shut.hash === '', shut.hash);
  check('its sections go back where they live', shut.home);
  check('focus returns to the folder that opened it', shut.focus === '#proof', shut.focus);

  // That folder keeps focus — but once the mouse moves over empty desk, the
  // frame follows the mouse and lets go of it.
  await page.mouse.move(700, 20);     // the room above her head: no folder there
  await page.mouse.move(720, 32, { steps: 4 });
  await page.waitForTimeout(500);
  check('with the mouse on empty desk, no folder keeps the frame',
    await page.evaluate(() => !document.getElementById('deskSel').classList.contains('is-on')));
  check('the desk is handed back', shut.deskInert === false);

  await page.evaluate(() => { location.hash = '#words'; });
  await page.waitForTimeout(900);
  const deep = await page.evaluate(() => ({ folder: document.getElementById('folio').dataset.folder,
    open: !document.getElementById('folio').hidden }));
  check('a link to a section opens the folder it lives in', deep.open && deep.folder === 'path', deep.folder);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  check('Escape closes the folder', await page.evaluate(() => document.getElementById('folio').hidden));

  // A study read from a folder opened on the desk. Closing the study goes
  // back to the folder, where you left it, and one × then closes the
  // folder. (Closing a study used to leave a second copy of the folder's
  // entry in history, so the × had to be pressed twice.)
  const folderOpen = () => page.evaluate(() => !document.getElementById('folio').hidden);
  const readerOpen = () => page.evaluate(() => !document.getElementById('reader').hidden);
  await page.evaluate(() => { history.replaceState(null, '', location.pathname); scrollTo(0, 0); });
  await page.click('#folders .folder[href="#work"]:not([data-case])', { force: true });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { document.getElementById('folioScroll').scrollTop = 300; });
  await page.click('.pincard__hit[href="#case/klaxs"]');
  await page.waitForTimeout(800);
  const at = await page.evaluate(() => document.getElementById('folioScroll').scrollTop);
  await page.click('#readerClose');
  await page.waitForTimeout(800);
  const backTo = { hash: await page.evaluate(() => location.hash), folio: await folderOpen(), reader: await readerOpen(),
                   kept: await page.evaluate(() => document.getElementById('folioScroll').scrollTop) };
  check('Back from a study lands in its folder, where you left it',
        backTo.folio && !backTo.reader && backTo.hash === '#work' && at > 0 && Math.abs(backTo.kept - at) < 2,
        `${backTo.hash}, scrolled ${at} → ${backTo.kept}`);
  await page.click('#folioClose');
  await page.waitForTimeout(800);
  const gone = { hash: await page.evaluate(() => location.hash), folio: await folderOpen() };
  check('…and one × then closes the folder', !gone.folio && gone.hash === '', JSON.stringify(gone));

  // The browser's Back walks the same way: study, then folder, then desk.
  await page.click('#folders .folder[href="#work"]:not([data-case])', { force: true });
  await page.waitForTimeout(1200);
  await page.click('.pincard__hit[href="#case/klaxs"]');
  await page.waitForTimeout(800);
  await page.goBack();
  await page.waitForTimeout(800);
  const b1 = { hash: await page.evaluate(() => location.hash), folio: await folderOpen(), reader: await readerOpen() };
  await page.goBack();
  await page.waitForTimeout(800);
  const b2 = { hash: await page.evaluate(() => location.hash), folio: await folderOpen() };
  check("the browser's Back goes study → folder → desk",
        !b1.reader && b1.folio && b1.hash === '#work' && !b2.folio && b2.hash === '', `${JSON.stringify(b1)} ${JSON.stringify(b2)}`);

  await page.evaluate(() => { history.replaceState(null, '', location.pathname); scrollTo(0, 0); });
  await page.waitForTimeout(400);
  await page.click('#folders .folder[data-case="vibe-coding"]', { force: true });  // the folders float
  await page.waitForTimeout(1200);
  const live = await page.evaluate(() => ({
    hash: location.hash, open: !document.getElementById('reader').hidden,
    counter: !document.getElementById('readerCount').hidden,
    arrows: !document.getElementById('readerNav').hidden,
    back: document.getElementById('readerClose').textContent.replace(/\s+/g, ' ').trim(),
    foot: (document.querySelector('#readerBody [data-step="back"]') || {}).textContent || ''
  }));
  check('Live Projects opens the vibe coding study', live.open && live.hash === '#case/vibe-coding', live.hash);
  // It is the only one of its kind: nothing to count, nowhere to step.
  check('a one-off has no counter and no arrows', !live.counter && !live.arrows);
  check('Back says it goes to the desk', live.back === 'Back to Desk' && /Back to the desk/.test(live.foot),
        `${live.back} | ${live.foot.trim()}`);
  await page.click('#readerClose');
  await page.waitForTimeout(700);
  const home = await page.evaluate(() => ({
    reader: !document.getElementById('reader').hidden, folio: !document.getElementById('folio').hidden, hash: location.hash }));
  check('…and it does', !home.reader && !home.folio && home.hash === '', JSON.stringify(home));
  await page.evaluate(() => { history.replaceState(null, '', location.pathname); scrollTo(0, 0); });
  await page.waitForTimeout(300);

  /* ------------------------------------------------------------------
     The path, inside its folder: a row that moves sideways
     ------------------------------------------------------------------ */
  await page.evaluate(() => { location.hash = '#path'; });
  await page.waitForTimeout(1000);
  const rowX = () => page.evaluate(() => document.getElementById('lineView').scrollLeft);
  const inFolder = await page.evaluate(() => ({
    pinned: document.getElementById('line').classList.contains('line--pinned'),
    room: document.getElementById('lineView').scrollWidth > document.getElementById('lineView').clientWidth
  }));
  check('in its folder the path is a sideways row, not pinned', !inFolder.pinned && inFolder.room);

  const vb = await (await page.$('#lineView')).boundingBox();
  const x0 = await rowX();
  await page.mouse.move(vb.x + vb.width / 2, vb.y + vb.height / 2);
  await page.mouse.wheel(300, 0);
  await page.waitForTimeout(900);
  const x1 = await rowX();
  check('a sideways scroll moves the path', x1 - x0 > 150, `${x0} → ${x1}`);

  await page.mouse.move(vb.x + vb.width / 2, vb.y + vb.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(vb.x + vb.width / 2 + i * 25, vb.y + vb.height / 2); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.waitForTimeout(900);
  const x2 = await rowX();
  check('dragging moves the path', x1 - x2 > 100, `${x1} → ${x2}`);

  await page.click('#lineNext');
  await page.waitForTimeout(1000);
  const x3 = await rowX();
  check('the arrow buttons step along the path', x3 - x2 > 20, `${x2} → ${x3}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  await page.evaluate(() => { history.replaceState(null, '', location.pathname); scrollTo(0, 0); document.documentElement.style.scrollBehavior = ''; });

  /* ==================================================================
     2 — The reader dialog
     ================================================================== */
  await page.evaluate(() => { location.hash = '#case/invoices-payments'; });
  await page.waitForTimeout(700);

  const dlg = await page.evaluate(() => {
    const panel = document.getElementById('readerPanel');
    const label = document.getElementById(panel.getAttribute('aria-labelledby'));
    const main = document.querySelector('#main');
    return {
      role: panel.getAttribute('role'), modal: panel.getAttribute('aria-modal'),
      name: label && label.textContent.trim(),
      inert: main.inert, hidden: main.getAttribute('aria-hidden'),
      locked: document.body.classList.contains('is-locked'),
      focusInside: panel.contains(document.activeElement)
    };
  });
  check('reader is role=dialog + aria-modal', dlg.role === 'dialog' && dlg.modal === 'true');
  check('reader has an accessible name', !!dlg.name, dlg.name);
  check('background is inert and aria-hidden', dlg.inert === true && dlg.hidden === 'true');
  check('page scroll is locked while open', dlg.locked);
  check('focus moves into the dialog', dlg.focusInside);

  let escaped = false;
  for (let i = 0; i < 40 && !escaped; i++) {
    await page.keyboard.press('Tab');
    escaped = !await page.evaluate(() =>
      document.getElementById('readerPanel').contains(document.activeElement));
  }
  check('focus is trapped on Tab', !escaped);

  escaped = false;
  for (let i = 0; i < 25 && !escaped; i++) {
    await page.keyboard.press('Shift+Tab');
    escaped = !await page.evaluate(() =>
      document.getElementById('readerPanel').contains(document.activeElement));
  }
  check('focus is trapped on Shift+Tab', !escaped);

  const before = await page.evaluate(() => location.hash);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => location.hash);
  check('arrow keys step between studies', before !== after, `${before} → ${after}`);

  // The counter and the arrows belong to the case studies alone: four of
  // them, in a loop, never stepping into the argument or the vibe coding.
  const tour = [];
  for (let i = 0; i < 4; i++) {
    tour.push(await page.evaluate(() => ({
      hash: location.hash, kind: document.getElementById('readerKind').textContent,
      count: document.getElementById('readerIndex').textContent + '/' + document.getElementById('readerTotal').textContent
    })));
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
  }
  const round = await page.evaluate(() => location.hash);
  check('the counter counts case studies only', tour.every(s => s.kind === 'Case study' && /^[1-4]\/4$/.test(s.count)),
        tour.map(s => s.count).join(' '));
  check('the arrows go round the case studies and come back', round === tour[0].hash &&
        new Set(tour.map(s => s.hash)).size === 4, tour.map(s => s.hash.replace('#case/', '')).join(' → '));

  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  const closed = await page.evaluate(() => ({
    hidden: document.getElementById('reader').hidden,
    hash: location.hash,
    inert: document.querySelector('#main').inert,
    locked: document.body.classList.contains('is-locked')
  }));
  check('Escape closes the reader', closed.hidden === true);
  check('the hash is cleared on close', closed.hash === '');
  check('the background is handed back', closed.inert === false && !closed.locked);

  await page.evaluate(() => { location.hash = '#work'; });
  await page.waitForTimeout(900);
  check('the work cards sit straight', await page.evaluate(() =>
    [...document.querySelectorAll('.pincard')].every(c => {
      const cs = getComputedStyle(c);
      return (cs.rotate === 'none' || cs.rotate === '0deg') && (cs.transform === 'none' || /^matrix\(1, 0, 0, 1,/.test(cs.transform));
    })));
  const card = await page.$('.pincard__hit');
  await card.focus();
  await card.press('Enter');
  await page.waitForTimeout(700);
  const over = await page.evaluate(() => {
    const a = document.getElementById('folioSheet').getBoundingClientRect();
    const b = document.getElementById('readerPanel').getBoundingClientRect();
    return {
      same: ['left', 'top', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) <= 2),
      sizes: `folder ${Math.round(a.width)}×${Math.round(a.height)}, study ${Math.round(b.width)}×${Math.round(b.height)}`,
      back: document.getElementById('readerClose').textContent.replace(/\s+/g, ' ').trim(),
      count: document.getElementById('readerKind').textContent + ' ' +
             document.getElementById('readerIndex').textContent + '/' + document.getElementById('readerTotal').textContent
    };
  });
  check('a study opens the same size as the folder', over.same, over.sizes);
  check('a case study is counted among the case studies', over.count === 'Case study 1/4', over.count);
  check('Back names the folder it goes back to', over.back === 'Back to Case Studies', over.back);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  const restored = await page.evaluate(() => ({ cls: document.activeElement.className, hash: location.hash }));
  check('focus returns to the card that opened it', restored.cls.includes('pincard__hit'));
  check('closing a study opened in a folder leaves you in that folder', restored.hash === '#work', restored.hash);

  // The argument is a one-off too, opened from the folder: its Back, at the
  // top and at the foot, returns to the folder.
  await page.click('.pincard__hit[href="#case/ux-argument-localisation"]');
  await page.waitForTimeout(700);
  const arg = await page.evaluate(() => ({
    counter: !document.getElementById('readerCount').hidden,
    foot: (document.querySelector('#readerBody [data-step="back"]') || {}).textContent || ''
  }));
  check('the argument stands alone, with a way back to the folder', !arg.counter && /Back to Case Studies/.test(arg.foot), arg.foot.trim());
  await page.click('#readerBody [data-step="back"]');
  await page.waitForTimeout(700);
  check('…which leaves you in the folder', await page.evaluate(() =>
    document.getElementById('reader').hidden && !document.getElementById('folio').hidden && location.hash === '#work'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);

  // A slug that does not exist must not leave a broken-looking URL behind.
  await page.evaluate(() => { location.hash = '#case/does-not-exist'; });
  await page.waitForTimeout(500);
  const bogus = await page.evaluate(() => ({
    hash: location.hash, open: !document.getElementById('reader').hidden }));
  check('an unknown slug is cleaned up, not opened', bogus.hash === '' && !bogus.open);

  /* ==================================================================
     3 — Contact form
     ================================================================== */
  await page.evaluate(() => { location.hash = '#contact'; });
  await page.waitForTimeout(900);
  await page.click('#formSubmit');
  await page.waitForTimeout(300);

  const invalid = await page.evaluate(() => ({
    fields: document.querySelectorAll('.field[data-invalid]').length,
    aria: document.querySelectorAll('[aria-invalid="true"]').length,
    shown: [...document.querySelectorAll('.field__err')].filter(e => !e.hidden).length,
    status: document.getElementById('formStatus').textContent,
    focus: document.activeElement.id
  }));
  check('an empty submit flags all three fields', invalid.fields === 3);
  check('aria-invalid is set on each one', invalid.aria === 3);
  check('errors are shown and a status is announced', invalid.shown === 3 && invalid.status.length > 0);
  check('focus lands on the first bad field', invalid.focus === 'f-name');

  await page.fill('#f-name', 'Jane Okafor');
  await page.fill('#f-email', 'not-an-email');
  await page.fill('#f-msg', 'We are hiring a senior product designer for our billing team.');
  await page.click('#formSubmit');
  await page.waitForTimeout(250);
  check('a malformed email is still caught',
    await page.evaluate(() => document.querySelectorAll('.field[data-invalid]').length) === 1);

  await page.fill('#f-email', 'jane@company.com');
  await page.waitForTimeout(150);
  check('the error clears the moment it is fixed',
    await page.evaluate(() => document.querySelectorAll('.field[data-invalid]').length) === 0);

  // With no endpoint configured, delivery must fall back to the visitor's
  // mail client rather than silently dropping the message.
  const keySet = await page.evaluate(() => !!window.SITE.contactEndpoint);
  if (!keySet) {
    await page.click('#formSubmit');
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => document.getElementById('formStatus').textContent);
    check('with no endpoint, the form falls back to a mail client',
      /email app/i.test(st), st);
  }

  // And with an endpoint, it posts to the relay and reports success.
  await page.route(RELAY, route =>
    route.fulfill({ status: 200, contentType: 'application/json',
                    body: JSON.stringify({ success: true, message: 'ok' }) }));
  await page.evaluate(() => { window.SITE.contactEndpoint = 'https://relay.test/'; });
  await page.fill('#f-name', 'Jane Okafor');
  await page.fill('#f-email', 'jane@company.com');
  await page.fill('#f-msg', 'We are hiring a senior product designer for our billing team.');
  await page.click('#formSubmit');
  await page.waitForTimeout(900);
  const sent = await page.evaluate(() => ({
    status: document.getElementById('formStatus').textContent,
    tone: document.getElementById('formStatus').getAttribute('data-tone'),
    name: document.getElementById('f-name').value
  }));
  check('with an endpoint, a successful send is confirmed and the form resets',
    sent.tone === 'ok' && sent.name === '', sent.status);

  // Everything up to here should have been silent. Snapshot now, because the
  // next scenario deliberately provokes a 500 and the console error it logs
  // is the correct behaviour, not a regression.
  check('no uncaught page errors during normal use', pageErrors.length === 0,
    pageErrors.slice(0, 3).join(' | '));
  const errorsBeforeFailureTest = pageErrors.length;

  // A server failure must not swallow the message either.
  await page.unroute(RELAY);
  await page.route(RELAY, route =>
    route.fulfill({ status: 500, contentType: 'application/json',
                    body: JSON.stringify({ success: false, message: 'boom' }) }));
  await page.fill('#f-name', 'Jane Okafor');
  await page.fill('#f-email', 'jane@company.com');
  await page.fill('#f-msg', 'We are hiring a senior product designer for our billing team.');
  await page.click('#formSubmit');
  await page.waitForTimeout(700);
  const afterError = await page.evaluate(() => document.getElementById('formStatus').textContent);
  check('a failed send falls back rather than losing the message',
    /email app/i.test(afterError), afterError);
  check('a failed send is logged for debugging',
    pageErrors.slice(errorsBeforeFailureTest).some(e => e.includes('[contact]')));
  await ctx.close();

  /* ==================================================================
     4 — Responsive
     ================================================================== */
  for (const [w, h] of [[375, 812], [768, 1024], [1280, 900], [1920, 1080]]) {
    const c = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 600 });
    const pg = await c.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(800);
    const o = await pg.evaluate(() => ({
      s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
    check(`no horizontal overflow at ${w}px`, o.s <= o.c, `${o.s} vs ${o.c}`);

    // Every folder fits its sheet, and its own tab is in view in the tab row
    // (which scrolls sideways on a phone).
    const wide = [];
    let sheetW = 0;
    for (const key of ['about', 'work', 'path', 'proof', 'contact']) {
      await pg.evaluate(k => { location.hash = '#' + k; }, key);
      await pg.waitForTimeout(key === 'about' ? 900 : 500);
      const f = await pg.evaluate(() => {
        const s = document.getElementById('folioScroll');
        const sheet = document.getElementById('folioSheet').getBoundingClientRect();
        const t = document.querySelector('.folio__tab[aria-current]');
        const a = t.getBoundingClientRect(), row = t.parentNode.getBoundingClientRect();
        return { sw: s.scrollWidth, cw: s.clientWidth, sheetW: sheet.width,
                 inside: sheet.left >= 0 && sheet.right <= innerWidth,
                 tab: a.left >= row.left - 1 && a.right <= row.right + 1 };
      });
      sheetW = f.sheetW;
      if (f.sw > f.cw || !f.inside || !f.tab) wide.push(`${key}: ${f.sw}/${f.cw}${f.inside ? '' : ' off screen'}${f.tab ? '' : ' tab hidden'}`);
    }
    check(`every folder fits the screen at ${w}px`, wide.length === 0, wide.join(' | '));
    await pg.evaluate(() => { location.hash = ''; });
    await pg.waitForTimeout(700);

    await pg.evaluate(() => { location.hash = '#case/invoices-payments'; });
    await pg.waitForTimeout(700);
    const r = await pg.evaluate(() => {
      const s = document.getElementById('readerScroll');
      return { sw: s.scrollWidth, cw: s.clientWidth, w: document.getElementById('readerPanel').getBoundingClientRect().width };
    });
    check(`reader does not scroll sideways at ${w}px`, r.sw <= r.cw);
    check(`the reader is as wide as a folder at ${w}px`, Math.abs(r.w - sheetW) <= 2, `${Math.round(r.w)} vs ${Math.round(sheetW)}`);
    check(`no page errors at ${w}px`, errs.length === 0, errs.join(' | '));
    await c.close();
  }

  // On a phone the "open to relocation" tag sits right above her head; the
  // desk keeps her head clear of it, even on the shortest screens.
  const covered = [];
  for (const [w, h] of [[360, 640], [375, 667], [390, 664], [430, 740]]) {
    const c = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const pg = await c.newPage();
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(700);
    const g = await pg.evaluate(() => {
      const t = document.querySelector('.desk__status').getBoundingClientRect();
      const me = document.getElementById('deskMe').getBoundingClientRect();
      const across = t.left < me.right - me.width * 0.2 && t.right > me.left + me.width * 0.2;
      return { gap: Math.round(me.top - t.bottom), across };
    });
    if (g.across && g.gap < 0) covered.push(`${w}x${h}: ${g.gap}px`);
    await c.close();
  }
  check('on a phone the corner tag never covers her head', covered.length === 0, covered.join(' | '));

  /* ==================================================================
     5 — Reduced motion
     ================================================================== */
  ctx = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
  page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1100);

  const rm = await page.evaluate(() => {
    window.__snap = () => [...document.querySelectorAll('[data-parallax], .pincard, .hang__photo')]
      .map(e => getComputedStyle(e).transform);
    window.__first = window.__snap();
    return {
      motion: getComputedStyle(document.documentElement).getPropertyValue('--motion').trim(),
      drift: [...document.querySelectorAll('.pincard')]
        .map(e => e.style.getPropertyValue('--drift-y')).filter(Boolean).length,
      revealed: document.querySelectorAll('[data-reveal].is-in').length
    };
  });
  await page.waitForTimeout(1200);
  const drifted = await page.evaluate(() =>
    window.__snap().filter((v, i) => v !== window.__first[i]).length);

  check('--motion is switched off', rm.motion === '0');
  check('no drift is written to the cards', rm.drift === 0);
  check('nothing moves over 1.2 seconds', drifted === 0);
  check('content is still revealed, never hidden by motion', rm.revealed > 0);

  await page.evaluate(() => { location.hash = '#case/invoices-payments'; });
  await page.waitForTimeout(500);
  check('the reader still opens', await page.evaluate(() =>
    !document.getElementById('reader').hidden &&
    getComputedStyle(document.getElementById('readerPanel')).opacity === '1'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('the reader still closes',
    await page.evaluate(() => document.getElementById('reader').hidden === true));
  await ctx.close();

  /* ==================================================================
     6 — Without JavaScript
     ================================================================== */
  ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 950 } });
  page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  const text = await page.textContent('body');
  check('the desk still renders with JavaScript off',
    await page.isVisible('.desk__name') && await page.isVisible('#folders .folder'));
  check('…and its folders are plain links',
    await page.evaluate(() => [...document.querySelectorAll('#folders .folder')]
      .every(a => a.tagName === 'A' && a.getBoundingClientRect().height > 100)));
  check('the page still says who she is with JavaScript off',
    text.includes('Mariam') && text.includes('Open to relocation'));
  const row = await page.evaluate(() => {
    const v = document.getElementById('lineView');
    return { sw: v.scrollWidth, cw: v.clientWidth, ox: getComputedStyle(v).overflowX };
  });
  check('the path still lists every stop with JavaScript off',
    ['Product Designer', 'Software Engineer Intern', 'B.Sc. Computer Science'].every(t => text.includes(t)));
  check('…and scrolls sideways on its own', row.ox === 'auto' && row.sw > row.cw, JSON.stringify(row));
  await ctx.close();

  await browser.close();

  /* ---- report ---- */
  const width = Math.max(...results.map(r => r.name.length));
  for (const r of results) {
    console.log(`${r.pass ? '  ok' : 'FAIL'}  ${r.name.padEnd(width)}` +
                (r.detail ? `  — ${r.detail}` : ''));
  }
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks pass.`);
  process.exit(failed ? 1 : 0);
}

run().catch(err => { console.error(err); process.exit(1); });
