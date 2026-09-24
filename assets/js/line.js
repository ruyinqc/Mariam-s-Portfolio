/* ==========================================================================
   line.js — the path as a clothesline.

   The experience list is one long row of photos pegged to a rope. While the
   section is on screen the row is pinned, and scrolling down the page moves
   it sideways. It can also be dragged, swiped, scrolled sideways with a
   trackpad or Shift + wheel, stepped with the arrow buttons, or moved with
   the arrow keys once it has focus.

   There is one source of truth for where the row is. When pinned, it is the
   page's own scroll position: a drag or a sideways swipe just scrolls the
   page, so the row and the page can never disagree about where you are, and
   the Back button, the nav and the progress ring all keep working. When the
   screen is too short to pin, it is the row's native scrollLeft instead.

   The photos swing on their pegs when the row moves and settle when it
   stops. All of that goes quiet under prefers-reduced-motion; the row still
   follows the scroll, because that is the visitor's own hand moving it.
   ========================================================================== */

(function () {
  'use strict';

  var line  = document.getElementById('line');
  var pin   = document.getElementById('linePin');
  var view  = document.getElementById('lineView');
  var track = document.getElementById('lineTrack');
  var rope  = document.getElementById('lineRope');
  var bar   = document.getElementById('lineBar');
  var steps = document.getElementById('lineSteps');
  var prev  = document.getElementById('linePrev');
  var next  = document.getElementById('lineNext');
  var hint  = document.getElementById('lineHint');
  if (!line || !pin || !view || !track || !window.Motion) return;

  var ctrl  = pin.querySelector('.line__ctrl');
  var hangs = Array.prototype.slice.call(track.querySelectorAll('.hang'));
  if (!hangs.length) return;

  var ROPE_IN_PEG = 7;     // px from the top of a peg to where the rope runs
  var NAIL_RISE   = 24;    // how far the nails sit above the highest peg

  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var pinned = false;
  var maxX = 0;            // how far the row can travel
  var top0 = 0;            // page y where the pin begins
  var stops = [];          // the x that centres each photo

  var x = 0;               // where the row is drawn
  var goal = 0;            // where it is heading
  var direct = false;      // a finger or a fling is steering: no easing
  var fling = 0;           // px per ms, after a thrown drag
  var onScreen = false;
  var aim = 0, aimAt = 0;  // the last stop an arrow asked for

  var swings = hangs.map(function (h, i) {
    return {
      el: h.querySelector('.hang__photo'),
      a: 0,                              // angle, deg
      w: 0,                              // angular velocity, deg per ms
      k: 0.00015 + (i % 3) * 0.00003,    // stiffness: not all in unison
      phase: i * 1.7
    };
  });

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ---- where the row is, and moving it ---------------------------------- */

  function pos() {
    return pinned ? clamp(window.scrollY - top0, 0, maxX) : view.scrollLeft;
  }

  function moveTo(px, smooth) {
    px = clamp(px, 0, maxX);
    var glide = smooth && !Motion.reduced;
    if (!pinned) {
      view.scrollTo({ left: px, behavior: glide ? 'smooth' : 'auto' });
    } else if (glide) {
      window.scrollTo({ top: top0 + px, behavior: 'smooth' });
    } else {
      // <html> scrolls smoothly by default; a drag has to land at once.
      var root = document.documentElement;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(window.scrollX, top0 + px);
      root.style.scrollBehavior = '';
    }
  }

  function step(dir) {
    var base = performance.now() - aimAt < 700 ? aim : pos();
    var to = dir > 0 ? maxX : 0;
    var i;
    if (dir > 0) {
      for (i = 0; i < stops.length; i++) if (stops[i] > base + 4) { to = stops[i]; break; }
    } else {
      for (i = stops.length - 1; i >= 0; i--) if (stops[i] < base - 4) { to = stops[i]; break; }
    }
    aim = to;
    aimAt = performance.now();
    moveTo(to, true);
  }

  /* ---- drawing ----------------------------------------------------------- */

  var shown = { p: -1, prev: '', next: '' };

  function paint() {
    track.style.transform = pinned ? 'translate3d(' + (-x).toFixed(2) + 'px,0,0)' : '';

    var p = maxX ? Math.round((x / maxX) * 1000) / 1000 : 0;
    if (bar && p !== shown.p) { bar.style.transform = 'scaleX(' + p + ')'; shown.p = p; }

    var atStart = x <= 2 ? 'true' : 'false';
    var atEnd = x >= maxX - 2 ? 'true' : 'false';
    if (prev && atStart !== shown.prev) { prev.setAttribute('aria-disabled', atStart); shown.prev = atStart; }
    if (next && atEnd !== shown.next) { next.setAttribute('aria-disabled', atEnd); shown.next = atEnd; }
  }

  function offsetIn(el, ancestor) {
    var l = 0, t = 0;
    while (el && el !== ancestor) { l += el.offsetLeft; t += el.offsetTop; el = el.offsetParent; }
    return { x: l, y: t };
  }

  /* The rope is nailed up between the photos and sags under each one. It is
     laid out from the pegs' real positions, and offsets ignore transforms,
     so the reveal animation and the swing never pull it out of place. */
  function drawRope() {
    if (!rope) return;
    var W = track.offsetWidth, H = track.offsetHeight;

    var pegs = hangs.map(function (h) {
      var peg = h.querySelector('.hang__peg');
      var o = offsetIn(peg, track);
      return { x: o.x + peg.offsetWidth / 2, y: o.y + ROPE_IN_PEG };
    });

    var span = pegs.length > 1 ? pegs[1].x - pegs[0].x : 240;
    var high = Math.min.apply(null, pegs.map(function (p) { return p.y; }));
    var nails = [];
    for (var i = 0; i <= pegs.length; i++) {
      var nx = i === 0 ? pegs[0].x - span / 2
             : i === pegs.length ? pegs[i - 1].x + span / 2
             : (pegs[i - 1].x + pegs[i].x) / 2;
      nails.push({ x: nx, y: high - NAIL_RISE + (i % 2 ? 4 : -2) });
    }

    function f(n) { return n.toFixed(1); }
    var a = nails[0], z = nails[nails.length - 1];

    // In from the left edge, sagging, up to the first nail…
    var d = 'M0 ' + f(a.y + 6) + ' Q' + f(a.x / 2) + ' ' + f(a.y + 30) + ' ' + f(a.x) + ' ' + f(a.y);
    // …then down to each peg and back up to the next nail. The curve is flat
    // where it meets a peg, the way a line looks under a small weight.
    for (i = 0; i < pegs.length; i++) {
      var n0 = nails[i], p = pegs[i], n1 = nails[i + 1];
      d += ' Q' + f(p.x - (p.x - n0.x) / 2) + ' ' + f(p.y) + ' ' + f(p.x) + ' ' + f(p.y) +
           ' Q' + f(p.x + (n1.x - p.x) / 2) + ' ' + f(p.y) + ' ' + f(n1.x) + ' ' + f(n1.y);
    }
    // …and out past the right edge.
    d += ' Q' + f((z.x + W) / 2) + ' ' + f(z.y + 30) + ' ' + f(W) + ' ' + f(z.y + 6);

    var tacks = nails.map(function (n) {
      return '<circle class="line__tack" cx="' + f(n.x) + '" cy="' + f(n.y) + '" r="4.5"/>' +
             '<circle class="line__tack-shine" cx="' + f(n.x - 1.4) + '" cy="' + f(n.y - 1.4) + '" r="1.4"/>';
    }).join('');

    rope.setAttribute('width', W);
    rope.setAttribute('height', H);
    rope.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    rope.innerHTML = '<path class="line__cord" d="' + d + '"/>' +
                     '<path class="line__twist" d="' + d + '"/>' + tacks;
    line.classList.add('line--roped');
  }

  /* ---- the frame loop ---------------------------------------------------- */

  var stopLoop = null, last = 0;

  function wake() {
    if (Motion.reduced) { x = goal; paint(); return; }
    if (!stopLoop) { last = 0; stopLoop = Motion.onFrame(tick); }
  }

  function tick(t) {
    var dt = last ? Math.min(t - last, 48) : 16.7;
    last = t;

    if (fling) {
      fling *= Math.pow(0.94, dt / 16.7);
      var to = pos() + fling * dt;
      moveTo(to);
      goal = pos();
      if (Math.abs(fling) < 0.02 || to <= 0 || to >= maxX) { fling = 0; direct = false; }
    }

    var before = x;
    x = direct || !pinned ? goal : x + (goal - x) * (1 - Math.exp(-dt / 110));
    if (Math.abs(goal - x) < 0.1) x = goal;
    var v = (x - before) / dt;

    var still = x === goal && !fling;
    for (var i = 0; i < swings.length; i++) {
      var s = swings[i];
      // The row moving left leaves the bottom of each photo trailing right.
      var want = clamp(-v * 4, -9, 9) +
                 (onScreen ? Math.sin(t * 0.0012 + s.phase) * 0.6 : 0);   // a little air
      s.w += ((want - s.a) * s.k - s.w * 0.012) * dt;
      s.a += s.w * dt;
      if (Math.abs(s.a) > 0.02 || Math.abs(s.w) > 0.0005) still = false;
      s.el.style.setProperty('--swing', s.a.toFixed(2) + 'deg');
    }

    paint();
    if (still && !onScreen) { stopLoop(); stopLoop = null; }
  }

  /* ---- measuring --------------------------------------------------------- */

  function setHint() {
    var label = hint && hint.querySelector('span');
    if (!label) return;
    label.textContent = pinned
      ? (coarse ? 'Keep scrolling, or swipe the line' : 'Keep scrolling, or drag the line')
      : (coarse ? 'Swipe the line sideways' : 'Drag the line sideways');
  }

  function measure() {
    // Measure in the pinned layout, then keep it only if it fits.
    line.classList.add('line--pinned');
    var cs = getComputedStyle(pin);
    var need = view.offsetHeight + ctrl.offsetHeight +
               (parseFloat(cs.rowGap) || 0) +
               parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var travel = track.offsetWidth - view.clientWidth;

    pinned = travel > 1 && need <= pin.clientHeight;
    line.classList.toggle('line--pinned', pinned);

    if (pinned) {
      maxX = travel;
      view.scrollLeft = 0;
      line.style.height = (pin.offsetHeight + maxX) + 'px';
    } else {
      line.style.height = '';
      track.style.transform = '';
      maxX = Math.max(0, view.scrollWidth - view.clientWidth);
    }
    line.classList.toggle('line--fits', maxX <= 1);
    top0 = line.getBoundingClientRect().top + window.scrollY;

    stops = hangs.map(function (h) {
      return clamp(h.offsetLeft + h.offsetWidth / 2 - view.clientWidth / 2, 0, maxX);
    });

    drawRope();
    setHint();
    Motion.remeasure();
    goal = x = pos();
    paint();
  }

  /* ---- input ------------------------------------------------------------- */

  Motion.onScroll(function () {
    if (!pinned) return;
    top0 = line.getBoundingClientRect().top + window.scrollY;
    goal = pos();
    wake();
  });

  view.addEventListener('scroll', function () {
    if (pinned) return;
    goal = view.scrollLeft;
    wake();
  }, { passive: true });

  // Sideways wheels and trackpad swipes. Up and down stays the page's.
  view.addEventListener('wheel', function (e) {
    if (!pinned) return;
    var dx = e.deltaX, dy = e.deltaY;
    if (e.shiftKey && !dx) { dx = dy; dy = 0; }
    if (Math.abs(dx) <= Math.abs(dy)) return;
    e.preventDefault();
    var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? view.clientWidth : 1;
    fling = 0;
    direct = false;
    moveTo(pos() + dx * unit);
  }, { passive: false });

  // Dragging with a mouse, or swiping with a finger while pinned. Unpinned,
  // a finger already gets the browser's own sideways scroll, which is better.
  var drag = null;

  view.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    if (e.pointerType === 'touch' && !pinned) return;
    fling = 0;
    direct = false;
    drag = { id: e.pointerId, x0: e.clientX, from: pos(), moved: false,
             lx: e.clientX, lt: e.timeStamp, v: 0 };
  });

  view.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 5) return;
      drag.moved = true;
      direct = true;
      line.classList.add('is-dragging');
      try { view.setPointerCapture(e.pointerId); } catch (_) {}
    }
    var dt = e.timeStamp - drag.lt;
    if (dt > 0) drag.v = 0.8 * ((e.clientX - drag.lx) / dt) + 0.2 * drag.v;
    drag.lx = e.clientX;
    drag.lt = e.timeStamp;

    moveTo(drag.from - dx);
    goal = pos();
    wake();
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag;
    drag = null;
    line.classList.remove('is-dragging');
    if (!d.moved) return;
    direct = false;
    // Let go mid-swipe and it keeps going for a moment, like a thrown thing.
    if (!Motion.reduced && e.type === 'pointerup' &&
        e.timeStamp - d.lt < 80 && Math.abs(d.v) > 0.15) {
      fling = clamp(-d.v, -4, 4);
      direct = true;
      wake();
    }
  }
  view.addEventListener('pointerup', endDrag);
  view.addEventListener('pointercancel', endDrag);

  view.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      moveTo(e.key === 'Home' ? 0 : maxX, true);
    }
  });

  function onStep(dir) {
    return function () {
      if (this.getAttribute('aria-disabled') === 'true') return;
      fling = 0;
      direct = false;
      step(dir);
    };
  }
  if (prev) prev.addEventListener('click', onStep(-1));
  if (next) next.addEventListener('click', onStep(1));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[entries.length - 1].isIntersecting;
      if (onScreen) wake();
    }).observe(view);
  }

  /* ---- go ---------------------------------------------------------------- */

  line.classList.add('line--live');
  if (steps) steps.hidden = false;
  measure();

  // Phone toolbars resize the window by a few dozen pixels as they slide in
  // and out. The stage is sized in svh, so that is not worth re-measuring —
  // and re-measuring mid-scroll is what would make the page jump.
  var lastW = window.innerWidth, lastH = window.innerHeight, resizeTimer;
  window.addEventListener('resize', function () {
    var w = window.innerWidth, h = window.innerHeight;
    if (w === lastW && Math.abs(h - lastH) < 120) return;
    lastW = w;
    lastH = h;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 120);
  }, { passive: true });

  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();
