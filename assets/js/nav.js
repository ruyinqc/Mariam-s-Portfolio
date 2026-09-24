/* ==========================================================================
   nav.js — floating palette nav: scroll ring, sliding selection chip,
   active-section tracking, and the mobile sheet.
   ========================================================================== */

(function () {
  'use strict';

  var nav      = document.getElementById('nav');
  var list     = document.getElementById('navList');
  var chip     = document.getElementById('navChip');
  var ring     = document.getElementById('scrollRing');
  var toggle   = document.getElementById('navToggle');
  var sheet    = document.getElementById('navSheet');
  var current  = document.getElementById('navCurrent');
  if (!nav) return;

  var links = Array.prototype.slice.call(list.querySelectorAll('.nav__link'));
  var RING = 125.6;                       // 2πr with r = 20, matches the CSS
  var activeId = null;

  /* ---- scroll progress ring + stuck state ------------------------------- */

  Motion.onScroll(function (y, vh, dh) {
    var max = Math.max(dh - vh, 1);
    var pct = Math.min(Math.max(y / max, 0), 1);
    if (ring) ring.style.strokeDashoffset = (RING * (1 - pct)).toFixed(2);
    nav.classList.toggle('is-stuck', y > 24);
  });

  /* ---- sliding selection chip ------------------------------------------- */

  function moveChip(link) {
    if (!chip || !link) return;
    // Hidden on mobile, where the list is display:none and offsets are 0.
    if (!link.offsetParent) { chip.classList.remove('is-on'); return; }
    chip.style.width = link.offsetWidth + 'px';
    chip.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    chip.classList.add('is-on');
  }

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;

    var match = null;
    links.forEach(function (a) {
      var on = a.getAttribute('data-section') === id;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'true'); match = a; }
      else a.removeAttribute('aria-current');
    });

    if (match) moveChip(match);
    else if (chip) chip.classList.remove('is-on');

    if (current) current.textContent = match ? match.textContent : 'Menu';
  }

  /* Which section is the reader actually looking at? Use the one whose top
     is closest to just under the nav, rather than whatever happens to be
     intersecting — with sections this tall, several always are. */
  var sections = ['path', 'work', 'words', 'toolkit', 'proof']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  Motion.onScroll(function (y, vh) {
    var line = y + vh * 0.32;
    var found = null;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var top = s.offsetTop;
      if (line >= top && line < top + s.offsetHeight) { found = s.id; break; }
    }
    setActive(found);
  });

  window.addEventListener('resize', function () {
    var on = links.find(function (a) { return a.classList.contains('is-active'); });
    if (on) moveChip(on);
  }, { passive: true });

  // Web fonts change link widths after first paint, so re-place the chip.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      var on = links.find(function (a) { return a.classList.contains('is-active'); });
      if (on) moveChip(on);
    });
  }

  /* ---- roving arrow keys across the nav --------------------------------- */

  list.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var i = links.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    var next = e.key === 'ArrowRight'
      ? (i + 1) % links.length
      : (i - 1 + links.length) % links.length;
    links[next].focus();
  });

  /* ---- mobile sheet ------------------------------------------------------ */

  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openSheet() {
    sheet.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    var first = sheet.querySelector('a');
    if (first) first.focus();
  }

  if (toggle && sheet) {
    toggle.addEventListener('click', function () {
      sheet.hidden ? openSheet() : closeSheet();
    });

    sheet.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeSheet();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) { closeSheet(); toggle.focus(); }
    });

    document.addEventListener('click', function (e) {
      if (sheet.hidden) return;
      if (!sheet.contains(e.target) && !toggle.contains(e.target)) closeSheet();
    });
  }
})();
