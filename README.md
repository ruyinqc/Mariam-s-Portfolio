# Mariam Emad Nabih — portfolio

A static portfolio site. No framework, no build step, no dependencies —
open `index.html` and it works. Deploys by copying the folder.

---

## The files you edit

Everything you'd normally want to change lives in these three places. You
don't need to touch anything else.

| File | What's in it |
|---|---|
| `assets/js/config.js` | Contact-form key, your links, the certificate list |
| `assets/js/data.js` | Every word of every case study |
| `index.html` → *EXPERIENCE* | Your roles on the clothesline, and their photos |

---

## 1. Turn the contact form on

Right now the form works, but it opens the visitor's own email app instead of
sending to you directly. That's the fallback. To make messages land in your
inbox:

1. Go to **https://web3forms.com**
2. Type `marmaremad31@gmail.com` into the box and press **Create Access Key**
3. They email you a key that looks like `c7f3a1b2-4d5e-6789-abcd-ef0123456789`
4. Open `assets/js/config.js` and paste it here:

```js
web3formsKey: 'c7f3a1b2-4d5e-6789-abcd-ef0123456789',
```

That's it. Free, no account, no card. Messages arrive as normal email with the
sender's address in the reply-to, so you can just hit reply.

If Web3Forms ever goes down or the key is wrong, the form quietly falls back to
the email app rather than pretending to have sent something.

---

## 2. Add or finish a case study

Open `assets/js/data.js`. Each case study is one object in the list. Two of the
three are placeholders — search for `TODO` to find every line that needs your
words.

A minimal one looks like this:

```js
{
  slug: 'my-project',            // becomes the URL: yoursite.com/#case/my-project
  kind: 'Case study',            // or 'UX argument'
  published: true,               // false hides the card completely
  status: 'live',                // 'live' → "Shipped" pill · 'draft' → "In progress"
                                 // 'concept' → "Concept": finished, designed but not built

  card: {                        // what shows on the pin board
    title: 'My Project',
    sub: 'One sentence a recruiter can understand at a glance.',
    tags: ['Fintech'],           // only the first one is shown
    thumb: {
      left:  { icon: 'alert', count: 3 },   // the "before" pile
      right: { icon: 'check', count: 1 },   // the "after"
      tone: 'blue'                          // or 'lime'
    }                                       // { art: 'invoice', count: 5 } uses a picture
                                            // or thumb: { zoom: {…}, tone } shows a close-up
                                            // of one of your screens (see "Close-ups" below)
                                            // or thumb: { image: { src, width, height }, tone }
                                            // fills the frame with a picture of the project
  },

  title: 'My Project',
  standfirst: 'Two or three sentences setting up the problem.',

  meta: {                        // the Role / Timeline / Status row
    'Role':     { value: 'Product Designer', note: 'End-to-end design' },
    'Timeline': { value: '6 weeks' },
    'Status':   { value: 'Shipped', note: 'In production since March 2026' }
  },

  cover: {                       // optional: a screenshot under the meta row
    src: 'assets/img/work/my-project.webp', width: 2000, height: 977,
    alt: 'What the screenshot shows'
  },
  // or a video instead (Journey Guide Tracker does this). It never plays by
  // itself and nothing downloads until someone presses play:
  // cover: { video: 'assets/video/my-project.mp4', poster: 'assets/img/work/….webp',
  //          width: 832, height: 464, alt: '…', caption: '…' }

  blocks: [ /* see below */ ]
}
```

### The blocks

`blocks` is the body of the study, in order. The kinds you'll use most:

**`section`** — a heading and some paragraphs.

```js
{ type: 'section', num: '01', title: 'Where it started',
  body: ['First paragraph.', 'Second paragraph.'] }
```

**`challenge`** — the illustrated rectangle, then the *Why* / *How* columns.
This is the one that does the heavy lifting.

```js
{
  type: 'challenge',
  n: 1,
  diagram: {
    rows: [{                                    // one row per arrow
      from: { art: [{ name: 'invoice', count: 5 }], caption: '5 Invoices user needs to pay' },
      to:   { art: [{ name: 'invoice', count: 1 }], caption: 'User pays only 1', emoji: 'confused' }
    }]
  },
  why: {
    title: 'Why this happened?',
    text: ['<b>Unable</b> to process <b>batch payments</b>, …']      // paragraphs
  },
  how: {
    title: 'How I worked on solving this?',
    text: ['Users can now <b>pay multiple invoices at once</b> …'],
    image: { src: 'assets/img/work/…webp', width: 2000, height: 394,   // shown full width
             alt: 'What the screenshot shows', caption: 'Public UI preview only…' }
  }
}
```

- **Pictures** live in `assets/img/art/`: `invoice`, `coins`, `wallet`,
  `confused` (SVG) and `support-agent.png`. A bare name means `.svg`; write the
  extension for anything else. To use your own drawing, drop the file in that
  folder with the same name — nothing else changes
- `count` piles copies up (5 → three over two, 4 → a diamond, 2 → a step)
- Two pictures on one side get a `+` between them
- `emoji` puts a small picture at the end of a caption
- **Close-ups of your own screens.** Instead of `art`, a side can take `zoom`
  to show part of one of the hi-fi screens (the Company Naming study does
  this). The window zooms in from the whole screen to that part, rings it and
  dims the rest:

  ```js
  from: { zoom: { screen: 'naming-before', frame: 'list', focus: 'ends' },
          caption: '“Top” … ? … “Low”' }
  ```

  `screen` is a screen from `mockups.js`; names ending in `-after` get the
  After look, the rest Before. `focus` is what gets the ring and `frame` is
  what the window shows (it defaults to `focus`). Both are names from the
  `data-focus="…"` hooks in `mockups.js`, and both can list several, separated
  by spaces. To zoom closer than "fit the frame", add `span` (how much of the
  screen's width to show: `0.5` is half) and `align: 'start'` or `'end'` to
  hold the window to that side of the frame
- Use `text: [...]` for paragraphs or `points: [...]` for bullets. Both accept
  `<b>` for emphasis
- `how` can also take a `wireframe` (see Challenge 2 in `data.js`): a list of
  bars per panel, where `'~'` draws a scribble placeholder
- **`diagram.alt` is for screen readers.** The captions are read out, but the
  pictures aren't. If a picture carries meaning the captions don't, say it here

**`pull`** — a large serif pull-quote.

```js
{ type: 'pull', text: 'The one sentence you want quoted back to you.' }
```

**`outcome`** — a row of result tiles.

```js
{ type: 'outcome', num: '03', title: 'Outcome',
  items: [{ value: '-42%', label: 'Support tickets about payments' }] }
```

**`note`** — a small aside in a blue box. Accepts HTML.

**`steps`** — a walkthrough in frames: a row of numbered stills, each with a
short title and a sentence. Journey Guide Tracker uses frames from its video.

```js
{ type: 'steps', num: '02', title: 'How it works', intro: 'Optional sentence.',
  items: [{ title: 'Scan and start', text: 'Accepts <b>HTML</b>.',
            image: { src: 'assets/img/work/….webp', width: 220, height: 449, alt: '…' } }] }
```

**`chips`** — a short list of words as pills. `accent: true` picks one out,
and `note` adds a small line under it.

```js
{ type: 'chips', num: '03', title: 'Where it works best',
  items: [{ text: 'Museums', note: 'The prototype', accent: true }, 'City Tours'] }
```

### Finishing a placeholder

When a study is ready, change two things:

```js
status: 'draft',   →   status: 'live',
draft: true,       →   (delete this line)
```

`draft: true` is what shows the "still being written up" banner at the top.

---

## 3. The clothesline (your experience)

The *Path* section is a rope with a photo pegged on for each stop, newest on
the left, ending at university. Scrolling down the page carries it sideways
while it is on screen; visitors can also drag it, swipe it, use the arrow
buttons under it, or the arrow keys.

**The words** are in `index.html` — search for `EXPERIENCE`. Each stop is one
`<li class="hang">` with the dates, role, company and a one-line note.

**The photos** are in `assets/img/path/`, one per stop:

| File | Stop |
|---|---|
| `ovarc.webp` | Product Designer, Ovarc |
| `loccamp.webp` | UI/UX Designer, Loccamp |
| `huawei-designer.webp` | UI/UX Designer, Huawei |
| `huawei-engineer.webp` | Software Engineer, Huawei |
| `huawei-intern.webp` | Software Engineer Intern, Huawei |
| `bjtu-graduation.webp` | B.Sc., Beijing Jiaotong University |

To change one, overwrite the file with the same name. Any shape works: every
photo is shown at the same height and keeps its own proportions. Crop so that
whatever says *where* you were — a logo, a sign, the cap — stays in frame.
If the new photo is a different shape, update its `width` and `height` in
the `<img>` so nothing jumps while it loads.

Two small settings on each `<li>`: `--tilt` is how crooked the photo hangs,
`--drop` is how far its weight pulls the rope down (0–30px). The little
stickers on the photos (*Now*, *Code → Design*, *Class of 2021*) are the
`hang__sticker` lines — delete one to remove it.

On a screen too short to hold the whole line (a phone on its side), it stops
pinning and becomes a row you swipe sideways instead.

---

## 4. Two things worth fixing in your content

**Your certificate links.** Your CV gives the *same* Coursera URL for three
different certificates — CalArts Graphic Design, Google UX, and Udacity
Advanced Data Analysis. A Udacity certificate can't live on coursera.org, so at
least two are wrong. They're marked `verify: true` in `config.js`. A recruiter
who clicks a dead certificate link trusts the rest of the page less, so this is
worth ten minutes.

**Your headline numbers.** The site says *6 years in tech · 3.5 years in
product design*, because that's what you wrote. Your CV says *over 5 years* and
*more than 3 years*, and your dated roles run July 2021 to now, which is about
five years and two months. Recruiters cross-check this against LinkedIn. Pick
one set of numbers and make the CV, LinkedIn and this site agree.

To change them, edit the `hero__facts` list in `index.html`.

---

## Running it locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` directly with `file://` mostly works, but the fonts and
hash routing behave better over HTTP.

## Deploying

**GitHub Pages** — Settings → Pages → Deploy from branch → pick the branch and
`/ (root)`. Done, it's already a static site.

**Netlify / Vercel / Cloudflare Pages** — drag the folder in. No build command,
no output directory.

Whatever you use, update the site address once you have a real domain — see
the SEO section below, it is the one thing that genuinely matters.

---

## SEO

The site is set up to rank for your name first, and for "product designer
Egypt" / "B2B SaaS product designer" after that.

**The one thing to change when you move domains.** Six values in `index.html`,
plus `robots.txt` and `sitemap.xml`, hardcode the site address. There is a
loud comment above the canonical link in `index.html` telling you which. Find
and replace `https://ruyinqc.github.io/Mariam-s-Portfolio/` with the new one.

This matters more than it looks. A canonical link pointing at a domain that
does not resolve tells Google "the real copy of this page lives elsewhere",
and it will drop the page from the index without anything on the page looking
broken. `tools/seo.js` checks for exactly that.

**What's in place**
- Title, description, `robots` with `max-image-preview:large` so Google can
  show the big thumbnail
- Full Open Graph and Twitter card set, with a 1200x630 social image built
  from the site's own fonts and tokens (`tools/make-og.js` regenerates it)
- `rel="me"` links to LinkedIn and Instagram, so search engines tie those
  profiles to this page
- JSON-LD: `ProfilePage` + `WebSite` + a detailed `Person` with `knowsAbout`,
  `knowsLanguage`, `hasOccupation`, `alumniOf` and `worksFor`
- Case studies and certificates are added to the structured data **at runtime
  from `data.js` and `config.js`**, so editing content updates the search
  markup automatically. Only finished studies (`status: 'live'` or
  `'concept'`) are described — a placeholder full of `TODO` would be worse
  than nothing
- `robots.txt` and `sitemap.xml`

**Once it is live**, submit it to Google: add the site at
[Search Console](https://search.google.com/search-console), verify with the
HTML-file method, then submit `sitemap.xml`. Paste a case-study URL into the
[Rich Results Test](https://search.google.com/test/rich-results) to see the
structured data the way Google does.

**One honest limitation.** The case-study prose lives in `data.js` and is
rendered into the overlay when someone opens it. Google does run JavaScript,
but it does not click, so it sees each study's title and summary — which the
structured data gives it — rather than the full text. For ranking on her name
that is more than enough. If you ever want individual case studies to rank on
their own subject matter, the next step is a static page per study.

---

## Checks

```bash
node tools/contrast.js     # colour contrast, no install needed
```

Reads the real values out of `tokens.css` and measures every pairing on the
site against WCAG 2.2. Exits non-zero if one regresses — so if you change a
colour, run this.

```bash
npm install --no-save playwright && npx playwright install chromium
python3 -m http.server 8080 &
node tools/check.js
```

Drives a real browser: keyboard access, focus trapping in the reader, the
contact form's success *and* failure paths, the clothesline (scroll, drag,
arrows), four screen widths, reduced motion, and the page with JavaScript
switched off. 58 checks.

```bash
node tools/seo.js           # add LIVE=1 to also check the canonical resolves
```

42 checks over the head, the social cards, the structured data (including the
parts JavaScript adds), and the crawl files. Run it after changing content or
moving domains.

```bash
node tools/make-og.js       # rebuild the 1200x630 social image
```

```bash
bash tools/fetch-fonts.sh   # only if you change which fonts are used
```

---

## How it's put together

```
index.html               all the markup; sections are commented
assets/
  css/
    fonts.css            self-hosted @font-face (generated)
    tokens.css           colour, type, space, motion — change the design here
    base.css             reset, focus rings, the reveal mechanism
    layout.css           shell, hero, the clothesline, contact, footer
    components.css       nav, buttons, pin board, quotes, chips, form
    reader.css           the case-study overlay
  js/
    config.js            ← yours
    data.js              ← yours
    art.js               illustrations and how copies of one pile up
    mockups.js           the hi-fi Before / After screens, drawn in HTML
    lens.js              close-ups of those screens in challenge diagrams
    motion.js            one scroll loop shared by everything
    nav.js               active section, progress ring, mobile sheet
    board.js             pin cards, drift, tilt, the string between pins
    line.js              the clothesline: pinning, drag, the swing, the rope
    reader.js            the overlay: routing, prev/next, focus trap
    contact.js           validation and delivery
    app.js               bootstrap
  fonts/                 woff2, latin + latin-ext
  img/                   photography + og-cover.png (the social card)
    art/                 pictures for the challenge diagrams — swap freely
    work/                screenshots used inside case studies
    path/                one photo per stop on the clothesline
    people/              testimonial photos. Mohamed Wael's card is a
                         placeholder: the comment next to "MW" in index.html
                         says what to add when his words and photo arrive
  cv/                    the PDF the Download CV button serves
  video/                 videos used inside case studies (H.264 MP4)
robots.txt               crawl rules + sitemap pointer
sitemap.xml              the one URL, for Search Console
tools/
  contrast.js            colour contrast, no install needed
  check.js               58 browser checks (accessibility, reader, form, line)
  seo.js                 42 SEO checks
  make-og.js             rebuilds the social image
  fetch-fonts.sh         re-downloads the webfonts
```

### Decisions worth knowing about

**Light only.** There is no dark mode and no `prefers-color-scheme` block
anywhere. If you add one, add the new pairings to `tools/contrast.js` too.

**Lime is a fill, never text.** `--lime` only ever sits *behind* dark ink. As a
text colour on the off-white background it's around 1.3:1 — invisible. The
contrast checker enforces this.

**Fonts are self-hosted.** No request ever goes to Google. That's one less
third-party connection, and it keeps the site clear of the GDPR problem that
German courts have raised about Google Fonts — which matters if you're
applying to European companies.

**Case studies open in an overlay, not a new page.** The URL still changes to
`#case/<slug>`, so you can send a recruiter a link straight to one study and
the browser Back button behaves. The ‹ › arrows use `replaceState`, so somebody
who reads all three still leaves the overlay with a single Back.

**Reveal-on-scroll is armed by JavaScript, not CSS.** Elements are visible by
default; `app.js` adds `.reveal-ready` to `<html>`, which is what switches on
the hidden-until-seen state. With JavaScript off, or for a crawler, the page is
simply complete rather than blank.

**Motion is genuinely optional.** `prefers-reduced-motion: reduce` sets
`--motion: 0`, stops the animation loop, drops the parallax, and freezes the
card drift and the swing of the photos on the clothesline. The clothesline
still follows the scroll, because that is the visitor's own hand moving it. The static tilt on the cards stays, because it's a layout choice
rather than movement. Nothing is ever hidden behind an animation.
