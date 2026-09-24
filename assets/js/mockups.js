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

  function chrome(inner, tone, url) {
    return '<div class="mk-frame mk-frame--' + tone + '">' +
      '<div class="mk-bar" aria-hidden="true"><i></i><i></i><i></i>' +
        '<span class="mk-url">' + (url || 'app / incorporate / company-name') + '</span></div>' +
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

  /* ==========================================================================
     Localisation study: one sales-and-collections dashboard, two markets.
     Both screens show the same kind of data: what each customer signed for,
     what they have paid and what is still left. Only the design changes.
     ========================================================================== */

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function spark(points, cls) {
    var max = Math.max.apply(null, points), min = Math.min.apply(null, points);
    var step = 100 / (points.length - 1);
    var d = points.map(function (v, i) {
      return (i * step).toFixed(1) + ',' + (28 - ((v - min) / (max - min || 1)) * 24).toFixed(1);
    }).join(' ');
    return '<svg class="' + cls + '" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">' +
      '<polyline points="0,30 ' + d + ' 100,30" class="is-area"/>' +
      '<polyline points="' + d + '"/>' +
    '</svg>';
  }

  /* ---- Cairo: calm, three numbers, one wide table ------------------------ */

  // name, sector, contract, paid, last payment, next due, overdue?, invoices,
  // avg days to pay, [Q1, Q2, Q3 collected %], YoY %, share of sales %, region, owner
  var DB_ROWS = [
    ['Nile Logistics',    'Logistics',     482000, 482000, 'Sep 18', '—',      false, 12, 21, [100, 100, 100], 18.2, 10.0, 'Cairo',       'Sara M.'],
    ['Delta Foods',       'FMCG',          365400, 248470, 'Sep 12', 'Oct 05', false,  9, 34, [100,  88,  51],  9.6,  7.6, 'Mansoura',    'Omar K.'],
    ['Pyramid Textiles',  'Manufacturing', 298000, 104300, 'Aug 02', 'Sep 02', true,   7, 58, [ 72,  40,  12], -4.1,  6.2, 'Giza',        'Sara M.'],
    ['Red Sea Resorts',   'Hospitality',   256750, 192560, 'Sep 20', 'Oct 20', false,  6, 27, [100,  95,  60], 22.7,  5.3, 'Hurghada',    'Nour A.'],
    ['Alexandria Pharma', 'Healthcare',    221900, 221900, 'Sep 09', '—',      false,  8, 18, [100, 100, 100],  6.3,  4.6, 'Alexandria',  'Omar K.'],
    ['Sinai Energy',      'Energy',        198200,  59460, 'Jul 14', 'Aug 30', true,   5, 66, [ 60,  22,   0],-12.5,  4.1, 'Sharm',       'Nour A.'],
    ['Canal Build Co.',   'Construction',  176500, 123550, 'Sep 15', 'Oct 12', false,  4, 39, [100,  80,  35],  3.8,  3.7, 'Ismailia',    'Sara M.'],
    ['Oasis Retail',      'Retail',        142300,  99610, 'Sep 21', 'Oct 01', false, 10, 30, [100,  90,  48], 11.0,  3.0, 'Cairo',       'Omar K.']
  ];

  var DB_TINTS = ['#EDEAFE', '#E7F6EC', '#FDEEE6', '#E6F0FD', '#F3EAFB', '#FDF3DC', '#E9F4F4', '#FBE9EF'];

  function dbStatus(r) {
    if (r[3] >= r[2]) return '<span class="db-pill db-pill--paid">Paid in full</span>';
    if (r[6])         return '<span class="db-pill db-pill--late">Overdue</span>';
    return '<span class="db-pill db-pill--part">Partially paid</span>';
  }

  function dbRow(r, i) {
    var pct = Math.round(r[3] / r[2] * 100);
    var initials = r[0].split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2);
    return '<tr>' +
      '<td class="db-sticky"><span class="db-cust">' +
        '<i style="background:' + DB_TINTS[i % DB_TINTS.length] + '">' + initials + '</i>' +
        '<span><b>' + r[0] + '</b><small>' + r[1] + '</small></span></span></td>' +
      '<td class="db-n">' + money(r[2]) + '</td>' +
      '<td class="db-n">' + money(r[3]) + '</td>' +
      '<td class="db-n' + (r[2] - r[3] > 0 ? ' db-strong' : ' db-dim') + '">' + money(r[2] - r[3]) + '</td>' +
      '<td><span class="db-prog"><span><i style="width:' + pct + '%"' +
        (r[6] ? ' class="is-late"' : pct === 100 ? ' class="is-done"' : '') + '></i></span>' + pct + '%</span></td>' +
      '<td class="db-n">' + r[7] + '</td>' +
      '<td>' + r[4] + '</td>' +
      '<td' + (r[6] ? ' class="db-late"' : '') + '>' + r[5] + '</td>' +
      '<td>' + dbStatus(r) + '</td>' +
      '<td class="db-n">' + r[8] + ' days</td>' +
      r[9].map(function (q) { return '<td class="db-n">' + q + '%</td>'; }).join('') +
      '<td class="db-n ' + (r[10] >= 0 ? 'db-up' : 'db-down') + '">' + (r[10] >= 0 ? '+' : '−') + Math.abs(r[10]).toFixed(1) + '%</td>' +
      '<td class="db-n">' + r[11].toFixed(1) + '%</td>' +
      '<td>' + r[12] + '</td>' +
      '<td>' + r[13] + '</td>' +
    '</tr>';
  }

  function dbKpi(label, value, foot, tone, graphic) {
    return '<div class="db-kpi db-kpi--' + tone + '">' +
      '<p class="db-kpi__label">' + label + '</p>' +
      '<p class="db-kpi__value">' + value + '</p>' +
      graphic +
      '<p class="db-kpi__foot">' + foot + '</p>' +
    '</div>';
  }

  function dashCairo() {
    var cols = ['Customer', 'Contract value', 'Paid', 'Remaining', '% paid', 'Invoices', 'Last payment',
                'Next due', 'Status', 'Avg. days to pay', 'Q1', 'Q2', 'Q3', 'YoY', 'Share of sales',
                'Region', 'Account owner'];
    var num = { 'Contract value': 1, 'Paid': 1, 'Remaining': 1, 'Invoices': 1, 'Avg. days to pay': 1,
                'Q1': 1, 'Q2': 1, 'Q3': 1, 'YoY': 1, 'Share of sales': 1 };

    return chrome(
      '<div class="db">' +
        '<header class="db-top">' +
          '<span class="db-logo"><i></i>Ledger</span>' +
          '<nav class="db-nav"><span class="is-on">Overview</span><span>Customers</span>' +
            '<span>Invoices</span><span>Reports</span></nav>' +
          '<span class="db-search"><svg viewBox="0 0 24 24" class="mk-ico mk-ico--line"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>Search customers</span>' +
          '<span class="db-avatar">ME</span>' +
        '</header>' +

        '<div class="db-head">' +
          '<div><h5 class="db-h">Sales &amp; collections</h5>' +
            '<p class="db-sub">Q3 2026 · every customer, what they signed, what they paid, what is left</p></div>' +
          '<div class="db-actions"><span class="db-btn">Jul 1 – Sep 30, 2026' + CARET + '</span>' +
            '<span class="db-btn db-btn--primary">Export</span></div>' +
        '</div>' +

        '<div class="db-kpis mk-rel">' + mark(1, 'bad') +
          dbKpi('Total sales', '$4,820,500', '<b class="db-up">+12.4%</b> vs Q2', 'blue',
                spark([31, 34, 33, 38, 41, 40, 45, 48], 'db-spark')) +
          dbKpi('Collected', '$3,371,920', '<b>69.9%</b> of total sales', 'green',
                '<span class="db-bar"><i style="width:69.9%"></i></span>') +
          dbKpi('Still to collect', '$1,448,580', '<b class="db-down">8 customers</b> overdue', 'amber',
                '<span class="db-bar db-bar--split"><i style="width:78%"></i><i style="width:22%"></i></span>') +
        '</div>' +

        '<section class="db-card">' +
          '<div class="db-toolbar">' +
            '<div class="db-tabs"><span class="is-on">All customers <em>48</em></span>' +
              '<span>Paid in full <em>21</em></span><span>Partially paid <em>19</em></span>' +
              '<span>Overdue <em>8</em></span></div>' +
            '<div class="db-filters mk-rel">' + mark(2, 'bad') +
              '<span class="db-chip">Region: All' + CARET + '</span>' +
              '<span class="db-chip">Owner: Anyone' + CARET + '</span>' +
              '<span class="db-chip db-chip--on"><svg viewBox="0 0 24 24" class="mk-ico mk-ico--line"><path d="M4 6h16M7 12h10M10 18h4"/></svg>Filters <em>2</em></span>' +
            '</div>' +
          '</div>' +
          '<div class="db-scroll">' +
            '<table class="db-table"><thead><tr>' +
              cols.map(function (c, i) {
                return '<th class="' + (i === 0 ? 'db-sticky' : '') + (num[c] ? ' db-n' : '') + '">' + c +
                  (c === 'Remaining' ? '<svg viewBox="0 0 24 24" class="mk-ico mk-ico--line db-sort"><path d="m7 10 5 5 5-5"/></svg>' : '') +
                '</th>';
              }).join('') +
            '</tr></thead><tbody>' + DB_ROWS.map(dbRow).join('') + '</tbody></table>' +
          '</div>' +
          '<div class="db-scrollbar mk-rel">' + mark(3, 'bad') + '<i></i></div>' +
          '<div class="db-foot"><span>Showing 1–8 of 48 customers</span>' +
            '<span class="db-pager"><b>1</b><i>2</i><i>3</i><i>…</i><i>6</i></span></div>' +
        '</section>' +
      '</div>',
      'before mk-frame--dash', 'app / sales / overview'
    );
  }

  /* ---- Beijing: dark, dense, colour-coded, the same table ---------------- */

  // customer, region, industry, contract ¥K, paid ¥K, YoY %, MoM %, [Q1, Q2, Q3 collected %],
  // invoices, days overdue, avg days to pay, last payment, next due, credit, status, owner
  var CN_ROWS = [
    ['Huachen Technology',    'East',    'Telecom',      8624, 8624,  18.2,   4.1, [100, 100, 100], 12,  0, 21, '09-18', '—',     'AAA', 'done', 'Wang Lei'],
    ['Yuanhang Logistics',    'South',   'Logistics',    6450, 4418,   9.6,   2.3, [100,  88,  51],  9,  0, 34, '09-12', '10-05', 'AA',  'ing',  'Li Na'],
    ['Dingsheng Construction','North',   'Construction', 5287, 1850,  -4.1,  -6.8, [ 72,  40,  12],  7, 22, 58, '08-02', '09-02', 'BBB', 'late', 'Zhang Wei'],
    ['Ruifeng Foods',         'SW',      'FMCG',         4763, 3572,  22.7,   8.9, [100,  95,  60],  6,  0, 27, '09-20', '10-20', 'AA',  'ing',  'Liu Yang'],
    ['Hengxin Pharma',        'East',    'Healthcare',   4129, 4129,   6.3,   1.2, [100, 100, 100],  8,  0, 18, '09-09', '—',     'AAA', 'done', 'Chen Jing'],
    ['Tianqi Energy',         'NW',      'Energy',       3895, 1169, -12.5,  -9.4, [ 60,  22,   0],  5, 38, 66, '07-14', '08-30', 'BB',  'late', 'Yang Fan'],
    ['Jinqiao Trading',       'Central', 'Trading',      3412, 2388,   3.8,   0.6, [100,  80,  35],  4,  0, 39, '09-15', '10-12', 'A',   'warn', 'Zhao Min'],
    ['Xinghai Electronics',   'South',   'Electronics',  3186, 2230,  11.0,   3.7, [100,  90,  48], 10,  0, 30, '09-21', '10-01', 'AA',  'ing',  'Huang Qiang'],
    ['Boyuan Auto',           'NE',      'Automotive',   2964, 1482,  -2.6,  -1.9, [ 90,  60,  20],  6,  4, 45, '08-28', '09-20', 'A',   'warn', 'Zhou Jie'],
    ['Jiahe Textiles',        'East',    'Textiles',     2548, 2548,   7.4,   2.8, [100, 100, 100],  7,  0, 24, '09-11', '—',     'AA',  'done', 'Wu Xia'],
    ['Yunfan Media',          'North',   'Media',        2135, 1068,  15.9,   6.2, [ 85,  55,  30],  3,  0, 41, '09-16', '10-16', 'A',   'new',  'Sun Peng'],
    ['Zhongtai Property',     'SW',      'Real estate',  1980,  396, -18.3, -11.0, [ 40,  15,   0],  4, 52, 72, '06-30', '08-01', 'BB',  'late', 'Zheng Nan'],
    ['Lianchuang Semicon',    'East',    'Semiconductor',1846, 1292,  27.4,   9.8, [100,  92,  55],  5,  0, 29, '09-19', '10-19', 'AAA', 'ing',  'Qian Hui'],
    ['Haoyun Retail',         'Central', 'Retail',       1523, 1066,   5.1,   1.4, [100,  84,  42], 11,  0, 33, '09-17', '10-08', 'A',   'ing',  'Ma Lin']
  ];

  var CN_STATUS = {
    done: ['Settled', 'cyan'], ing: ['Collecting', 'blue'], late: ['Overdue', 'red'],
    warn: ['Warning', 'orange'], 'new': ['New', 'purple']
  };
  var CN_REGION = { East: 'blue', South: 'cyan', North: 'purple', SW: 'gold',
                    NW: 'orange', Central: 'magenta', NE: 'green' };
  var CN_CREDIT = { AAA: 'green', AA: 'cyan', A: 'blue', BBB: 'orange', BB: 'red' };
  var CN_METHOD = ['Bank transfer', 'Bank draft', 'Bank transfer', 'Letter of credit', 'Bank transfer'];

  function k(n) { return n.toLocaleString('en-US'); }

  // Red is up and green is down, as on every Chinese market screen.
  function cnDelta(v) {
    return '<span class="' + (v >= 0 ? 'cn-up' : 'cn-down') + '">' + (v >= 0 ? '▲' : '▼') +
      Math.abs(v).toFixed(1) + '%</span>';
  }

  function cnRow(r, i) {
    var left = r[3] - r[4], pct = r[4] / r[3] * 100, st = CN_STATUS[r[14]];
    return '<tr' + (i === 2 ? ' class="is-picked"' : '') + '>' +
      '<td class="cn-fix cn-fix--0"><i class="cn-check' + (i === 2 ? ' is-on' : '') + '"></i></td>' +
      '<td class="cn-fix cn-fix--1"><b class="cn-rank' + (i < 3 ? ' cn-rank--' + (i + 1) : '') + '">' + (i + 1) + '</b></td>' +
      '<td class="cn-fix cn-fix--2 cn-name">' + r[0] + '</td>' +
      '<td><span class="cn-tag cn-tag--' + CN_REGION[r[1]] + '">' + r[1] + '</span></td>' +
      '<td>' + r[2] + '</td>' +
      '<td class="cn-code">HT-2026-' + String(412 + i * 37).padStart(4, '0') + '</td>' +
      '<td class="cn-n">' + k(r[3]) + '</td>' +
      '<td class="cn-n cn-c-cyan">' + k(r[4]) + '</td>' +
      '<td class="cn-n ' + (left > 0 ? 'cn-c-gold' : 'cn-dim') + '">' + k(left) + '</td>' +
      '<td><span class="cn-mini"><i style="width:' + pct.toFixed(0) + '%" class="' +
        (pct >= 99.9 ? 'is-cyan' : pct >= 60 ? 'is-blue' : pct >= 40 ? 'is-orange' : 'is-red') + '"></i></span>' +
        '<span class="cn-n">' + pct.toFixed(1) + '%</span></td>' +
      '<td class="cn-n">' + cnDelta(r[5]) + '</td>' +
      '<td class="cn-n">' + cnDelta(r[6]) + '</td>' +
      r[7].map(function (q) {
        return '<td class="cn-n cn-heat" style="--h:' + (q / 100).toFixed(2) + '">' + q + '%</td>';
      }).join('') +
      '<td class="cn-n">' + r[8] + '</td>' +
      '<td class="cn-n' + (r[9] ? ' cn-up cn-bold' : ' cn-dim') + '">' + (r[9] ? r[9] + 'd' : '—') + '</td>' +
      '<td class="cn-n' + (r[10] > 45 ? ' cn-c-orange' : '') + '">' + r[10] + 'd</td>' +
      '<td class="cn-n">2026-' + r[11] + '</td>' +
      '<td class="cn-n' + (r[14] === 'late' ? ' cn-up' : '') + '">' + (r[12] === '—' ? '—' : '2026-' + r[12]) + '</td>' +
      '<td>' + CN_METHOD[i % CN_METHOD.length] + '</td>' +
      '<td><span class="cn-tag cn-tag--' + CN_CREDIT[r[13]] + '">' + r[13] + '</span></td>' +
      '<td><span class="cn-tag cn-tag--' + st[1] + ' cn-tag--solid">' + st[0] + '</span></td>' +
      '<td>' + r[15] + '</td>' +
      '<td class="cn-fix cn-fix--end"><span class="cn-link">View</span><span class="cn-link">' +
        (r[14] === 'done' ? 'Invoice' : 'Remind') + '</span><span class="cn-link">More ▾</span></td>' +
    '</tr>';
  }

  function cnChips(label, items, on) {
    return '<span class="cn-group"><em>' + label + '</em>' + items.map(function (t, i) {
      return '<i' + (i === on ? ' class="is-on"' : '') + '>' + t + '</i>';
    }).join('') + '</span>';
  }

  function dashBeijing() {
    var cols = ['', '#', 'Customer', 'Region', 'Industry', 'Contract no.', 'Contract ¥K', 'Paid ¥K', 'Remaining ¥K', 'Paid %',
                'YoY', 'MoM', 'Q1', 'Q2', 'Q3', 'Invoices', 'Overdue', 'Avg. days', 'Last payment',
                'Next due', 'Method', 'Credit', 'Status', 'Owner', 'Actions'];
    var fix = { 0: 'cn-fix cn-fix--0', 1: 'cn-fix cn-fix--1', 2: 'cn-fix cn-fix--2', 24: 'cn-fix cn-fix--end' };
    var totals = CN_ROWS.reduce(function (t, r) { t[0] += r[3]; t[1] += r[4]; return t; }, [0, 0]);

    return chrome(
      '<div class="cn">' +
        '<div class="cn-head">' +
          '<b class="cn-title">Customer Payment Details</b>' +
          '<span class="cn-updated">Updated 2026-09-24 14:32:08 <i class="cn-live">● LIVE</i></span>' +
          '<span class="cn-search"><svg viewBox="0 0 24 24" class="mk-ico mk-ico--line"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>Customer, owner, contract no.</span>' +
          '<span class="cn-btn">Reset</span>' +
          '<span class="cn-btn cn-btn--blue">Search</span>' +
          '<span class="cn-btn cn-btn--export"><svg viewBox="0 0 24 24" class="mk-ico mk-ico--line"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>Export Excel</span>' +
          '<span class="cn-btn cn-btn--icon"><svg viewBox="0 0 24 24" class="mk-ico mk-ico--line"><path d="M4 6h16M4 12h16M4 18h16"/></svg></span>' +
        '</div>' +

        '<div class="cn-filters mk-rel">' + mark(1, 'good') +
          cnChips('Period', ['Today', 'Week', 'Month', 'Quarter', 'Year'], 3) +
          cnChips('Region', ['All', 'East', 'South', 'North', 'SW', 'NW', 'Central', 'NE'], 0) +
          '<span class="cn-group"><em>Industry</em><i class="cn-select">All industries ▾</i></span>' +
          '<span class="cn-group"><em>Owner</em><i class="cn-select">Anyone ▾</i></span>' +
          '<span class="cn-group"><em>Date</em><i class="cn-select">2026-07-01 ~ 2026-09-30</i></span>' +
        '</div>' +

        '<div class="cn-status">' +
          '<span class="cn-tabs mk-rel">' + mark(3, 'good') +
            '<i class="is-on">All <b>1,286</b></i>' +
            '<i class="is-blue">Collecting <b>412</b></i>' +
            '<i class="is-red">Overdue <b>37</b></i>' +
            '<i class="is-orange">Warning <b>64</b></i>' +
            '<i class="is-cyan">Settled <b>773</b></i>' +
            '<i class="is-purple">New <b>48</b></i>' +
          '</span>' +
          '<span class="cn-legend mk-rel">' + mark(2, 'good') +
            '<span class="cn-up">▲ Up</span><span class="cn-down">▼ Down</span></span>' +
        '</div>' +

        '<div class="cn-tablewrap mk-rel">' + mark(4, 'good') +
          '<div class="cn-scroll" tabindex="-1">' +
            '<table class="cn-table"><thead><tr>' + cols.map(function (c, i) {
              return '<th class="' + (fix[i] || '') + '">' + (i === 0 ? '<i class="cn-check"></i>' : c) +
                (c === 'Remaining ¥K' ? ' <span class="cn-sort">▼</span>' : '') + '</th>';
            }).join('') + '</tr></thead><tbody>' + CN_ROWS.map(cnRow).join('') + '</tbody>' +
            '<tfoot><tr><td class="cn-fix cn-fix--0"></td><td class="cn-fix cn-fix--1"></td>' +
              '<td class="cn-fix cn-fix--2">Page total</td><td></td><td></td><td></td>' +
              '<td class="cn-n">' + k(totals[0]) + '</td><td class="cn-n cn-c-cyan">' + k(totals[1]) + '</td>' +
              '<td class="cn-n cn-c-gold">' + k(totals[0] - totals[1]) + '</td>' +
              '<td class="cn-n">' + (totals[1] / totals[0] * 100).toFixed(1) + '%</td>' +
              '<td colspan="14"></td><td class="cn-fix cn-fix--end"></td></tr></tfoot></table>' +
          '</div>' +
        '</div>' +

        '<div class="cn-pager"><span>Total 1,286 · 14 / page</span>' +
          '<span><i>‹</i><i class="is-on">1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>…</i><i>92</i><i>›</i>' +
          '<em>Go to</em><i class="cn-goto">1</i></span></div>' +
      '</div>',
      'after mk-frame--dash mk-frame--dark', 'app / payments / customers'
    );
  }

  window.Mockups = {
    'naming-before': namingBefore,
    'naming-after': namingAfter,
    'dash-cairo': dashCairo,
    'dash-beijing': dashBeijing
  };
})();
