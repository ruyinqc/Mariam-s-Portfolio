/* ==========================================================================
   data.js — every word of every case study lives here.
   Mariam: edit this file to change the work section. Nothing else needs
   touching. There is a short guide at the bottom of README.md.

   Quick reference
   ---------------
   published : false hides the card completely
   status    : 'live'  → green "Shipped" pill
               'draft' → grey "In progress" pill + a note at the top of the
                         study telling the reader it isn't finished yet
   Pictures you can use in a challenge diagram live in assets/img/art/:
     invoice · coins · wallet · confused · support-agent.png
   Drop any new SVG or PNG in that folder and use its name.
   ========================================================================== */

window.WORK = [

/* ==========================================================================
   1 — INVOICES & PAYMENTS  (real, complete)
   ========================================================================== */
{
  slug: 'invoices-payments',
  kind: 'Case study',
  published: true,
  status: 'live',

  card: {
    title: 'Invoices & Payments Module',
    sub: 'Users were paying one invoice out of five — and paying the wrong number when they did.',
    tags: ['Fintech', 'B2B'],
    thumb: {
      left:  { art: 'invoice', count: 5 },
      right: { art: 'invoice', count: 1 },
      tone: 'blue'
    }
  },

  title: 'Invoices & Payments Module',
  standfirst:
    'Ovarc customers were receiving several invoices a month and paying only the one that ' +
    'scared them most. The ones who did try to pay in full often sent the wrong amount. ' +
    'I rebuilt the payment flow so that the right number is the obvious number.',

  meta: {
    'Role':     { value: 'Product Designer', note: 'End-to-end design' },
    'Timeline': { value: '2.5 weeks' },
    'Status':   { value: 'Shipped', note: 'In production since November 2025' },
    'Product':  { value: 'Ovarc', note: 'B2B SaaS · Egypt' }
  },

  // shown full width right under the Role / Timeline / Status row
  cover: {
    src: 'assets/img/work/invoices-payments-page.webp',
    width: 2000, height: 977,
    alt: 'The Invoices & Payments page: Payments, Expense Claims, Transactions History ' +
         'and Wallet tabs, with Wallet Balance, Selected Invoices and POs, Amount To Pay ' +
         'and the table of all invoices.',
    caption: 'Public UI preview only—no real data included (NDA).'
  },

  blocks: [
    {
      type: 'section',
      num: '01',
      title: 'Where it started',
      body: [
        'Ovarc bills its customers for several services at once — payroll, government ' +
        'fees, service charges. Each one arrives as its own invoice. In theory a customer ' +
        'opens the billing page and settles what is due. In practice, they did not.',

        'Two behaviours showed up again and again: customers paid a single invoice and ' +
        'left the rest open, and customers who did pay in full transferred an amount that ' +
        'did not match what the system expected. Both ended as manual reconciliation work ' +
        'for the finance team, and both started on the same screen.'
      ]
    },

    {
      type: 'challenge',
      n: 1,
      diagram: {
        rows: [{
          from: { art: [{ name: 'invoice', count: 5 }], caption: '5 Invoices user needs to pay' },
          to:   { art: [{ name: 'invoice', count: 1 }], caption: 'User pays only 1', emoji: 'confused' }
        }]
      },
      why: {
        title: 'Why this happened?',
        text: [
          '<b>Unable</b> to process <b>batch payments</b>, the user only paid the most ' +
          'critical invoice: payroll.',

          'Because the only payment method was <b>manual transfer</b>, which made it easy ' +
          'to <b>ignore</b> the other invoices.'
        ]
      },
      how: {
        title: 'How I worked on solving this?',
        text: [
          'Users can now <b>pay multiple invoices at once</b> with full <b>upfront ' +
          'visibility</b> into totals and <b>wallet</b> balances before taking action.'
        ],
        image: {
          src: 'assets/img/work/invoices-ui-preview.webp',
          width: 2000, height: 741,
          alt: 'The Payments tab: Wallet Balance, Selected Invoices and POs and Amount To ' +
               'Pay above the invoice table, with a Proceed To Payment button.',
          caption: 'Public UI preview only—no real data included (NDA).'
        }
      }
    },

    {
      type: 'challenge',
      n: 2,
      diagram: {
        alt: 'Top: what is required is coins plus the wallet balance, but the user pays ' +
             'more than what is required. Bottom: the user pays less than what is ' +
             'required, shown next to a frustrated support agent.',
        rows: [
          {
            from: { art: [{ name: 'coins', count: 2 }, { name: 'wallet', count: 1 }],
                    caption: 'What is required' },
            to:   { art: [{ name: 'coins', count: 4 }],
                    caption: 'User pays more than what is required' }
          },
          {
            from: { art: [{ name: 'coins', count: 4 }],
                    caption: 'What is required' },
            to:   { art: [{ name: 'coins', count: 2 }, { name: 'support-agent.png', count: 1 }],
                    caption: 'User pays less than what is required' }
          }
        ]
      },
      why: {
        title: 'Why this happens?',
        points: [
          '<b>Missing Information Hierarchy:</b> No clear visual distinction or priority ' +
          'for the final payable amount.',

          '<b>Lack of Section Titles:</b> No labels to differentiate between total ' +
          'invoices, available wallet balance, and bank transfer details.',

          '<b>High Risk of Incorrect Payments:</b> Users pay the first visible number ' +
          '(gross total) instead of the net amount after wallet deduction.',

          '<b>Excessive Vertical Scrolling:</b> Key payment figures are pushed below the ' +
          'fold, forcing unnecessary scrolling.'
        ]
      },
      how: {
        title: 'How I worked on solving this?',
        // '~' draws a scribble placeholder, like in a hand wireframe.
        wireframe: {
          before: {
            label: 'Before',
            panels: [{
              title: 'Payments Details',
              rows: [
                ['Amount', '$x,xxx.xx'],
                ['~', '~'],
                ['~', '$x,xxx.xx'],
                ['Total', '$x,xxx.xx'],
                ['~', '~'],
                ['~', '~']
              ]
            }]
          },
          after: {
            label: 'After',
            panels: [
              {
                title: 'Invoice Details',
                rows: [['~', '~', '~'], ['~', '~', '~'], ['~', '~', '~']]
              },
              {
                title: 'Payment Summary',
                rows: [
                  ['Total Amount', '$x,xxx.xx'],
                  ['Wallet Balance', '$xx.xx'],
                  ['Outstanding Amount', '$x,xxx.xx']
                ],
                button: 'Pay $x,xxx.xx'
              }
            ]
          }
        }
      }
    },

    {
      type: 'pull',
      text: 'People do not read a payment screen. They find a number and they send it.'
    },

    {
      type: 'section',
      num: '02',
      title: 'What I would watch next',
      body: [
        'The redesign shipped in November 2025. The measures that matter are the ones ' +
        'tied to the two behaviours it targeted: how many invoices get settled per ' +
        'payment session, and how many payments arrive at an amount finance has to ' +
        'correct by hand.',

        'I would also want session recordings on the summary block specifically. The ' +
        'hypothesis is that hierarchy fixed the wrong-amount problem — but hierarchy is ' +
        'exactly the kind of fix that is easy to believe in and hard to prove without ' +
        'watching someone use it.'
      ]
    }
  ]
},

/* ==========================================================================
   2 — BILINGUAL COMPANY NAMING  (real, complete)
   --------------------------------------------------------------------------
   The Before / After screens are drawn in HTML by assets/js/mockups.js.
   The numbered notes under each screen match the numbered markers on it.
   ========================================================================== */
{
  slug: 'bilingual-company-naming',
  kind: 'Case study',
  published: true,
  status: 'live',

  card: {
    title: 'Write It Once: Bilingual Company Naming',
    sub: 'I designed the step where founders name their company in Arabic and English — then redesigned it so they only write one.',
    tags: ['Onboarding', 'B2B'],
    thumb: {
      left:  { icon: 'doc', count: 3 },
      right: { icon: 'check', count: 1 },
      tone: 'lime'
    }
  },

  title: 'Write It Once: Bilingual Company Naming',
  standfirst:
    'To register a company in Egypt, a founder has to submit several names, ranked, in both ' +
    'Arabic and English. I designed this step from scratch, reviewed my own first version, ' +
    'found where it failed, and redesigned it, so founders write each name once, in the ' +
    'language they know, and see exactly where it lands in their list.',

  meta: {
    'Role':    { value: 'Product Designer', note: 'Sole designer · both versions' },
    'Scope':   { value: 'Company name step', note: 'Inside the incorporation flow' },
    'Product': { value: 'B2B SaaS', note: 'Incorporation · Egypt' }
  },

  blocks: [
    {
      type: 'section',
      num: '01',
      title: 'Where it started',
      body: [
        'Egyptian law asks for every company name in <b>both Arabic and English</b>. That is a ' +
        'real barrier: plenty of founders are comfortable in one of the two languages and not the ' +
        'other. On top of that, they have to submit <b>several names ranked by preference</b>, in ' +
        'case their first choice is already taken.',

        'So one small-looking step asks for a lot: multiple names, two languages and a clear ' +
        'order. The platform already removed the language barrier: you write the name in the ' +
        'language you know, and it generates the other. I owned the design of this step ' +
        'end to end, and my goal was to make it <b>feel as simple as that promise</b>.'
      ]
    },

    {
      type: 'screens',
      num: '02',
      title: 'Before and after',
      intro:
        'Both screens are my own work. I designed the first version, then pressure-tested it ' +
        'against what a founder actually has to do here, and the problems below are the ones ' +
        'I found in it. The redesign keeps the same features, data and rules. What I changed ' +
        'is how the pieces relate to each other, and that turned out to be the whole problem.',
      before: {
        label: 'Before',
        kicker: 'My first version · two panels',
        screen: 'naming-before',
        alt: 'My first design: a form on the left split into a language box and a name box with ' +
             'a Generate button, and a separate Names List on the right labelled Top and Low.',
        notes: [
          '<b>No bridge between form and list.</b> Nothing tells you how a name you typed ' +
          'ends up on the right.',
          '<b>“Top” and “Low” only label the ends.</b> Every name in the middle has no exact rank.',
          '<b>Three boxes for one decision.</b> Language, name and list each feel like a separate task.'
        ]
      },
      after: {
        label: 'After',
        kicker: 'My redesign · one flow',
        screen: 'naming-after',
        alt: 'My redesign: one column. Pick the name language, type the name, and the other ' +
             'language is generated beside it. An Add to list button puts the pair into a ' +
             'numbered list, where number one is the first choice.',
        notes: [
          '<b>Read top to bottom.</b> Enter, add, see it in the list. Cause and effect sit on ' +
          'one line of sight, and the layout already works on mobile.',
          '<b>Write once, review both.</b> The generated name appears right next to yours, so ' +
          'you check the pair before saving it.',
          '<b>“Add to list” closes the loop.</b> One explicit action moves a name from the ' +
          'form into the list. Nothing is left to guess.',
          '<b>Every name has a number.</b> No more “Top” and “Low”. Drag to reorder and each ' +
          'position stays unambiguous.',
          '<b>Generate suggests more names.</b> Using AI, it proposes new names close to the ' +
          'one you typed and to your business, each with its Arabic and English pair, so a ' +
          'founder with one idea quickly has a full list of backups.'
        ]
      }
    },

    {
      type: 'challenge',
      n: 1,
      diagram: {
        alt: 'Left: a close-up of my first version, where the user types a name in the form. ' +
             'Right: the gap between the form and the list, where nothing shows how the name ' +
             'gets across.',
        rows: [{
          from: { zoom: { screen: 'naming-before', focus: 'name' },
                  caption: 'User types a name in the form' },
          to:   { zoom: { screen: 'naming-before', focus: 'gap', span: 0.46 },
                  caption: '…and has to guess how it reaches the list', emoji: 'confused' }
        }]
      },
      why: {
        title: 'Where my first version fell short',
        points: [
          '<b>Two panels, no action between them.</b> The form lived on the left, the list on ' +
          'the right, and nothing explicitly moved a name across.',
          '<b>Side by side reads as “separate”.</b> Parallel panels suggest two independent ' +
          'things, not one causing the other.'
        ]
      },
      how: {
        title: 'How I worked on solving this?',
        points: [
          'I stacked everything into <b>one column</b>, so the name you type sits directly above ' +
          'the list it goes into. Your eye follows the same path as the data.',
          'An explicit <b>“Add to list”</b> button completes the loop. Press it, and the pair ' +
          'appears below. Cause and effect are visible in one glance.'
        ]
      }
    },

    {
      type: 'challenge',
      n: 2,
      diagram: {
        alt: 'Left: a close-up of my first version’s list, labelled only Top and Low. Right: a ' +
             'close-up of the redesign’s list, where every name has a number.',
        rows: [{
          from: { zoom: { screen: 'naming-before', frame: 'list', focus: 'ends' },
                  caption: '“Top” … ? … “Low”' },
          to:   { zoom: { screen: 'naming-after', frame: 'list', focus: 'num', span: 0.52, align: 'start' },
                  caption: '#1, #2, #3: an exact rank for every name' }
        }]
      },
      why: {
        title: 'Where my first version fell short',
        points: [
          '<b>Labels only on the ends.</b> “Top” and “Low” worked for the first and last names ' +
          'and left everything in between to interpretation.',
          '<b>The order has legal weight.</b> If #1 is taken, the registry moves on to #2. A ' +
          'vague order means a founder might get a name they ranked lower than they thought.'
        ]
      },
      how: {
        title: 'How I worked on solving this?',
        points: [
          '<b>Numbers replace labels.</b> Every name carries its exact rank, and the first ' +
          'choice is highlighted so it reads as the one that matters most.',
          '<b>Drag to reorder</b> keeps changing your mind cheap. The numbers update as you ' +
          'move, so the list always says exactly what will be submitted.'
        ]
      }
    },

    {
      type: 'challenge',
      n: 3,
      diagram: {
        alt: 'Left: a close-up of my first version, with separate boxes for language, name and ' +
             'list. Right: a close-up of the redesign, where one question heads a single card ' +
             'and the language choice sits in the same row as the name.',
        rows: [{
          from: { zoom: { screen: 'naming-before', focus: 'box', span: 0.72, align: 'start' },
                  caption: 'Language + name + list = 3 tasks' },
          to:   { zoom: { screen: 'naming-after', frame: 'ask task', focus: 'task', span: 0.64, align: 'start' },
                  caption: 'One task: name your company' }
        }]
      },
      why: {
        title: 'Where my first version fell short',
        points: [
          '<b>Every concern got its own box.</b> Choosing a language, writing a name and ' +
          'managing the list each had a container, so one decision looked like three.',
          '<b>The language choice took a whole section</b> for what is really a single setting ' +
          'on the input.'
        ]
      },
      how: {
        title: 'How I worked on solving this?',
        points: [
          'I <b>folded the language choice into the input row</b>: language, your name, the ' +
          'generated name, side by side. One section disappeared entirely.',
          'The screen now reads as <b>one task</b> with one primary action, instead of three ' +
          'boxes competing for attention.'
        ]
      }
    },

    {
      type: 'outcome',
      num: '03',
      title: 'What changed',
      items: [
        { value: '1',      label: 'Language a founder has to write in, instead of two' },
        { value: '3 → 1',  label: 'Boxes to understand before starting' },
        { value: '#1–#n',  label: 'An exact rank for every name, not “Top” and “Low”' },
        { value: '1 tap',  label: 'From a typed name to a name on the list' }
      ]
    },

    {
      type: 'pull',
      text: 'The new layout added nothing. It made the relationships visible.'
    },

    {
      type: 'section',
      num: '04',
      title: 'Takeaway',
      body: [
        'Critiquing my own first version taught me the most here: a layout can include every ' +
        'feature and still fail to explain itself. Moving from two ' +
        'panels to one flow did not add anything new. It made the relationships between the ' +
        'existing pieces visible, and that turned out to be the real fix.'
      ]
    }
  ]
},

/* ==========================================================================
   3 — UX ARGUMENT   ⚠️ PLACEHOLDER — Mariam to replace
   --------------------------------------------------------------------------
   This one is not a case study — it is a position. Same structure, but the
   `pull` and `section` blocks carry the weight instead of `challenge`.
   ========================================================================== */
{
  slug: 'ux-argument-localisation',
  kind: 'UX argument',
  published: true,
  status: 'draft',
  draft: true,

  card: {
    title: 'Localisation is not translation',
    sub: 'What I learned redesigning a Huawei dashboard for Chinese users — from inside Beijing.',
    tags: ['Argument', 'Cross-cultural'],
    thumb: {
      left:  { icon: 'sad', count: 1 },
      right: { icon: 'happy', count: 1 },
      tone: 'lime'
    }
  },

  title: 'Localisation is not translation',
  standfirst:
    'A layout that tests well in Cairo can fail in Beijing without a single word being ' +
    'mistranslated. I spent five years studying in China and then redesigned a product ' +
    'for that market — here is what actually had to change.',

  meta: {
    'Format':  { value: 'UX argument' },
    'Context': { value: 'Huawei Technologies', note: 'Cairo & Beijing' },
    'Reading': { value: 'TODO min' },
    'Status':  { value: 'In progress' }
  },

  blocks: [
    {
      type: 'section',
      num: '01',
      title: 'The claim',
      body: [
        'TODO — state your position in two or three sentences. A UX argument earns its ' +
        'place by being arguable: if nobody could disagree with it, it is an observation, ' +
        'not an argument.'
      ]
    },
    {
      type: 'pull',
      text: 'TODO — the one sentence you would want a reader to quote back to you.'
    },

    // The two dashboards are drawn in HTML by assets/js/mockups.js.
    // Same job, same kind of data: what each customer signed for, what they
    // paid and what is left. The numbered notes match the markers on each screen.
    {
      type: 'screens',
      num: '02',
      title: 'One dashboard, two markets',
      intro:
        'Both screens do the same job: track sales, and for every customer, how much they ' +
        'signed for, how much they have paid and how much is still left. The first is how ' +
        'I would design it for a Western or Egyptian team. The second is how the same ' +
        'dashboard is expected to look in China. <b>All the data on both screens is dummy ' +
        'data</b>: the customers, names and numbers are made up, not real.',
      before: {
        label: 'Cairo',
        kicker: 'Modern Western UI · light · calm',
        screen: 'dash-cairo',
        disclaimer: 'Hi-fi concept for this case study. All customers, names and numbers are ' +
                    'dummy data, not real.',
        alt: 'A light, spacious sales dashboard: three headline cards for total sales, ' +
             'collected and still to collect, then a customer table with status tabs and ' +
             'filters. The table has more columns than fit, with a horizontal scrollbar under it.',
        notes: [
          '<b>Three numbers up top.</b> Total sales, collected and still to collect, with ' +
          'plenty of space around each one.',
          '<b>Detail lives behind filters.</b> Region, owner and more filters narrow the table ' +
          'down one question at a time.',
          '<b>The table scrolls sideways.</b> The customer column stays pinned while contract ' +
          'value, paid, remaining, % paid and quarter-by-quarter numbers scroll horizontally.'
        ]
      },
      after: {
        label: 'Beijing',
        kicker: 'Asian-style UI · dark · dense',
        screen: 'dash-beijing',
        disclaimer: 'Hi-fi concept for this case study. All customers, names and numbers are ' +
                    'dummy data, not real.',
        alt: 'The same customer table in a dark, dense, colourful style: every filter shown as ' +
             'chips, colour-coded status tabs with counts, an Export Excel button, and a small-type ' +
             'table whose middle columns scroll sideways between a pinned customer column and a ' +
             'pinned Actions column.',
        notes: [
          '<b>Every filter is out in the open.</b> Period, region, industry, owner and dates ' +
          'sit on screen as chips, not behind a Filters button.',
          '<b>Red means up.</b> On Chinese financial screens, gains are red and losses are ' +
          'green, the reverse of the Western convention.',
          '<b>Colour does the grouping.</b> Status, region and credit rating each get their own ' +
          'colour, with counts on every tab, instead of white space.',
          '<b>More rows, more columns, pinned at both ends.</b> Smaller type fits 14 customers ' +
          'per page. The middle columns scroll sideways while the customer and Actions columns stay put.'
        ]
      }
    },

    {
      type: 'section',
      num: '03',
      title: 'The evidence',
      body: [
        'TODO — what did you see? Density expectations, information hierarchy, entry ' +
        'points, how much a screen is allowed to hold before it reads as cluttered. ' +
        'Concrete examples beat adjectives here.'
      ]
    },
    {
      type: 'section',
      num: '04',
      title: 'What it changes about how I work',
      body: [
        'TODO — close with the practical consequence. What do you now do differently ' +
        'on day one of a project?'
      ]
    }
  ]
}

];
