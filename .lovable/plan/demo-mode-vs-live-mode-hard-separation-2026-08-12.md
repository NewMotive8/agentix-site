# Demo Mode vs Live Mode — hard separation

Right now every hunt runs off the simulated corpus, and the "demo" flag is only a label. This change makes the mode a real branch in the pipeline: Live Mode never touches simulated records, and the report refuses the "Live Procurement Watch" title unless every displayed opportunity carries a verified source URL and retrieval timestamp.

## Mode switch

A prominent DEMO / LIVE toggle sits at the top of the Engine Configuration panel and is mirrored in the report header.

- **DEMO MODE** — simulated corpora, every card and the header stamped `DEMO — SIMULATED DATA`. Never worded as a live search ("Replaying simulated corpus", not "Searching SAM.gov").
- **LIVE MODE** — only records returned by a real adapter. No fallback to the corpus, ever. If every enabled source is unavailable, the run finishes with zero results and an explicit "no live sources returned data" state — not simulated filler.

## Source adapters

Each source gets a connector with an explicit status, checked before the run and shown in the progress panel:

```text
SAM.gov   LIVE ✓        (opportunities API, paginated)
DIBBS     NOT CONNECTED  LIVE ACCESS NOT CONFIGURED
NSPA      NOT CONNECTED  LIVE ACCESS NOT CONFIGURED
NCIA      NOT CONNECTED  LIVE ACCESS NOT CONFIGURED
```

- **SAM.gov** — implemented for real in this pass against the public Opportunities API. It needs a free SAM.gov API key, which I will ask you to paste in as a secret; it is read only on the server, never in the browser.
- **DIBBS / NSPA / NCIA** — no public programmatic API today. They ship as adapter stubs that report `LIVE ACCESS NOT CONFIGURED` and return nothing in Live Mode. Structure is in place so each can be filled in later (scraper or feed) without touching the pipeline.

Live records are mapped to the existing opportunity shape with no invention: solicitation number, agency, NAICS/FSC, posted and response dates, description and the notice URL come from the response. Anything the source does not provide (unit price, incumbents, prior awards, supplier quotes) is left empty and labelled `NOT AVAILABLE` — never estimated silently. Fields we do derive (margin, cash requirement) are tagged `ESTIMATE` in the card so it is obvious they are model output, not source data.

## Report integrity rules

- Header reads exactly `LIVE PROCUREMENT DATA` or `DEMO — SIMULATED DATA`.
- The live header is only allowed if 100% of displayed opportunities have `status: LIVE` plus a source URL and a retrieval timestamp. One simulated record anywhere downgrades the whole report to `DEMO — SIMULATED DATA` with a banner explaining why.
- Each opportunity card shows its source badge, a clickable link to the original notice, and "Retrieved <timestamp>".
- The run summary lists per-source counts and any source that was skipped because live access is not configured.

## Technical notes

- New `src/lib/hunt/sources/` folder: `types.ts` (adapter contract returning `{ status, notices, sourceUrl, retrievedAt, error }`), `sam.ts`, `dibbs.ts`, `nspa.ts`, `ncia.ts`, `registry.ts`.
- SAM fetching runs in a `createServerFn` (`src/lib/hunt/sam.functions.ts`) so the API key stays server-side; the key is read inside the handler.
- `runPipeline` becomes async and takes `mode: "demo" | "live"`; the demo branch keeps the current corpus path, the live branch calls only real adapters.
- `HuntRun` gains `mode`, `sourceStatuses`, and `integrity: { liveClean: boolean; reason?: string }`; `Provenance` becomes mandatory on every scored record.
- Progress panel renders live per-source status while the run streams; the existing staged UI stays.
- Fixes a small hydration warning on the report timestamp by formatting dates client-side.

## SAM.gov API correctness

Before any adapter code is written, I verify the current SAM.gov Get Opportunities API schema against the official GSA / api.data.gov documentation — the exact endpoint version, required parameters (including the mandatory posted-date window and its maximum span), pagination fields, rate limits, and the full list of documented `ptype` codes with their meanings.

Rules the adapter follows:

- No guessed or human-readable `ptype` strings. Only codes the current documentation explicitly lists are ever sent, and only after the doc check confirms them. If the documentation does not support filtering a category we want, we do not filter on it.
- Retrieval is broad: query the opportunity universe with the documented parameters (date window, NAICS, set-aside, keyword, pagination) and classify afterwards.
- Classification (active solicitation vs sources sought vs presolicitation vs award vs special notice) comes only from the response's own notice-type fields (`type` / `baseType` and related fields as documented), never from the title text and never inferred.
- If a returned notice has a type value we do not recognise, it is labelled `UNCLASSIFIED NOTICE TYPE` and shown with its raw value rather than being forced into a bucket.
- The adapter stores the raw SAM record alongside the normalised one, so notice type, `uiLink`, `noticeId`, and the retrieval timestamp are always traceable to the source payload. The investigation drawer can show the raw fields on demand.
- Doc-check findings (endpoint URL, parameter list, valid type codes) are recorded as comments in `src/lib/hunt/sources/sam.ts` so future edits do not reintroduce invented parameters.

## Mode defaults and placement (revision)

Live Mode is the product. Demo Mode is a development/testing aid only.

- The app defaults to **LIVE MODE** on load, including the first automatic run. No simulated results are ever shown unless the user deliberately turns Demo Mode on.
- The DEMO/LIVE toggle moves out of the main panel into a collapsed **Advanced / Developer settings** section at the bottom of the sidebar (closed by default, with a short "for testing only" note).
- While Demo Mode is on, a persistent amber bar across the top of the report reads `DEMO — SIMULATED DATA · developer mode` so it can never be mistaken for a real run.
- The normal (live) experience shows a **Connected sources** panel high in the sidebar with each source's real state: `SAM.gov — LIVE ✓`, `DIBBS — NOT CONNECTED`, etc. Sources that are not connected are visibly disabled rather than silently ignored, so it is always obvious what the hunt actually covered.
- Simulated and live records are never combined in one run, one report, or one list. The mode selects exactly one data path; there is no partial or fallback blending under any error condition.
- If Live Mode returns nothing (no connected source, API key missing, or zero matches), the report shows the reason and stays empty. It never falls back to the demo corpus.
