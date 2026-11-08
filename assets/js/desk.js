/* ==========================================================================
   desk.js — the desk at the top of the page.

   • Fits the whole desk — photo, name, folders — inside one screen. The
     photo is cropped from the top (never into her head) and, on a short
     screen, the folders get a little smaller.
   • Her name sits on the desk right under her hands, the subtitle under it.
   • The six folders sit on a fixed U around her: the two ends up beside her
     at desk level, the middle two under her name. They float; they never
     spin. Below 900px wide they become two curved rows of three.
   • Her eyes go to the folder you point at, before anything opens.
   • The cursor: a crosshair and a green selection frame around the folder
     you're on, for a mouse or trackpad. On a phone a tap snaps the frame
     onto the folder.
   • Opening a folder: her eyes move first, then it opens over the desk
     (folio.js). Live Projects opens the Vibe Coding study in the reader.

   Kept light on purpose: nothing here runs every frame. The cursor is drawn
   when the mouse moves or the folder under it changes, and the folder you
   point at stops floating so its frame can stay still.

   Every folder is a real link, so all of this is an enhancement: without
   the script, the desk.css fallback shows the same desk and plain links.
   Loaded before app.js, which re-measures the page once it is laid out.
   ========================================================================== */

(function () {
  'use strict';

  var desk = document.getElementById('top');
  if (!desk || !desk.classList.contains('desk')) return;

  var photo  = document.getElementById('deskPhoto');
  var world  = document.getElementById('deskWorld');
  var me     = document.getElementById('deskMe');
  var plate  = document.getElementById('deskPlate');
  var list   = document.getElementById('folders');
  var layer  = document.getElementById('deskCursor');
  var cross  = document.getElementById('deskCross');
  var sel    = document.getElementById('deskSel');
  if (!photo || !world || !me || !plate || !list) return;

  var items   = Array.prototype.slice.call(list.querySelectorAll('.folders__item'));
  var folders = items.map(function (li) { return li.querySelector('.folder'); });
  var nameEl  = plate.querySelector('.desk__name');
  var roleEl  = plate.querySelector('.desk__role');
  var blend   = desk.querySelector('.desk__blend');

  var reduced = window.Motion ? Motion.reduced
                              : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine    = window.matchMedia('(pointer: fine)').matches;

  desk.classList.add('desk--js');

  function px(v) { return v + 'px'; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ======================================================================
     Layout
     ====================================================================== */

  /* Fractions of each room photo. cx is the middle of her; figTop and
     figBottom are the top of her photo and where her forearms meet the
     desk; figW is how wide she is. bottomCut is where the photo stops — a
     strip of desk under her arms, for her name to sit on. headroom is the
     room always kept above her head when the top is cropped. */
  var WIDE = { aspect: 941 / 1672, cx: 0.51,  figTop: 0.33,  figBottom: 0.845, figW: 0.25,
               bottomCut: 0.97, headroom: 0.025 };
  var TALL = { aspect: 1672 / 941, cx: 0.505, figTop: 0.449, figBottom: 0.775, figW: 0.5,
               bottomCut: 0.84, headroom: 0.03 };

  var TITLE_GAP = -6;      // her name starts this far below her hands (line box; the letters sit lower)
  var TEXT_GAP = 18;       // between the subtitle and the folders under it
  var EDGE = 18;           // folders keep this far from the sides of the screen

  var sides = [];          // which side of her each folder is on
  var lastW = 0;

  function layout(force) {
    var W = desk.clientWidth;
    // A phone's address bar changes the height as you scroll. Only a real
    // change of width re-lays the desk, so nothing jumps under your thumb.
    if (!force && W === lastW) return;
    lastW = W;
    var vh = window.innerHeight;

    var P = window.matchMedia('(max-width: 619px)').matches ? TALL : WIDE;
    var Himg = W * P.aspect;
    var armsFull = P.figBottom * Himg;                       // arms, with no crop
    var cropMax = (P.figTop - P.headroom) * Himg;            // never into her head
    var under = (P.bottomCut - P.figBottom) * Himg;          // desk shown below her arms

    // Her name always starts just under her hands, wherever the crop lands.
    plate.style.marginTop = px(TITLE_GAP - under);
    if (blend) blend.style.height = px(Math.max(40, under - 6));
    var plateH = plate.offsetHeight;
    var padB = parseFloat(getComputedStyle(desk).paddingBottom) || 0;
    var wideU = W >= 900;

    // Try the folders at full size, then a little smaller, until it all fits.
    var scales = [1, 0.93, 0.86, 0.8, 0.74, 0.68], plan = null, arms = armsFull - cropMax;
    for (var i = 0; i < scales.length && !plan; i++) {
      var size = wideU ? uSize(W, scales[i]) : rowSize(W, scales[i]);
      var below = TITLE_GAP + plateH + TEXT_GAP + size.below + padB;
      var room = vh - below;                                  // where her arms may sit
      var last = i === scales.length - 1;
      if (room < armsFull - cropMax && !last) continue;
      arms = clamp(room, armsFull - cropMax, armsFull);
      plan = wideU ? uPlan(W, P, arms, plateH, size) : rowPlan(W, arms, plateH, size);
      if (!plan && last) plan = rowPlan(W, arms, plateH, rowSize(W, scales[i]));
    }

    var crop = armsFull - arms;
    photo.style.aspectRatio = 'auto';
    photo.style.height = px(P.bottomCut * Himg - crop);
    world.style.top = px(-crop);

    plan.items.forEach(function (it, idx) {
      var li = items[idx];
      if (!li) return;
      li.style.setProperty('--w', px(it.w));
      li.style.setProperty('--h', px(it.h));
      li.style.setProperty('--s', it.s.toFixed(3));
      li.style.setProperty('--ry', it.ry.toFixed(2) + 'deg');
      li.style.setProperty('--z', String(it.z));
      li.style.setProperty('--d', (-idx * 1.1) + 's');
      li.style.left = px(it.x);
      li.style.top = px(it.y);
      sides[idx] = it.side;
    });

    desk.style.minHeight = plan.bottom + padB > vh ? px(plan.bottom + padB) : '';
    if (window.Motion) Motion.remeasure();
    kick(0);
  }

  /* ---- wide screens: a U around her ------------------------------------- */

  function uSize(W, k) {
    var w = clamp(W * 0.125, 140, 210) * k;
    return { w: w, h: w * 1.19, below: w * 1.19 };
  }

  function textRect() {
    var d = desk.getBoundingClientRect(), r = document.createRange(), a, b;
    r.selectNodeContents(nameEl); a = r.getBoundingClientRect();
    r.selectNodeContents(roleEl); b = r.getBoundingClientRect();
    return {
      left: Math.min(a.left, b.left) - d.left - 14,
      right: Math.max(a.right, b.right) - d.left + 14,
      top: Math.min(a.top, b.top) - d.top - 10,
      bottom: Math.max(a.bottom, b.bottom) - d.top + 12
    };
  }

  function uPlan(W, P, arms, plateH, size) {
    var w = size.w, h = size.h;
    var cx = P.cx * W;
    var textTop = arms + TITLE_GAP, textBottom = textTop + plateH;
    var t = textRect();
    // textRect() reads the plate where it is now; move it to where it will be
    var shift = textTop - plate.offsetTop;
    t.top += shift; t.bottom += shift;

    var reach = Math.min(cx, W - cx) - w / 2 - EDGE;         // how far the ends can go
    var rx = Math.min(W * 0.37, reach);
    var yMid = textBottom + TEXT_GAP + h / 2;
    t.bottom = Math.min(t.bottom, textBottom + TEXT_GAP - 2);
    var lift = Math.min(h * 0.3, arms - h / 2 - 10);          // the ends rise beside her
    var cy = arms - lift;
    var uMid = Math.max(0.2, (w + 16) / (2 * rx));
    var ryE = (yMid - cy) / Math.sqrt(1 - uMid * uMid);
    var us = [-1, -0.6, -uMid, uMid, 0.6, 1];

    var out = us.map(function (u) {
      return { u: u, x: cx + rx * u, y: cy + ryE * Math.sqrt(Math.max(0, 1 - u * u)) };
    });

    // Nothing may cover her name: slide anything that touches it outwards,
    // then make sure each pair on a side still clears each other.
    function hits(o) {
      return o.x + w / 2 > t.left && o.x - w / 2 < t.right &&
             o.y + h / 2 > t.top && o.y - h / 2 < t.bottom;
    }
    for (var side = -1; side <= 1; side += 2) {
      var second = out[side < 0 ? 1 : 4], end = out[side < 0 ? 0 : 5];
      if (hits(second)) second.x = side < 0 ? t.left - w / 2 : t.right + w / 2;
      if (hits(end)) end.x = side < 0 ? t.left - w / 2 : t.right + w / 2;
      if (Math.abs(end.x - second.x) < w + 12) end.x = second.x + side * (w + 12);
      end.x = clamp(end.x, w / 2 + EDGE, W - w / 2 - EDGE);
      second.x = clamp(second.x, w / 2 + EDGE, W - w / 2 - EDGE);
      var apartX = Math.abs(end.x - second.x) >= w + 8;
      var apartY = Math.abs(end.y - second.y) >= h + 8;
      if ((!apartX && !apartY) || hits(second) || hits(end)) return null;   // too tight: go smaller
      // and the ends stay clear of her
      if (Math.abs(end.x - cx) - w / 2 < P.figW * W / 2 + 8) return null;
    }

    var bottom = 0;
    var items = out.map(function (o) {
      var depth = Math.sqrt(Math.max(0, 1 - o.u * o.u));      // 0 at her sides, 1 in front
      bottom = Math.max(bottom, o.y + h / 2);
      return {
        x: o.x, y: o.y, w: w, h: h,
        s: 0.9 + 0.1 * depth,
        ry: o.u * 16,
        z: 100 - Math.round(Math.abs(o.u) * 30),
        side: o.u > 0 ? 'right' : 'left'
      };
    });
    return { items: items, bottom: bottom };
  }

  /* ---- narrow screens: two curved rows of three ------------------------- */

  function rowSize(W, k) {
    var w = Math.min(150, (W - 28) / 3.3) * k, h = w * 1.19;
    var step = 26 * Math.PI / 180, gap = 16;
    var R = (w + gap) / (2 * Math.sin(step / 2));
    var maxD = R * (1 - Math.cos(step));
    var rowGap = W < 620 ? 22 : 30;
    return { w: w, h: h, step: step, R: R, maxD: maxD, rowGap: rowGap,
             below: 2 * (h + maxD * 0.35) + rowGap + 14 };
  }

  function rowPlan(W, arms, plateH, size) {
    var w = size.w, h = size.h, rise = 0.35, PERS = 1200;
    var y = arms + TITLE_GAP + plateH + TEXT_GAP;
    var items = [];
    [[0, 1, 2], [3, 4, 5]].forEach(function (row) {
      row.forEach(function (idx, i) {
        var t = (i - 1) * size.step, d = size.R * (1 - Math.cos(t));
        items[idx] = {
          x: W / 2 + size.R * Math.sin(t),
          y: y + h / 2 + size.maxD * rise - d * rise + 6,
          w: w, h: h, s: PERS / (PERS + d), ry: t * 180 / Math.PI,
          z: 100 - Math.round(d),
          side: t > 0.01 ? 'right' : (t < -0.01 ? 'left' : 'front')
        };
      });
      y += h + size.maxD * rise + size.rowGap;
    });
    return { items: items, bottom: y - size.rowGap + 14 };
  }

  /* ======================================================================
     Her eyes
     ====================================================================== */

  var looks = {};
  Array.prototype.forEach.call(me.querySelectorAll('[data-look]'), function (img) {
    looks[img.getAttribute('data-look')] = img;
  });

  // The photos of her looking aside are only needed once someone points at
  // a folder, so they load after the page has settled instead of with it.
  var looksLoaded = false;
  function loadLooks() {
    if (looksLoaded) return;
    looksLoaded = true;
    Object.keys(looks).forEach(function (k) {
      var img = looks[k];
      if (img.getAttribute('data-src')) img.src = img.getAttribute('data-src');
    });
  }
  window.addEventListener('load', function () {
    if ('requestIdleCallback' in window) requestIdleCallback(loadLooks, { timeout: 2500 });
    else setTimeout(loadLooks, 1200);
  });

  function gaze(side) {
    if (side !== 'front') loadLooks();
    me.setAttribute('data-gaze', looks[side] ? side : 'front');
  }

  /* ======================================================================
     Opening a folder
     ====================================================================== */

  var busy = false, openIdx = -1, lastType = 'mouse';
  var hovered = null, focused = null, tapped = null;

  function finish(folder) {
    folder.classList.remove('is-on');
    busy = false;
    openIdx = -1;
    tapped = null;
    gaze('front');
    kick(0);
  }

  function openFolder(i) {
    if (busy) return;
    var folder = folders[i];
    var key = folder.getAttribute('href').slice(1);
    var study = folder.getAttribute('data-case');
    busy = true;
    openIdx = i;

    var looking = me.getAttribute('data-gaze') === sides[i] && looks[sides[i]];
    gaze(sides[i]);
    folder.classList.add('is-on');
    kick(600);

    // Her eyes get there first; then the folder opens.
    setTimeout(function () {
      // Live Projects: the Vibe Coding study, in the reader. Setting the hash
      // lands one history entry, exactly like clicking its card.
      if (study && window.Reader) location.hash = '#case/' + study;
      else if (window.Folio) Folio.show(key, folder);
      else location.hash = '#' + key;
      finish(folder);
    }, reduced ? 0 : (looking ? 160 : 400));
  }

  folders.forEach(function (folder, i) {
    folder.addEventListener('click', function (e) {
      // A middle-click or ⌘-click still opens a new tab, like any link.
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (lastType !== 'mouse') tapped = folder;
      openFolder(i);
    });
    folder.addEventListener('pointerenter', function () {
      if (!busy) gaze(sides[i]);
      hovered = folder;
      kick(600);
    });
    folder.addEventListener('pointerleave', function () {
      if (!busy) gaze('front');
      if (hovered === folder) hovered = null;
      kick(600);
    });
    folder.addEventListener('focus', function () {
      if (!busy) gaze(sides[i]);
      try { if (folder.matches(':focus-visible')) focused = folder; } catch (err) { focused = folder; }
      kick(600);
    });
    folder.addEventListener('blur', function () {
      if (!busy) gaze('front');
      if (focused === folder) focused = null;
      kick(600);
    });
  });

  /* ======================================================================
     The selection-frame cursor
     Drawn only when something changes: the mouse moves, or the folder under
     it does. A change starts a short run of frames to follow the folder as
     it lifts; then it stops. The folder in the frame stops floating.
     ====================================================================== */

  var P0 = { x: 0, y: 0, inside: false };
  var xy = cross ? cross.querySelector('.desk__xy') : null;
  var selName = sel ? sel.querySelector('.desk__sel-name') : null;
  var selSize = sel ? sel.querySelector('.desk__sel-size') : null;
  var queued = false, until = 0, held = null, shownName = '', shownSize = '';
  var root = document.documentElement;

  function kick(ms) {
    if (!sel) return;
    until = Math.max(until, performance.now() + (ms || 0));
    if (!queued) { queued = true; requestAnimationFrame(draw); }
  }

  function draw(now) {
    queued = false;
    var folio = root.classList.contains('folio-open');
    var target = folio ? null : (openIdx >= 0 ? folders[openIdx] : (hovered || tapped || focused));

    // the folder in the frame holds still
    var li = target ? target.parentNode : null;
    if (li !== held) {
      if (held) held.classList.remove('is-held');
      if (li) li.classList.add('is-held');
      held = li;
    }

    // read everything first, then write
    var d = desk.getBoundingClientRect();
    var r = target ? target.getBoundingClientRect() : null;
    var showX = fine && P0.inside && lastType === 'mouse' && !folio;

    cross.classList.toggle('is-on', showX);
    if (showX) {
      cross.style.transform = 'translate(' + P0.x + 'px,' + P0.y + 'px)';
      xy.textContent = 'x ' + Math.round(P0.x) + '  y ' + Math.round(P0.y);
      xy.style.opacity = target ? 0 : 1;
    }
    if (r) {
      var pad = 7;
      sel.style.transform = 'translate(' + (r.left - d.left - pad) + 'px,' + (r.top - d.top - pad) + 'px)';
      sel.style.width = px(r.width + pad * 2);
      sel.style.height = px(r.height + pad * 2);
      var name = 'Folder / ' + target.querySelector('.folder__title').textContent;
      if (name !== shownName) { selName.textContent = name; shownName = name; }
      var size = Math.round(r.width) + ' × ' + Math.round(r.height);
      if (size !== shownSize) { selSize.textContent = size; shownSize = size; }
      sel.classList.add('is-on');
    } else {
      sel.classList.remove('is-on');
    }

    if (now < until) kick(0);
  }

  if (layer && cross && sel) {
    if (fine) desk.classList.add('desk--cursor');

    desk.addEventListener('pointerdown', function (e) { lastType = e.pointerType || 'mouse'; }, true);
    desk.addEventListener('pointermove', function (e) {
      lastType = e.pointerType || 'mouse';
      if (lastType !== 'mouse') return;
      var d = desk.getBoundingClientRect();
      P0.x = e.clientX - d.left; P0.y = e.clientY - d.top; P0.inside = true;
      kick(0);
    }, { passive: true });
    desk.addEventListener('pointerleave', function () { P0.inside = false; hovered = null; kick(300); });

    // A tap on the empty desk, on a phone: a small green crosshair pulse.
    desk.addEventListener('click', function (e) {
      if (lastType === 'mouse' || (e.target.closest && e.target.closest('.folder'))) return;
      var d = desk.getBoundingClientRect(), p = document.createElement('div');
      p.className = 'desk__pulse';
      p.style.left = px(e.clientX - d.left); p.style.top = px(e.clientY - d.top);
      p.innerHTML = cross.querySelector('svg').outerHTML;
      layer.appendChild(p);
      setTimeout(function () { p.remove(); }, 520);
    });
  }

  /* ---- go ---------------------------------------------------------------- */

  layout(true);
  if ('ResizeObserver' in window) new ResizeObserver(function () { layout(false); }).observe(desk);
  else window.addEventListener('resize', function () { layout(false); }, { passive: true });
  // Her name sets where the folders may sit; measure again once the fonts land.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(true); });
})();
