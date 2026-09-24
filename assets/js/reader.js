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
  var unmountLenses = function () {};

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
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---- The challenge rectangle -------------------------------------------
     Each row reads left to right: what should happen → what actually
     happens. The pictures and piles come from art.js; a side with `zoom`
     shows a close-up of one of the hi-fi screens instead (lens.js).         */

  var PLUS = '<span class="flow__plus" aria-hidden="true">+</span>';

  function flowSide(side, cls) {
    return '<div class="flow__side flow__side--' + cls + '">' +
      '<div class="flow__art">' +
        (side.zoom ? Lens.html(side.zoom) : side.art.map(Art.pile).join(PLUS)) +
      '</div>' +
      '<p class="flow__cap">' + esc(side.caption) +
        (side.emoji
          ? ' <img class="flow__emoji" src="' + esc(Art.src(side.emoji)) + '" alt="" decoding="async">'
          : '') +
      '</p>' +
    '</div>';
  }

  var ARROW =
    '<div class="flow__arrow" aria-hidden="true">' +
      '<span class="flow__line"></span>' +
      '<svg class="flow__head" viewBox="0 0 10 16"><path d="M1.5 1.5 8.5 8l-7 6.5"/></svg>' +
    '</div>';

  function renderDiagram(d) {
    // The pictures are decorative. The captions carry the argument, and
    // `alt` fills in whatever only the pictures say.
    var zoom = d.rows.some(function (r) { return r.from.zoom || r.to.zoom; });
    return '<figure class="flow' + (zoom ? ' flow--zoom' : '') + '">' +
      d.rows.map(function (r) {
        return '<div class="flow__row">' +
          flowSide(r.from, 'from') + ARROW + flowSide(r.to, 'to') +
        '</div>';
      }).join('') +
      (d.alt ? '<figcaption class="sr-only">' + esc(d.alt) + '</figcaption>' : '') +
    '</figure>';
  }

  /* ---- Why / How columns --------------------------------------------------- */

  function renderCopy(c) {
    var out = '';
    if (c.text)   out += c.text.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    if (c.points) out += '<ul>' + c.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
    if (c.wireframe) out += renderWireframe(c.wireframe);
    return out;
  }

  /** A screenshot. `width`/`height` are the file's own pixels, so the page
      keeps its place while the image loads. */
  function renderShot(im, cls, lazy) {
    return '<figure class="' + cls + '">' +
      '<img src="' + esc(im.src) + '" alt="' + esc(im.alt || '') + '"' +
        (im.width ? ' width="' + im.width + '" height="' + im.height + '"' : '') +
        (lazy ? ' loading="lazy"' : '') + ' decoding="async">' +
      (im.caption ? '<figcaption>' + esc(im.caption) + '</figcaption>' : '') +
    '</figure>';
  }

  /** A video in place of a screenshot. It never plays by itself and nothing
      downloads until the reader presses play: the poster stands in until then. */
  function renderVideo(v, cls) {
    return '<figure class="' + cls + '">' +
      '<video controls playsinline preload="none"' +
        (v.poster ? ' poster="' + esc(v.poster) + '"' : '') +
        (v.width ? ' width="' + v.width + '" height="' + v.height + '"' : '') +
        (v.alt ? ' aria-label="' + esc(v.alt) + '"' : '') + '>' +
        '<source src="' + esc(v.video) + '" type="video/mp4">' +
        '<a href="' + esc(v.video) + '">Download the video</a>' +
      '</video>' +
      (v.caption ? '<figcaption>' + esc(v.caption) + '</figcaption>' : '') +
    '</figure>';
  }

  /* ---- Wireframe ------------------------------------------------------------
     A low-fidelity before/after, drawn from data. '~' is a scribble standing
     in for text that does not matter to the point.                            */

  var SCRIBBLE =
    '<svg class="wf__scribble" viewBox="0 0 40 8" aria-hidden="true">' +
      '<path d="M1.5 5.2c3-2.4 6-2.8 9-1.2s5.6 2.1 8.6.2 6-2.5 9-.9 5.4 1.9 10.4.3"/>' +
    '</svg>';

  function wfCell(t) {
    return t === '~' ? SCRIBBLE : '<span>' + esc(t) + '</span>';
  }

  function wfPanel(p) {
    return '<div class="wf__panel">' +
      '<p class="wf__title">' + esc(p.title) + '</p>' +
      '<div class="wf__rows">' +
        p.rows.map(function (r) {
          return '<div class="wf__bar' + (r.length > 2 ? ' wf__bar--spread' : '') + '">' +
                   r.map(wfCell).join('') + '</div>';
        }).join('') +
        (p.button
          ? '<div class="wf__btn"><span>' + esc(p.button) + '</span>' + icon('next') + '</div>'
          : '') +
      '</div>' +
    '</div>';
  }

  function wfSide(side, cls) {
    return '<div class="wf__side wf__side--' + cls + '">' +
      '<div class="wf__panels">' + side.panels.map(wfPanel).join('') + '</div>' +
      '<p class="wf__label">' + esc(side.label) + '</p>' +
    '</div>';
  }

  function renderWireframe(w) {
    return '<figure class="wf">' +
      '<div class="wf__grid">' + wfSide(w.before, 'before') + wfSide(w.after, 'after') + '</div>' +
    '</figure>';
  }

  /* ---- Screens: a high-fidelity before and after ---------------------------
     The screens come from mockups.js. Each note's number matches a marker
     drawn on the screen itself.                                             */

  function screenSide(side, tone) {
    var draw = window.Mockups && window.Mockups[side.screen];
    return '<figure class="scr scr--' + tone + '">' +
      '<figcaption class="scr__label"><span>' + esc(side.label) + '</span>' +
        (side.kicker ? '<small>' + esc(side.kicker) + '</small>' : '') + '</figcaption>' +
      '<div class="scr__stage"' + (side.alt ? ' role="img" aria-label="' + esc(side.alt) + '"' : '') + '>' +
        '<div aria-hidden="true">' + (draw ? draw() : '') + '</div>' +
      '</div>' +
      '<p class="scr__disclaimer">' + esc(side.disclaimer ||
        'Hi-fi recreation for this case study, not a screenshot of the production product. ' +
        'Names and details are illustrative.') + '</p>' +
      (side.notes
        ? '<ol class="scr__notes">' + side.notes.map(function (n, i) {
            return '<li><span class="mk-mark mk-mark--' + tone + '" aria-hidden="true">' + (i + 1) + '</span>' +
                   '<p>' + n + '</p></li>';
          }).join('') + '</ol>'
        : '') +
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
          '<div class="whyhow' + (b.how.wireframe ? ' whyhow--wide' : '') + '">' +
            '<div class="whyhow__col whyhow__col--why">' +
              '<h4>' + esc(b.why.title || 'Why this happened?') + '</h4>' +
              renderCopy(b.why) +
            '</div>' +
            '<div class="whyhow__col whyhow__col--how">' +
              '<h4>' + esc(b.how.title || 'How I worked on solving this?') + '</h4>' +
              renderCopy(b.how) +
            '</div>' +
            // the screen gets the full width of the challenge, under both columns
            (b.how.image ? renderShot(b.how.image, 'shot', true) : '') +
          '</div>' +
        '</section>';

      case 'screens':
        return '<section class="cs__section scrs">' +
          '<h3 class="cs__h">' + (b.num ? '<span>' + esc(b.num) + '</span>' : '') + esc(b.title) + '</h3>' +
          (b.intro ? '<p class="cs__p">' + b.intro + '</p>' : '') +
          screenSide(b.before, 'bad') + screenSide(b.after, 'good') +
        '</section>';

      case 'pull':
        return '<p class="cs__pull">' + esc(b.text) + '</p>';

      case 'note':
        return '<p class="cs__note">' + b.text + '</p>';

      case 'projects':
        // Live things built elsewhere — each one opens in a new tab.
        return '<section class="cs__section">' +
          '<h3 class="cs__h">' + (b.num ? '<span>' + esc(b.num) + '</span>' : '') + esc(b.title) + '</h3>' +
          (b.intro ? '<p class="cs__p">' + b.intro + '</p>' : '') +
          '<ul class="proj">' + b.items.map(function (it) {
            return '<li><a class="proj__link' + (it.img ? ' proj__link--img' : '') + '" href="' + esc(it.url) + '" target="_blank" rel="noopener noreferrer">' +
              (it.img ? '<img class="proj__img" src="' + esc(it.img) + '" alt="" width="120" height="120" loading="lazy" decoding="async">' : '') +
              '<span class="proj__body">' +
                '<span class="proj__name">' + esc(it.name) + ' ' + icon('ext', 'icon--xs') + '</span>' +
                (it.badges ? '<span class="proj__badges">' + it.badges.map(function (t) {
                  return '<span class="proj__badge' + (/delivered/i.test(t) ? ' proj__badge--done' : '') + '">' + esc(t) + '</span>';
                }).join('') + '</span>' : '') +
                (it.text ? '<span class="proj__text">' + esc(it.text) + '</span>' : '') +
                '<span class="proj__url">' + esc(it.url.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</span>' +
              '</span>' +
            '</a></li>';
          }).join('') + '</ul>' +
        '</section>';

      case 'steps':
        // A walkthrough told in frames: one still per step, in order.
        return '<section class="cs__section">' +
          '<h3 class="cs__h">' + (b.num ? '<span>' + esc(b.num) + '</span>' : '') + esc(b.title) + '</h3>' +
          (b.intro ? '<p class="cs__p">' + b.intro + '</p>' : '') +
          '<ol class="steps">' + b.items.map(function (s, i) {
            return '<li class="step">' +
              '<img class="step__shot" src="' + esc(s.image.src) + '" alt="' + esc(s.image.alt || '') + '"' +
                ' width="' + s.image.width + '" height="' + s.image.height + '" loading="lazy" decoding="async">' +
              '<p class="step__n" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</p>' +
              '<h4 class="step__t">' + esc(s.title) + '</h4>' +
              '<p class="step__p">' + s.text + '</p>' +
            '</li>';
          }).join('') + '</ol>' +
        '</section>';

      case 'chips':
        // A short list of words. `accent: true` picks one out.
        return '<section class="cs__section">' +
          '<h3 class="cs__h">' + (b.num ? '<span>' + esc(b.num) + '</span>' : '') + esc(b.title) + '</h3>' +
          (b.intro ? '<p class="cs__p">' + b.intro + '</p>' : '') +
          '<ul class="chips cs__chips">' + b.items.map(function (c) {
            var it = typeof c === 'string' ? { text: c } : c;
            return '<li class="chip' + (it.accent ? ' chip--accent' : '') + '">' + esc(it.text) +
              (it.note ? '<small>' + esc(it.note) + '</small>' : '') + '</li>';
          }).join('') + '</ul>' +
        '</section>';

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

    unmountLenses();
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
      (it.cover
        ? (it.cover.video ? renderVideo(it.cover, 'cs__cover') : renderShot(it.cover, 'cs__cover', false))
        : '') +
      it.blocks.map(renderBlock).join('') +

      '<footer class="cs__foot">' +
        '<p>' + (i + 1) + ' of ' + items.length + '</p>' +
        (items.length > 1
          ? '<button class="btn btn--ghost" type="button" data-step="next">' +
            'Next: ' + esc(items[(i + 1) % items.length].card.title) + ' ' + icon('arrow') +
            '</button>'
          : '') +
      '</footer>';

    unmountLenses = Lens.mount(body);

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
      unmountLenses();
      unmountLenses = function () {};
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

    // a focused video keeps its arrow keys for seeking
    if (e.target.tagName === 'VIDEO' && e.key !== 'Tab') return;

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
