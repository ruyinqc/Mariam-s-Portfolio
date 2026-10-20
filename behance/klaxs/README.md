# Klaxs on Behance

The Klaxs case study, photographed from the site itself: the same page, the
same words, the same look, cut into Behance images. Plus a cover with your
photo, and the spots where the videos go.

---

## 1. Project settings

| Setting | What to put |
|---|---|
| **Cover** | `00-behance-cover.png`: your photo in the game, the Klaxs logo, the title and “UX · Product Design” |
| **Title** | Klaxs: Learn to Speak Horn |
| **Background colour** | `#F7F5F1` (the site's paper, behind every image) |
| **Space between modules** | **0**, so the images join into one long page, like the site |
| **Creative fields** | Game Design · UI/UX · Interaction Design |
| **Tags** | game design, ux writing, ux design, product design, arabic, egyptian arabic, localisation, cairo, web game, mobile game, microcopy |
| **Tools** | Add the ones you actually used |
| **Project link** | https://ruyinqc.com/klaxs/ |

**Description** (the short text under the title):

> I moved to Cairo and realised the car horns were talking. So I designed and
> built a game that teaches their language, and 41 players are on its board.
>
> Klaxs is a web game in Egyptian Arabic and English: an old taxi driver,
> Osta Abdo, teaches you the words, then the street tests you on them.
> Idea, UX, UX writing and art direction by me. Play it at ruyinqc.com/klaxs,
> best on a phone, with the sound on.

---

## 2. The order to upload

**▶ marks a video.** Every video is optional and the page reads fine
without them, but A and B are the two worth making first: Klaxs is a game
about sound, and a still can't honk.

| # | Image | On the site |
|---|---|---|
| 1 | `01-title.png` | The title, the standfirst, the facts and the Play Klaxs card |
| 2 | `02-cover.png` | The game's cover, and you in it |
| ▶ | **Video A · Trailer** | One round of the game, sound on |
| 3 | `03-where-it-started.png` | 01 · Where it started, and the quote |
| 4 | `04-writing-the-language-down.png` | 02 · Writing the language down |
| 5 | `05-who-its-for.png` | 03 · Who it’s for |
| 6 | `06-how-it-plays.png` | 04 · How it plays |
| ▶ | **Video B · A lesson** | Hear it, see it, honk it |
| 7 | `07-the-ux-behind-the-fun-1.png` | 05 · The UX behind the fun: natural mapping |
| 8 | `07-the-ux-behind-the-fun-2.png` | Feedback that teaches |
| 9 | `07-the-ux-behind-the-fun-3.png` | Scaffolding, then fading |
| 10 | `07-the-ux-behind-the-fun-4.png` | Peak–end rule |
| ▶ | **Video C · The wedding** | The zaffa, the confetti, the zaghrouta |
| 11 | `07-the-ux-behind-the-fun-5.png` | Value-sensitive design |
| 12 | `07-the-ux-behind-the-fun-6.png` | Designed to be shared |
| ▶ | **Video D · Sharing your score** | Round over → Download image → the story picture |
| 13 | `08-ux-writing.png` | 06 · UX writing |
| 14 | `09-how-it-spread.png` | 07 · How it spread |
| 15 | `10-real-players-real-numbers.png` | 08 · Real players, real numbers |
| 16 | `11-what-players-told-me.png` | 09 · What players told me |
| 17 | `12-what-i-learned.png` | 10 · What I learned, and the closing line |

The images are 2800 px wide: the page at 1400 px, Behance's width, drawn
at 2× so the text stays sharp on a retina screen. The cover is 808 × 632,
Behance's cover size, also at 2× (1616 × 1264).

---

## 3. The videos

### What to record

Record on your phone, in portrait, with the sound on. Turn on Do Not
Disturb first so no notification lands in the shot, and set the phone's
volume high: the horn is the whole point. Trim each clip to just the
moment, with a second of calm before and after.

| Video | Record this | Length |
|---|---|---|
| **A · Trailer** | Start the car → a lesson → a few street moments → the round-over sheet with your rank | 30–45 s |
| **B · A lesson** | One lesson: Osta plays the word, the pills appear, you honk it back. Miss once on purpose so Osta's hint shows, then get it right | 10–15 s |
| **C · The wedding** | A wedding moment on the street: the three zaffa rounds, the confetti, the zaghrouta | 10–15 s |
| **D · Sharing** | The round-over sheet → **Download image** → the 1080 × 1920 picture it makes | 8–12 s |

### Put each one in the frame

`tools/behance/frame-video.js` puts a recording in a 1920 × 1080 frame
styled like the case study: the site's paper, the section number in blue,
the title, a line of Osta's in Arabic, and your recording in a phone bezel
on the right. It keeps the sound. A landscape recording gets a title strip
above it instead.

From the repository root, once:

```sh
npm install --no-save playwright          # skip if you already have it
python3 -m http.server 8080 &             # leave this running
```

Then, one line per video (put your own file names in):

```sh
node tools/behance/frame-video.js trailer.mp4 behance/klaxs/video-a-trailer.mp4 \
  --title "Learn to speak horn" \
  --ar "الكلاكس هنا مش دوشة… ده لغة." \
  --sub "Best on a phone, with the sound on."

node tools/behance/frame-video.js lesson.mp4 behance/klaxs/video-b-lesson.mp4 \
  --num 04 --title "Hear it, see it, honk it" \
  --ar "ناقصة زمارة… اسمع تاني." \
  --sub "Each lesson plays one word, draws its beeps as pills, and waits for you to honk it back on the wheel."

node tools/behance/frame-video.js wedding.mp4 behance/klaxs/video-c-wedding.mp4 \
  --num 05 --title "A peak in the middle, a verdict at the end" \
  --ar "الفرح جبر بخاطرك… قلب زيادة!" \
  --sub "Honk the zaffa with the convoy three times, and the street answers with confetti and a zaghrouta."

node tools/behance/frame-video.js share.mp4 behance/klaxs/video-d-share.mp4 \
  --num 05 --title "A score worth posting" \
  --sub "Download image draws a 1080×1920 picture of your round, with your rank and your place among the players."
```

Needs `ffmpeg` (on a Mac: `brew install ffmpeg`).

### Putting it on Behance

You can either upload the MP4 straight into a **Video** module, or put it
on YouTube or Vimeo and add it as an **Embed**. Uploading is simpler.
YouTube or Vimeo also gives you a link you can share outside Behance.

If you'd rather have a short silent loop that plays by itself, Behance takes
GIFs as images. This turns the first 6 seconds of a framed video into one:

```sh
ffmpeg -t 6 -i behance/klaxs/video-b-lesson.mp4 \
  -vf "fps=15,scale=1400:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" \
  behance/klaxs/video-b-lesson.gif
```

A GIF has no sound, so for Klaxs keep at least the trailer as a real video.

---

## 4. Changing the images

The images are taken from the live case study, so they follow whatever
`assets/js/data.js` and the site's styles say. After changing the study:

```sh
python3 -m http.server 8080 &             # from the repository root
node tools/behance/render.js              # rewrites every image in behance/klaxs/
```

The cover is `tools/behance/thumb.html`, and `render.js` draws it too.
