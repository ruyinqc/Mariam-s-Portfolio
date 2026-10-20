# Klaxs on Behance

The Klaxs case study, photographed from the site itself: the same page, the
same words, the same look, cut into Behance images. Plus a cover with your
photo, and the opening video.

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
> built a game that teaches their language. 41 players are on its board,
> and counting.
>
> Klaxs is a web game in Egyptian Arabic and English: an old taxi driver,
> Osta Abdo, teaches you the words, then the street tests you on them.
> Idea, UX, UX writing and art direction by me. Play it at ruyinqc.com/klaxs,
> best on a phone, with the sound on.

---

## 2. The order to upload

The project opens with your video, then the images follow in this order.

| # | Module | On the site |
|---|---|---|
| ▶ | **The opening video** (`video-opening.mp4`) | The “Case study” pill, the title and the intro on the left, the game playing on the right |
| 1 | `01-facts.png` | Role, Timeline, Platform, Players, Status, and the Play Klaxs card |
| 2 | `02-cover.png` | The game's cover, and you in it |
| 3 | `03-where-it-started.png` | 01 · Where it started, and the quote |
| 4 | `04-writing-the-language-down.png` | 02 · Writing the language down |
| 5 | `05-who-its-for.png` | 03 · Who it’s for |
| 6 | `06-how-it-plays.png` | 04 · How it plays |
| 7 | `07-the-ux-behind-the-fun-1.png` | 05 · The UX behind the fun: natural mapping |
| 8 | `07-the-ux-behind-the-fun-2.png` | Feedback that teaches |
| 9 | `07-the-ux-behind-the-fun-3.png` | Scaffolding, then fading |
| 10 | `07-the-ux-behind-the-fun-4.png` | Peak–end rule |
| 11 | `07-the-ux-behind-the-fun-5.png` | Value-sensitive design |
| 12 | `07-the-ux-behind-the-fun-6.png` | Designed to be shared |
| 13 | `08-ux-writing.png` | 06 · UX writing |
| 14 | `09-how-it-spread.png` | 07 · How it spread |
| 15 | `10-real-players-real-numbers.png` | 08 · Real players, real numbers |
| 16 | `11-what-players-told-me.png` | 09 · What players told me |
| 17 | `12-what-i-learned.png` | 10 · What I learned, and the closing line |
| 18 | `13-thank-you.png` | Thank you, your email, and Play Klaxs, in the site's contact style |

The title and intro aren't an image, because the video already shows them.

The images are 4200 px wide: the page at 1400 px, Behance's project width,
drawn fresh by the browser at 3×, so the text stays sharp at any zoom. The
cover is Behance's 808 × 632, drawn at 2× (1616 × 1264).

The players number is the count on 12 October 2026, so the facts and the
numbers say “and counting”. To show a newer number, change it in
`assets/js/data.js` and draw the images again (section 4).

---

## 3. The opening video

`video-opening.mp4` is ready: your demo recording in the frame, 1920 × 1080,
32 seconds, with its sound. It's cropped to the game, without the phone's
status bar or Safari's bars, and starts 4.2 seconds in, once the iPhone's
touch button has moved off the game.

### Put a new clip in the frame

`tools/behance/frame-video.js` puts a phone recording in a 1920 × 1080
frame styled like the case study: the site's paper, the “Case study” pill,
the title and the intro on the left, and your recording in a phone bezel on
the right. It keeps the sound.

From the repository root, once:

```sh
npm install --no-save playwright          # skip if you already have it
python3 -m http.server 8080 &             # leave this running
```

Then (put your own file name in):

```sh
node tools/behance/frame-video.js klaxs.mp4 behance/klaxs/video-opening.mp4 \
  --kicker "Case study" \
  --title "Klaxs: in Cairo, the horn is a language" \
  --sub "When I moved to Cairo, the honking drove me crazy. Then I started listening, and noticed that most of it actually meant something. Klaxs is the game I designed and built to teach that language: an old taxi driver teaches you the words, then the street tests you on them."
```

Needs `ffmpeg` (on a Mac: `brew install ffmpeg`).

### Putting it on Behance

Upload the framed video to YouTube (unlisted is fine) or Vimeo, and add it
to the project as an **Embed**. Behance shows a video uploaded straight
into the project at most 1280 px wide, while an embed fills the project's
full width, so it lines up with the images below it.

---

## 4. Changing the images

The images are taken from the live case study, so they follow whatever
`assets/js/data.js` and the site's styles say. After changing the study:

```sh
python3 -m http.server 8080 &             # from the repository root
node tools/behance/render.js              # rewrites every image in behance/klaxs/
```

The cover is `tools/behance/thumb.html`, and `render.js` draws it too.
