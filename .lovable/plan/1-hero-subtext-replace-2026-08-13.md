Verita site update — content changes + new logo

Applies the four changes from the uploaded document to the Verita site at `/demo/agency2`, plus the new gold "V" logo.

## 1. Hero subtext (replace)

New copy:
"We help you build or scale your iGaming business — the right way. From first idea to live launch and beyond, we bring industry-standard rigor and hands-on expertise to every stage. No handoffs, no guesswork — we stay with you the whole way."

## 2. New section — Why Verita

Placed directly after the hero, before "Great ideas are easy...". Three columns in the existing minimal style:

- 20+ Years in iGaming — deep operator-side experience across PAM, aggregation, bonus engines, KYC and payments.
- Full Lifecycle, One Partner — strategy and execution under one roof, no handoff between consultant and dev shop.
- Regulated-Market Ready — licensing, compliance and market entry across multiple regulated jurisdictions.

## 3. Capabilities — add item 07

"07 — Analysis & Business Intelligence: Data-driven visibility into performance, player behaviour and market opportunity — dashboards and reporting frameworks that turn raw data into decisions, not noise." Same formatting as 01–06, directly after 06.

## 4. New section — Stay in the Loop (email capture)

Placed under the contact form near the footer. Title "Stay in the Loop", subtext "Occasional insights on iGaming market entry, regulation and product strategy. No spam.", one email field and a "Subscribe" button, with an inline thank-you state and error message.

Emails are stored for real using Lovable Cloud: a `subscribers` table (email, created_at) that accepts public sign-ups but is readable only by you. Email format and length are validated both in the browser and on the server, and duplicate sign-ups are handled quietly.

## 5. Logo

The uploaded gold "V" mark replaces the current drawn logo in the header and footer, and becomes the site favicon.

## Technical notes

- The live `/demo/agency2` folder holds a compiled build; its React source is recovered from `verita-site-standalone.html` in the repo, edited there, rebuilt with base `/demo/agency2/`, and redeployed into `public/demo/agency2/`.
- The uploaded logo is uploaded as a CDN asset and referenced by URL; a square downscaled copy goes to `public/` for the favicon.
- Email capture requires enabling Lovable Cloud (database + server function). The insert path is a server-side endpoint with zod validation; the table has row-level security so submissions can be written but not read publicly.