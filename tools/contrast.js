#!/usr/bin/env node
/**
 * Verifies every colour pairing the site actually uses against WCAG 2.2.
 * Reads the real values out of assets/css/tokens.css, so it cannot drift
 * away from the stylesheet.
 *
 *   node tools/contrast.js
 *
 * Exits non-zero if any pairing regresses, which makes it usable as a
 * pre-commit or CI check.
 */

const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(
  path.join(__dirname, '..', 'assets', 'css', 'tokens.css'), 'utf8'
);

const tokens = {};
for (const [, name, value] of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,8})\s*;/g)) {
  tokens[name] = value;
}

const srgb = hex => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
};

const luminance = hex => {
  const [r, g, b] = srgb(hex).map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/* Every pairing that appears on screen. `min` is what WCAG 2.2 AA demands
   for that pairing: 4.5 for body text, 3 for large text and UI borders. */
const PAIRS = [
  ['ink',          'paper',        4.5, 'body text on the page'],
  ['ink-soft',     'paper',        4.5, 'secondary paragraphs'],
  ['muted',        'paper',        4.5, 'meta, captions, eyebrows'],
  ['blue',         'paper',        4.5, 'links and accents on the page'],
  ['blue-deep',    'blue-wash',    4.5, 'kind pill'],
  ['ink',          'blue-wash',    4.5, 'text in a blue tint panel'],
  ['ink',          'lime',         4.5, 'ink on the lime chip'],
  ['ink',          'lime-wash',    4.5, '"How I solved it" panel'],
  ['ink',          'paper-raised', 4.5, 'card text'],
  ['muted',        'paper-raised', 4.5, 'card meta'],
  ['ink',          'paper-sunk',   4.5, 'tag text'],
  ['muted',        'paper-sunk',   4.5, 'muted tag text'],
  ['on-panel',     'panel',        4.5, 'text on the dark section'],
  ['on-panel-soft','panel',        4.5, 'muted text on the dark section'],
  ['on-panel',     'panel-soft',   4.5, 'text on the form'],
  ['on-panel-soft','panel-soft',   4.5, 'form labels'],
  ['lime',         'panel',        4.5, 'lime accent on the dark section'],
  ['lime',         'panel-soft',   3.0, 'focused field border'],

  /* SC 1.4.11 — control boundaries and graphics that carry meaning.
     --line / --line-strong are absent on purpose: they are decorative
     rules only, which 1.4.11 exempts. */
  ['edge',         'paper',        3.0, 'ghost button and control borders'],
  ['graphic',      'paper-raised', 3.0, 'diagram arrows and "+" operators'],
  ['graphic-bad',  'paper-raised', 3.0, 'the "before" state in a diagram'],
  ['blue',         'paper-raised', 3.0, 'the "after" state in a diagram'],
  ['field-placeholder', 'panel-soft', 4.5, 'form placeholder text'],
];

const WHITE = '#FFFFFF';

/* Translucent borders have to be composited over what is behind them before
   they can be measured — an alpha value on its own says nothing about
   contrast. This is what caught the form fields at 1.54:1. */
const over = (hex, alpha, bgHex) => {
  const fg = srgb(hex), bg = srgb(bgHex);
  const mix = fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]);
  return '#' + mix.map(c =>
    Math.round(c * 255).toString(16).padStart(2, '0')
  ).join('');
};

const FIELD_BG = over(WHITE, 0.04, tokens['panel-soft']);

const EXTRA = [
  [WHITE, tokens['blue'],      4.5, 'white label on the primary button'],
  [WHITE, tokens['blue-deep'], 4.5, 'white label on the pressed button'],
  [tokens['paper'], tokens['ink'], 4.5, 'inverted chip'],
  [over(WHITE, 0.40, tokens['panel-soft']), FIELD_BG, 3.0, 'form field border (rgba .40)'],
  [over(WHITE, 0.58, tokens['panel-soft']), FIELD_BG, 3.0, 'form field border, hover'],
  [tokens['on-panel'], FIELD_BG, 4.5, 'text typed into a form field'],
];

let failed = 0;
const rows = [];

for (const [fg, bg, min, what] of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) {
    console.error(`unknown token in pair: ${fg} / ${bg}`);
    failed++;
    continue;
  }
  const r = ratio(tokens[fg], tokens[bg]);
  const ok = r >= min;
  if (!ok) failed++;
  rows.push([ok, r, min, `--${fg} on --${bg}`, what]);
}

for (const [fg, bg, min, what] of EXTRA) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  rows.push([ok, r, min, `${fg} on ${bg}`, what]);
}

const w = Math.max(...rows.map(r => r[3].length));
for (const [ok, r, min, pair, what] of rows) {
  const grade = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA ' : r >= 3 ? 'AA-lg' : '—';
  console.log(
    `${ok ? '  ok' : 'FAIL'}  ${pair.padEnd(w)}  ${r.toFixed(2).padStart(6)}:1` +
    `  (needs ${min})  ${grade.padEnd(5)}  ${what}`
  );
}

console.log(
  `\n${rows.length - failed}/${rows.length} pairings pass WCAG 2.2 AA.`
);
process.exit(failed ? 1 : 0);
