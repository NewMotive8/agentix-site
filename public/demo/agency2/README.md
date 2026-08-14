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
or optimised. Keep the MP4 under 3 MB; re-encode at a lower bitrate rather than trimming.

Behaviour: autoplays muted once per session (`sessionStorage` key `verita-sting-seen`),
`?intro=1` forces it for QA, `Skip` / `Esc` dismiss it, and it cross-fades to the hero on
`ended`. It is skipped entirely under `prefers-reduced-motion: reduce`, on blocked
autoplay, on a video error, or if `canplay` has not fired within 2.5s.

## Intro gate (Aug 2026)

- The site root opens on a full-screen intro (`#verita-sting` in `index.html`).
  The 7s clip autoplays muted/inline; when it ends it holds on the last frame.
- Two CTAs: **ENTER** (fades the intro out over 700ms, sets
  `sessionStorage['verita-intro-entered']`, never shown again that session) and
  **PLAY** (restarts the clip from 0). `Esc` = ENTER. `?intro=1` forces the intro.
- Buttons fade in as soon as playback starts, on video error, or after a 2.5s
  readiness guard, so a blocked/slow video never traps the visitor. With
  `prefers-reduced-motion` the poster frame is shown with the same buttons.
- Assets re-encoded from the master at higher quality for smoothness:
  `ffmpeg -i master.webm -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow -tune film -movflags +faststart -an verita-sting.mp4`
  `ffmpeg -i master.webm -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 -cpu-used 2 -an verita-sting.webm`
- Header wordmark uses DM Serif Display for "VERITA" and Inter 300 / 0.3em
  tracking for "IGAMING CONSULTANCY" to match the master logo artwork.

## Aug 2026 — smoothness + typography pass

- The original master was ~51fps with irregular 33-42ms frame gaps (visible judder).
  Assets are now retimed to true CFR 60 with motion-compensated interpolation:
  `ffmpeg -i master.webm -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmc=1,format=yuv420p" -r 60 -fps_mode cfr -c:v libx264 -profile:v high -crf 18 -preset medium -tune film -movflags +faststart -an verita-sting.mp4`
  then VP9: `ffmpeg -i verita-sting.mp4 -c:v libvpx-vp9 -crf 28 -b:v 0 -row-mt 1 -cpu-used 2 -an verita-sting.webm`
  Measured in Chrome: 418 total frames, ~0 dropped.
- Header lockup uses Jost 300 (Montserrat/Inter fallback) to match the poster
  lettering; "IGAMING CONSULTANCY" is gold (#c9a24a) at 0.34em tracking.
- `--muted-foreground` lifted #6e6b63 -> #a5a096; inline dim greys #8d8a84 -> #b0aba1.
