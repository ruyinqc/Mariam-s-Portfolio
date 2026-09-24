/* ==========================================================================
   board.js — the work cards.

   Renders a card per published entry in window.WORK into the grid. The
   layout itself (three columns, then two, then one) is all CSS.
   ========================================================================== */

(function () {
  'use strict';

  var holder = document.getElementById('boardCards');
  if (!holder || !window.WORK) return;

  var count = 0;

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

  window.WORK.forEach(function (item) {
    if (item.published === false) return;

    var t = item.card.thumb || {};
    var isDraft = item.status === 'draft';
    var id = 'pc-' + item.slug;

    var el = document.createElement('article');
    el.className = 'pincard';

    el.innerHTML =
      // `zoom` shows a close-up of one of the study's own screens instead
      (t.zoom && window.Lens
        ? '<div class="pincard__thumb pincard__thumb--lens" aria-hidden="true">' +
            Lens.html(t.zoom) +
          '</div>'
        : '<div class="pincard__thumb" aria-hidden="true">' +
            '<div class="mini ' + (t.tone === 'lime' ? 'mini--lime' : '') + '">' +
              miniCluster(t.left) +
              '<span class="mini__arrow">' + icon('arrow') + '</span>' +
              miniCluster(t.right) +
            '</div>' +
          '</div>') +

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
    count++;
  });

  if (count && window.Lens) Lens.mount(holder);
})();
