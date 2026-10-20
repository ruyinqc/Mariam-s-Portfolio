# Klaxs on Behance

Everything you need to post the Klaxs case study on Behance: 17 images in
order, a cover, the spots where your videos go, and the text to paste.

Every word in the images comes from the case study on the site
(`assets/js/data.js`). If you change the text there, run the render again
(see the end of this file) and the images update to match.

---

## 1. Project settings

| Setting | What to put |
|---|---|
| **Cover** | `00-behance-cover.png` (808 × 632, drawn at 2× so it's sharp) |
| **Title** | Klaxs: Learn to Speak Horn |
| **Background colour** | `#FFF3DC` (the sand behind every panel) |
| **Space between modules** | **0**, so the panels join into one long page |
| **Creative fields** | Game Design · UI/UX · Interaction Design |
| **Tags** | game design, ux writing, ux design, arabic, egyptian arabic, localisation, cairo, web game, mobile game, gamification, microcopy, product design |
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

Upload the images in this order. **▶ marks a video.** Every video is
optional, and the page reads fine without any of them, but A and B are the
two worth making first: Klaxs is a game about sound, and a still can't honk.

| # | Module | |
|---|---|---|
| 1 | `01-hero.png` | The cover, title, role, timeline, platform, players, status |
| ▶ | **Video A · Trailer** | One round of the game, sound on |
| 2 | `02-where-it-started.png` | 01 · Where it started |
| 3 | `03-pull.png` | “Here, the horn isn’t noise. It’s a language.” |
| 4 | `04-the-horn-vocabulary.png` | 02 · Writing the language down |
| 5 | `05-who-its-for.png` | 03 · Who it’s for |
| 6 | `06-how-it-plays.png` | 04 · How it plays |
| ▶ | **Video B · A lesson** | Hear it, see it, honk it |
| 7 | `07-ux-natural-mapping.png` | 05 · The UX behind the fun, 1 / 6 |
| 8 | `08-ux-feedback-that-teaches.png` | 2 / 6 |
| 9 | `09-ux-scaffolding-then-fading.png` | 3 / 6 |
| 10 | `10-ux-peak-end-rule.png` | 4 / 6 |
| ▶ | **Video C · The wedding** | The zaffa, the confetti, the zaghrouta |
| 11 | `11-ux-value-sensitive-design.png` | 5 / 6 |
| 12 | `12-ux-designed-to-be-shared.png` | 6 / 6 |
| ▶ | **Video D · Sharing your score** | Round over → Download image → the story picture |
| 13 | `13-ux-writing.png` | 06 · UX writing |
| 14 | `14-how-it-spread.png` | 07 · How it spread |
| 15 | `15-real-numbers.png` | 08 · Real players, real numbers |
| 16 | `16-what-players-said.png` | 09 · What players told me |
| 17 | `17-what-i-learned.png` | 10 · What I learned, and the link to play |

The images are 2800 px wide (1400 px drawn at 2×). Behance shows them at
1400 px, and the extra pixels keep the text sharp on a retina screen.

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

`tools/behance/frame-video.js` puts a recording in a 1920 × 1080 frame that
matches the panels: the sand page, the title on the left, your recording in
a phone bezel on the right. It keeps the sound. A landscape recording gets a
title strip above it instead.

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
  --num 05 --title "A peak in the middle" \
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

The panels are drawn from `tools/behance/klaxs.html`, which reads the case
study's text from `assets/js/data.js`. After changing either one:

```sh
python3 -m http.server 8080 &             # from the repository root
node tools/behance/render.js              # rewrites everything in behance/klaxs/
```
