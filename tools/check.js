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
     The path: a clothesline the page's own scroll carries sideways
     ------------------------------------------------------------------ */
  const rowX = () => page.evaluate(() => {
    const m = /translate3d\((-?[\d.]+)px/.exec(document.getElementById('lineTrack').style.transform);
    return m ? -parseFloat(m[1]) : 0;
  });
  const pinned = await page.evaluate(() => {
    const l = document.getElementById('line');
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, l.getBoundingClientRect().top + scrollY);
    return l.classList.contains('line--pinned');
  });
  await page.waitForTimeout(700);
  check('the path is pinned while it is on screen', pinned);

  const x0 = await rowX();
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(900);
  const x1 = await rowX();
  check('scrolling down moves the path sideways', x1 - x0 > 200, `${x0} → ${x1}`);

  await page.mouse.move(900, 450);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(900 + i * 25, 450); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.waitForTimeout(900);
  const x2 = await rowX();
  check('dragging moves the path', x1 - x2 > 150, `${x1} → ${x2}`);

  await page.click('#lineNext');
  await page.waitForTimeout(1000);
  const x3 = await rowX();
  check('the arrow buttons step along the path', x3 - x2 > 20, `${x2} → ${x3}`);
  await page.evaluate(() => { scrollTo(0, 0); document.documentElement.style.scrollBehavior = ''; });

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

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const card = await page.$('.pincard__hit');
  await card.focus();
  await card.press('Enter');
  await page.waitForTimeout(700);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  const restored = await page.evaluate(() => document.activeElement.className);
  check('focus returns to the card that opened it', restored.includes('pincard__hit'));

  // A slug that does not exist must not leave a broken-looking URL behind.
  await page.evaluate(() => { location.hash = '#case/does-not-exist'; });
  await page.waitForTimeout(500);
  const bogus = await page.evaluate(() => ({
    hash: location.hash, open: !document.getElementById('reader').hidden }));
  check('an unknown slug is cleaned up, not opened', bogus.hash === '' && !bogus.open);

  /* ==================================================================
     3 — Contact form
     ================================================================== */
  await page.evaluate(() => document.getElementById('contact').scrollIntoView());
  await page.waitForTimeout(400);
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

    await pg.evaluate(() => { location.hash = '#case/invoices-payments'; });
    await pg.waitForTimeout(700);
    const r = await pg.evaluate(() => {
      const s = document.getElementById('readerScroll');
      return { sw: s.scrollWidth, cw: s.clientWidth };
    });
    check(`reader does not scroll sideways at ${w}px`, r.sw <= r.cw);
    check(`no page errors at ${w}px`, errs.length === 0, errs.join(' | '));
    await c.close();
  }

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
  check('the hero still renders with JavaScript off',
    await page.isVisible('.hero__name') && await page.isVisible('.hero__cta'));
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
