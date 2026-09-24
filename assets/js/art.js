/* ==========================================================================
   art.js — the illustrations used in challenge diagrams and card thumbnails.

   Pictures live in assets/img/art/. A bare name means an SVG ("invoice" →
   invoice.svg); a name with an extension is used as-is ("support-agent.png").
   Several copies of one picture are laid out as a pile, not a row.
   ========================================================================== */

(function () {
  'use strict';

  var DIR = 'assets/img/art/';

  // Where each copy sits in a pile, in picture-widths (x) and heights (y).
  var PILES = {
    1: [[0, 0]],
    2: [[0, 0.42], [0.62, 0]],
    3: [[0, 0], [1.2, 0], [0.6, 0.9]],
    4: [[0.5, 0], [0, 0.52], [1, 0.4], [0.5, 0.92]],
    5: [[0, 0], [1.24, 0], [2.48, 0], [0.62, 1.12], [1.86, 1.12]]
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function src(name) {
    return DIR + (/\.[a-z0-9]+$/i.test(name) ? name : name + '.svg');
  }

  /** { name: 'invoice', count: 5 }  or  { icon: 'alert', count: 3 } */
  function pile(g) {
    var one = g.icon
      ? '<svg class="icon" aria-hidden="true"><use href="#i-' + g.icon + '"/></svg>'
      : '<img src="' + esc(src(g.name)) + '" alt="" decoding="async">';
    var spots = PILES[g.count] || PILES[1];
    var w = 1, h = 1;
    spots.forEach(function (p) { w = Math.max(w, p[0] + 1); h = Math.max(h, p[1] + 1); });

    var out = '';
    spots.forEach(function (p) {
      out += '<span class="pile__item" style="--x:' + p[0] + ';--y:' + p[1] + '">' + one + '</span>';
    });

    var kind = g.icon ? 'icon' : g.name.replace(/\.[a-z0-9]+$/i, '');
    return '<span class="pile art--' + esc(kind) + '" style="--w:' + w + ';--h:' + h + '" aria-hidden="true">' +
             out + '</span>';
  }

  window.Art = { src: src, pile: pile };
})();
