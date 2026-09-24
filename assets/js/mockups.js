/* ==========================================================================
   mockups.js — high-fidelity screens drawn in HTML, used by the `screens`
   block in a case study (see data.js → Bilingual company naming).

   Each screen is a function that returns markup. Numbered markers
   (mark(n)) line up with the numbered notes printed under the screen, so
   the reader can match a problem or a fix to the exact spot it lives.
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
        '<div class="mk-col">' +
          '<div class="mk-box mk-rel">' + mark(3, 'bad') +
            '<p class="mk-q">In which language is your company name?</p>' +
            '<div class="mk-radios">' +
              '<span class="mk-radio is-on"><i></i>English</span>' +
              '<span class="mk-radio"><i></i>Arabic</span>' +
            '</div>' +
          '</div>' +
          '<div class="mk-box mk-rel">' +
            '<p class="mk-q">Write your company name</p>' +
            '<div class="mk-pair">' +
              '<label class="mk-field"><span>English name</span><em>Samurai</em></label>' +
              '<label class="mk-field"><span>Arabic name</span><em class="mk-empty">—</em></label>' +
            '</div>' +
            '<span class="mk-btn mk-btn--ghost">Generate</span>' +
          '</div>' +
        '</div>' +
        '<div class="mk-gap mk-rel" aria-hidden="true">' + mark(1, 'bad') + '<span>?</span></div>' +
        '<div class="mk-box mk-list mk-rel">' +
          '<p class="mk-q">Names List</p>' +
          '<span class="mk-tag mk-rel">Top' + mark(2, 'bad') + '</span>' +
          '<div class="mk-item">' + GRIP +
            '<div><b dir="rtl" lang="ar">ساموراي</b><small>Samurai</small></div></div>' +
          '<div class="mk-item">' + GRIP +
            '<div><b dir="rtl" lang="ar">سام ديجيتال</b><small>Sam Digital</small></div></div>' +
          '<div class="mk-item mk-item--ghost"></div>' +
          '<span class="mk-tag">Low</span>' +
        '</div>' +
      '</div>',
      'before'
    );
  }

  /* ---- After: one column, write once, numbered ranks -------------------- */

  function rankRow(n, en, ar) {
    return '<div class="mk-rank">' + GRIP +
      '<span class="mk-num">' + n + '</span>' +
      '<span class="mk-cell">' + en + '</span>' +
      '<span class="mk-cell mk-cell--ar" dir="rtl" lang="ar">' + ar + '</span>' +
    '</div>';
  }

  function namingAfter() {
    return chrome(
      steps(1) +
      '<h5 class="mk-h mk-rel">What is your company name?' + mark(1, 'good') + '</h5>' +
      '<p class="mk-sub">Write it in the language you know best. We\'ll write the other one for you.</p>' +
      '<div class="mk-card">' +
        '<div class="mk-inputs">' +
          '<label class="mk-field mk-field--select"><span>Name language</span>' +
            '<em>Arabic (AR)' + CARET + '</em></label>' +
          '<label class="mk-field mk-field--focus"><span>Company name (AR)</span>' +
            '<em dir="rtl" lang="ar">سامكس</em></label>' +
          '<label class="mk-field mk-field--gen mk-rel"><span>Company name (EN)</span>' +
            '<em>Samix<small class="mk-ai">' + SPARK + 'Generated</small></em>' + mark(2, 'good') + '</label>' +
        '</div>' +
        '<div class="mk-actions">' +
          '<span class="mk-btn mk-btn--soft mk-rel">' + SPARK + 'Generate' + mark(5, 'good') + '</span>' +
          '<span class="mk-btn mk-btn--primary mk-rel">' + PLUS + 'Add to list' + mark(3, 'good') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="mk-listhead mk-rel"><p class="mk-q">Your preferred names</p>' +
        '<small>Drag to reorder</small>' + mark(4, 'good') + '</div>' +
      '<div class="mk-ranks">' +
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

  /* ---- Beijing: dark, dense, every number on one screen ------------------ */

  // 客户, 区域, 行业, 合同额(万), 已回款(万), 同比 %, 环比 %, [Q1, Q2, Q3 回款率], 账期(天), 状态, 负责人
  var CN_ROWS = [
    ['华辰科技', '华东', '通信', 862.4, 862.4,  18.2,  4.1, [100, 100, 100], 21, 'done', '王磊'],
    ['远航物流', '华南', '物流', 645.0, 441.8,   9.6,  2.3, [100,  88,  51], 34, 'ing',  '李娜'],
    ['鼎盛建设', '华北', '建筑', 528.7, 185.0,  -4.1, -6.8, [ 72,  40,  12], 58, 'late', '张伟'],
    ['瑞丰食品', '西南', '快消', 476.3, 357.2,  22.7,  8.9, [100,  95,  60], 27, 'ing',  '刘洋'],
    ['恒信医药', '华东', '医药', 412.9, 412.9,   6.3,  1.2, [100, 100, 100], 18, 'done', '陈静'],
    ['天启能源', '西北', '能源', 389.5, 116.9, -12.5, -9.4, [ 60,  22,   0], 66, 'late', '杨帆'],
    ['金桥贸易', '华中', '贸易', 341.2, 238.8,   3.8,  0.6, [100,  80,  35], 39, 'warn', '赵敏'],
    ['星海电子', '华南', '电子', 318.6, 223.0,  11.0,  3.7, [100,  90,  48], 30, 'ing',  '黄强'],
    ['博远汽车', '东北', '汽车', 296.4, 148.2,  -2.6, -1.9, [ 90,  60,  20], 45, 'warn', '周杰'],
    ['嘉禾纺织', '华东', '纺织', 254.8, 254.8,   7.4,  2.8, [100, 100, 100], 24, 'done', '吴霞'],
    ['云帆传媒', '华北', '传媒', 213.5, 106.8,  15.9,  6.2, [ 85,  55,  30], 41, 'new',  '孙鹏'],
    ['中泰置业', '西南', '地产', 198.0,  39.6, -18.3, -11.0,[ 40,  15,   0], 72, 'late', '郑楠']
  ];

  var CN_STATUS = {
    done: ['已结清', 'cyan'], ing: ['回款中', 'blue'], late: ['逾期', 'red'],
    warn: ['预警', 'orange'], 'new': ['新签', 'purple']
  };
  var CN_REGION = { '华东': 'blue', '华南': 'cyan', '华北': 'purple', '西南': 'gold',
                    '西北': 'orange', '华中': 'magenta', '东北': 'green' };

  // Red is up and green is down, as on every Chinese market screen.
  function cnDelta(v) {
    return '<span class="' + (v >= 0 ? 'cn-up' : 'cn-down') + '">' + (v >= 0 ? '▲' : '▼') +
      Math.abs(v).toFixed(1) + '%</span>';
  }

  function cnRow(r, i) {
    var left = r[3] - r[4], pct = r[4] / r[3] * 100, st = CN_STATUS[r[9]];
    return '<tr>' +
      '<td><b class="cn-rank' + (i < 3 ? ' cn-rank--' + (i + 1) : '') + '">' + (i + 1) + '</b></td>' +
      '<td class="cn-name">' + r[0] + '</td>' +
      '<td><span class="cn-tag cn-tag--' + CN_REGION[r[1]] + '">' + r[1] + '</span></td>' +
      '<td>' + r[2] + '</td>' +
      '<td class="cn-n">' + r[3].toFixed(1) + '</td>' +
      '<td class="cn-n cn-c-cyan">' + r[4].toFixed(1) + '</td>' +
      '<td class="cn-n ' + (left > 0 ? 'cn-c-gold' : 'cn-dim') + '">' + left.toFixed(1) + '</td>' +
      '<td><span class="cn-mini"><i style="width:' + pct.toFixed(0) + '%" class="' +
        (pct >= 99.9 ? 'is-cyan' : pct >= 60 ? 'is-blue' : pct >= 40 ? 'is-orange' : 'is-red') + '"></i></span>' +
        '<span class="cn-n">' + pct.toFixed(1) + '%</span></td>' +
      '<td class="cn-n">' + cnDelta(r[5]) + '</td>' +
      '<td class="cn-n">' + cnDelta(r[6]) + '</td>' +
      r[7].map(function (q) {
        return '<td class="cn-n cn-heat" style="--h:' + (q / 100).toFixed(2) + '">' + q + '%</td>';
      }).join('') +
      '<td class="cn-n' + (r[8] > 45 ? ' cn-up' : '') + '">' + r[8] + '天</td>' +
      '<td><span class="cn-tag cn-tag--' + st[1] + ' cn-tag--solid">' + st[0] + '</span></td>' +
      '<td>' + r[10] + '</td>' +
    '</tr>';
  }

  function cnKpi(label, value, unit, delta, color, points) {
    return '<div class="cn-kpi cn-kpi--' + color + '">' +
      '<p class="cn-kpi__label">' + label + '</p>' +
      '<p class="cn-kpi__value">' + value + '<small>' + unit + '</small></p>' +
      '<p class="cn-kpi__foot">同比 ' + cnDelta(delta[0]) + ' 环比 ' + cnDelta(delta[1]) + '</p>' +
      spark(points, 'cn-spark') +
    '</div>';
  }

  function cnPanel(title, extra, body, cls) {
    return '<section class="cn-panel' + (cls ? ' ' + cls : '') + '">' +
      '<header class="cn-ph"><b>' + title + '</b>' + (extra || '') + '</header>' + body +
    '</section>';
  }

  function cnBars() {
    var sales = [62, 58, 71, 66, 74, 80, 77, 85, 92, 0, 0, 0];
    var paid  = [48, 51, 55, 57, 60, 66, 63, 70, 71, 0, 0, 0];
    var target = [70, 70, 72, 72, 75, 78, 80, 82, 85, 88, 90, 95];
    var out = '<svg class="cn-chart" viewBox="0 0 260 110" aria-hidden="true">' +
      '<defs><linearGradient id="cnBarA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36CFFF"/><stop offset="1" stop-color="#1668DC" stop-opacity=".35"/></linearGradient>' +
      '<linearGradient id="cnBarB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD666"/><stop offset="1" stop-color="#FA8C16" stop-opacity=".35"/></linearGradient></defs>';
    [0, 25, 50, 75, 100].forEach(function (v) {
      var y = 96 - v * 0.86;
      out += '<line x1="18" x2="258" y1="' + y + '" y2="' + y + '" class="cn-grid"/>' +
             '<text x="14" y="' + (y + 2) + '" class="cn-axis" text-anchor="end">' + v + '</text>';
    });
    var line = [];
    for (var i = 0; i < 12; i++) {
      var x = 24 + i * 19.6;
      if (sales[i]) {
        out += '<rect x="' + x + '" y="' + (96 - sales[i] * 0.86) + '" width="6.5" height="' + (sales[i] * 0.86) + '" fill="url(#cnBarA)"/>' +
               '<rect x="' + (x + 7.5) + '" y="' + (96 - paid[i] * 0.86) + '" width="6.5" height="' + (paid[i] * 0.86) + '" fill="url(#cnBarB)"/>';
      }
      line.push((x + 7).toFixed(1) + ',' + (96 - target[i] * 0.86).toFixed(1));
      out += '<text x="' + (x + 7) + '" y="106" class="cn-axis" text-anchor="middle">' + (i + 1) + '月</text>';
    }
    out += '<polyline points="' + line.join(' ') + '" class="cn-line"/>';
    line.forEach(function (p) {
      var xy = p.split(',');
      out += '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="1.6" class="cn-dot"/>';
    });
    out += '<text x="' + (24 + 8 * 19.6 + 7) + '" y="' + (96 - 92 * 0.86 - 3) + '" class="cn-callout" text-anchor="middle">92</text>';
    return out + '</svg>';
  }

  function cnDonut() {
    var parts = [['华东', 31, '#1677FF'], ['华南', 22, '#13C2C2'], ['华北', 16, '#9254DE'],
                 ['西南', 12, '#FADB14'], ['华中', 8, '#EB2F96'], ['西北', 6, '#FA8C16'], ['东北', 5, '#52C41A']];
    var c = 2 * Math.PI * 15.9, off = 0;
    var svg = '<svg class="cn-donut" viewBox="0 0 42 42" aria-hidden="true">' +
      '<circle cx="21" cy="21" r="15.9" class="cn-ring"/>';
    parts.forEach(function (p) {
      var len = c * p[1] / 100;
      svg += '<circle cx="21" cy="21" r="15.9" fill="none" stroke="' + p[2] + '" stroke-width="5.5" ' +
             'stroke-dasharray="' + (len - 0.4).toFixed(2) + ' ' + (c - len + 0.4).toFixed(2) + '" ' +
             'stroke-dashoffset="' + (-off + c * 0.25).toFixed(2) + '"/>';
      off += len;
    });
    svg += '<text x="21" y="20.5" text-anchor="middle" class="cn-donut__v">3,482</text>' +
           '<text x="21" y="25.5" text-anchor="middle" class="cn-donut__l">万元</text></svg>';
    return '<div class="cn-donutwrap">' + svg + '<ul class="cn-legend">' + parts.map(function (p, i) {
      return '<li><i style="background:' + p[2] + '"></i>' + p[0] + '<b>' + p[1] + '%</b>' +
        cnDelta([12.1, 8.4, -3.2, 15.7, 4.9, -6.1, 1.8][i]) + '</li>';
    }).join('') + '</ul></div>';
  }

  function cnRanking() {
    var list = [['华东一部', 1286, 108], ['华南二部', 1104, 97], ['华北一部', 982, 91], ['西南大区', 874, 88],
                ['华中大区', 760, 79], ['华东二部', 698, 74], ['西北大区', 512, 62], ['东北大区', 431, 55]];
    var colors = ['red', 'orange', 'gold', 'blue', 'blue', 'blue', 'blue', 'blue'];
    return '<ol class="cn-rankl">' + list.map(function (r, i) {
      return '<li><b class="cn-rank' + (i < 3 ? ' cn-rank--' + (i + 1) : '') + '">' + (i + 1) + '</b>' +
        '<span>' + r[0] + '</span>' +
        '<span class="cn-hbar"><i class="is-' + colors[i] + '" style="width:' + Math.min(r[2], 100) + '%"></i></span>' +
        '<em class="cn-n">' + r[1] + '万</em><em class="cn-n ' + (r[2] >= 100 ? 'cn-up' : '') + '">' + r[2] + '%</em></li>';
    }).join('') + '</ol>';
  }

  function cnGauge(label, pct, color) {
    var c = 2 * Math.PI * 15;
    return '<div class="cn-gauge"><svg viewBox="0 0 36 36" aria-hidden="true">' +
      '<circle cx="18" cy="18" r="15" class="cn-ring"/>' +
      '<circle cx="18" cy="18" r="15" fill="none" stroke="' + color + '" stroke-width="3.2" stroke-linecap="round" ' +
        'stroke-dasharray="' + (c * pct / 100).toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 18 18)"/>' +
      '<text x="18" y="20.5" text-anchor="middle" class="cn-gauge__v">' + pct + '%</text></svg>' +
      '<span>' + label + '</span></div>';
  }

  function cnFeed() {
    var feed = [['14:31', '华辰科技', '+86.2', 'cyan'], ['14:26', '瑞丰食品', '+42.0', 'cyan'],
                ['14:12', '天启能源', '逾期 38天', 'red'], ['13:58', '星海电子', '+23.5', 'cyan'],
                ['13:40', '云帆传媒', '新签 213.5', 'purple'], ['13:22', '金桥贸易', '预警 账期', 'orange'],
                ['13:05', '远航物流', '+60.8', 'cyan'], ['12:47', '中泰置业', '逾期 52天', 'red'],
                ['12:30', '恒信医药', '已结清', 'blue']];
    return '<ul class="cn-feed">' + feed.map(function (f) {
      return '<li><i class="is-' + f[3] + '"></i><time>' + f[0] + '</time><span>' + f[1] + '</span>' +
        '<b class="cn-c-' + f[3] + '">' + f[2] + '</b></li>';
    }).join('') + '</ul>';
  }

  function dashBeijing() {
    var cols = ['#', '客户名称', '区域', '行业', '合同额(万)', '已回款(万)', '待回款(万)', '回款率',
                '同比', '环比', 'Q1', 'Q2', 'Q3', '账期', '状态', '负责人'];
    return chrome(
      '<div class="cn" lang="zh-CN">' +
        '<header class="cn-top">' +
          '<span class="cn-logo"><i></i>财务云</span>' +
          '<nav class="cn-nav mk-rel">' + mark(4, 'good') +
            '<span>首页</span><span class="is-on">销售看板</span><span>客户管理</span><span>合同</span>' +
            '<span>回款<em>12</em></span><span>发票</span><span>财务报表</span><span>预警<em class="is-red">8</em></span>' +
            '<span>审批<em>5</em></span><span>更多 ▾</span></nav>' +
          '<h5 class="cn-title">销售回款数据中心</h5>' +
          '<span class="cn-meta"><b>2026-09-24</b> 星期四 <b class="cn-clock">14:32:08</b></span>' +
          '<span class="cn-meta">晴 23°C 北京</span>' +
          '<span class="cn-bell"><svg viewBox="0 0 24 24" class="mk-ico mk-ico--line"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg><em>99+</em></span>' +
          '<span class="cn-avatar">王</span>' +
        '</header>' +

        '<div class="cn-ticker"><b>公告</b>' +
          '<span>Q3回款冲刺 · 华东一部完成率 <em class="cn-up">108% ▲</em></span>' +
          '<span>天启能源逾期 38 天，请跟进</span>' +
          '<span>本月新签 48 家 <em class="cn-up">▲15.9%</em></span>' +
          '<span class="cn-filters"><i class="is-on">今日</i><i>本周</i><i class="is-on">本月</i><i>本季</i><i>本年</i>' +
          '<i>全部区域 ▾</i><i>全部行业 ▾</i><i>刷新 ⟳</i></span>' +
        '</div>' +

        '<div class="cn-kpis mk-rel">' + mark(1, 'good') +
          cnKpi('销售总额', '3,482.6', '万', [12.4, 3.1], 'blue',   [22, 25, 24, 28, 31, 30, 34, 38]) +
          cnKpi('已回款',   '2,431.9', '万', [9.8, 2.2],  'cyan',   [18, 19, 22, 21, 24, 26, 25, 29]) +
          cnKpi('待回款',   '1,050.7', '万', [4.6, -1.8], 'gold',   [12, 11, 13, 14, 13, 12, 11, 10]) +
          cnKpi('回款率',   '69.8',    '%',  [2.1, 0.9],  'green',  [61, 62, 64, 63, 66, 67, 68, 70]) +
          cnKpi('客户数',   '1,286',   '家', [15.9, 3.9], 'purple', [30, 32, 33, 35, 36, 38, 40, 42]) +
          cnKpi('逾期金额', '186.2',   '万', [3.1, -4.2], 'red',    [9, 12, 10, 14, 13, 16, 15, 13]) +
          cnKpi('平均账期', '42',      '天', [-2.0, -1.1],'orange', [48, 47, 46, 46, 45, 44, 43, 42]) +
          cnKpi('目标完成', '92.4',    '%',  [6.7, 2.5],  'magenta',[70, 74, 76, 80, 83, 86, 89, 92]) +
        '</div>' +

        '<div class="cn-row">' +
          cnPanel('月度销售与回款', '<span class="cn-keys"><i class="is-blue"></i>销售 <i class="is-gold"></i>回款 <i class="is-line"></i>目标</span>', cnBars()) +
          cnPanel('区域销售占比', '<span class="cn-more">详情 ›</span>', cnDonut()) +
          cnPanel('团队业绩排行 TOP8', '<span class="cn-seg"><i class="is-on">金额</i><i>完成率</i></span>', cnRanking()) +
          cnPanel('回款进度', '<span class="cn-more">单位: %</span>',
            '<div class="cn-gauges">' + cnGauge('本月', 71, '#13C2C2') + cnGauge('本季', 69, '#1677FF') +
              cnGauge('本年', 58, '#FAAD14') + cnGauge('目标', 92, '#EB2F96') + '</div>' +
            '<ul class="cn-stats"><li>应收<b class="cn-c-gold">1,050.7万</b></li><li>本周到期<b class="cn-c-orange">128.4万</b></li>' +
              '<li>已开票<b class="cn-c-cyan">2,986.0万</b></li><li>坏账风险<b class="cn-up">3家</b></li></ul>') +
        '</div>' +

        '<div class="cn-row cn-row--bottom">' +
          cnPanel('客户回款明细', '<span class="cn-keys mk-rel">' + mark(2, 'good') + '<span class="cn-up">▲ 上涨</span> <span class="cn-down">▼ 下降</span></span>' +
            '<span class="cn-seg"><i class="is-on">全部 1286</i><i>回款中 412</i><i>逾期 37</i><i>预警 64</i><i>已结清 773</i></span>' +
            '<span class="cn-more">导出 ⇩</span>',
            '<table class="cn-table"><thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') +
            '</tr></thead><tbody>' + CN_ROWS.map(cnRow).join('') + '</tbody></table>' +
            '<div class="cn-pager"><span>共 1,286 条 · 每页 12 条</span>' + mark(3, 'good') +
              '<span><i>‹</i><i class="is-on">1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>…</i><i>108</i><i>›</i></span></div>',
            'cn-panel--table') +
          cnPanel('实时动态', '<span class="cn-live">● LIVE</span>', cnFeed(), 'cn-panel--feed') +
        '</div>' +
      '</div>',
      'after mk-frame--dash mk-frame--dark', 'app / 销售看板'
    );
  }

  window.Mockups = {
    'naming-before': namingBefore,
    'naming-after': namingAfter,
    'dash-cairo': dashCairo,
    'dash-beijing': dashBeijing
  };
})();
