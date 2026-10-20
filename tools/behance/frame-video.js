#!/usr/bin/env node
/**
 * Puts a screen recording of Klaxs into a 1920×1080 frame that matches the
 * Behance panels: sand page, the words on the left, the recording in a phone
 * bezel on the right. A landscape recording gets a title strip above it.
 * The sound is kept, because in this game the sound is the point.
 *
 *   python3 -m http.server 8080 &        # from the repository root
 *   node tools/behance/frame-video.js <in.mp4> <out.mp4> \
 *        --title "Hear it, see it, honk it" \
 *        [--num 04] [--ar "دورك! زمّر زيي بالظبط."] [--sub "One line under the title"]
 *
 * Needs ffmpeg and ffprobe on the PATH.
 * Set BROWSER_PATH to use a Chromium you already have installed.
 */

const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const EXE = process.env.BROWSER_PATH || undefined;

const args = process.argv.slice(2);
const [input, output] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
const opt = k => { const i = args.indexOf('--' + k); return i < 0 ? '' : args[i + 1]; };
if (!input || !output || !opt('title')) {
  console.error('usage: frame-video.js <in.mp4> <out.mp4> --title "…" [--num 04] [--ar "…"] [--sub "…"]');
  process.exit(2);
}

// the recording's size, after any rotation the phone wrote into it
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height:stream_side_data=rotation', '-of', 'json', input]));
const st = probe.streams[0];
const rot = Math.abs(((st.side_data_list || [])[0] || {}).rotation || 0) % 180 === 90;
const [vw, vh] = rot ? [st.height, st.width] : [st.width, st.height];
const wide = vw > vh;
const even = n => Math.round(n / 2) * 2;

// where the video sits: portrait fills the right side, landscape the middle
let w, h, x, y;
if (wide) { w = Math.min(1500, even(780 * vw / vh)); h = even(w * vh / vw); x = even((1920 - w) / 2); y = 1080 - 90 - h; }
else      { h = 900; w = even(h * vw / vh); x = even(1490 - w / 2); y = even((1080 - h) / 2); }

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'klaxs-frame-'));
  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const q = { x, y, w, h, title: opt('title'), num: opt('num'), ar: opt('ar'), sub: opt('sub') };
  if (wide) q.wide = 1;
  for (const layer of ['back', 'front']) {
    await page.goto(BASE + 'tools/behance/frame.html?' + new URLSearchParams({ ...q, layer }), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(tmp, layer + '.png'), omitBackground: layer === 'front' });
  }
  await browser.close();

  execFileSync('ffmpeg', ['-y', '-v', 'error',
    '-loop', '1', '-framerate', '30', '-i', path.join(tmp, 'back.png'),
    '-i', input,
    '-loop', '1', '-framerate', '30', '-i', path.join(tmp, 'front.png'),
    '-filter_complex',
      `[1:v]scale=${w}:${h}:flags=lanczos,fps=30[v];` +
      `[0:v][v]overlay=${x}:${y}:shortest=1[b];` +
      `[b][2:v]overlay=0:0:shortest=1,format=yuv420p[out]`,
    '-map', '[out]', '-map', '1:a?',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '192k',
    output], { stdio: 'inherit' });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('✓', output);
})().catch(e => { console.error(e); process.exit(1); });
