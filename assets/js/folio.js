/* ==========================================================================
   folio.js — an open folder.

   Opening a folder on the desk doesn't scroll the page: the folder's
   sections are moved into a sheet of paper that grows out of the folder and
   sits over the desk. Tabs along its top switch folders; ×, Escape, the
   backdrop and the Back button close it, and it shrinks back into the
   folder it came from.

   Routing contract
   ----------------
   #about, #work, #path, #proof and #contact open their folder, and the
   anchors inside them (#toolkit, #words) open the folder and scroll to
   that part. Opening from the desk lands one entry in history, so Back
   closes it; switching tabs replaces that entry, so one Back still gets you
   out. #case/<slug> stays the reader's (reader.js), and opens over the top.

   Without JavaScript none of this runs: the sections stay where they are in
   the page, one after another.
   ========================================================================== */

(function () {
  'use strict';

  var root   = document.getElementById('folio');
  var sheet  = document.getElementById('folioSheet');
  var scrim  = document.getElementById('folioScrim');
  var scroll = document.getElementById('folioScroll');
  var body   = document.getElementById('folioBody');
  var btnX   = document.getElementById('folioClose');
  var desk   = document.getElementById('top');
  if (!root || !sheet || !scroll || !body || !desk) return;

  /* Which sections live in which folder. The first is the folder's own. */
  var FOLDERS = [
    { key: 'about',   ids: ['about', 'toolkit'] },
    { key: 'work',    ids: ['work'] },
    { key: 'path',    ids: ['path', 'words'] },
    { key: 'proof',   ids: ['proof'] },
    { key: 'contact', ids: ['contact'] }
  ];

  var byKey = {}, byId = {}, homes = {};
  FOLDERS.forEach(function (f) {
    byKey[f.key] = f;
    f.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      byId[id] = f;
      // A marker where each section lives, so it can always go back home.
      var mark = document.createComment(' ' + id + ' lives here when its folder is closed ');
      el.parentNode.insertBefore(mark, el);
      homes[id] = { el: el, mark: mark };
    });
  });

  document.documentElement.classList.add('desk-mode');

  var reduced = window.Motion ? Motion.reduced
                              : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.folio__tab'));
  var backdrop = [desk, document.getElementById('nav'), document.querySelector('.footer')]
    .filter(Boolean);

  var current = null;      // the open folder
  var origin = null;       // the element it grew out of
  var pushed = false;      // did opening it add a history entry?
  var lastFocus = null;
  var pendingFrom = null;
  var animTimer = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), ' +
                  '[tabindex]:not([tabindex="-1"])';

  function setHash(hash, push) {
    try {
      if (push) history.pushState(null, '', hash);
      else history.replaceState(null, '', hash || location.pathname + location.search);
    } catch (err) { /* no addressable URL here (a sandboxed preview) — the folder still opens */ }
  }

  function deskFolder(key) {
    return desk.querySelector('.folder[href="#' + key + '"]:not([data-case])');
  }

  function readerOpen() {
    var r = document.getElementById('reader');
    return r && !r.hidden;
  }

  /* ---- what's inside ---------------------------------------------------- */

  function sendHome() {
    Object.keys(homes).forEach(function (id) {
      var h = homes[id];
      if (h.el.parentNode === body) h.mark.parentNode.insertBefore(h.el, h.mark.nextSibling);
    });
  }

  function fill(f) {
    sendHome();
    f.ids.forEach(function (id) { if (homes[id]) body.appendChild(homes[id].el); });

    var link = deskFolder(f.key);
    root.setAttribute('data-folder', f.key);
    root.style.setProperty('--fc', link ? getComputedStyle(link).getPropertyValue('--fc').trim() : '');
    var title = link && link.querySelector('.folder__title');
    sheet.setAttribute('aria-label', title ? title.textContent : f.key);

    tabs.forEach(function (t) {
      var on = !t.hasAttribute('data-case') && t.getAttribute('href') === '#' + f.key;
      if (on) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
      // on a phone the tabs scroll sideways: bring the open one into view
      if (on && t.parentNode.scrollWidth > t.parentNode.clientWidth) {
        t.parentNode.scrollLeft = t.offsetLeft - (t.parentNode.clientWidth - t.offsetWidth) / 2;
      }
    });

  }

  // The sections were hidden until now, so anything that measures itself has
  // to measure again — once the sheet is on screen, or it measures nothing.
  function remeasure() {
    if (window.Line) Line.measure();
    if (window.Motion) Motion.remeasure();
  }

  function scrollToPart(id, f) {
    var el = id && id !== f.ids[0] ? document.getElementById(id) : null;
    scroll.scrollTop = el ? Math.max(0, el.offsetTop - 12) : 0;
  }

  /* ---- the sheet growing out of a folder, and back ---------------------- */

  function flipFrom(el) {
    if (reduced || !el) return;
    var a = el.getBoundingClientRect(), b = sheet.getBoundingClientRect();
    if (!a.width || !b.width) return;
    sheet.style.transition = 'none';
    sheet.style.transformOrigin = '0 0';
    sheet.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) ' +
                            'scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')';
    sheet.getBoundingClientRect();       // commit the starting frame
    sheet.style.transition = '';
    sheet.style.transform = '';
  }

  function flipTo(el) {
    if (reduced || !el) return false;
    var a = el.getBoundingClientRect(), b = sheet.getBoundingClientRect();
    if (!a.width || !b.width || a.bottom < 0 || a.top > window.innerHeight) return false;
    sheet.style.transformOrigin = '0 0';
    sheet.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) ' +
                            'scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')';
    return true;
  }

  function setBackdrop(hidden) {
    backdrop.forEach(function (n) {
      if (hidden) { n.setAttribute('aria-hidden', 'true'); n.inert = true; }
      else { n.removeAttribute('aria-hidden'); n.inert = false; }
    });
  }

  /* ---- open, switch, close ---------------------------------------------- */

  function open(f, part) {
    clearTimeout(animTimer);
    if (current === f && !root.hidden && !root.classList.contains('is-closing')) {
      scrollToPart(part, f);
      return;
    }

    if (current && !root.hidden) {
      // Switching folders: swap what's on the sheet, keep the sheet.
      root.classList.add('is-switching');
      current = f;
      animTimer = setTimeout(function () {
        fill(f);
        root.classList.remove('is-switching', 'is-opening');
        remeasure();
        scrollToPart(part, f);
      }, reduced ? 0 : 160);
      return;
    }

    current = f;
    origin = pendingFrom || deskFolder(f.key);
    pendingFrom = null;
    lastFocus = document.activeElement && document.activeElement !== document.body
      ? document.activeElement : origin;

    fill(f);
    root.classList.remove('is-closing');
    root.classList.add('is-opening');
    root.hidden = false;
    document.documentElement.classList.add('folio-open');
    setBackdrop(true);
    flipFrom(origin);
    requestAnimationFrame(function () { root.classList.add('is-open'); });
    scroll.focus({ preventScroll: true });

    // The sheet grows out of the folder as blank paper; its contents are
    // laid out and drawn once it has landed, then fade in.
    animTimer = setTimeout(function () {
      root.classList.remove('is-opening');
      remeasure();
      scrollToPart(part, f);
    }, reduced ? 0 : 480);
  }

  function close() {
    if (!current || root.hidden) return;
    clearTimeout(animTimer);
    var back = deskFolder(current.key) || origin;
    current = null;
    pushed = false;
    root.classList.remove('is-open', 'is-opening');
    root.classList.add('is-closing');
    var shrinking = flipTo(back);

    animTimer = setTimeout(function () {
      root.hidden = true;
      root.classList.remove('is-closing');
      sheet.style.transform = '';
      sendHome();
      remeasure();
    }, reduced ? 0 : (shrinking ? 460 : 280));

    document.documentElement.classList.remove('folio-open');
    setBackdrop(false);
    var to = lastFocus && document.contains(lastFocus) ? lastFocus : back;
    if (to) to.focus({ preventScroll: true });
    lastFocus = null;
  }

  // Close the way it was opened: if opening added a history entry, step back
  // over it, so the Back button and the × always agree.
  function requestClose() {
    if (pushed) { history.back(); return; }
    setHash(null, false);
    close();
  }

  /* ---- routing ------------------------------------------------------------ */

  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (/^case\//.test(id)) return;                 // the reader's
    var f = id && byId[id];
    if (f) open(f, id);
    else if (current) close();
  }

  window.addEventListener('hashchange', route);

  /* ---- events ------------------------------------------------------------- */

  btnX.addEventListener('click', requestClose);
  scrim.addEventListener('click', requestClose);

  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      var study = t.getAttribute('data-case');
      if (study) { location.hash = '#case/' + study; return; }
      var key = t.getAttribute('href').slice(1);
      setHash('#' + key, false);       // a tab switch replaces, so one Back still closes
      open(byKey[key], key);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (!current || root.hidden || readerOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); requestClose(); return; }
    if (e.key !== 'Tab') return;

    var nodes = Array.prototype.filter.call(sheet.querySelectorAll(FOCUSABLE), function (n) {
      return n.offsetParent !== null || n === document.activeElement;
    });
    if (!nodes.length) return;
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === scroll)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // A link inside a folder to another folder's section (the About page's
  // "See the work", say) switches folder instead of scrolling a hidden page.
  body.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var id = a.getAttribute('href').slice(1);
    var f = byId[id];
    if (!f) return;
    e.preventDefault();
    setHash('#' + id, false);
    open(f, id);
  });

  /* ---- public: the desk opens folders through here ------------------------ */

  window.Folio = {
    /** Open a folder from the desk, growing out of `from`. */
    show: function (key, from) {
      var f = byKey[key];
      if (!f) return;
      pendingFrom = from || null;
      if (location.hash === '#' + key) { open(f, key); return; }
      pushed = true;
      setHash('#' + key, true);
      open(f, key);
    },
    /** The open folder's address, or null. reader.js returns to it on close. */
    hash: function () { return current ? '#' + current.key : null; },
    close: requestClose
  };

  // A link straight to a section (#work, #words…) opens its folder.
  route();
})();
