/* ==========================================================================
   desk.js — the desk at the top of the page.

   • Fits the room photo to the screen, so Mariam, her name and the folders
     all land in the first view.
   • Lays the six folders on a fixed curve. They float; they never spin.
     On a wide screen it is one row across the desk, the end folders rising
     beside her name. Below 960px it is two curved rows of three.
   • Her eyes go to the folder you point at, before anything opens.
   • The cursor: a crosshair, and a green selection frame around the folder
     you're on, for a mouse or trackpad. On a phone a tap snaps the frame
     onto the folder.
   • Opening a folder: her eyes move, a sheet in the folder's colour grows to
     fill the screen, the page jumps to that section behind it, and the
     sheet fades. Live Projects opens the Vibe Coding study in the reader.

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
  var nav    = document.getElementById('nav');
  if (!photo || !world || !me || !plate || !list) return;

  var items   = Array.prototype.slice.call(list.querySelectorAll('.folders__item'));
  var folders = items.map(function (li) { return li.querySelector('.folder'); });
  var nameEl  = plate.querySelector('.desk__name');
  var roleEl  = plate.querySelector('.desk__role');

  var reduced = window.Motion ? Motion.reduced
                              : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine    = window.matchMedia('(pointer: fine)').matches;

  desk.classList.add('desk--js');

  function px(v) { return v + 'px'; }

  /* ======================================================================
     Layout
     ====================================================================== */

  /* Fractions of each room photo. figTop is where the top of her photo sits;
     bottomCut trims the last bit of floor; maxVH is the most of the screen
     the photo may take before its top is cropped (never into her head). */
  var WIDE = { aspect: 941 / 1672, figTop: 0.33,  bottomCut: 0.99, maxVH: 0.64 };
  var TALL = { aspect: 1672 / 941, figTop: 0.449, bottomCut: 0.93, maxVH: 0.6  };

  var sides = [];          // which side of her each folder is on
  var lastW = 0;
  var viewH = window.innerHeight;

  function layout(force) {
    var W = desk.clientWidth;
    // A phone's address bar changes the height as you scroll. Only a real
    // change of width re-lays the desk, so nothing jumps under your thumb.
    if (!force && W === lastW) return;
    lastW = W;
    viewH = window.innerHeight;

    var P = window.matchMedia('(max-width: 619px)').matches ? TALL : WIDE;
    var Himg = W * P.aspect;
    var crop = Math.max(0, Math.min(Himg * P.bottomCut - viewH * P.maxVH,
                                    Himg * P.figTop - Himg * 0.06));
    var Hc = Himg * P.bottomCut - crop;

    photo.style.aspectRatio = 'auto';
    photo.style.height = px(Hc);
    world.style.top = px(-crop);
    plate.style.marginTop = px(-Math.min(Hc * 0.17, 110));

    if (W < 960) twoRows(W); else oneRow(W);

    if (window.Motion) Motion.remeasure();
  }

  function place(li, x, y, w, h, s, ry, z, i) {
    li.style.setProperty('--w', px(w));
    li.style.setProperty('--h', px(h));
    li.style.setProperty('--s', s.toFixed(3));
    li.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    li.style.setProperty('--z', String(z));
    li.style.setProperty('--d', (-i * 1.1) + 's');
    li.style.left = px(x);
    li.style.top = px(y);
  }

  // Narrower screens: two rows of three, each on a shallow cylinder.
  function twoRows(W) {
    var rows = [[0, 1, 2], [3, 4, 5]];
    var step = 26 * Math.PI / 180, gap = 18, PERS = 1200, rise = 0.35;
    var cw = Math.min(150, (W - 32) / 3.35), ch = cw * 1.19;
    var R = (cw + gap) / (2 * Math.sin(step / 2));
    var y = 0;
    rows.forEach(function (row) {
      var n = row.length, maxD = R * (1 - Math.cos(step * (n - 1) / 2));
      row.forEach(function (idx, i) {
        if (!items[idx]) return;
        var t = (i - (n - 1) / 2) * step, d = R * (1 - Math.cos(t));
        place(items[idx], W / 2 + R * Math.sin(t), y + ch / 2 + maxD * rise - d * rise + 8,
              cw, ch, PERS / (PERS + d), t * 180 / Math.PI, 100 - Math.round(d), idx);
        sides[idx] = t > 0.01 ? 'right' : (t < -0.01 ? 'left' : 'front');
      });
      y += ch + maxD * rise + 34;
    });
    list.style.height = px(y + 20);
  }

  // Wide screens: one row across the whole desk. The end folders rise up
  // beside her name, the middle ones dip under the title, and no folder is
  // ever allowed to cover the text.
  function textBox(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    return r.getBoundingClientRect();
  }
  function oneRow(W) {
    var n = items.length, m = 24;
    var cw = Math.max(140, Math.min(180, (W - 2 * m) / 6.6)), ch = cw * 1.19;
    var sp = (W - 2 * m - cw) / Math.max(1, n - 1), half = W / 2 - m - cw / 2;
    var rise = Math.max(70, Math.min(160, W * 0.1));

    list.style.height = '0px';
    var lr = list.getBoundingClientRect(), nb = textBox(nameEl), rb = textBox(roleEl);
    var boxL = Math.min(nb.left, rb.left) - lr.left - 18;
    var boxR = Math.max(nb.right, rb.right) - lr.left + 18;
    var textBottom = rb.bottom - lr.top;

    var xs = [], us = [], base = textBottom + 30;
    for (var i = 0; i < n; i++) {
      var x = m + cw / 2 + i * sp, u = (x - W / 2) / half;
      xs.push(x); us.push(u);
      if (x + cw / 2 > boxL && x - cw / 2 < boxR) base = Math.max(base, textBottom + 30 + rise * u * u);
    }
    var bottom = 0;
    items.forEach(function (li, i) {
      var u = us[i], top = base - rise * u * u;
      place(li, xs[i], top + ch / 2, cw, ch, 1 - 0.06 * u * u, u * 24, 100 - Math.round(u * u * 40), i);
      sides[i] = u > 0 ? 'right' : 'left';
      bottom = Math.max(bottom, top + ch);
    });
    list.style.height = px(bottom + 30);
  }

  layout(true);
  if ('ResizeObserver' in window) new ResizeObserver(function () { layout(false); }).observe(desk);
  else window.addEventListener('resize', function () { layout(false); }, { passive: true });
  // Her name sets where the folders may rise; measure again once the fonts land.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(true); });

  /* ======================================================================
     Her eyes
     ====================================================================== */

  var looks = {};
  Array.prototype.forEach.call(me.querySelectorAll('[data-look]'), function (img) {
    looks[img.getAttribute('data-look')] = img;
  });
  function gaze(side) {
    me.setAttribute('data-gaze', looks[side] ? side : 'front');
  }

  /* ======================================================================
     Opening a folder
     ====================================================================== */

  var busy = false, openIdx = -1, lastType = 'mouse';

  function pushHash(hash) {
    try { history.pushState(null, '', hash); } catch (err) { /* sandboxed: the jump still works */ }
  }

  function landOn(target) {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    var head = target.querySelector('h2');
    if (head) {
      head.setAttribute('tabindex', '-1');
      head.focus({ preventScroll: true });
    }
  }

  function finish(folder) {
    folder.classList.remove('is-on');
    busy = false;
    openIdx = -1;
    tapped = null;
    gaze('front');
  }

  function openFolder(i) {
    if (busy) return;
    var folder = folders[i];
    var hash = folder.getAttribute('href');
    var target = document.querySelector(hash);
    var study = folder.getAttribute('data-case');
    busy = true;
    openIdx = i;

    var looking = me.getAttribute('data-gaze') === sides[i] && looks[sides[i]];
    gaze(sides[i]);
    folder.classList.add('is-on');

    setTimeout(function () {
      // Live Projects: the Vibe Coding study, in the reader. Setting the hash
      // lands one history entry, exactly like clicking its card on the board.
      if (study && window.Reader) {
        location.hash = '#case/' + study;
        finish(folder);
        return;
      }
      if (!target) { finish(folder); return; }

      if (reduced) {
        pushHash(hash);
        landOn(target);
        finish(folder);
        return;
      }

      var r = folder.getBoundingClientRect();
      var sheet = document.createElement('div');
      sheet.className = 'desk-sheet';
      sheet.setAttribute('aria-hidden', 'true');
      sheet.style.setProperty('--fc', getComputedStyle(folder).getPropertyValue('--fc'));
      sheet.innerHTML =
        '<span class="desk-sheet__tag">' + folder.querySelector('.folder__tab').innerHTML + '</span>' +
        '<span class="desk-sheet__title">' + folder.querySelector('.folder__title').innerHTML + '</span>';
      sheet.style.top = px(r.top); sheet.style.left = px(r.left);
      sheet.style.width = px(r.width); sheet.style.height = px(r.height);
      document.body.appendChild(sheet);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          sheet.classList.add('is-full');
          sheet.style.top = '0px'; sheet.style.left = '0px';
          sheet.style.width = '100vw'; sheet.style.height = '100vh';
        });
      });

      setTimeout(function () {
        pushHash(hash);
        landOn(target);
        sheet.classList.add('is-leaving');
        finish(folder);
        setTimeout(function () { sheet.remove(); }, 380);
      }, 640);
    }, reduced ? 0 : (looking ? 160 : 420));
  }

  folders.forEach(function (folder, i) {
    folder.addEventListener('click', function (e) {
      // A middle-click or ⌘-click still opens a new tab, like any link.
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (lastType !== 'mouse') tapped = folder;
      openFolder(i);
    });
    folder.addEventListener('pointerenter', function () { if (!busy) gaze(sides[i]); });
    folder.addEventListener('pointerleave', function () { if (!busy) gaze('front'); });
    folder.addEventListener('focus', function () {
      if (!busy) gaze(sides[i]);
      try { if (folder.matches(':focus-visible')) focused = folder; } catch (err) { focused = folder; }
    });
    folder.addEventListener('blur', function () {
      if (!busy) gaze('front');
      if (focused === folder) focused = null;
    });
  });

  /* ======================================================================
     The selection-frame cursor
     ====================================================================== */

  var P = { x: 0, y: 0, inside: false };
  var hovered = null, focused = null, tapped = null;
  var xy = cross ? cross.querySelector('.desk__xy') : null;
  var selName = sel ? sel.querySelector('.desk__sel-name') : null;
  var selSize = sel ? sel.querySelector('.desk__sel-size') : null;

  if (layer && cross && sel) {
    if (fine) desk.classList.add('desk--cursor');

    desk.addEventListener('pointerdown', function (e) { lastType = e.pointerType || 'mouse'; }, true);
    desk.addEventListener('pointermove', function (e) {
      lastType = e.pointerType || 'mouse';
      if (lastType !== 'mouse') return;
      var d = desk.getBoundingClientRect();
      P.x = e.clientX - d.left; P.y = e.clientY - d.top; P.inside = true;
      hovered = e.target.closest ? e.target.closest('.folder') : null;
    });
    desk.addEventListener('pointerleave', function () { P.inside = false; hovered = null; });

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

    var shown = '', visible = true, running = false;

    var tick = function () {
      running = false;
      if (!visible) return;
      var target = openIdx >= 0 ? folders[openIdx] : (hovered || tapped || focused);
      var showX = fine && P.inside && lastType === 'mouse';
      cross.classList.toggle('is-on', showX);
      if (showX) {
        cross.style.transform = 'translate(' + P.x + 'px,' + P.y + 'px)';
        xy.textContent = 'x ' + Math.round(P.x) + '  y ' + Math.round(P.y);
        xy.style.opacity = target ? 0 : 1;
      }
      if (target) {
        var d = desk.getBoundingClientRect(), r = target.getBoundingClientRect(), pad = 7;
        sel.style.left = px(r.left - d.left - pad);
        sel.style.top = px(r.top - d.top - pad);
        sel.style.width = px(r.width + pad * 2);
        sel.style.height = px(r.height + pad * 2);
        var name = 'Folder / ' + target.querySelector('.folder__title').textContent;
        if (name !== shown) { selName.textContent = name; shown = name; }
        selSize.textContent = Math.round(r.width) + ' × ' + Math.round(r.height);
        sel.classList.add('is-on');
      } else {
        sel.classList.remove('is-on');
      }
      run();
    };
    var run = function () {
      if (running || !visible) return;
      running = true;
      requestAnimationFrame(tick);
    };

    // Only draw while the desk is on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) run();
      }).observe(desk);
    }
    run();
  }

  /* ======================================================================
     The nav stays hidden while the desk fills the screen
     ====================================================================== */

  if (nav && window.Motion) {
    Motion.onScroll(function (y, vh) {
      nav.classList.toggle('is-desk', y < desk.offsetHeight - vh * 0.35);
    });
  }
})();
