# Remove Play button from /demo/agency2 intro

## Goal
Remove the "Play" button from the Verita intro sting at `/demo/agency2`, keeping only the "ENTER" call-to-action (plus the existing top-right "Skip" control and `Esc` shortcut).

## Changes
1. In `public/demo/agency2/index.html`:
   - Remove the `#verita-sting-play` `<button>` element from the injected CTA HTML.
   - Remove the `playBtn` variable and its `click` event listener that restarts the video.
   - Keep `#verita-sting-enter`, `#verita-sting-skip`, the `ended`/`error` CTA reveal logic, and the cross-fade `finish()` behavior unchanged.

## Acceptance
- Only one CTA button appears after the intro clip ends: "ENTER".
- "Skip" remains top-right; `Esc` still skips.
- No JavaScript errors after removing the Play button references.
