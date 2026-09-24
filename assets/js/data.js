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
          src: 'assets/img/work/invoices-ui-preview.png',
          width: 777, height: 122,
          alt: 'The invoices page: Wallet Balance, Selected Invoices and Amount To Pay ' +
               'above the invoice table, with a Proceed To Payment button.',
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
   2 — INCORPORATION PRODUCT   ⚠️ PLACEHOLDER — Mariam to replace
   --------------------------------------------------------------------------
   The structure below is ready. Replace the copy and the diagram captions
   with the real story, then change `status` to 'live' and delete the
   `draft: true` line. Everything else keeps working.
   ========================================================================== */
{
  slug: 'incorporation',
  kind: 'Case study',
  published: true,
  status: 'draft',
  draft: true,

  card: {
    title: 'Company Incorporation Flow',
    sub: 'Turning a lawyer-shaped paperwork process into something a founder can finish alone.',
    tags: ['Onboarding', 'B2B'],
    thumb: {
      left:  { icon: 'alert', count: 3 },
      right: { icon: 'check', count: 1 },
      tone: 'blue'
    }
  },

  title: 'Company Incorporation Flow',
  standfirst:
    'I led the end-to-end design of Ovarc\'s incorporation product — from user research ' +
    'and flow definition through to implementation.',

  meta: {
    'Role':     { value: 'Product Designer', note: 'End-to-end design' },
    'Timeline': { value: 'TODO' },
    'Status':   { value: 'TODO' },
    'Product':  { value: 'Ovarc', note: 'B2B SaaS · Egypt' }
  },

  blocks: [
    {
      type: 'section',
      num: '01',
      title: 'Where it started',
      body: [
        'TODO — what was the situation before you touched it? Who was struggling, ' +
        'and what did that cost the business?'
      ]
    },
    {
      type: 'challenge',
      n: 1,
      diagram: {
        alt: 'Placeholder diagram — replace with the real before and after.',
        rows: [{
          from: { art: [{ icon: 'alert', count: 3 }], caption: 'TODO — what went wrong, in one line' },
          to:   { art: [{ icon: 'check', count: 1 }], caption: 'TODO — what happens now instead' }
        }]
      },
      why: {
        title: 'Why this happened?',
        points: [
          '<b>TODO.</b> The root cause, not the symptom.',
          '<b>TODO.</b> A second contributing cause.'
        ]
      },
      how: {
        title: 'How I worked on solving this?',
        points: [
          'TODO — what you changed, and why that change addresses the cause above.',
          'TODO — a second move.'
        ]
      }
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
    {
      type: 'section',
      num: '02',
      title: 'The evidence',
      body: [
        'TODO — what did you see? Density expectations, information hierarchy, entry ' +
        'points, how much a screen is allowed to hold before it reads as cluttered. ' +
        'Concrete examples beat adjectives here.'
      ]
    },
    {
      type: 'section',
      num: '03',
      title: 'What it changes about how I work',
      body: [
        'TODO — close with the practical consequence. What do you now do differently ' +
        'on day one of a project?'
      ]
    }
  ]
}

];
