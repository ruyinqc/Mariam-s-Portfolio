/* ==========================================================================
   motion.js — one scroll loop, one clock, one reduced-motion switch.

   Everything that wants to react to scroll registers here instead of adding
   its own listener. That keeps us to a single rAF frame and a single read of
   scrollY per frame, which is what stops the parallax from juddering on a
   long page.
   ========================================================================== */

window.Motion = (function () {
  'use strict';

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = reduceQuery.matches;

  var scrollSubs = [];   // called with (scrollY, viewportH, docH)
  var frameSubs  = [];   // called with (timeMs) — only while something needs it
  var ticking = false;
  var rafId = null;

  var scrollY = 0, viewH = 0, docH = 0;

  function measure() {
    viewH = window.innerHeight;
    docH = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight
    );
  }

  function runScroll() {
    ticking = false;
    for (var i = 0; i < scrollSubs.length; i++) {
      scrollSubs[i](scrollY, viewH, docH);
    }
  }

  function onScroll() {
    scrollY = window.scrollY || window.pageYOffset || 0;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(runScroll);
    }
  }

  function loop(t) {
    for (var i = 0; i < frameSubs.length; i++) frameSubs[i](t);
    rafId = frameSubs.length ? requestAnimationFrame(loop) : null;
  }

  function startLoop() {
    if (rafId === null && frameSubs.length) rafId = requestAnimationFrame(loop);
  }

  /* ---- public ----------------------------------------------------------- */

  var api = {
    get reduced() { return reduced; },

    /** Subscribe to scroll. Fires immediately with current values. */
    onScroll: function (fn) {
      scrollSubs.push(fn);
      fn(scrollY, viewH, docH);
      return function off() {
        var i = scrollSubs.indexOf(fn);
        if (i > -1) scrollSubs.splice(i, 1);
      };
    },

    /** Subscribe to every animation frame. The loop only runs while used. */
    onFrame: function (fn) {
      if (reduced) return function () {};
      frameSubs.push(fn);
      startLoop();
      return function off() {
        var i = frameSubs.indexOf(fn);
        if (i > -1) frameSubs.splice(i, 1);
      };
    },

    remeasure: measure,

    /** Reveal-on-scroll for anything carrying [data-reveal]. */
    reveal: function (root) {
      var nodes = (root || document).querySelectorAll('[data-reveal]');
      if (!nodes.length) return;

      nodes.forEach(function (el) {
        var d = el.getAttribute('data-reveal-delay');
        if (d) el.style.setProperty('--reveal-delay', d);
      });

      if (!('IntersectionObserver' in window)) {
        nodes.forEach(function (el) { el.classList.add('is-in'); });
        return;
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);   // reveal once, then stop watching
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

      // Anything already on screen animates in straight away. The observer's
      // -12% bottom inset is right for scrolling but would strand content
      // sitting just above the fold at load, which is how the hero buttons
      // ended up invisible. Their stagger delays still apply, so the first
      // screen plays in rather than snapping.
      var vh = window.innerHeight;
      nodes.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          requestAnimationFrame(function () { el.classList.add('is-in'); });
        } else {
          io.observe(el);
        }
      });
    },

    /**
     * Parallax for [data-parallax="<rate>"].
     * Negative rate travels against the scroll (the classic "floats up" feel).
     * Only runs while the element is near the viewport.
     */
    parallax: function () {
      if (reduced) return;
      var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
      if (!nodes.length) return;

      var items = nodes.map(function (el) {
        return { el: el, rate: parseFloat(el.getAttribute('data-parallax')) || 0, live: true };
      });

      // Pause elements that are nowhere near the screen.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            var hit = items.find(function (it) { return it.el === e.target; });
            if (hit) hit.live = e.isIntersecting;
          });
        }, { rootMargin: '25% 0px 25% 0px' });
        items.forEach(function (it) { io.observe(it.el); });
      }

      api.onScroll(function (y, vh) {
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          if (!it.live) continue;
          var box = it.el.getBoundingClientRect();
          var centre = box.top + box.height / 2 - vh / 2;
          it.el.style.transform = 'translate3d(0,' + (centre * it.rate).toFixed(2) + 'px,0)';
        }
      });
    }
  };

  /* ---- wiring ----------------------------------------------------------- */

  measure();
  scrollY = window.scrollY || 0;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });

  // Late-loading images change the document height, which breaks the
  // scroll-progress ring if we don't re-measure.
  window.addEventListener('load', function () { measure(); onScroll(); });

  var onPrefChange = function (e) {
    reduced = e.matches;
    document.documentElement.style.setProperty('--motion', reduced ? '0' : '1');
    if (reduced) {
      frameSubs.length = 0;
      document.querySelectorAll('[data-parallax]').forEach(function (el) {
        el.style.transform = '';
      });
    }
  };
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onPrefChange);
  else if (reduceQuery.addListener) reduceQuery.addListener(onPrefChange);

  return api;
})();
