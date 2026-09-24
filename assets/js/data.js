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
               'concept' → pale lime "Concept" pill, for finished work that
                         was designed but not built
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
      type: 'outcome',
      num: '02',
      title: 'Outcome',
      items: [
        { value: '>90%', label: 'Completion rate' }
      ]
    },

    {
      type: 'pull',
      text: 'People do not read a payment screen. They find a number and they send it.'
    },

    {
      type: 'section',
      num: '03',
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
      // the founder types the Arabic name once; the English one is generated
      zoom: { screen: 'naming-after', frame: 'own gen add', focus: 'gen', span: 0.52, align: 'end' },
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
   3 — UX ARGUMENT: LOCALISATION  (complete)
   --------------------------------------------------------------------------
   This one is not a case study — it is a position. Same structure, but the
   `pull` and `section` blocks carry the weight instead of `challenge`.
   `status: 'concept'` because the two dashboards in it are hi-fi concepts
   drawn for this piece, with dummy data, not the real Huawei screens.
   ========================================================================== */
{
  slug: 'ux-argument-localisation',
  kind: 'UX argument',
  published: true,
  status: 'concept',

  card: {
    title: 'Localisation is not translation',
    sub: 'A perfectly translated dashboard can still feel wrong in Beijing. Here is what actually has to change.',
    tags: ['Cross-cultural', 'Localisation'],
    thumb: {
      // the study's two dashboards, split down the middle: Cairo | Beijing.
      // tools/make-thumbs.js draws it from mockups.js; re-run it if they change.
      image: { src: 'assets/img/work/localisation-card.webp', width: 1200, height: 750 },
      tone: 'lime'
    }
  },

  title: 'Localisation is not translation',
  standfirst:
    'A dashboard that feels calm and clear in Cairo can feel empty in Beijing, without a ' +
    'single word being mistranslated. I spent five years studying in China, then designed ' +
    'financial dashboards at Huawei, adapting them to Chinese design conventions. This is ' +
    'what had to change, and none of it was the words.',

  meta: {
    'Format':     { value: 'UX argument' },
    'Context':    { value: 'Huawei Technologies', note: 'Financial dashboards · 2024' },
    'Background': { value: '5 years in China', note: 'B.Sc., Beijing Jiaotong University' },
    'Reading':    { value: '5 min' }
  },

  blocks: [
    {
      type: 'section',
      num: '01',
      title: 'The claim',
      body: [
        'Most teams treat localisation as the last step of a project. The product is ' +
        'designed once, the strings go to a translator, and the layout, the density and ' +
        'the colours stay exactly as they were, because everyone assumes they are neutral.',

        'They are not. How much a screen is allowed to hold, where the eye starts and what ' +
        'red and green mean are all cultural. My position is simple: <b>a product is not ' +
        'localised until its layout has been designed for the market, not just its ' +
        'words.</b> If a finance team in Beijing opens a perfectly translated dashboard and ' +
        'still asks where everything is, the localisation has failed.',

        'Plenty of designers would disagree. One global design system is cheaper to build ' +
        'and easier to maintain, and minimalism is often treated as universal good taste. ' +
        'I think that is one market’s taste, applied as a rule everywhere.'
      ]
    },
    {
      type: 'pull',
      text: 'You can translate every word correctly and still ship a screen that feels foreign.'
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
        'Put the two screens side by side and none of the differences are in the words. ' +
        'Four of them decide whether the dashboard feels right.',

        '<b>Density reads as capability, not clutter.</b> The apps people in China use ' +
        'every day, for payments, shopping, travel and public services, put dozens of entry ' +
        'points on one screen, and people learn to scan dense screens fast. A dashboard ' +
        'with eight rows and three big numbers does not read as calm there. It reads as a ' +
        'tool that is hiding something, or one that is not finished. The Beijing screen ' +
        'shows 14 customers across more than twenty columns, because that is what its ' +
        'reader expects to take in at a glance.',

        '<b>Hidden filters feel like missing features.</b> The Cairo screen uses progressive ' +
        'disclosure: two dropdowns, and a Filters button for the rest. That keeps the page ' +
        'quiet for someone asking one question at a time. The Beijing screen puts period, ' +
        'region, industry, owner and dates on screen as chips. The filter bar doubles as a ' +
        'summary of what the table is showing, and every change is one click, not a panel.',

        '<b>Colour carries meaning before it carries style.</b> In China, red means up. ' +
        'Stock tickers, sales reports and finance screens show gains in red and losses in ' +
        'green, the reverse of the Western convention. A growth figure in green, the obvious ' +
        'choice in Cairo, reads as a loss in Beijing. Colour also does the grouping that ' +
        'white space does on the Cairo screen: status, region and credit rating each get ' +
        'their own colour, and every tab shows a count.',

        '<b>The data is expected to leave the screen.</b> Export Excel sits in the header, ' +
        'not in a menu. The table ends with a page total, and the header shows the exact ' +
        'time the data was last updated. Numbers on a screen like this usually end up in a ' +
        'report, and the design treats exporting them as the main job, not an edge case.',

        'None of this would come back from a translator. Every word on the Cairo screen ' +
        'could be rendered perfectly in Chinese, and it would still feel like a product ' +
        'built for somewhere else.'
      ]
    },
    {
      type: 'section',
      num: '04',
      title: 'What it changes about how I work',
      body: [
        'I no longer treat the market as a translation task at the end of a project. It ' +
        'goes into the brief on day one, next to the persona, and it shapes three things ' +
        'before I draw a single screen.',

        '<b>I design from the user’s own tools, not from design galleries.</b> Before ' +
        'wireframes, I collect screens from the products my users already work in every ' +
        'day. Those set the density, the entry points and the patterns to follow, instead ' +
        'of my own taste.',

        '<b>I check what colours mean, not only their contrast.</b> Red, green and gold ' +
        'carry different meanings in different markets. Which way is up, and what counts ' +
        'as a warning, gets agreed before the palette is final.',

        '<b>I plan for density from the start.</b> Row height, type size and what is ' +
        'visible by default are decisions, not constants. When one product serves more ' +
        'than one market, I design its components to be compact or comfortable without ' +
        'being redesigned.',

        'Translation makes a product readable. Localisation makes it feel like it was ' +
        'built for the person using it.'
      ]
    }
  ]
},

/* ==========================================================================
   4 — VIBE CODING  (side projects, links out)
   --------------------------------------------------------------------------
   Mariam: the `text` line under each project is yours to fill in — one
   sentence on what it is and what you used to build it.
   ========================================================================== */
{
  slug: 'vibe-coding',
  kind: 'Vibe coding',
  published: true,
  status: 'live',

  card: {
    title: 'Vibe Coding Projects',
    sub: 'Three things I designed and built myself, end to end, with AI as my pair programmer.',
    tags: [],
    thumb: {
      // the projects below, as browser windows. tools/make-thumbs.js draws it
      // from this entry; re-run it after changing a project's image or link.
      image: { src: 'assets/img/work/vibe-coding-card.webp', width: 1200, height: 750 },
      tone: 'blue'
    }
  },

  title: 'Vibe Coding Projects',
  standfirst:
    'Designing a product and shipping one are different skills. These are projects I took ' +
    'from idea to a live link myself, building with AI tools. Each one is live, so you can ' +
    'open it and try it.',

  meta: {
    'Role':     { value: 'Designer & builder' },
    'Projects': { value: '3', note: 'All live' },
    'Type':     { value: 'Freelance', note: 'All delivered' },
    'Status':   { value: 'Live' }
  },

  blocks: [
    {
      type: 'projects',
      num: '01',
      title: 'The projects',
      intro: 'Each link opens in a new tab.',
      items: [
        { name: 'Mirayti',          url: 'https://mirayti.vercel.app/',
          img: 'assets/img/vibe/mirayti.webp',          badges: ['Freelance', 'Delivered'], tool: 'Claude' },
        { name: 'Match and Attack', url: 'https://ruyiemad.github.io/match-and-attack/',
          img: 'assets/img/vibe/match-and-attack.webp', badges: ['Freelance', 'Delivered'], tool: 'Claude' },
        { name: 'Sandra & Alex',    url: 'https://studio.ruyinqc.workers.dev/w/sandra-alex-1b532e/',
          img: 'assets/img/vibe/sandra-alex.webp',      badges: ['Freelance', 'Delivered'], tool: 'Claude' }
      ]
    }
  ]
},

/* ==========================================================================
   5 — JOURNEY GUIDE TRACKER  (tourism concept, complete)
   --------------------------------------------------------------------------
   `status: 'concept'` gives the card a "Concept" pill instead of "Shipped":
   this one was designed, not built. The video is the prototype walkthrough,
   and the five stills under "How it works" are its screens, exported from
   the design at full size and set in a phone frame.
   ========================================================================== */
{
  slug: 'journey-guide-tracker',
  kind: 'Case study',
  published: true,
  status: 'concept',

  card: {
    title: 'Journey Guide Tracker',
    sub: 'A museum guide that ticks off every room you visit and shows you where to go next.',
    tags: ['Tourism'],
    thumb: {
      image: { src: 'assets/img/work/journey-guide-card.webp', width: 870, height: 544 },
      tone: 'lime'
    }
  },

  title: 'Your Journey Guide Tracker',
  standfirst:
    'From your first step to your last stop, it keeps track of every place you visit. ' +
    'Never forget where you’ve been, and get guided to where to go next.',

  meta: {
    'Role':     { value: 'UI/UX Designer', note: 'Solo project' },
    'Platform': { value: 'Mobile app' },
    'Industry': { value: 'Tourism', note: 'Museums & venues' },
    'Status':   { value: 'Concept', note: 'Prototype video' }
  },

  // A vibe coding card under the meta row. The image is a placeholder:
  // swap in a screenshot, and add `url` once there is a live link.
  projects: [
    { name: 'Journey Guide Tracker', img: 'assets/img/vibe/placeholder.svg',
      badges: ['Vibe coding'], tool: 'claude.ai' }
  ],

  // the prototype walkthrough, shown full width under the meta row
  cover: {
    video: 'assets/video/journey-guide-tracker.mp4',
    poster: 'assets/img/work/journey-guide-poster.webp',
    width: 960, height: 544,
    alt: 'Prototype walkthrough of Journey Guide Tracker: a visitor scans a QR code at a ' +
         'museum entrance, the guide loads, and the map follows them room by room.'
  },

  blocks: [
    {
      type: 'section',
      num: '01',
      title: 'The idea',
      body: [
        'Journey Guide Tracker is a mobile guide for places you explore on foot. It keeps a ' +
        'record of every stop you make and points you to the next one, so you never have to ' +
        'wonder which rooms you have already seen or where to go now.',

        'The prototype is set in a museum, <b>The Meridian Archive</b>. You scan a QR code at ' +
        'the entrance, and the guide follows you room by room until your last stop.'
      ]
    },

    {
      type: 'pull',
      text: 'Never forget where you’ve been.'
    },

    {
      type: 'steps',
      num: '02',
      title: 'How it works',
      intro: 'Five moments from the prototype. Each one is a screen from the video above.',
      items: [
        {
          title: 'Scan and start',
          text: 'Visitors scan a QR code at the entrance, and their journey guide for ' +
                '<b>The Meridian Archive</b> loads.',
          image: {
            src: 'assets/img/work/journey-guide-step-1.webp', width: 418, height: 872,
            alt: 'Loading screen: The Meridian Archive, Your Journey Guide, Loading your journey guide.'
          }
        },
        {
          title: 'See where you are',
          text: 'A blue dot marks you on the map, and the top bar names the room you are in. ' +
                'Rooms you haven’t seen yet are flagged <b>Not visited</b>.',
          image: {
            src: 'assets/img/work/journey-guide-step-2.webp', width: 418, height: 872,
            alt: 'Museum map. The top bar reads: You are at Footprints of the Past, Visit ' +
                 'progress 10%. Pharaohs Room has a Visited tick and the other rooms are flagged ' +
                 'Not visited. A card at the bottom describes Footprints of the Past: 7 min, Floor 1.'
          }
        },
        {
          title: 'Ticked off as you go',
          text: 'Leave a room and it turns <b>Visited</b>. Your visit progress goes up, and the ' +
                'top bar moves on to the next stop.',
          image: {
            src: 'assets/img/work/journey-guide-step-3.webp', width: 418, height: 872,
            alt: 'Footprints of the Past and Pharaohs Room both have a Visited tick. The top bar ' +
                 'reads: Next is Time Travelers’ Gallery, Visit progress 20%.'
          }
        },
        {
          title: 'Follow the footprints',
          text: 'A trail of footprints on the map shows the way. Here it heads for the ' +
                '<b>Time Travelers’ Gallery</b>, with 20% of the visit done.',
          image: {
            src: 'assets/img/work/journey-guide-step-4.webp', width: 418, height: 872,
            alt: 'The map with a trail of footprints toward Time Travelers’ Gallery. The top ' +
                 'bar reads: Next is Time Travelers’ Gallery, Visit progress 20%.'
          }
        },
        {
          title: 'Plan the rest by floor',
          text: 'Pull the card up to see every room, floor by floor, with its tour time and ' +
                'any extra fees.',
          image: {
            src: 'assets/img/work/journey-guide-step-5.webp', width: 418, height: 872,
            alt: 'The card pulled up into a list with tabs for All, Floor 1, Floor 2 and Floor 3. ' +
                 'Floor 1 lists Pharaohs Room (30 min tour, extra fees), Footprints of the Past ' +
                 '(7 min tour) and Time Travelers’ Gallery.'
          }
        }
      ]
    },

    {
      type: 'chips',
      num: '03',
      title: 'Where it works best',
      intro: 'The prototype is set in a museum, but the same guide fits any place you explore ' +
             'stop by stop.',
      items: [
        { text: 'Museums', note: 'The prototype', accent: true },
        'Exhibitions',
        'Historical Sites',
        'University Open Days',
        'Shopping Malls or Markets',
        'City Tours'
      ]
    },

    {
      type: 'projects',
      num: '04',
      title: 'See the full project',
      items: [
        { name: 'Journey Guide Tracker on Behance',
          text: 'The full project, with every screen.',
          url: 'https://www.behance.net/gallery/232930537/Journey-Gide-Tracker-UIUX-Project-Tourism' }
      ]
    }
  ]
}

];
