/* ==========================================================================
   mockups.js — high-fidelity screens drawn in HTML, used by the `screens`
   block in a case study (see data.js → Bilingual company naming).

   Each screen is a function that returns markup. Numbered markers
   (mark(n)) line up with the numbered notes printed under the screen, so
   the reader can match a problem or a fix to the exact spot it lives.

   data-focus="…" names a part of a screen, so a challenge diagram can zoom
   in on it (lens.js, and `zoom` in data.js). One element can carry several
   names, and one name can sit on several elements.
   ========================================================================== */

(function () {
  'use strict';

  function mark(n, tone) {
    return '<span class="mk-mark mk-mark--' + tone + '" aria-hidden="true">' + n + '</span>';
  }

  var GRIP =
    '<svg class="mk-grip" viewBox="0 0 10 16" aria-hidden="true">' +
      '<circle cx="2.5" cy="3" r="1.4"/><circle cx="7.5" cy="3" r="1.4"/>' +
      '<circle cx="2.5" cy="8" r="1.4"/><circle cx="7.5" cy="8" r="1.4"/>' +
      '<circle cx="2.5" cy="13" r="1.4"/><circle cx="7.5" cy="13" r="1.4"/>' +
    '</svg>';

  var SPARK =
    '<svg class="mk-ico" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/>' +
    '</svg>';

  var PLUS =
    '<svg class="mk-ico mk-ico--line" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  var CARET =
    '<svg class="mk-ico mk-ico--line" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  function chrome(inner, tone) {
    return '<div class="mk-frame mk-frame--' + tone + '">' +
      '<div class="mk-bar" aria-hidden="true"><i></i><i></i><i></i>' +
        '<span class="mk-url">app / incorporate / company-name</span></div>' +
      '<div class="mk-screen">' + inner + '</div>' +
    '</div>';
  }

  function steps(active) {
    var names = ['Founders', 'Company name', 'Capital', 'Review'];
    return '<ol class="mk-steps" aria-hidden="true">' + names.map(function (n, i) {
      return '<li class="' + (i < active ? 'is-done' : i === active ? 'is-on' : '') + '">' +
        '<b>' + (i + 1) + '</b><span>' + n + '</span></li>';
    }).join('') + '</ol>';
  }

  /* ---- Before: two panels, three boxes, Top / Low ----------------------- */

  function namingBefore() {
    return chrome(
      steps(1) +
      '<h5 class="mk-h">What is your company name?</h5>' +
      '<div class="mk-split">' +
        '<div class="mk-col" data-focus="form">' +
          '<div class="mk-box mk-rel" data-focus="box lang">' + mark(3, 'bad') +
            '<p class="mk-q">In which language is your company name?</p>' +
            '<div class="mk-radios">' +
              '<span class="mk-radio is-on"><i></i>English</span>' +
              '<span class="mk-radio"><i></i>Arabic</span>' +
            '</div>' +
          '</div>' +
          '<div class="mk-box mk-rel" data-focus="box name">' +
            '<p class="mk-q">Write your company name</p>' +
            '<div class="mk-pair">' +
              '<label class="mk-field" data-focus="typed"><span>English name</span><em>Samurai</em></label>' +
              '<label class="mk-field"><span>Arabic name</span><em class="mk-empty">—</em></label>' +
            '</div>' +
            '<span class="mk-btn mk-btn--ghost">Generate</span>' +
          '</div>' +
        '</div>' +
        '<div class="mk-gap mk-rel" aria-hidden="true">' + mark(1, 'bad') + '<span data-focus="gap">?</span></div>' +
        '<div class="mk-box mk-list mk-rel" data-focus="box list">' +
          '<p class="mk-q">Names List</p>' +
          '<span class="mk-tag mk-rel" data-focus="ends">Top' + mark(2, 'bad') + '</span>' +
          '<div class="mk-item">' + GRIP +
            '<div><b dir="rtl" lang="ar">ساموراي</b><small>Samurai</small></div></div>' +
          '<div class="mk-item">' + GRIP +
            '<div><b dir="rtl" lang="ar">سام ديجيتال</b><small>Sam Digital</small></div></div>' +
          '<div class="mk-item mk-item--ghost"></div>' +
          '<span class="mk-tag" data-focus="ends">Low</span>' +
        '</div>' +
      '</div>',
      'before'
    );
  }

  /* ---- After: one column, write once, numbered ranks -------------------- */

  function rankRow(n, en, ar) {
    return '<div class="mk-rank">' + GRIP +
      '<span class="mk-num" data-focus="num">' + n + '</span>' +
      '<span class="mk-cell">' + en + '</span>' +
      '<span class="mk-cell mk-cell--ar" dir="rtl" lang="ar">' + ar + '</span>' +
    '</div>';
  }

  function namingAfter() {
    return chrome(
      steps(1) +
      '<h5 class="mk-h mk-rel" data-focus="ask">What is your company name?' + mark(1, 'good') + '</h5>' +
      '<p class="mk-sub">Write it in the language you know best. We\'ll write the other one for you.</p>' +
      '<div class="mk-card" data-focus="task">' +
        '<div class="mk-inputs" data-focus="row">' +
          '<label class="mk-field mk-field--select" data-focus="lang"><span>Name language</span>' +
            '<em>Arabic (AR)' + CARET + '</em></label>' +
          '<label class="mk-field mk-field--focus" data-focus="own"><span>Company name (AR)</span>' +
            '<em dir="rtl" lang="ar">سامكس</em></label>' +
          '<label class="mk-field mk-field--gen mk-rel" data-focus="gen"><span>Company name (EN)</span>' +
            '<em>Samix<small class="mk-ai">' + SPARK + 'Generated</small></em>' + mark(2, 'good') + '</label>' +
        '</div>' +
        '<div class="mk-actions">' +
          '<span class="mk-btn mk-btn--soft mk-rel">' + SPARK + 'Generate' + mark(5, 'good') + '</span>' +
          '<span class="mk-btn mk-btn--primary mk-rel" data-focus="add">' + PLUS + 'Add to list' + mark(3, 'good') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="mk-listhead mk-rel" data-focus="list"><p class="mk-q">Your preferred names</p>' +
        '<small>Drag to reorder</small>' + mark(4, 'good') + '</div>' +
      '<div class="mk-ranks" data-focus="list">' +
        rankRow(1, 'Samix', 'سامكس') +
        rankRow(2, 'Samurai', 'ساموراي') +
        rankRow(3, 'Sam Digital', 'سام ديجيتال') +
        '<div class="mk-addrow">' + PLUS + 'Add name</div>' +
      '</div>',
      'after'
    );
  }

  window.Mockups = {
    'naming-before': namingBefore,
    'naming-after': namingAfter
  };
})();
