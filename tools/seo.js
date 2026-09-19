#!/usr/bin/env node
/**
 * Verifies the SEO surface of the built page — including the parts that only
 * exist after JavaScript runs, which is why this drives a real browser rather
 * than reading the HTML.
 *
 *   npm install --no-save playwright
 *   python3 -m http.server 8080 &
 *   node tools/seo.js
 *
 * The important one is the canonical check. A canonical pointing at a host
 * that does not resolve is the single fastest way to get a site dropped from
 * the index, and it fails silently — nothing on the page looks wrong.
 *
 * BASE_URL      the local server (default http://localhost:8080/)
 * BROWSER_PATH  reuse a Chromium you already have
 * LIVE          set to 1 to also check that the canonical host answers
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const ROOT = path.join(__dirname, '..');

const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

(async () => {
  const browser = await chromium.launch(
    process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {});
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  const head = await page.evaluate(() => {
    const meta = n => { const e = document.querySelector(`meta[name="${n}"]`); return e && e.content; };
    const og = p => { const e = document.querySelector(`meta[property="${p}"]`); return e && e.content; };
    const link = r => { const e = document.querySelector(`link[rel="${r}"]`); return e && e.getAttribute('href'); };
    return {
      title: document.title,
      description: meta('description'),
      robots: meta('robots'),
      canonical: link('canonical'),
      lang: document.documentElement.lang,
      ogTitle: og('og:title'), ogDesc: og('og:description'), ogUrl: og('og:url'),
      ogImage: og('og:image'), ogW: og('og:image:width'), ogH: og('og:image:height'),
      ogAlt: og('og:image:alt'), ogType: og('og:type'), ogSite: og('og:site_name'),
      twCard: meta('twitter:card'), twImage: meta('twitter:image'),
      h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
      // A <br> with no space before it reads as "MariamEmad Nabih" to a
      // crawler and a screen reader, however correct it looks on screen.
      gluedHeadings: [...document.querySelectorAll('h1,h2,h3,h4')]
        .filter(h => /\S<br\s*\/?>/i.test(h.innerHTML))
        .map(h => h.textContent.trim().slice(0, 40)),
      ldBlocks: [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => s.textContent),
      imgNoAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
      linksNoText: [...document.querySelectorAll('a[href]')].filter(a =>
        a.offsetParent && !a.textContent.trim() && !a.getAttribute('aria-label')).length,
      textLength: document.body.innerText.replace(/\s+/g, ' ').trim().length
    };
  });

  /* ---- the basics -------------------------------------------------------- */
  check('has a <title>', !!head.title, head.title);
  check('title is 20–65 characters',
    head.title.length >= 20 && head.title.length <= 65, `${head.title.length} chars`);
  check('has a meta description', !!head.description);
  check('description is 70–165 characters',
    head.description && head.description.length >= 70 && head.description.length <= 165,
    `${head.description ? head.description.length : 0} chars`);
  check('html has a lang attribute', head.lang === 'en', head.lang);
  check('robots allows indexing',
    !!head.robots && /index/.test(head.robots) && !/noindex/.test(head.robots), head.robots);
  check('exactly one h1', head.h1.length === 1, head.h1.join(' | '));
  check('the h1 is her full name, spaced', head.h1[0] === 'Mariam Emad Nabih', head.h1[0]);
  check('no heading glues words across a line break',
    head.gluedHeadings.length === 0, head.gluedHeadings.join(' | '));
  check('every image has alt text', head.imgNoAlt === 0);
  check('no link is left without an accessible name', head.linksNoText === 0);
  check('page has substantial indexable text', head.textLength > 1500, `${head.textLength} chars`);

  /* ---- canonical --------------------------------------------------------- */
  check('has a canonical link', !!head.canonical, head.canonical);
  let canonicalHost = null;
  try { canonicalHost = new URL(head.canonical).host; } catch (e) { /* handled below */ }
  check('canonical is an absolute https URL',
    !!head.canonical && /^https:\/\//.test(head.canonical), head.canonical);
  check('canonical is not a placeholder domain',
    !!canonicalHost && !/example\.|localhost|127\.0\.0\.1/.test(canonicalHost), canonicalHost);

  if (process.env.LIVE === '1' && canonicalHost) {
    let reachable = false, status = 'no response';
    try {
      const res = await page.request.get(head.canonical, { timeout: 12000 });
      status = res.status(); reachable = res.status() < 400;
    } catch (e) { status = e.message.split('\n')[0]; }
    check('the canonical URL actually resolves', reachable, String(status));
  }

  /* ---- social cards ------------------------------------------------------ */
  check('og:type is profile', head.ogType === 'profile', head.ogType);
  check('og:site_name is set', !!head.ogSite, head.ogSite);
  check('og:title and og:description are set', !!head.ogTitle && !!head.ogDesc);
  check('og:url matches the canonical', head.ogUrl === head.canonical, head.ogUrl);
  check('og:image is an absolute URL',
    !!head.ogImage && /^https?:\/\//.test(head.ogImage), head.ogImage);
  check('og:image declares its dimensions',
    head.ogW === '1200' && head.ogH === '630', `${head.ogW}x${head.ogH}`);
  check('og:image has alt text', !!head.ogAlt);
  check('twitter card is summary_large_image', head.twCard === 'summary_large_image');
  check('twitter:image is set', !!head.twImage);

  const ogFile = path.join(ROOT, 'assets', 'img', 'og-cover.png');
  check('the og image file exists', fs.existsSync(ogFile),
    fs.existsSync(ogFile) ? `${Math.round(fs.statSync(ogFile).size / 1024)} KB` : 'missing');

  /* ---- structured data --------------------------------------------------- */
  let nodes = [];
  let parseError = null;
  for (const raw of head.ldBlocks) {
    try {
      const parsed = JSON.parse(raw);
      nodes = nodes.concat(parsed['@graph'] || [parsed]);
    } catch (e) { parseError = e.message; }
  }
  check('all JSON-LD blocks parse', !parseError, parseError || `${head.ldBlocks.length} blocks`);

  const typeOf = t => nodes.filter(n => {
    const nt = n['@type'];
    return Array.isArray(nt) ? nt.includes(t) : nt === t;
  });
  const person = typeOf('Person')[0];

  check('declares a Person', !!person);
  check('the Person has a description', !!(person && person.description));
  check('the Person has sameAs profiles',
    !!(person && person.sameAs && person.sameAs.length >= 2),
    person && person.sameAs ? person.sameAs.length + ' profiles' : '0');
  check('the Person has knowsAbout topics',
    !!(person && person.knowsAbout && person.knowsAbout.length >= 5),
    person && person.knowsAbout ? person.knowsAbout.length + ' topics' : '0');
  check('declares a ProfilePage', typeOf('ProfilePage').length === 1);
  check('declares a WebSite', typeOf('WebSite').length === 1);

  const credentialNode = nodes.find(n => n.hasCredential);
  check('certificates are described as credentials',
    !!(credentialNode && credentialNode.hasCredential.length > 0),
    credentialNode ? credentialNode.hasCredential.length + ' credentials' : 'none');

  const works = typeOf('CreativeWork').concat(typeOf('Article'));
  check('published case studies are described', works.length > 0, works.length + ' described');

  const hasTodo = works.some(w => /TODO/i.test(JSON.stringify(w)));
  check('no placeholder text leaks into structured data', !hasTodo);

  const badId = nodes.filter(n => n['@id'] && !/^https?:\/\//.test(n['@id']));
  check('every @id is an absolute URL', badId.length === 0,
    badId.map(n => n['@id']).join(', '));

  /* ---- crawlable files --------------------------------------------------- */
  for (const file of ['robots.txt', 'sitemap.xml']) {
    const res = await page.request.get(new URL(file, BASE).href);
    check(`${file} is served`, res.status() === 200, `HTTP ${res.status()}`);
  }

  const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
  check('robots.txt points at the sitemap', /Sitemap:\s*https:\/\//.test(robots));
  check('robots.txt does not disallow everything', !/Disallow:\s*\/\s*$/m.test(robots));

  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  check('sitemap lists the canonical URL',
    head.canonical && sitemap.includes(head.canonical));

  const sameHost = [head.canonical, head.ogUrl, head.ogImage, head.twImage]
    .concat((robots.match(/https:\/\/[^\s]+/g) || []))
    .concat((sitemap.match(/https:\/\/[^<]+/g) || []))
    .filter(Boolean)
    .map(u => { try { return new URL(u).host; } catch (e) { return null; } })
    .filter(Boolean);
  const hosts = [...new Set(sameHost)];
  check('every absolute URL uses one host', hosts.length === 1, hosts.join(', '));

  await browser.close();

  const w = Math.max(...results.map(r => r.name.length));
  for (const r of results) {
    console.log(`${r.pass ? '  ok' : 'FAIL'}  ${r.name.padEnd(w)}` +
                (r.detail ? `  — ${r.detail}` : ''));
  }
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} SEO checks pass.`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
