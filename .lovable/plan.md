# Verita intro screen with video

Visitors landing on the Verita page see a full-screen intro that plays the uploaded sting video before the site itself.

## Behaviour

- On arrival, a full-screen dark intro covers the page and the video starts playing automatically (muted, so browsers allow autoplay), scaled to fill the screen.
- Two calls to action sit below/over the video in the existing gold-on-dark style:
  - **ENTER** — fades the intro away and reveals the main Verita page underneath.
  - **PLAY** — restarts the video from the first frame on the same intro screen (with sound enabled, since it is a user tap).
- The main page is fully rendered behind the intro, so entering is instant with no reload.
- If the video fails to load or the browser blocks playback, the intro still shows the logo and both buttons, so no one gets stuck.
- Mobile: video fills the screen (cropped to fit), buttons stacked and thumb-reachable.
- The intro shows on every fresh arrival at the page (no "seen it already" suppression), matching the request.

## Technical notes

- The video is uploaded as a CDN asset (`verita-sting-1920x1080.webm`, 1920x1080 VP9) and referenced by URL; the 8.5 MB file is not committed into the repo.
- An MP4/H.264 copy is generated as a `<source>` fallback for browsers that do not decode VP9.
- Implementation is a self-contained overlay (markup + inline styles + a small script) added to `public/demo/agency2/index.html`, above the app root — no rebuild of the compiled Verita bundle is required.
- `playsinline`, `muted`, `autoplay` on first load; PLAY calls `currentTime = 0`, unmutes and replays. ENTER hides the overlay and pauses the video so it stops downloading/decoding.
