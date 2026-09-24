/* ==========================================================================
   lens.js — a zoomed-in crop of one of the hi-fi screens, used in a
   challenge diagram or a card thumbnail instead of an illustration (see
   data.js → `zoom`).

   The whole screen from mockups.js is drawn at a fixed width, then scaled
   and moved inside a small window so that one part of it fills the view.
   Parts of a screen are named with data-focus="…" hooks in mockups.js. A
   lens frames the part it is given, rings it, and dims everything else.
   `focus` and `frame` can each list several names, separated by spaces.

   When a lens first scrolls into view it starts on the whole screen and
   zooms in to its part. Under reduced motion it simply starts zoomed in.
   ========================================================================== */

(function () {
  'use strict';

  var uid = 0;

  var LOUPE =
    '<svg class="lens__loupe" viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>' +
    '</svg>';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** Screens named "…-after" get the After look; anything else is Before. */
  function isAfter(screen) { return /-after$/.test(screen); }

  /* ---- markup -------------------------------------------------------------
     { screen: 'naming-before', focus: 'ends', frame: 'list',
       span: 0.5, align: 'start' }                                            */

  function html(z) {
    var draw = window.Mockups && window.Mockups[z.screen];
    var after = isAfter(z.screen);
    return '<div class="lens lens--' + (after ? 'good' : 'bad') + '" aria-hidden="true"' +
        ' data-lens-focus="' + esc(z.focus || '') + '"' +
        (z.frame ? ' data-lens-frame="' + esc(z.frame) + '"' : '') +
        (z.span  ? ' data-lens-span="' + esc(z.span) + '"' : '') +
        (z.align ? ' data-lens-align="' + esc(z.align) + '"' : '') + '>' +
      '<div class="lens__view">' +
        '<div class="lens__canvas">' + (draw ? draw() : '') + '</div>' +
      '</div>' +
      '<span class="lens__tag">' + LOUPE + (after ? 'After' : 'Before') + '</span>' +
    '</div>';
  }

  /* ---- geometry -----------------------------------------------------------
     Everything is measured in the screen's own layout pixels, so nothing
     around the lens can throw it off: not its own zoom, the reader's open
     transition, or the tilt of a card on the pin board.                    */

  function boxes(canvas, keys) {
    var names = (keys || '').replace(/"/g, '').split(/\s+/).filter(Boolean);
    if (!names.length) return [];
    var nodes = canvas.querySelectorAll(names.map(function (n) {
      return '[data-focus~="' + n + '"]';
    }).join(','));
    return Array.prototype.map.call(nodes, function (el) {
      // walk up to the canvas, which is positioned, so it is always on the way
      var x = 0, y = 0, n = el;
      while (n && n !== canvas) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent;
        if (n && n !== canvas) { x += n.clientLeft; y += n.clientTop; }
      }
      return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
    });
  }

  function union(list) {
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    list.forEach(function (b) {
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
    });
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }

  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  /** Where the camera sits to frame `box`: a scale and an offset. */
  function aim(lw, lh, W, H, box, o) {
    var pad = W * 0.03;
    var ratio = lw / lh;
    var w, h, x;

    if (o.span) {
      w = W * o.span;
      h = w / ratio;
      x = o.align === 'start' ? box.x - pad
        : o.align === 'end'   ? box.x + box.w + pad - w
        : box.x + box.w / 2 - w / 2;
    } else {
      w = box.w + pad * 2;
      h = box.h + pad * 2;
      if (w / h > ratio) h = w / ratio; else w = h * ratio;
      x = box.x + box.w / 2 - w / 2;
    }
    var y = box.y + box.h / 2 - h / 2;

    // stay on the screen, so the window is never half empty
    x = w >= W ? (W - w) / 2 : clamp(x, 0, W - w);
    y = h >= H ? (H - h) / 2 : clamp(y, 0, H - h);

    var s = lw / w;
    return { s: s, x: -x * s, y: -y * s };
  }

  /** The whole screen, fitted inside the window. Where the zoom starts. */
  function whole(lw, lh, W, H) {
    var m = lw * 0.07;
    var s = Math.min((lw - m * 2) / W, (lh - m * 2) / H);
    return { s: s, x: (lw - W * s) / 2, y: (lh - H * s) / 2 };
  }

  function toLens(b, cam, grow) {
    return {
      x: b.x * cam.s + cam.x - grow, y: b.y * cam.s + cam.y - grow,
      w: b.w * cam.s + grow * 2,     h: b.h * cam.s + grow * 2
    };
  }

  function rect(r, extra) {
    var rx = Math.min(10, r.h / 2);
    return '<rect x="' + r.x.toFixed(1) + '" y="' + r.y.toFixed(1) +
      '" width="' + r.w.toFixed(1) + '" height="' + r.h.toFixed(1) +
      '" rx="' + rx.toFixed(1) + '"' + extra + '/>';
  }

  /* ---- one lens ----------------------------------------------------------- */

  function paint(st) {
    var lw = st.view.clientWidth, lh = st.view.clientHeight;
    var W = st.canvas.offsetWidth, H = st.canvas.offsetHeight;
    if (!lw || !lh || !W || !H) return;

    var ring = boxes(st.canvas, st.focus);
    var frame = st.frame ? boxes(st.canvas, st.frame) : ring;
    if (!frame.length) return;

    var cam = aim(lw, lh, W, H, union(frame), st);
    var now = st.zoomed ? cam : whole(lw, lh, W, H);
    st.canvas.style.transform =
      'translate(' + now.x.toFixed(2) + 'px,' + now.y.toFixed(2) + 'px) scale(' + now.s.toFixed(4) + ')';

    // The spotlight is drawn for the zoomed-in view only; it fades in once
    // the camera arrives.
    var holes = frame.concat(ring).map(function (b) { return toLens(b, cam, 6); });
    var rings = ring.map(function (b) { return toLens(b, cam, 5); });

    st.spot.setAttribute('viewBox', '0 0 ' + lw + ' ' + lh);
    st.spot.innerHTML =
      '<defs><mask id="' + st.id + '">' +
        '<rect width="' + lw + '" height="' + lh + '" fill="#fff"/>' +
        holes.map(function (r) { return rect(r, ' fill="#000"'); }).join('') +
      '</mask></defs>' +
      '<rect class="lens__dim" width="' + lw + '" height="' + lh + '" mask="url(#' + st.id + ')"/>' +
      rings.map(function (r) {
        return rect(r, ' class="lens__halo"') + rect(r, ' class="lens__ring"');
      }).join('');
  }

  function zoomIn(st) {
    if (st.zoomed) return;
    st.zoomed = true;
    st.el.classList.add('is-zoomed', 'is-zooming');
    paint(st);
    var done = function () { st.el.classList.remove('is-zooming'); };
    st.canvas.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 1600);   // in case the transition never runs
  }

  /* ---- mount ----------------------------------------------------------------
     Call after the lenses are in the page. Returns a function that stops
     watching them, for when the page is torn down.                           */

  function mount(root) {
    var nodes = root.querySelectorAll('.lens');
    if (!nodes.length) return function () {};

    var still = (window.Motion && Motion.reduced) || !('IntersectionObserver' in window);
    var alive = true;

    var list = Array.prototype.map.call(nodes, function (el) {
      var spot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      spot.setAttribute('class', 'lens__spot');
      spot.setAttribute('aria-hidden', 'true');
      spot.setAttribute('preserveAspectRatio', 'none');
      var view = el.querySelector('.lens__view');
      view.appendChild(spot);
      if (still) el.classList.add('is-zoomed');
      return {
        el: el,
        view: view,
        canvas: el.querySelector('.lens__canvas'),
        spot: spot,
        id: 'lens-mask-' + (++uid),
        focus: el.getAttribute('data-lens-focus'),
        frame: el.getAttribute('data-lens-frame'),
        span: parseFloat(el.getAttribute('data-lens-span')) || 0,
        align: el.getAttribute('data-lens-align'),
        zoomed: still
      };
    });

    function paintAll() { if (alive) list.forEach(paint); }
    paintAll();

    // text reflows once the webfonts land, and the window changes size with
    // the viewport — both move the part the camera is aimed at
    var ro = 'ResizeObserver' in window ? new ResizeObserver(paintAll) : null;
    if (ro) list.forEach(function (st) { ro.observe(st.view); });
    if (document.fonts) {
      document.fonts.ready.then(paintAll);
      document.fonts.addEventListener('loadingdone', paintAll);
    }

    var io = null;
    if (!still) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          list.forEach(function (st) { if (st.el === e.target) zoomIn(st); });
        });
      }, { threshold: 0.6 });
      list.forEach(function (st) { io.observe(st.el); });
    }

    return function unmount() {
      alive = false;
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      if (document.fonts) document.fonts.removeEventListener('loadingdone', paintAll);
    };
  }

  window.Lens = { html: html, mount: mount };
})();
