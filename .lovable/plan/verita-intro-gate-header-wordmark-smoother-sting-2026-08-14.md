# Verita — Intro Gate, Header Wordmark, Smoother Sting

## 1. Intro page (new arrival experience)

Replace the current "auto-play once then disappear" overlay with a real intro gate on the Verita site root.

- On arrival at the site root, the visitor lands on a full-screen black intro screen and the 7s brand animation starts immediately (muted, inline).
- The intro no longer auto-dismisses when the clip ends. It holds on the final frame with two CTA buttons:
  - **ENTER** — fades the intro out (700ms) and reveals the main page.
  - **PLAY** — restarts the animation from frame 0, exactly as a fresh page load would.
- Buttons appear as soon as the intro is on screen (so nobody is trapped waiting), styled as thin gold-outlined uppercase links matching the site language; ENTER is primary, PLAY is secondary.
- Keyboard/accessibility: Esc = ENTER, Enter/Space activate the focused button, focus is moved into the intro and restored to the page afterwards, buttons are ≥44px tall.
- Fallbacks kept: if the video is blocked, errors, or is still not playable after 2.5s, the poster frame is shown with the same two buttons (PLAY retries). With `prefers-reduced-motion`, the intro shows the static poster + buttons instead of motion.
- Session behaviour: the intro shows on each arrival at the site root; once ENTER is pressed it is not shown again for that browser session (internal navigation never re-triggers it). `?intro=1` forces it.

## 2. Header wordmark typography

Bring the header lockup closer to the master logo artwork:

- "VERITA" switches from Inter 600 to the site's display serif (DM Serif Display, already loaded) in gold, with wide uppercase tracking, matched optically to the mark height.
- "IGAMING CONSULTANCY" stays a light sans (Inter 300/400) but gets tighter size, wider letter-spacing and a muted gold-grey tone so it reads as a caption under the wordmark, as in the artwork.
- Baseline/gap between the two lines and the gap to the circular V mark are re-tuned so the whole lockup optically matches the logo image; verified at desktop and mobile header sizes.

## 3. Smoother animation

The current MP4 is 1920x1080 at 60fps but only ~380 kbps, which is what causes the blocky, judder-y look on the gold gradients.

- Re-encode both files from the original master at a proper quality target: H.264 MP4 (CRF ~20, high profile, `-tune film`, faststart) and VP9 WebM at an equivalent quality, keeping 1920x1080.
- Expect roughly 2–4 MB per file instead of ~340 KB; preload stays `auto`, poster still covers first paint, and the 2.5s readiness guard remains so a slow connection never blocks entry.
- Add GPU-friendly compositing on the overlay (`transform: translateZ(0)`, opacity-only fade) so the fade to the main page is not repainted on the CPU.

## Technical notes

- Files touched: `public/demo/agency2/index.html` (intro overlay markup, styles, script), the header Logo component inside the deployed bundle `public/demo/agency2/assets/index-*.js` (wordmark typography), and new re-encoded `verita-sting.mp4` / `.webm` in `public/demo/agency2/assets/`.
- `public/demo/agency2/README.md` updated with the new intro states, button behaviour and re-encode command.
- Verified with Playwright at 1440x900 and 390x844: intro visible on load, PLAY restarts playback from 0, ENTER fades out and leaves the hero scrollable, no console errors.
