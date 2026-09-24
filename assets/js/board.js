/* ==========================================================================
   board.js — the pin board.

   Renders a card per published entry in window.WORK, lets them drift as if
   there were air in the room, tilts them toward the cursor, and draws the
   string between the pins. All of it goes quiet under prefers-reduced-motion.
   ========================================================================== */

(function () {
  'use strict';

  var stage   = document.getElementById('boardStage');
  var holder  = document.getElementById('boardCards');
  var strings = document.getElementById('boardStrings');
  if (!holder || !window.WORK) return;

  var SKEWS = [-1.4, 0.9, -0.6, 1.2, -1.1];   // a little human imprecision
  var cards = [];

  function icon(id, extraClass) {
    return '<svg class="icon ' + (extraClass || '') + '" aria-hidden="true">' +
           '<use href="#i-' + id + '"/></svg>';
  }

  function cluster(spec) {
    // An illustration from assets/img/art/ piles up like it does in the study.
    if (spec.art && window.Art) return Art.pile({ name: spec.art, count: spec.count });
    var out = '';
    for (var i = 0; i < spec.count; i++) out += icon(spec.icon);
    return out;
  }

  function miniCluster(spec) {
    return '<span class="mini__cluster' + (spec && spec.art ? ' mini__cluster--art' : '') + '">' +
             (spec ? cluster(spec) : '') + '</span>';
  }

  /* ---- render ----------------------------------------------------------- */

  window.WORK.forEach(function (item, i) {
    if (item.published === false) return;

    var t = item.card.thumb || {};
    var isDraft = item.status === 'draft';
    var id = 'pc-' + item.slug;

    var el = document.createElement('article');
    el.className = 'pincard' + (t.tone === 'lime' ? ' pincard--lime' : '');
    el.style.setProperty('--skew', SKEWS[i % SKEWS.length] + 'deg');

    el.innerHTML =
      '<span class="pincard__pin" aria-hidden="true"></span>' +

      '<div class="pincard__thumb" aria-hidden="true">' +
        '<div class="mini ' + (t.tone === 'lime' ? 'mini--lime' : '') + '">' +
          miniCluster(t.left) +
          '<span class="mini__arrow">' + icon('arrow') + '</span>' +
          miniCluster(t.right) +
        '</div>' +
      '</div>' +

      '<div class="pincard__tags">' +
        '<span class="tag tag--kind">' + item.kind + '</span>' +
        // One topic tag only — three pills fit on one line, four wrap and the
        // card starts to look like a tag cloud.
        (item.card.tags || []).slice(0, 1).map(function (tag) {
          return '<span class="tag">' + tag + '</span>';
        }).join('') +
        '<span class="tag ' + (isDraft ? 'tag--wip' : 'tag--live') + '">' +
          (isDraft ? 'In progress' : 'Shipped') +
        '</span>' +
      '</div>' +

      '<h3 class="pincard__title" id="' + id + '">' + item.card.title + '</h3>' +
      '<p class="pincard__sub">' + item.card.sub + '</p>' +
      '<p class="pincard__go" aria-hidden="true">Read it ' + icon('arrow') + '</p>' +

      '<a class="pincard__hit" href="#case/' + item.slug + '" ' +
         'aria-label="Read ' + item.kind.toLowerCase() + ': ' + item.card.title + '"></a>';

    holder.appendChild(el);

    cards.push({
      el: el,
      phase: Math.random() * Math.PI * 2,
      amp: 4 + Math.random() * 4,      // px
      speed: 0.00042 + Math.random() * 0.00024,
      live: true
    });
  });

  if (!cards.length) return;

  /* ---- drift ------------------------------------------------------------ */

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var hit = cards.find(function (c) { return c.el === e.target; });
        if (hit) hit.live = e.isIntersecting;
      });
    }, { rootMargin: '10% 0px' });
    cards.forEach(function (c) { io.observe(c.el); });
  }

  Motion.onFrame(function (t) {
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (!c.live) continue;
      var y = Math.sin(t * c.speed + c.phase) * c.amp;
      c.el.style.setProperty('--drift-y', y.toFixed(2) + 'px');
    }
  });

  /* ---- tilt toward the cursor ------------------------------------------- */

  if (!Motion.reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cards.forEach(function (c) {
      c.el.addEventListener('pointermove', function (e) {
        var b = c.el.getBoundingClientRect();
        var nx = (e.clientX - b.left) / b.width - 0.5;    // -0.5 … 0.5
        var ny = (e.clientY - b.top) / b.height - 0.5;
        c.el.style.setProperty('--tilt-y', (nx * 7).toFixed(2) + 'deg');
        c.el.style.setProperty('--tilt-x', (-ny * 7).toFixed(2) + 'deg');
        c.el.style.setProperty('--lift', '1');
      });
      c.el.addEventListener('pointerleave', function () {
        c.el.style.setProperty('--tilt-y', '0deg');
        c.el.style.setProperty('--tilt-x', '0deg');
        c.el.style.setProperty('--lift', '0');
      });
    });
  }

  /* ---- the string between the pins -------------------------------------- */

  function drawStrings() {
    if (!strings || !stage) return;
    var wide = window.matchMedia('(min-width: 721px)').matches;
    if (!wide || cards.length < 2) { strings.innerHTML = ''; return; }

    var base = stage.getBoundingClientRect();
    strings.setAttribute('viewBox', '0 0 ' + base.width + ' ' + base.height);

    var pts = cards.map(function (c) {
      var pin = c.el.querySelector('.pincard__pin').getBoundingClientRect();
      return {
        x: pin.left - base.left + pin.width / 2,
        y: pin.top - base.top + pin.height / 2
      };
    });

    var d = '';
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var midX = (a.x + b.x) / 2;
      var sag = Math.min(Math.abs(b.x - a.x) * 0.22, 52);   // gravity on a string
      d += 'M' + a.x + ' ' + a.y +
           ' Q' + midX + ' ' + (Math.max(a.y, b.y) + sag) + ' ' + b.x + ' ' + b.y + ' ';
    }
    strings.innerHTML = '<path d="' + d + '"/>';
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawStrings, 120);
  }, { passive: true });

  drawStrings();
  window.addEventListener('load', drawStrings);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawStrings);
})();
