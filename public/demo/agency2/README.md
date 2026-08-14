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
