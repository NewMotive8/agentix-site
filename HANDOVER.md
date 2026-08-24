# Verita iGaming Consultancy — Site Handover

Last updated: 2026-08-24

## 1. What this is

The Verita marketing site is served at the path **`/demo/agency2`** of this web
application.

- Preview: `https://id-preview--50137d3b-22a7-44e9-ad51-274b8bf6e633.lovable.app/demo/agency2`
- Published: `https://stealth-architects-collective.lovable.app/demo/agency2`
- Custom domains attached to the app: `https://agentix-tech.net`, `https://www.agentix-tech.net`

The site is a **self-contained static build** (HTML + one JS bundle + one CSS
bundle + media). The surrounding application is a TanStack Start (React 19 +
Vite 7) app that simply serves those files and provides one small API endpoint
for the email signup form.

## 2. Files that make up the Verita site

```
public/demo/agency2/
├── index.html                      the page shell + the whole intro-sting
│                                   markup, CSS and vanilla JS controller
├── favicon.png
├── robots.txt                      noindex/nofollow while the site is a demo
├── README.md                       maintenance notes (logo + sting)
└── assets/
    ├── index-DJU1rbE0.js           the built React bundle for the site body
    ├── index-Bie2yWpX.css          the built stylesheet (+ verita-shine keyframes)
    ├── verita-sting.mp4            intro clip, H.264 (listed first for Safari/iOS)
    ├── verita-sting.webm           intro clip, VP9
    └── verita-sting-poster.png     final frame; used as poster and held end state

src/routes/demo.agency2.tsx         redirects /demo/agency2 -> /demo/agency2/index.html
src/routes/api/public/verita-subscribe.ts   POST endpoint for the signup form
handover/verita_subscribers.sql     database table used by the signup endpoint
```

Everything else in the archive belongs to other, unrelated parts of the
application (the Agentix landing page at `/`, and internal tools at `/engine`
and `/hunter`). They are included for completeness but are not part of the
Verita site.

## 3. Important: source vs. build

`assets/index-DJU1rbE0.js` and `assets/index-Bie2yWpX.css` are **minified build
output**. The original React/TypeScript source that produced them is *not* part
of this project — the site was delivered as a compiled bundle and has been
maintained since by editing the built files in place.

Two ways forward for the next owner:

1. **Keep patching the build.** Content edits (copy, logo markup, colours) are
   done with a search-and-replace inside the minified JS/CSS. This is how the
   wordmark, the "IGAMING CONSULTANCY" typography and the animated header mark
   were changed. Works fine for small text/style changes.
2. **Rebuild from source.** If the original repository for the Verita front end
   is available, rebuild it and drop the new `index.html` + `assets/*` into
   `public/demo/agency2/`, keeping the intro-sting `<style>`/`<script>` block
   from the current `index.html` (see §4) if the intro should be preserved.

## 4. Intro sting (the 7-second brand animation)

All of it — markup, styles and controller — lives inline in
`public/demo/agency2/index.html`. No build step, no bundling.

Current behaviour:

- The clip autoplays muted/inline on **every** page load (no session gating).
- When it ends it holds on the last frame and reveals a single **ENTER** CTA
  which cross-fades the overlay out over 700 ms.
- A **Skip** control sits at the top right; `Esc` also skips.
- Fallbacks: if autoplay is blocked, the video errors, or the video is not
  ready within 2.5 s, the CTA appears anyway so the visitor is never trapped.
- The overlay is skipped entirely under `prefers-reduced-motion: reduce`.
- On viewports ≤ 768 px the video is scaled 1.5× so the logo reads on mobile.

### Swapping the clip

Replace these three files in place, keeping the same names — nothing is
bundled or hashed:

`assets/verita-sting.mp4`, `assets/verita-sting.webm`,
`assets/verita-sting-poster.png`

The current master is `verita-sting-1920x1080-3.webm` (VP9, 1920×1080, ~59.94 fps).
Encode commands used:

```bash
# MP4 fallback (H.264 High L4.2, yuv420p, CFR 59.94)
ffmpeg -i master.webm -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.2 \
  -crf 18 -preset slow -r 60000/1001 -movflags +faststart -an verita-sting.mp4

# WebM (VP9, CFR 59.94)
ffmpeg -i master.webm -c:v libvpx-vp9 -pix_fmt yuv420p -crf 24 \
  -b:v 8M -minrate 4M -maxrate 12M -r 60000/1001 -an verita-sting.webm

# Poster (final frame)
ffmpeg -sseof -0.5 -i verita-sting.mp4 -q:v 2 -frames:v 1 verita-sting-poster.png
```

Resulting sizes: MP4 ≈ 1.3 MB, WebM ≈ 960 KB, poster ≈ 280 KB.

## 5. Animated header mark

The gold "V" in the header is an **inline SVG with a pure-CSS shine** (no JS,
transform only). It lives inside the logo component in
`assets/index-DJU1rbE0.js` — search for `verita-hdr-vGold`. Gradient and clip
ids are prefixed `verita-hdr-` to avoid collisions with other inline SVGs.

The keyframes are appended at the bottom of `assets/index-Bie2yWpX.css`:

```css
@keyframes verita-shine{
  0%,62%   {transform:translateX(-1.35px) rotate(18deg)}
  82%,100% {transform:translateX(1.35px)  rotate(18deg)}
}
.verita-shine{transform-origin:center;animation:verita-shine 5s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.verita-shine{animation:none;opacity:0}}
```

- Shine interval: change the `5s` duration.
- Sweep speed: move the `62%` / `82%` stops (closer together = faster rake).
- Never render the mark below 28 px tall; scale via `width`/`height` only.
- Do not edit the path data, stroke width, `stroke-dasharray`, or the arc gap.
- For a light-background header, swap the gradient stops to `#a8843c` → `#6f5220`.

Wordmark typography: **Jost 300** with gold sub-lines, loaded from Google Fonts
at the top of `assets/index-Bie2yWpX.css`.

## 6. Email signup

The form posts to a small server route:

```
POST /api/public/verita-subscribe
Content-Type: application/json

{ "email": "person@example.com" }
```

Responses:

- `200 { "ok": true }` — stored (idempotent upsert on `email`)
- `400 { "ok": false, "error": "Please enter a valid email address." }`
- `500 { "ok": false, "error": "Could not save your email. Please try again." }`

Implementation: `src/routes/api/public/verita-subscribe.ts`. It validates with
Zod, lowercases the address, and upserts into `public.verita_subscribers` using
a service-role database client (server side only — the key never reaches the
browser). Routes under `/api/public/*` intentionally bypass site auth.

Table definition: see `handover/verita_subscribers.sql`. Row Level Security is
enabled with **no policies**, so the table is unreachable from the browser; only
the server-side service role can read or write it. That is deliberate — do not
add public policies unless the signup list should become readable.

To read the list, query the table from the backend (e.g. `select email,
created_at from public.verita_subscribers order by created_at desc;`).

## 7. Environment variables

Values are **not** included in this handover. The application expects these
names (a `.env` file at the project root, or the host's env settings):

| Name | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Backend URL, exposed to the browser |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public/anon key, exposed to the browser |
| `VITE_SUPABASE_PROJECT_ID` | Backend project id, exposed to the browser |
| `SUPABASE_URL` | Same URL, server side |
| `SUPABASE_PUBLISHABLE_KEY` | Public key, server side |
| `SUPABASE_PROJECT_ID` | Project id, server side |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key used by the signup endpoint. Server side only — never expose. Must be issued by whoever owns the backend project. |

The Verita static site itself needs **none** of these; only the signup endpoint
does.

## 8. Running and deploying

Local development:

```bash
bun install       # or npm install
bun run dev       # serves on http://localhost:8080
# open http://localhost:8080/demo/agency2
```

Production build:

```bash
bun run build
```

The app targets an edge/serverless runtime (Cloudflare Workers style). Node-only
native packages will not run in server functions.

### Deploying the Verita site on its own

If the new owner does not want the surrounding application, the site is fully
static and can be hosted anywhere:

1. Copy `public/demo/agency2/` to the host.
2. Either serve it at the path `/demo/agency2/` (all internal asset URLs are
   absolute and start with `/demo/agency2/`), **or** serve it at the site root
   after rewriting `/demo/agency2/` to `/` inside `index.html`,
   `assets/index-DJU1rbE0.js` and `assets/index-Bie2yWpX.css`.
3. Remove `robots.txt` (or change it) when the site should be indexed — it
   currently sends `noindex, nofollow`.
4. Re-point the signup form at whatever backend the new owner uses, or drop it.

## 9. Known constraints / gotchas

- `robots.txt` blocks indexing, and `index.html` carries
  `<meta name="robots" content="noindex, nofollow">`. Both must be changed for
  a public launch.
- The intro plays on every refresh by explicit request. To show it only once per
  session, wrap the initialiser in `index.html` with a `sessionStorage` flag.
- Asset filenames in `assets/` are content-hashed from the original build. If
  you replace them, update the `<script>` and `<link>` tags in `index.html`.
- The video is `object-fit: contain` so the wordmark is never cropped; changing
  it to `cover` will clip the logo on desktop.
