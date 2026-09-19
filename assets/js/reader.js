/* ==========================================================================
   reader.js — the full-screen case-study reader.

   Routing contract
   ----------------
   #case/<slug> opens that study. Clicking a card is a normal link click, so
   it lands one entry in history and Back returns to the board. Moving with
   the ‹ › arrows uses replaceState instead, so a reader who has walked
   through all three studies still gets out of the overlay with one Back.
   ========================================================================== */

(function () {
  'use strict';

  var root   = document.getElementById('reader');
  var panel  = document.getElementById('readerPanel');
  var scrim  = document.getElementById('readerScrim');
  var scroll = document.getElementById('readerScroll');
  var body   = document.getElementById('readerBody');
  var bar    = document.getElementById('readerProgress');
  var btnX   = document.getElementById('readerClose');
  var btnP   = document.getElementById('readerPrev');
  var btnN   = document.getElementById('readerNext');
  var elKind = document.getElementById('readerKind');
  var elIdx  = document.getElementById('readerIndex');
  var elTot  = document.getElementById('readerTotal');

  if (!root || !window.WORK) return;

  var items = window.WORK.filter(function (w) { return w.published !== false; });
  if (!items.length) return;

  var open = false;
  var index = -1;
  var lastFocus = null;
  var backdropNodes = [];

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), ' +
                  '[tabindex]:not([tabindex="-1"])';

  /**
   * Rewrite the URL without adding a history entry.
   * Some hosts refuse history writes — a sandboxed iframe preview, or a page
   * opened straight off the filesystem. Losing the shareable URL there is
   * acceptable; losing the reader is not, so this never throws.
   */
  function setHash(slug) {
    try {
      history.replaceState(null, '',
        slug ? '#case/' + slug : location.pathname + location.search);
    } catch (err) {
      /* no addressable URL in this context — the reader still works */
    }
  }

  /* ======================================================================
     Rendering
     ====================================================================== */

  function icon(id, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>';
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var PLUS = '<span class="diagram__plus" aria-hidden="true">+</span>';

  function iconGroup(groups) {
    return groups.map(function (g, i) {
      var out = '';
      // A group can opt out of the "+" — a reaction face is a consequence,
      // not another term in the sum.
      if (i > 0 && g.join !== false) out += PLUS;
      for (var n = 0; n < g.count; n++) out += icon(g.icon);
      return out;
    }).join('');
  }

  function renderSide(side) {
    return '<div class="diagram__side diagram__side--' + (side.tone || 'bad') + '">' +
      side.rows.map(function (row) {
        // A single stack of four or more reads better as a deliberate pile
        // than as whatever the flex wrap happens to produce.
        var pile = row.groups.length === 1 && row.groups[0].count >= 4;
        return '<div class="diagram__row">' +
                 '<div class="diagram__icons' + (pile ? ' diagram__icons--pile' : '') + '">' +
                   iconGroup(row.groups) +
                 '</div>' +
                 '<p class="diagram__cap">' + esc(row.caption) + '</p>' +
               '</div>';
      }).join('') +
    '</div>';
  }

  function renderDiagram(d) {
    // The icons are decorative; the captions and the figcaption carry the
    // meaning, so a screen reader gets the argument rather than a glyph list.
    return '<figure class="diagram">' +
      renderSide(d.before) +
      '<div class="diagram__arrow" aria-hidden="true">' + icon('arrow') + '</div>' +
      renderSide(d.after) +
      (d.alt ? '<figcaption class="sr-only">' + esc(d.alt) + '</figcaption>' : '') +
    '</figure>';
  }

  function renderBlock(b) {
    switch (b.type) {

      case 'section':
        return '<section class="cs__section">' +
          '<h3 class="cs__h">' + (b.num ? '<span>' + esc(b.num) + '</span>' : '') + esc(b.title) + '</h3>' +
          b.body.map(function (p) { return '<p class="cs__p">' + p + '</p>'; }).join('') +
        '</section>';

      case 'challenge':
        return '<section class="cs__section chal">' +
          '<h3 class="chal__label">Challenge<sup>0' + b.n + '</sup></h3>' +
          renderDiagram(b.diagram) +
          '<div class="whyhow">' +
            '<div class="whyhow__col whyhow__col--why">' +
              '<h4>' + icon('alert') + 'Why this happened</h4>' +
              '<ul>' + b.why.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
            '</div>' +
            '<div class="whyhow__col whyhow__col--how">' +
              '<h4>' + icon('check') + 'How I solved it</h4>' +
              '<ul>' + b.how.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
            '</div>' +
          '</div>' +
        '</section>';

      case 'pull':
        return '<p class="cs__pull">' + esc(b.text) + '</p>';

      case 'note':
        return '<p class="cs__note">' + b.text + '</p>';

      case 'outcome':
        return '<section class="cs__section">' +
          '<h3 class="cs__h"><span>' + esc(b.num || '') + '</span>' + esc(b.title || 'Outcome') + '</h3>' +
          '<ul class="outcome">' + b.items.map(function (it) {
            return '<li><b>' + esc(it.value) + '</b><span>' + esc(it.label) + '</span></li>';
          }).join('') + '</ul>' +
        '</section>';

      default:
        return '';
    }
  }

  function renderMeta(meta) {
    return '<dl class="cs__meta">' + Object.keys(meta).map(function (k) {
      var m = meta[k];
      return '<div><dt>' + esc(k) + '</dt><dd>' + esc(m.value) +
             (m.note ? '<small>' + esc(m.note) + '</small>' : '') + '</dd></div>';
    }).join('') + '</dl>';
  }

  function render(i) {
    var it = items[i];
    var isArg = /argument/i.test(it.kind);

    body.innerHTML =
      '<p class="cs__kind' + (isArg ? ' cs__kind--argument' : '') + '">' +
        icon(isArg ? 'quote' : 'layers') + esc(it.kind) +
      '</p>' +

      '<h2 class="cs__title" id="readerTitle">' + esc(it.title) + '</h2>' +
      '<p class="cs__standfirst">' + esc(it.standfirst) + '</p>' +

      (it.draft
        ? '<p class="cs__draft">' + icon('alert') +
          '<span>This one is still being written up. The structure is here; the detail ' +
          'is coming. Ask me about it directly and I will walk you through it.</span></p>'
        : '') +

      renderMeta(it.meta) +
      it.blocks.map(renderBlock).join('') +

      '<footer class="cs__foot">' +
        '<p>' + (i + 1) + ' of ' + items.length + '</p>' +
        (items.length > 1
          ? '<button class="btn btn--ghost" type="button" data-step="next">' +
            'Next: ' + esc(items[(i + 1) % items.length].card.title) + ' ' + icon('arrow') +
            '</button>'
          : '') +
      '</footer>';

    elKind.textContent = it.kind;
    elIdx.textContent = i + 1;
    elTot.textContent = items.length;

    // Arrows wrap, so they are never dead — but with one study there is
    // nowhere to go.
    var single = items.length < 2;
    btnP.disabled = single;
    btnN.disabled = single;

    scroll.scrollTop = 0;
    if (bar) bar.style.width = '0%';
    index = i;
  }

  /* ======================================================================
     Open / close
     ====================================================================== */

  function lockPage() {
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--sbw', sbw + 'px');
    document.body.classList.add('is-locked');
  }

  function unlockPage() {
    document.body.classList.remove('is-locked');
    document.documentElement.style.removeProperty('--sbw');
  }

  function setBackdropHidden(hidden) {
    if (!backdropNodes.length) {
      backdropNodes = ['#main', '.nav', '.footer']
        .map(function (s) { return document.querySelector(s); })
        .filter(Boolean);
    }
    backdropNodes.forEach(function (n) {
      if (hidden) {
        n.setAttribute('aria-hidden', 'true');
        if ('inert' in n) n.inert = true;
      } else {
        n.removeAttribute('aria-hidden');
        if ('inert' in n) n.inert = false;
      }
    });
  }

  function openAt(i, fromHash) {
    if (i < 0 || i >= items.length) return;

    if (!open) {
      lastFocus = document.activeElement;
      root.hidden = false;
      lockPage();
      setBackdropHidden(true);
      // next frame, so the transition has a starting state to move from
      requestAnimationFrame(function () { root.classList.add('is-open'); });
      open = true;
    }

    render(i);

    if (!fromHash) setHash(items[i].slug);

    scroll.focus({ preventScroll: true });
  }

  function close() {
    if (!open) return;
    open = false;
    root.classList.remove('is-open');
    setBackdropHidden(false);
    unlockPage();

    // Strip the hash without adding to history, so Back still leaves the page
    // rather than re-opening the study the visitor just closed.
    if (location.hash.indexOf('#case/') === 0) setHash(null);

    var done = function () {
      root.hidden = true;
      body.innerHTML = '';
      root.removeEventListener('transitionend', onEnd);
    };
    var onEnd = function (e) { if (e.target === panel) done(); };

    if (Motion.reduced) done();
    else {
      root.addEventListener('transitionend', onEnd);
      setTimeout(function () { if (!root.hidden) done(); }, 500); // safety net
    }

    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  function step(delta) {
    if (items.length < 2) return;
    openAt((index + delta + items.length) % items.length, false);
  }

  /* ======================================================================
     Events
     ====================================================================== */

  btnX.addEventListener('click', close);
  scrim.addEventListener('click', close);
  btnP.addEventListener('click', function () { step(-1); });
  btnN.addEventListener('click', function () { step(1); });

  body.addEventListener('click', function (e) {
    var b = e.target.closest('[data-step="next"]');
    if (b) step(1);
  });

  document.addEventListener('keydown', function (e) {
    if (!open) return;

    if (e.key === 'Escape') { e.preventDefault(); close(); return; }

    if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) { step(1); return; }
    if (e.key === 'ArrowLeft'  && !e.metaKey && !e.ctrlKey) { step(-1); return; }

    if (e.key !== 'Tab') return;

    // Focus trap.
    var nodes = Array.prototype.filter.call(
      panel.querySelectorAll(FOCUSABLE),
      function (n) { return n.offsetParent !== null || n === document.activeElement; }
    );
    if (!nodes.length) return;

    var first = nodes[0];
    var last = nodes[nodes.length - 1];

    if (e.shiftKey && (document.activeElement === first || document.activeElement === scroll)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  if (bar) {
    scroll.addEventListener('scroll', function () {
      var max = scroll.scrollHeight - scroll.clientHeight;
      bar.style.width = (max > 0 ? (scroll.scrollTop / max) * 100 : 0).toFixed(1) + '%';
    }, { passive: true });
  }

  /* ---- hash routing ------------------------------------------------------ */

  function slugIndex(slug) {
    for (var i = 0; i < items.length; i++) if (items[i].slug === slug) return i;
    return -1;
  }

  function syncFromHash() {
    var m = /^#case\/(.+)$/.exec(location.hash);
    if (!m) { if (open) close(); return; }
    var i = slugIndex(decodeURIComponent(m[1]));
    if (i === -1) {
      // Unknown slug — clear it rather than leaving a broken-looking URL.
      setHash(null);
      return;
    }
    openAt(i, true);
  }

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();

  window.Reader = { open: function (slug) { openAt(slugIndex(slug), false); }, close: close };
})();
