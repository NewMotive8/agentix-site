# Verita — Smoother Sting, Lighter Greys, Correct Header Font

## 1. Animation smoothness (root cause found)

The supplied master is not the clean 60fps clip it claims to be: it carries 356 frames across ~7s (~51 fps) with irregular frame gaps — mostly 16-17ms, but with occasional 33ms and 42ms jumps. Those long gaps are the visible stutter, and bitrate cannot fix them because the judder is baked into the source timing.

Fix in two steps:

1. **Retime to a true constant 60fps.** Re-encode from the master with motion-compensated frame interpolation (`minterpolate`) so missing frames are synthesised and every frame lands exactly 16.67ms apart — constant frame rate, no dropped or duplicated frames.
2. **Encode at a quality that preserves the gold gradients.** H.264 MP4 at CRF 18 (high profile, `-tune film`, faststart) and VP9 WebM at equivalent quality, both 1920x1080 CFR 60. Expected ~2-4 MB each, fine behind the poster and the existing readiness guard.

Playback-side polish: the video gets its own compositing layer, the overlay animates opacity only so the fade never forces a repaint, and playback starts once the browser reports it can play through — removing the early-buffer stutter on first load.

If it still is not perfect, the limit is the master. A cleaner source removes all doubt — best to worst: an image sequence (PNG/WebP frames at 60fps), ProRes 422/444 MOV, or a high-bitrate 60fps H.264 (>20 Mbps). Send any of those and it will be re-encoded from that instead.

## 2. Grey text too dark

The site's muted grey is `#6e6b63` on near-black — roughly 3.4:1 contrast, below comfortable reading level.

- Lift the muted text token to a warmer, lighter grey (around `#a5a096`, ~7:1 contrast) so body copy, captions, eyebrow labels and nav links read easily.
- Lift the secondary/dim greys used inline (button labels, footer text, small caption rows) into the same family so nothing is left behind at the old value.
- Keep hierarchy intact: primary text stays the light bone `#e6e2d8`, muted moves up but still sits clearly below it, gold accents unchanged.

## 3. Header wordmark font

The DM Serif Display experiment is wrong — the poster is a **thin, wide-tracked geometric sans**, not a serif.

- Switch "VERITA" to a light geometric sans matching the poster lettering (Jost 300, Montserrat Light fallback), uppercase, wide tracking (~0.3em), near-white, thin strokes.
- "IGAMING CONSULTANCY" uses the same family at a smaller size, wider tracking (~0.34em) and the gold tone from the poster (not grey), as in the artwork.
- Load the weight via the existing Google Fonts link, then compare the rendered lockup against a crop of the poster at desktop and mobile header sizes.

## Technical notes

- Files touched: re-encoded `public/demo/agency2/assets/verita-sting.mp4` / `.webm`, `public/demo/agency2/index.html` (font link, overlay compositing, playback gating, intro greys), the deployed CSS/JS bundle in `public/demo/agency2/assets/` for the muted-foreground token and the Logo typography, and `README.md`.
- Verified with Playwright: header crop compared against the poster crop, contrast checked on body/caption text, and the intro measured for dropped frames via `video.getVideoPlaybackQuality()`.