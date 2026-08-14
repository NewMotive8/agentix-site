# VERITA — brand intro sting + animated header logo

Two additions to the Verita site at `/demo/agency2`: a 7-second full-bleed intro clip on the home page, and an animated gold "V" mark in the header replacing the static image.

## 1. Video assets

You supplied a WebM (VP9, 1920x1080, 23.5 MB) and the final-frame poster; no MP4 was included and the WebM is far above the 3 MB budget.

- Transcode the supplied WebM to `verita-sting.mp4` (H.264, yuv420p, faststart) and re-encode a lighter `verita-sting.webm` (VP9), both targeting roughly 2-3 MB at 1920x1080 without trimming a single frame of the animation.
- Copy the poster as-is to `verita-sting-poster.png`.
- All three land in `public/demo/agency2/assets/` as plain static files — no bundler, no image optimiser.

## 2. Intro sting

An overlay above the hero (never a gate): fixed, inset 0, `object-fit: cover`, true-black backdrop, no filter/opacity/blend/tint layer of any kind, no page-level logo or text over it.

- `<video muted playsinline autoplay preload="auto" disablePictureInPicture>` with MP4 first, WebM second, poster set. No controls, no loop.
- One control only: low-contrast `Skip`, bottom-right, 12px uppercase, `.18em` tracking, `#8d8a84` to `#e8c976` on hover, 44px hit area, focusable with a visible ring; `Esc` also skips.
- On `ended`: hold the final frame and cross-fade 700ms into the hero, then remove the overlay. No black flash, no rewind, no controls.
- Fallbacks: `play()` rejection skips instantly; no `canplay` within 2.5s skips; `prefers-reduced-motion: reduce` never loads the video; `sessionStorage` gate shows it once per session, with `?intro=1` to force it for QA.
- Hero stays in the DOM and interactive throughout, so it remains the LCP element; scroll lock lasts only while the overlay is up.

## 3. Animated header logo

Replace the `<img>` mark in the site's logo component with the supplied inline SVG, unchanged geometry: hairline-outlined left stroke, solid right stroke, detached open arc, black negative space.

- Gradient/clip ids prefixed `verita-hdr-` to avoid document-global collisions.
- One CSS keyframe, transform-only highlight band, 5s loop, disabled under reduced motion. No JS.
- Lockup stays as today (mark, then VERITA wordmark and IGAMING CONSULTANCY line) laid out with flex and a gap, one link to `/` with `aria-label="VERITA — home"`, `aria-hidden` on the SVG. Mark never renders below 28px tall; sizes scale via width/height only.

## 4. README note

A short `public/demo/agency2/README.md` covering where the mark lives, how to change the shine interval (the `5s` duration and the 62%/82% keyframe stops), and how to swap the video sources.

## Technical notes

The live `/demo/agency2` site is a compiled static bundle. The header change is a targeted patch to the logo component inside the bundle's JS (same method used for the previous logo swap). The sting is added as a self-contained overlay in `public/demo/agency2/index.html` — inline markup plus a small vanilla script — so it renders before React hydrates and needs no bundle rebuild. Verified after the change with a headless browser run across desktop, ultrawide and mobile-portrait viewports, plus reduced-motion and blocked-autoplay cases.
