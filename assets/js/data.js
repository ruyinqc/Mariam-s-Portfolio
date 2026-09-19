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
   Icons you can use in a diagram:
     doc · coin · wallet · sad · happy · check · alert
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
      left:  { icon: 'doc', count: 5 },
      right: { icon: 'doc', count: 1 },
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
    'Timeline': { value: '~7.5 weeks' },
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
        alt: 'Five invoices are due. The customer pays only one of them.',
        before: {
          tone: 'bad',
          rows: [{
            groups: [{ icon: 'doc', count: 5 }],
            caption: '5 invoices the user needs to pay'
          }]
        },
        after: {
          tone: 'bad',
          rows: [{
            groups: [{ icon: 'doc', count: 1 }, { icon: 'sad', count: 1, join: false }],
            caption: 'User pays only 1'
          }]
        }
      },
      why: [
        '<b>No batch payment existed.</b> The interface could only take one invoice at a ' +
        'time, so paying five meant repeating the same flow five times.',

        '<b>Manual bank transfer was the only method.</b> Every invoice meant another trip ' +
        'to a banking app, another reference number, another chance to give up halfway.',

        '<b>So people triaged.</b> They paid the invoice with the hardest deadline — ' +
        'usually payroll — and ignored the rest until someone chased them.'
      ],
      how: [
        'Customers can now select <b>multiple invoices and pay them in one action</b>.',

        'The total updates live as invoices are ticked, so the commitment is visible ' +
        '<b>before</b> anything is confirmed — not after.',

        'Available <b>wallet balance</b> is shown in the same view, so the customer can ' +
        'see what the payment will actually cost them out of pocket.'
      ]
    },

    {
      type: 'challenge',
      n: 2,
      diagram: {
        alt: 'Customers transferred either more or less than the amount actually owed.',
        before: {
          tone: 'bad',
          rows: [
            {
              groups: [{ icon: 'coin', count: 3 }, { icon: 'wallet', count: 1 }],
              caption: 'User pays more than what is required'
            },
            {
              groups: [{ icon: 'coin', count: 1 }],
              caption: 'User pays less than what is required'
            }
          ]
        },
        after: {
          tone: 'good',
          rows: [{
            groups: [{ icon: 'check', count: 1 }],
            caption: 'One clear amount, confirmed before paying'
          }]
        }
      },
      why: [
        '<b>Missing information hierarchy.</b> Nothing on the screen said which number was ' +
        'the one to act on. The final payable amount had the same visual weight as every ' +
        'other figure.',

        '<b>No section titles.</b> Total invoiced, available wallet balance and bank ' +
        'transfer details ran together with no labels separating them.',

        '<b>High risk of incorrect payment.</b> People transferred the first number they ' +
        'saw — the gross total — instead of the net amount left after the wallet balance ' +
        'was deducted.',

        '<b>Excessive vertical scrolling.</b> The figures that mattered sat below the fold, ' +
        'so the decision was made before the evidence was even on screen.'
      ],
      how: [
        'Split the screen into three <b>named</b> regions — Payment Details, Invoice ' +
        'Details and Payment Summary — so every number has a stated job.',

        'Gave the <b>final payable amount</b> the strongest treatment on the page, and ' +
        'demoted the gross total to supporting text.',

        'Showed the <b>wallet deduction as a line item</b>, so the arithmetic is visible ' +
        'rather than implied.',

        'Pulled the summary <b>above the fold</b> — the customer now sees what they owe ' +
        'and what they are about to send without scrolling.'
      ]
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
        before: {
          tone: 'bad',
          rows: [{
            groups: [{ icon: 'alert', count: 3 }],
            caption: 'TODO — what went wrong, in one line'
          }]
        },
        after: {
          tone: 'good',
          rows: [{
            groups: [{ icon: 'check', count: 1 }],
            caption: 'TODO — what happens now instead'
          }]
        }
      },
      why: [
        '<b>TODO.</b> The root cause, not the symptom.',
        '<b>TODO.</b> A second contributing cause.'
      ],
      how: [
        'TODO — what you changed, and why that change addresses the cause above.',
        'TODO — a second move.'
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
