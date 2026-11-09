/* ==========================================================================
   desk.js — the desk at the top of the page.

   • Fits the whole desk — photo, name, folders — inside one screen. The
     photo is cropped from the top (never into her head), and the folders
     are made as big as the screen allows.
   • Her name sits across the desk's edge, in front of her arms; the
     subtitle sits just under her hands.
   • The six folders sit on a fixed U around her: the two ends up beside her
     at desk level, the middle two under the subtitle. They float; they never
     spin. Below 900px wide they become two curved rows of three.
   • The cursor: a crosshair and a green selection frame around the folder
     you're on, for a mouse or trackpad. On a phone a tap snaps the frame
     onto the folder.
   • Clicking a folder opens it over the desk (folio.js). Live Projects
     opens the Vibe Coding study in the reader.

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
  var plate  = document.getElementById('deskPlate');
  var list   = document.getElementById('folders');
  var layer  = document.getElementById('deskCursor');
  var cross  = document.getElementById('deskCross');
  var sel    = document.getElementById('deskSel');
  if (!photo || !world || !plate || !list) return;

  var items   = Array.prototype.slice.call(list.querySelectorAll('.folders__item'));
  var folders = items.map(function (li) { return li.querySelector('.folder'); });
  var nameEl  = plate.querySelector('.desk__name');
  var roleEl  = plate.querySelector('.desk__role');
  var blend   = desk.querySelector('.desk__blend');
  var tag     = desk.querySelector('.desk__status');

  var fine = window.matchMedia('(pointer: fine)').matches;

  desk.classList.add('desk--js');

  function px(v) { return v + 'px'; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ======================================================================
     Layout
     ====================================================================== */

  /* Fractions of each room photo. cx is the middle of her; figTop and
     figBottom are the top of her photo and where her forearms meet the
     desk; figW is how wide she is; deskEdge is the back edge of the desk,
     where her name sits. bottomCut is where the photo stops; headroom is
     the room always kept above her head when the top is cropped. */
  var WIDE = { aspect: 941 / 1672, cx: 0.51,  figTop: 0.345, figBottom: 0.86, figW: 0.25,
               deskEdge: 0.82, bottomCut: 0.97, headroom: 0.02 };
  var TALL = { aspect: 1672 / 941, cx: 0.513, figTop: 0.454, figBottom: 0.78, figW: 0.5,
               deskEdge: 0.735, bottomCut: 0.84, headroom: 0.03 };

  // On a screen wider than 16:10 the folders and the text keep the size and
  // spacing they have at 16:10 (1440×900, Mariam's choice); the photo still
  // spans the full width.
  var STAGE = 1.6;

  var ROLE_GAP = 6;        // the subtitle starts this far under her hands
  var TEXT_GAP = 12;       // between the subtitle and the folders under it
  var EDGE = 18;           // folders keep this far from the sides of the screen

  var sides = [];          // which side of her each folder is on
  var lastW = 0;
  var textBoxes = [];      // her name and the subtitle, once laid out

  function layout(force) {
    var W = desk.clientWidth;
    // A phone's address bar changes the height as you scroll. Only a real
    // change of width re-lays the desk, so nothing jumps under your thumb.
    if (!force && W === lastW) return;
    lastW = W;
    var vh = window.innerHeight;

    var P = window.matchMedia('(max-width: 619px)').matches ? TALL : WIDE;
    // The scene: the whole width, or on a wide, short screen a 16:10 stage
    // in the middle (and never narrower than the room's carried-on sides
    // can fill).
    var Ws = W, off = 0;
    if (P === WIDE && W >= 900) {
      Ws = Math.min(W, Math.round(vh * STAGE));
      off = Math.round((W - Ws) / 2);
    }
    // her name and the subtitle are sized from the scene's width, not the screen's
    desk.style.setProperty('--sw', off ? px(Ws / 100) : '');
    var Himg = W * P.aspect;                                 // the photo always spans the full width
    var armsFull = P.figBottom * Himg;                       // her arms, with no crop
    // The least room kept over her head when the top of the photo is cropped:
    // a sliver, or, where the "open to relocation" tag sits right above her
    // (on a phone), enough to clear it.
    var headMin = P.headroom * Himg;
    if (tag) {
      var t = tag.getBoundingClientRect(), d = desk.getBoundingClientRect();
      var hair = 0.3 * P.figW * W;                           // her head, either side of her middle
      if (t.left - d.left < P.cx * W + hair && t.right - d.left > P.cx * W - hair) {
        headMin = Math.max(headMin, t.bottom - d.top + 6);
      }
    }
    var armsMin = Math.min(armsFull, armsFull - P.figTop * Himg + headMin); // cropped right down to that
    var under = (P.bottomCut - P.figBottom) * Himg;          // desk shown below her arms

    // Her name across the desk's edge, in front of her arms; the subtitle
    // just under her hands. Both are placed relative to her arms, so they
    // stay put wherever the crop lands.
    var F = parseFloat(getComputedStyle(nameEl).fontSize) || 48;
    var N = nameEl.offsetHeight;
    var nameRel = -(P.figBottom - P.deskEdge) * Himg - 0.6 * F;   // letters centred on the edge
    nameEl.style.marginBottom = px(ROLE_GAP - (nameRel + N));
    plate.style.marginTop = px(nameRel - under);
    if (blend) blend.style.height = px(Math.max(40, under - 6));
    var textBelow = ROLE_GAP + roleEl.offsetHeight;          // subtitle bottom, below her arms
    // Clear space always kept under the lowest folder, so no folder ever
    // sits on the bottom edge of the screen.
    var bottomSpace = clamp(vh * 0.025, 20, 40);
    var spare = vh - textBelow - TEXT_GAP - bottomSpace;    // top of the screen to the lowest folder's foot

    // Where her arms go, once the folders' height is known. With height to
    // spare, the room over her head grows only to a comfortable margin, then
    // takes a third of what is left; the rest goes under the folders.
    var headIdeal = Math.max(headMin, vh * 0.045);
    function settle(need) {
      var room = Math.min(armsFull, spare - need) - armsMin;
      if (room <= 0) return armsMin;
      var give = Math.min(room, headIdeal - headMin);
      return armsMin + give + (room - give) * 0.35;
    }

    var plan = null, arms = armsMin, i;
    // On a wide screen her name and the subtitle are centred on her (she sits
    // a little right of the middle), so the curve clears them evenly.
    plate.style.transform = W >= 900 ? 'translateX(' + px(Math.round(P.cx * W - W / 2)) + ')' : '';
    if (W >= 900) {
      // As big as the height allows (and no bigger than looks right), then
      // a little smaller at a time until the U clears her name.
      var w = Math.min(clamp(Ws * 0.15, 150, 250), (spare - armsMin) / 1.19);
      for (i = 0; i < 14 && !plan && w >= 110; i++, w *= 0.95) {
        arms = settle(w * 1.19);
        plan = uPlan({ left: Math.round(P.cx * (W - Ws)), width: Ws }, W, P, arms, nameRel, N, textBelow, w);
      }
    }
    if (!plan) {
      var scales = [1, 0.93, 0.86, 0.8, 0.74, 0.68];
      for (i = 0; i < scales.length && !plan; i++) {
        var size = rowSize(W, scales[i]);
        if (spare - size.below < armsMin && i < scales.length - 1) continue;
        arms = settle(size.below);
        plan = rowPlan(W, arms, textBelow, size);
      }
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

    desk.style.minHeight = plan.bottom + bottomSpace > vh ? px(plan.bottom + bottomSpace) : '';
    if (window.Motion) Motion.remeasure();
    textBoxes = [box(nameEl), box(roleEl)];
    kick(0);
  }

  // Where a line of text sits on the desk, in the desk's own coordinates.
  function box(el) {
    var d = desk.getBoundingClientRect(), r = document.createRange();
    r.selectNodeContents(el);
    var b = r.getBoundingClientRect();
    return { left: b.left - d.left, right: b.right - d.left, top: b.top - d.top, bottom: b.bottom - d.top };
  }

  /* ---- wide screens: a U around her ------------------------------------- */

  // Where her name and the subtitle sit across the screen (they are placed
  // up and down by arms + their offsets, so only left and right are read).
  function span(el) {
    var d = desk.getBoundingClientRect(), r = document.createRange();
    r.selectNodeContents(el);
    var b = r.getBoundingClientRect();
    return { left: b.left - d.left - 14, right: b.right - d.left + 14 };
  }

  // `stage` is where the scene sits across the desk (its left edge and width):
  // the curve is drawn to its proportions. The folders may still use the whole
  // width of the desk, `Wd`.
  function uPlan(stage, Wd, P, arms, nameRel, N, textBelow, w) {
    var W = stage.width, L = stage.left;
    var h = w * 1.19;
    var cx = L + P.cx * W;
    var ns = span(nameEl), rs = span(roleEl);
    var boxes = [
      { left: ns.left, right: ns.right, top: arms + nameRel - 8, bottom: arms + nameRel + N + 4 },
      { left: rs.left, right: rs.right, top: arms + ROLE_GAP - 8, bottom: arms + textBelow + TEXT_GAP - 2 }
    ];

    var reach = Math.min(cx, Wd - cx) - w / 2 - EDGE;        // how far the ends can go
    var rx = Math.min(W * 0.37, w * 2.47, reach);       // closes up with smaller folders
    var yMid = arms + textBelow + TEXT_GAP + h / 2;
    var lift = Math.min(h * 0.3, arms - h / 2 - 10);          // the ends rise beside her
    var cy = arms - lift;
    var uMid = Math.max(0.2, (w + 16) / (2 * rx));
    var ry = (yMid - cy) / Math.sqrt(1 - uMid * uMid);
    var us = [-1, -0.6, -uMid, uMid, 0.6, 1];

    var out = us.map(function (u) {
      return { u: u, x: cx + rx * u, y: cy + ry * Math.sqrt(Math.max(0, 1 - u * u)) };
    });
    // About Me and Contact sit lower than the curve's ends would: just below
    // the desk's edge, in front of it, so all six read as one arc in front of
    // her (Mariam's own markup). The other four stay where the curve puts them.
    out[0].y = out[5].y = arms + h * 0.15;

    // Nothing may cover her name or the subtitle: slide anything that
    // touches them outwards, then make sure each pair on a side still clears.
    function hit(o) {
      for (var b = 0; b < boxes.length; b++) {
        var t = boxes[b];
        if (o.x + w / 2 > t.left && o.x - w / 2 < t.right &&
            o.y + h / 2 > t.top && o.y - h / 2 < t.bottom) return t;
      }
      return null;
    }
    function clear(o, side) {
      for (var n = 0, t; n < 3 && (t = hit(o)); n++) o.x = side < 0 ? t.left - w / 2 : t.right + w / 2;
    }
    // Two folders are apart if they clear each other across or up and down.
    function apart(a, b) {
      return Math.abs(a.x - b.x) >= w + 8 || Math.abs(a.y - b.y) >= h + 8;
    }
    for (var side = -1; side <= 1; side += 2) {
      var mid = out[side < 0 ? 2 : 3], second = out[side < 0 ? 1 : 4], end = out[side < 0 ? 0 : 5];
      clear(second, side);
      clear(end, side);
      // each folder steps out past the one inside it, if they would touch
      if (!apart(second, mid)) second.x = mid.x + side * (w + 12);
      if (!apart(end, second)) end.x = second.x + side * (w + 12);
      end.x = clamp(end.x, w / 2 + EDGE, Wd - w / 2 - EDGE);
      second.x = clamp(second.x, w / 2 + EDGE, Wd - w / 2 - EDGE);
      if (!apart(second, mid) || !apart(end, second) || hit(second) || hit(end)) return null;  // too tight: go smaller
      if (Math.abs(end.x - cx) - w / 2 < P.figW * W / 2 + 8) return null;                      // the ends clear her
    }
    if (hit(out[2]) || hit(out[3])) return null;

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

  function rowPlan(W, arms, textBelow, size) {
    var w = size.w, h = size.h, rise = 0.35, PERS = 1200;
    var y = arms + textBelow + TEXT_GAP;
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
     Opening a folder
     ====================================================================== */

  var lastType = 'mouse';
  // Which hand is on the controls. With the mouse, the frame follows the
  // mouse and nothing else; the folder with keyboard focus (focus returns to
  // a folder after it closes) only gets the frame while the keyboard is in
  // use — otherwise it would keep pulling the frame back to that folder.
  var lastInput = 'mouse';
  var hovered = null, focused = null, tapped = null;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' ||
        e.key.indexOf('Arrow') === 0) { lastInput = 'keyboard'; kick(600); }
  }, true);

  function openFolder(folder) {
    var study = folder.getAttribute('data-case');
    // Live Projects: the Vibe Coding study, in the reader — one history
    // entry, exactly like clicking its card.
    if (study && window.Reader) Reader.go(study);
    else if (window.Folio) Folio.show(folder.getAttribute('href').slice(1), folder);
    else location.hash = folder.getAttribute('href');
    tapped = null;
    kick(0);
  }

  folders.forEach(function (folder) {
    folder.addEventListener('click', function (e) {
      // A middle-click or ⌘-click still opens a new tab, like any link.
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (lastType !== 'mouse') { tapped = folder; kick(400); }
      openFolder(folder);
    });
    folder.addEventListener('pointerenter', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;     // a tap is not a hover
      hovered = folder;
      kick(600);
    });
    folder.addEventListener('pointerleave', function () {
      if (hovered === folder) hovered = null;
      kick(600);
    });
    folder.addEventListener('focus', function () {
      try { if (folder.matches(':focus-visible')) focused = folder; } catch (err) { focused = folder; }
      kick(600);
    });
    folder.addEventListener('blur', function () {
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
    var target = folio ? null : (hovered || tapped || (lastInput === 'keyboard' ? focused : null));

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
      // The name label sits above the frame, Figma-style — unless that would
      // put it on top of her name or the subtitle; then it goes underneath.
      var lt = r.top - d.top - pad - 24, ll = r.left - d.left - pad, lr = ll + 170;
      var clash = textBoxes.some(function (t) {
        return lt < t.bottom && lt + 20 > t.top && ll < t.right && lr > t.left;
      });
      sel.classList.toggle('is-below', clash);
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
      lastInput = 'mouse';
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

  // The desk is kept out of sight until it is laid out (see the script at
  // the top of index.html). Her name sets where the folders may sit, so show
  // it once the fonts have landed and it has been measured again in them, or
  // after a moment at most.
  function reveal() { document.documentElement.classList.remove('desk-pending'); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { layout(true); reveal(); });
    setTimeout(reveal, 700);
  } else {
    reveal();
  }
})();
