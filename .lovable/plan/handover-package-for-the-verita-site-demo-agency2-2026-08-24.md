# Handover package for the Verita site (/demo/agency2)

## Goal
Produce a downloadable archive of the whole project plus a standalone handover README, so another team can host, edit and redeploy the Verita site.

## What gets delivered
1. `verita-handover.zip` — full project archive (excluding `node_modules`, `.git`, build output, and `.env` secrets), containing:
   - `public/demo/agency2/` — the live static site: `index.html` (intro sting markup, styles and controller), `assets/index-*.js`, `assets/index-*.css`, the sting video (`mp4` + `webm`), poster, favicon, robots.txt, and the existing site README.
   - `src/routes/demo.agency2.tsx` — the route that serves the site.
   - `src/routes/api/public/verita-subscribe.ts` — the email signup endpoint.
   - The rest of the app source, config, and Tailwind/Vite setup for reference.
   - `HANDOVER.md` at the archive root.
2. `HANDOVER.md` — also delivered separately so it can be read without unzipping.

## HANDOVER.md contents
- What the site is and where it lives (route, published URL, custom domains).
- Layout of the delivered files and which ones are the actual site.
- Important note: the `/demo/agency2` site is a **pre-built static bundle**; the original React source for `assets/index-*.js` is not in this project. Editing options: patch the built HTML/CSS/JS in place (how it has been maintained so far), or rebuild from the original source repo if the new owner has it.
- Intro sting behaviour and how to swap the clip (three files, same names) plus the exact ffmpeg encode commands already documented.
- Animated header mark: where the inline SVG lives, the `verita-shine` keyframes, and the do-not-edit rules.
- Email signup: endpoint path, request/response shape, and the `verita_subscribers` table definition (columns, RLS, grants) exported as SQL so it can be recreated on any backend.
- Environment variables required (names only, no secret values) and how to set them.
- How to run locally (`bun install`, `bun run dev`) and how to deploy the static folder to any static host if they drop the app framework.

## Technical notes
- Table DDL for `verita_subscribers` will be read from the live schema and written into `HANDOVER.md` / a `handover/verita_subscribers.sql` file inside the zip.
- Secrets (`.env`, service keys) are excluded; only variable names are listed.
- Output written to `/mnt/documents/` for download.
