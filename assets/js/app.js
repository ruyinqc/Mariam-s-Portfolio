/* ==========================================================================
   app.js — bootstrap. Renders the certificate list and arms the animations.
   Loaded last, so everything it touches already exists.
   ========================================================================== */

(function () {
  'use strict';

  var cfg = window.SITE || {};

  /* ---- certificates ------------------------------------------------------ */

  var list = document.getElementById('certList');
  if (list && cfg.certificates) {
    list.innerHTML = cfg.certificates.map(function (c, i) {
      return '<li data-reveal data-reveal-delay="' + Math.min(i, 4) + '">' +
        '<a class="cert" href="' + c.url + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="cert__when">' + c.when + '</span>' +
          '<span>' +
            '<span class="cert__name">' + c.name + '</span>' +
            '<span class="cert__by">' + c.issuer + '</span>' +
          '</span>' +
          '<span class="cert__go">Verify ' +
            '<svg class="icon icon--xs" aria-hidden="true"><use href="#i-ext"/></svg>' +
          '</span>' +
        '</a>' +
      '</li>';
    }).join('');
  }

  /* ---- footer year ------------------------------------------------------- */

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- arm the animations ------------------------------------------------
     .reveal-ready is what switches [data-reveal] from "visible" to "hidden
     until observed". Adding it from JS means a visitor without JS, and any
     crawler, sees the finished page instead of a blank one. */

  document.documentElement.classList.add('reveal-ready');
  document.documentElement.style.setProperty('--motion', Motion.reduced ? '0' : '1');

  Motion.reveal();
  Motion.parallax();
  Motion.remeasure();
})();
