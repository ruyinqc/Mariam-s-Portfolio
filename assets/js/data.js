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
    'Customers were receiving several invoices a month and paying only the one that ' +
    'scared them most. The ones who did try to pay in full often sent the wrong amount. ' +
    'I rebuilt the payment flow so that the right number is the obvious number.',

  meta: {
    'Role':     { value: 'Product Designer', note: 'End-to-end design' },
    'Timeline': { value: '2.5 weeks' },
    'Status':   { value: 'Shipped', note: 'In production since November 2025' },
    'Product':  { value: 'Ovarc', note: 'B2B SaaS · Egypt' },
    'Outcome':  { value: '>90%', note: 'Completion rate' }
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
        'In theory a customer opens the billing page and settles what is due. In practice, ' +
        'they did not.',

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
    }
  ]
},

/* ==========================================================================
   KLAXS · كلاكس  (own product, live, real players)
   --------------------------------------------------------------------------
   The phone stills are the live game's own screens, in Arabic, framed
   in the file like the Journey Guide stills. The chat screenshots are real
   messages from players, with their profile pictures blurred; `en` is the
   translation shown under each one.
   Arabic inside a paragraph: <span class="ar" lang="ar" dir="rtl">…</span>
   ========================================================================== */
{
  slug: 'klaxs',
  kind: 'Case study',
  published: true,
  status: 'live',

  card: {
    title: 'Klaxs: Learn to Speak Horn',
    sub: 'I moved to Cairo and realised the car horns were talking. So I designed a game that teaches their language, and people played it.',
    tags: ['Game design'],
    thumb: {
      image: { src: 'assets/img/work/klaxs-card.webp', width: 1008, height: 630 },
      tone: 'lime'
    }
  },

  title: 'Klaxs: in Cairo, the horn is a language',
  standfirst:
    'When I moved to Cairo, the honking drove me crazy. Then I started listening, and ' +
    'noticed that most of it actually meant something. Klaxs is the game I designed and ' +
    'built to teach that language: an old taxi driver teaches you the words, then the ' +
    'street tests you on them.',

  meta: {
    'Role':     { value: 'Product Designer & builder', note: 'Idea, UX, UX writing, art direction' },
    'Timeline': { value: '9 days', note: 'First line of code to the version people shared' },
    'Platform': { value: 'Web game', note: 'Phone first · Egyptian Arabic & English' },
    'Players':  { value: '41', note: 'On the players board' },
    'Status':   { value: 'Live', note: 'ruyinqc.com/klaxs' }
  },

  projects: [
    { name: 'Play Klaxs', url: 'https://ruyinqc.com/klaxs/',
      img: 'assets/img/vibe/klaxs.webp', badges: ['Live', 'Arabic & English'],
      text: 'Best on a phone, with the sound on.' }
  ],

  // the game's cover beside me in the game, one row at the same height
  cover: {
    pair: [
      { src: 'assets/img/klaxs/cover.webp', width: 1200, height: 630,
        alt: 'The Klaxs cover: the game’s logo over a sunny, crowded Cairo street with a ' +
             'tuk-tuk, a microbus and a donkey cart, and a “Designed by ruyinqc” badge.' },
      { src: 'assets/img/klaxs/me-in-klaxs.webp', width: 720, height: 1039,
        alt: 'Me, smiling behind the wheel of a cartoon car on the game’s Cairo street, ' +
             'under the Klaxs logo and a prompt that asks “How’s the road today?” in ' +
             'English and Arabic.',
        caption: 'That’s me, in the driver’s seat of my own game.' }
    ]
  },

  blocks: [
    {
      type: 'section',
      num: '01',
      title: 'Where it started',
      body: [
        'I moved to Cairo, and the first thing the city gave me was a headache. Microbuses, ' +
        'taxis, tuk-tuks, all honking, all day, all at once. For weeks it was just ' +
        '<span class="ar" lang="ar" dir="rtl">دوشة</span>, noise.',

        'Then I started actually listening. One light beep when someone lets you into a ' +
        'lane: thank you. Two quick ones back: you too. One long angry blast at a tuk-tuk: ' +
        'what are you doing?! And when a wedding convoy passes, the whole street honks the ' +
        'same rhythm together.',

        'It wasn’t noise. Most of the time it meant something. Every Egyptian driver speaks ' +
        'horn fluently, nobody ever wrote it down, and nobody teaches it to the people who ' +
        'just arrived, people like me. <b>That is where Klaxs started.</b>'
      ]
    },

    {
      type: 'pull',
      ar: 'الكلاكس هنا مش دوشة… ده لغة.',
      text: 'Here, the horn isn’t noise. It’s a language.'
    },

    {
      type: 'horns',
      num: '02',
      title: 'Writing the language down',
      intro:
        'Before I designed a single screen, I wrote down the vocabulary: what each rhythm ' +
        'sounds like, what it means, and when people use it. Six words made it into the game. ' +
        'One of them you learn to recognise, but never say.',
      items: [
        { rhythm: 's', ar: 'صباح الفل!', en: 'Morning! / Thanks',
          when: 'Someone made room for you, or a passer-by says hi.' },
        { rhythm: 's s', ar: 'وإنت كمان!', en: 'Right back at you!',
          when: 'Someone gives you a single beep.' },
        { rhythm: 'L', ar: 'إنت بتعمل إيه؟!', en: 'What are you doing?!',
          when: 'Someone cuts you off or drives like a maniac.' },
        { rhythm: 's s | s | s s | s', ar: 'بحبك بحبك', en: 'Love ya, love ya',
          when: 'You spot a friend on the sidewalk.' },
        { rhythm: 's s | s s s', repeat: '× 3–4', ar: 'الزفّة', en: 'The wedding (zaffa)',
          when: 'The bride’s car rolls by and the whole street joins in.' },
        { rhythm: 's s s L', ar: 'شتيمة', en: 'A curse',
          when: 'A driver lost his temper.', listen: 'Recognise it. Never answer it.' }
      ]
    },

    {
      type: 'chips',
      num: '03',
      title: 'Who it’s for',
      intro:
        'I designed it for the person I was a few months ago, and for everyone who already ' +
        'speaks horn and wants to laugh at how true it all is.',
      items: [
        { text: 'People new to Cairo', note: 'Like me', accent: true },
        'Expats and students',
        'Egyptians abroad',
        'Families, kids in the back seat',
        'Every Egyptian who already speaks horn'
      ]
    },

    {
      type: 'steps',
      num: '04',
      title: 'How it plays',
      intro:
        'Learn with Osta, then drive. Every screen is in Egyptian Arabic first, with English ' +
        'one tap away. These are the live game’s own screens.',
      items: [
        {
          title: 'Start the car',
          text: 'The first button isn’t “Start”. It’s <span class="ar" lang="ar" dir="rtl">' +
                'دوّر العربية</span>, “start the car”, so your very first tap puts you in ' +
                'the driver’s seat.',
          image: {
            src: 'assets/img/klaxs/screen-start.webp', width: 420, height: 872,
            alt: 'The Klaxs start screen: the logo, the line “Learn to speak horn, the ' +
                 'Egyptian way” and a big orange “Start the car” button, in Arabic.'
          }
        },
        {
          title: 'Meet Osta Abdo',
          text: 'An old taxi driver with thirty years on Cairo’s streets. He is the teacher, ' +
                'the coach and the voice of the whole game.',
          image: {
            src: 'assets/img/klaxs/screen-osta.webp', width: 420, height: 872,
            alt: 'The driver’s seat on a downtown Cairo street. Osta Abdo, a cartoon taxi ' +
                 'driver with a cap and moustache, says in Arabic: here, the horn isn’t ' +
                 'noise, it’s a language, and I’ll teach you to speak it.'
          }
        },
        {
          title: 'Hear it, see it, honk it',
          text: 'Each lesson plays one word, draws its beeps as pills, and waits for you to ' +
                'honk it back on the wheel.',
          image: {
            src: 'assets/img/klaxs/screen-lesson.webp', width: 420, height: 872,
            alt: 'The lesson card for “Love ya, love ya”: what it means, when to use it, the ' +
                 'target rhythm as a row of pills and an empty row for your own honks.'
          }
        },
        {
          title: 'Hit the road',
          text: 'An endless drive through downtown. The microbus makes room for you, so you ' +
                'thank him. A taxi says good morning, so you answer.',
          image: {
            src: 'assets/img/klaxs/screen-street.webp', width: 420, height: 872,
            alt: 'Driving: a microbus pulls over and says “after you, boss”, and the prompt ' +
                 'at the top reads “The microbus made room for you. Thank him!”'
          }
        },
        {
          title: 'Get your rank',
          text: 'Osta tells you what kind of driver you turned out to be, and how far you are ' +
                'from the next rank.',
          image: {
            src: 'assets/img/klaxs/screen-over.webp', width: 420, height: 872,
            alt: 'The round-over sheet: Osta’s verdict, the score, the rank ladder from ' +
                 'learner’s permit to master of the road with “you’re here” on the player’s ' +
                 'rank, the points left to the next rank, and buttons to play again, share or ' +
                 'download the image.'
          }
        }
      ]
    },

    {
      type: 'decisions',
      num: '05',
      title: 'The UX behind the fun',
      intro:
        'Klaxs looks like a game, but every part of it is a product decision. These are the ' +
        'ones I’m proudest of, and the UX idea behind each one.',
      items: [
        {
          concept: 'Natural mapping',
          title: 'The horn is where your thumb already is',
          text: [
            'In a real car the horn is in the middle of the steering wheel, so that is exactly ' +
            'where I put it: at the bottom of the screen, right under your thumb. <b>Tap for a ' +
            'short beep, hold for a long one.</b> If you have ever sat in a car, there is ' +
            'nothing new to learn. On a computer, it’s the space bar.',

            'Osta’s very first lesson isn’t a word at all. It teaches the control, one light ' +
            'tap and then one long press, and only then does the language start.'
          ],
          said: { ar: 'الكلاكس في نص الدريكسيون. دوسة خفيفة كده… بيب!',
                  en: 'The horn is in the middle of the wheel. Give it a light tap… beep!',
                  by: 'Osta Abdo, lesson zero' },
          image: {
            src: 'assets/img/klaxs/screen-horn.webp', width: 420, height: 872,
            alt: 'Osta explains where the horn is, and a “press here” sticker bobs above the ' +
                 'horn in the middle of the steering wheel.'
          }
        },
        {
          concept: 'Feedback that teaches',
          title: 'Say what went wrong, not just that it did',
          text: [
            'A rhythm is hard to explain in words, so I made it visible. The word you need is ' +
            'drawn as pills, a dot for a short beep and a bar for a long one, and <b>your own ' +
            'honks fill a second row right under it</b>, so you can see exactly where you ' +
            'drifted.',

            'When you miss, Osta never just says “wrong”. He names the mistake, one beep ' +
            'short, held too long, no breath in the middle, and tells you what to do about it.'
          ],
          said: { ar: 'ناقصة زمارة… اسمع تاني.', en: 'You’re missing a beep. Listen again.' },
          image: {
            src: 'assets/img/klaxs/screen-hint.webp', width: 420, height: 872,
            alt: 'A lesson after a wrong try: the player’s single beep sits under the two-beep ' +
                 'target, and Osta says “You’re missing a beep. Listen again.”'
          }
        },
        {
          concept: 'Scaffolding, then fading',
          title: 'Training wheels that come off',
          text: [
            'You can’t drive until you’ve finished the lessons. The drive button simply isn’t ' +
            'there yet, so nobody lands in traffic without the vocabulary. Lessons come <b>one ' +
            'word at a time</b>, and finished ones turn into a dictionary you can practise from.',

            'On the street, the help fades. From level 3 the rhythm disappears and you honk ' +
            'from memory, for a bonus. You can still peek, but peeking costs you the bonus. ' +
            'One player described this exact moment to me: <b>“now I understand and reply ' +
            'without reading.”</b>'
          ],
          said: { ar: 'من هنا ورايح من غير غش… الإيقاع مش هيظهر.',
                  en: 'From now on, no cheat sheet. The rhythm won’t show.' },
          image: {
            src: 'assets/img/klaxs/screen-memory.webp', width: 420, height: 872,
            alt: 'A level 3 street moment: the microbus makes room, and the rhythm is hidden ' +
                 'behind question marks, with a “peek at the rhythm, no bonus” button.'
          }
        },
        {
          concept: 'Peak–end rule',
          title: 'Make the best moment unforgettable',
          text: [
            'Every few moments a wedding convoy drives by. You honk the zaffa with them, three ' +
            'rounds in a row, and the street answers with confetti and a ' +
            '<span class="ar" lang="ar" dir="rtl">زغروطة</span>. Weddings pay double, and a ' +
            'good one can even give you back a heart you lost.',

            'It’s the moment people remember, and it couldn’t be more Cairo.'
          ],
          said: { ar: 'الفرح جبر بخاطرك… قلب زيادة!', en: 'Weddings mend hearts. You got one back!' },
          image: {
            src: 'assets/img/klaxs/screen-wedding.webp', width: 420, height: 872,
            alt: 'The wedding moment. The prompt reads “A zaffa! Honk along, round 2 of 3”, ' +
                 'with the wedding rhythm as pills and the player’s first honk filling in.'
          }
        },
        {
          concept: 'Values in the design',
          title: 'Teach the curse, but never let anyone say it',
          text: [
            'The real horn vocabulary includes a curse, and leaving it out would teach people ' +
            'the wrong street. So you learn to <b>recognise</b> it, and that’s all. It’s the ' +
            'only word in the game you can’t honk.',

            'When a car curses at you on the street, the right answer is to let it go, and the ' +
            'game rewards you for exactly that. Honk back, and Osta stops you.'
          ],
          said: { ar: 'هتسمعها كتير… بس إحنا ولاد أصول، مابنردش.',
                  en: 'You’ll hear it plenty, but we have manners: we never answer.' },
          image: {
            src: 'assets/img/klaxs/screen-curse.webp', width: 420, height: 872,
            alt: 'The curse lesson: three short beeps and a long one, marked as a word you ' +
                 'only listen to, while Osta explains that we never answer it.'
          }
        },
        {
          concept: 'Designed to be shared',
          title: 'A score worth posting',
          text: [
            'A round ends with a rank, not just a number: from ' +
            '<span class="ar" lang="ar" dir="rtl">رخصة تعليم</span>, a learner’s permit, ' +
            'all the way to <span class="ar" lang="ar" dir="rtl">أسطى الأسطوات</span>, ' +
            'master of the road. Osta tells you how many points the next rank needs, so ' +
            '“one more round” is always close.',

            'Then the game gives you something to post. <b>Download image</b> makes a ' +
            'story-sized picture of your round with your rank and your place among the ' +
            'players, the players board is one tap from home, and a shared link shows the ' +
            'game’s cover with my credit on it.'
          ],
          image: {
            src: 'assets/img/klaxs/screen-home.webp', width: 420, height: 872,
            alt: 'The home screen: the best score, who is playing, and buttons for driving, ' +
                 'learning, the horn dictionary, the players ranking and sharing the game. ' +
                 'Under it, Osta asks who you are honking at, since the street is empty.'
          }
        }
      ]
    },

    {
      type: 'copy',
      num: '06',
      title: 'UX writing: the way people talk on the street',
      intro:
        'The whole game is written in Egyptian Arabic, <span class="ar" lang="ar" dir="rtl">' +
        'عامية</span>, not the formal Arabic of textbooks and settings menus. Osta talks the ' +
        'way a Cairo taxi driver actually talks: warm, cheeky, a little dramatic. The English ' +
        'version isn’t a translation of it. It’s the same joke, told again for English speakers.',
      items: [
        { where: 'Start button', ar: 'دوّر العربية', en: 'Start the car',
          why: 'Not <span class="ar" lang="ar" dir="rtl">ابدأ</span>, “start”. The first tap ' +
               'already happens inside the world.' },
        { where: 'Loading', ar: 'بنسخّن العربية…', en: 'Warming up the engine…',
          why: 'Even the wait stays in character.' },
        { where: 'Drive button', ar: 'يلا نسوق', en: 'Hit the road',
          why: 'The way a friend says it, not the way a menu does.' },
        { where: 'Grades', ar: 'بيرفكت! · حلو! · لأ!', en: 'Perfect! · Good! · Nope!',
          why: 'Short enough to read in the middle of a honk. And yes, Egyptians really do ' +
               'say <span class="ar" lang="ar" dir="rtl">بيرفكت</span>.' },
        { where: 'Wrong rhythm', ar: 'خد نفسك في النص… الوقفة مهمة.',
          en: 'Take a breath in the middle. The pause matters.',
          why: 'Every hint names the mistake and the fix, in Osta’s voice.' },
        { where: 'Honking at nothing', ar: 'على مين بتزمّر يا عم؟ الشارع لسه فاضي!',
          en: 'Who are you honking at? The street is empty!',
          why: 'Pressing the horn on the home screen isn’t an error, it’s curiosity. So it ' +
               'gets a joke instead of nothing.' },
        { where: 'Honking mid-drive', ar: 'الكلاكس مش لعبة… قصدي هو لعبة، بس برده.',
          en: 'The horn’s not a toy… well, it’s a game. But still.',
          why: '<b>The line players quoted back to me.</b> See what they said below.' },
        { where: 'Ranks', ar: 'رخصة تعليم ← سواق ملاكي ← سواق تاكسي ← سواق ميكروباص ← أسطى الأسطوات',
          en: 'Learner’s permit → Sunday driver → Taxi driver → Microbus driver → Master of the road',
          why: 'Every Egyptian knows the microbus driver outranks everyone. In English, ' +
               '<span class="ar" lang="ar" dir="rtl">سواق ملاكي</span>, a private-car ' +
               'driver, became a “Sunday driver”: localised, not translated.' },
        { where: 'Form error', ar: 'الإيميل مش مظبوط', en: 'That email doesn’t look right',
          why: 'Blames the email, never the person.' },
        { where: 'Offline', ar: 'مش قادرين نجيب الترتيب دلوقتي. هنحاول تاني الجولة الجاية.',
          en: 'Couldn’t load the players right now. We’ll try again next round.',
          why: 'Says what happened and what happens next. And the round you just played is ' +
               'never lost: it waits on the phone and goes up on your next visit.' }
      ]
    },

    {
      type: 'feedback',
      num: '07',
      title: 'How it spread',
      intro:
        'I launched it the Egyptian way: I sent the link to friends on Instagram with a dare, ' +
        'and asked them to post their score and tag me. They did, and the board kept growing.',
      items: [
        {
          image: { src: 'assets/img/klaxs/dm-launch.webp', width: 760, height: 832,
                   alt: 'My Instagram message with the Klaxs link and its cover preview. The ' +
                        'translation is below.' },
          en: ['Try this game 🎮🇪🇬',
               'Play, see how many points you get, and send it to your friends to see who ' +
               'gets the highest score 😂🔥',
               'If you play it, tag me in your story with your score, and I’ll repost the ' +
               'results 🏆❤️',
               'Can’t wait to see your score 👀'],
          note: 'My launch message. The link preview with the game’s cover and my credit was ' +
                'designed for exactly this moment.'
        },
        {
          image: { src: 'assets/img/klaxs/dm-story-reply.webp', width: 760, height: 701,
                   alt: 'My reply to a player’s Instagram story showing the players board, and ' +
                        'their answer. The translation is below.' },
          en: ['Me: What is this score?! Respect 🤣😍😎',
               'Player: Honestly, this game is so sweet ❤️❤️❤️'],
          note: 'A player posted the board on their story when it had 16 players: <b>#1, ' +
                'with 105,027 points</b>.'
        }
      ]
    },

    {
      type: 'outcome',
      num: '08',
      title: 'Real players, real numbers',
      items: [
        { value: '41',      label: 'Players on the board' },
        { value: '8 → 41',  label: 'Players on the board: 8 when one player posted their story, 41 now' },
        { value: '3+',      label: 'Countries on the board, including Egypt, Lebanon and China' },
        { value: '105,027', label: 'The #1 score a player posted on their story' }
      ]
    },

    {
      type: 'feedback',
      num: '09',
      title: 'What players told me',
      intro:
        'Real messages from players, in Egyptian Arabic, with my translation under each one. ' +
        'Their profile pictures are blurred.',
      items: [
        {
          image: { src: 'assets/img/klaxs/dm-without-reading.webp', width: 760, height: 133,
                   alt: 'A player’s Instagram message, in Arabic. The translation is below.' },
          en: ['I can’t even tell you how much I learned 😂😂',
               'Now I understand and reply without reading'],
          note: '<b>The fading hint worked.</b> This player stopped reading the rhythm and ' +
                'started hearing it.'
        },
        {
          image: { src: 'assets/img/klaxs/dm-not-a-toy.webp', width: 760, height: 200,
                   alt: 'Two Instagram messages from a player, in Arabic. The translation is below.' },
          en: ['Dangerous! 🤣🤣🤣',
               'I honked wrong and he told me “the horn’s not a toy… well, it’s a game, but ' +
               'still” 😂😂😂😂'],
          note: '<span class="ar" lang="ar" dir="rtl">خطير</span>, “dangerous”, is Egyptian ' +
                'for brilliant. And “he” is Osta: <b>a player quoting the UX writing back to me.</b>'
        },
        {
          image: { src: 'assets/img/klaxs/dm-masterpiece.webp', width: 760, height: 510,
                   alt: 'Four short Instagram messages from a player, in Arabic. The ' +
                        'translation is below.' },
          en: ['Mariouma!', 'A masterpiece', 'You really made this?', 'It’s amazing'],
          note: '<span class="ar" lang="ar" dir="rtl">مريومة</span>, Mariouma, is what ' +
                'Egyptians call a Mariam they love.'
        },
        {
          image: { src: 'assets/img/klaxs/dm-seriously.webp', width: 760, height: 311,
                   alt: 'A player’s Instagram message in Arabic, and my reply in emojis. The ' +
                        'translation is below.' },
          en: ['Seriously, Mariouma, the game is a masterpiece 😂😂❤️❤️❤️❤️'],
          note: 'I answered in emojis.'
        }
      ]
    },

    {
      type: 'section',
      num: '10',
      title: 'What I learned',
      body: [
        '<b>Delight is a feature.</b> The jokes, Osta’s voice and the wedding aren’t ' +
        'decoration. They are what players laughed about, quoted back to me and shared.',

        '<b>Write for the street, not for the screen.</b> The moment the copy sounded like a ' +
        'real Cairo driver, players started quoting it back to me.',

        '<b>Sharing has to be designed.</b> The rank, the story image and the link preview ' +
        'were all planned. Within days, players were posting their rank on their stories ' +
        'and tagging me.'
      ]
    },

    {
      type: 'pull',
      text: 'Once I learned to listen, Cairo stopped being loud. It started talking.'
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
        'Both screens are my own work. I designed the first version, and the problems below ' +
        'are the ones I found in it. The redesign keeps the same features, data and rules. ' +
        'What I changed is how the pieces relate to each other, and that turned out to be ' +
        'the whole problem.',
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
    sub: 'A perfectly translated dashboard can still feel wrong in China. Here is what actually has to change.',
    tags: ['Cross-cultural', 'Localisation'],
    thumb: {
      // the study's two dashboards, split down the middle: Western | Chinese.
      // tools/make-thumbs.js draws it from mockups.js; re-run it if they change.
      image: { src: 'assets/img/work/localisation-card.webp', width: 1200, height: 750 },
      tone: 'lime'
    }
  },

  title: 'Localisation is not translation',
  standfirst:
    'A dashboard that feels calm and clear in Egypt can feel empty in China, without a ' +
    'single word being mistranslated. I spent five years studying in China, then designed ' +
    'financial dashboards at Huawei, adapting them to Chinese design conventions. This is ' +
    'what had to change, and none of it was the words.',

  meta: {
    'Format':     { value: 'UX argument' },
    'Context':    { value: 'Huawei Technologies', note: 'Financial dashboards · 2024' },
    'Background': { value: '5 years in China', note: 'B.Sc. in China' },
    'Reading':    { value: '4 min' }
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
        'words.</b> If a finance team in China opens a perfectly translated dashboard and ' +
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
        label: 'Western market',
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
        label: 'Chinese market',
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

        '<b>Density reads as capability, not clutter.</b> People in China scan dense apps ' +
        'every day. A dashboard with three big numbers does not read as calm there. It ' +
        'reads as unfinished.',

        '<b>Hidden filters feel like missing features.</b> Every filter sits on screen as a ' +
        'chip, so the filter bar doubles as a summary of the table, and every change is ' +
        'one click.',

        '<b>Colour carries meaning before it carries style.</b> In China, red means up and ' +
        'green means down, so a growth figure in green reads as a loss.',

        '<b>The data is expected to leave the screen.</b> Export Excel sits in the header, ' +
        'not in a menu, because these numbers usually end up in a report.',

        'None of this would come back from a translator.'
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
    sub: 'Four things I designed and built myself, end to end, with AI as my pair programmer.',
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
    'Role':     { value: 'Designer & builder', note: 'Idea owner' },
    'AI tool':  { value: 'Claude.ai' },
    'Projects': { value: '4', note: 'All live' },
    'Type':     { value: 'Freelance & personal', note: '3 delivered, 1 own game' },
    'Status':   { value: 'Live' }
  },

  blocks: [
    {
      type: 'projects',
      num: '01',
      title: 'The projects',
      intro: 'Each link opens in a new tab.',
      // `view` is a screenshot of the site as it is used: device 'mobile' or
      // 'desktop'. A card without one shows its square `img` instead.
      items: [
        { name: 'Klaxs',            url: 'https://ruyinqc.com/klaxs/',
          img: 'assets/img/vibe/klaxs.webp',            badges: ['Personal project', 'Live'],
          view: { src: 'assets/img/vibe/klaxs-mobile.webp', width: 400, height: 667, device: 'mobile' } },
        { name: 'Mirayti',          url: 'https://mirayti.vercel.app/',
          img: 'assets/img/vibe/mirayti.webp',          badges: ['Freelance', 'Delivered'] },
        { name: 'Match and Attack', url: 'https://ruyiemad.github.io/match-and-attack/',
          img: 'assets/img/vibe/match-and-attack.webp', badges: ['Freelance', 'Delivered'],
          view: { src: 'assets/img/vibe/match-and-attack-desktop.webp', width: 800, height: 388, device: 'desktop' } },
        { name: 'Sandra & Alex',    url: 'https://studio.ruyinqc.workers.dev/w/sandra-alex-1b532e/',
          img: 'assets/img/vibe/sandra-alex.webp',      badges: ['Freelance', 'Delivered'],
          view: { src: 'assets/img/vibe/sandra-alex-mobile.webp', width: 400, height: 599, device: 'mobile' } }
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

  // A vibe coding card under the meta row. The picture is the app's logo,
  // cropped from its loading screen. Add `url` once there is a live link.
  projects: [
    { name: 'Journey Guide Tracker', img: 'assets/img/vibe/journey-guide-tracker.webp',
      badges: ['Vibe coding'] }
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
          title: 'On to the next stop',
          text: 'Your next stop, the <b>Time Travelers’ Gallery</b>, comes into view on the ' +
                'map, still <b>Not visited</b>, with 20% of the visit done.',
          image: {
            src: 'assets/img/work/journey-guide-step-4.webp', width: 418, height: 872,
            alt: 'The map with Time Travelers’ Gallery in view, flagged Not visited. The top ' +
                 'bar reads: Next is Time Travelers’ Gallery, Visit progress 20%. The card at ' +
                 'the bottom shows Time Travelers’ Gallery: 9 min, Floor 1.'
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
