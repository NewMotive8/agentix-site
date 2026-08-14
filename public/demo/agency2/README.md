# Verita site (`/demo/agency2`)

Static build. Two brand elements are maintained here by hand.

## Animated header mark

Lives inline in the logo component inside `assets/index-DJU1rbE0.js` (search for
`verita-hdr-vGold`). It is a pure SVG + CSS shine — no JS, transform only.
Gradient/clip ids are prefixed `verita-hdr-` to avoid collisions with other inline SVGs.

The keyframes live at the bottom of `assets/index-Bie2yWpX.css`:

```css
@keyframes verita-shine{
  0%,62%   {transform:translateX(-1.35px) rotate(18deg)}
  82%,100% {transform:translateX(1.35px)  rotate(18deg)}
}
.verita-shine{animation:verita-shine 5s ease-in-out infinite}
```

- Shine interval: change the `5s` duration.
- Sweep speed: move the `62%` / `82%` stops (closer together = faster rake).
- Reduced motion disables the band.
- Never render the mark below 28px tall; scale via `width`/`height` only. Do not edit the
  path data, stroke width, `stroke-dasharray`, or the arc gap.
- Light-background header: swap the gradient stops to `#a8843c` → `#6f5220`.

## Intro sting

Markup, styles and the vanilla controller are in `index.html`. Sources:

- `assets/verita-sting.mp4` (H.264, listed first for Safari/iOS)
- `assets/verita-sting.webm` (VP9)
- `assets/verita-sting-poster.png` (final frame; poster + held end state)

To swap the clip, replace those three files in place (same names) — nothing is bundled
or optimised. The current master is `verita-sting-1920x1080-3.webm`.

Behaviour (current):
- The site root opens on a full-screen intro (`#verita-sting` in `index.html`).
- The clip autoplays muted/inline on every refresh.
- When playback ends it holds on the last frame and reveals two CTAs:
  **ENTER** (fades the intro out over 700 ms) and **PLAY** (restarts the clip from 0).
- `Esc` and the bottom-right **Skip** button both dismiss the intro immediately.
- Fallbacks: if autoplay is blocked, the video errors, or `canplay`/`canplaythrough`
  has not fired within 2.5 s, the CTAs appear anyway so the visitor is never trapped.
- Skipped entirely under `prefers-reduced-motion: reduce`.

## Encoding notes

Current assets were produced from the uploaded master `verita-sting-1920x1080-3.webm`
(VP9, 1920×1080, ~59.94 fps) with these commands:

```bash
# MP4 fallback (H.264, High L4.2, yuv420p, CFR 59.94)
ffmpeg -i master.webm -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.2 \
  -crf 18 -preset slow -r 60000/1001 -movflags +faststart -an verita-sting.mp4

# WebM (VP9, CFR 59.94)
ffmpeg -i master.webm -c:v libvpx-vp9 -pix_fmt yuv420p -crf 24 \
  -b:v 8M -minrate 4M -maxrate 12M -r 60000/1001 -an verita-sting.webm

# Poster (final frame)
ffmpeg -sseof -0.5 -i verita-sting.mp4 -q:v 2 -frames:v 1 verita-sting-poster.png
```

Result: MP4 ~1.3 MB, WebM ~960 KB, poster ~280 KB. The mostly-black content compresses
very efficiently while retaining the 60 fps motion.
