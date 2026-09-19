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

  /* ---- structured data, generated from the content ------------------------
     The static JSON-LD in index.html describes the person. The work and the
     certificates live in data.js and config.js, so they are described here
     instead — that way editing content updates the search markup, and the two
     can never disagree. Google merges nodes that share an @id across blocks,
     so this attaches to the same Person.

     Note the filter: only studies marked 'live' are described. A placeholder
     still full of TODO is worse than no structured data at all. */

  var canonical = document.querySelector('link[rel="canonical"]');
  var SITE = canonical ? canonical.href : location.href;
  var PERSON = SITE + '#person';

  function ld(obj) {
    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(obj);
    document.head.appendChild(el);
  }

  var live = (window.WORK || []).filter(function (w) {
    return w.published !== false && w.status === 'live';
  });

  if (live.length) {
    ld({
      '@context': 'https://schema.org',
      '@graph': live.map(function (w) {
        return {
          '@type': /argument/i.test(w.kind) ? 'Article' : 'CreativeWork',
          '@id': SITE + '#case-' + w.slug,
          name: w.title,
          headline: w.title,
          description: w.standfirst,
          url: SITE + '#case/' + w.slug,
          inLanguage: 'en',
          author: { '@id': PERSON },
          creator: { '@id': PERSON },
          about: (w.card && w.card.tags) || undefined,
          keywords: [w.kind].concat((w.card && w.card.tags) || []).join(', '),
          isPartOf: { '@id': SITE + '#webpage' }
        };
      })
    });

    // Point the Person at the work, so the two are linked in both directions.
    ld({
      '@context': 'https://schema.org',
      '@id': PERSON,
      subjectOf: live.map(function (w) { return { '@id': SITE + '#case-' + w.slug }; })
    });
  }

  if (cfg.certificates && cfg.certificates.length) {
    ld({
      '@context': 'https://schema.org',
      '@id': PERSON,
      hasCredential: cfg.certificates.map(function (c) {
        return {
          '@type': 'EducationalOccupationalCredential',
          name: c.name,
          url: c.url,
          credentialCategory: 'certificate',
          recognizedBy: { '@type': 'Organization', name: c.issuer }
        };
      })
    });
  }

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
