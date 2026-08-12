# Procurement Hunter — Discovery Pipeline & Procurement Watch

Replace the current single-pass filter over a static list with a real multi-query discovery pipeline that runs on the server, plus a generated intelligence report.

## What changes for you

Press **RUN PROCUREMENT HUNT** and the engine works like an analyst instead of a search box:

1. Builds 40–80 distinct queries from the active strategy preset (procurement terms x product terms x FSC codes x strategy terms).
2. Runs them against four adapters — SAM.gov (live), DLA DIBBS, NSPA, NCIA (simulated corpora until we get access) — following pagination until the raw-candidate cap is hit.
3. Normalizes and deduplicates by canonical key (solicitation no. + source + NSN/part + buyer, punctuation/case stripped).
4. Enriches every NSN/part with historical demand (previous awards, quantities, unit prices, awardees, CAGE) and computes a Repeat Demand Score.
5. Discovers supply market (OEM, distributors, alternates, surplus) and assigns Source Accessibility VERY HIGH → VERY LOW. Geography is never pre-weighted.
6. Scores 0–100 with a visible breakdown: Economics 30, Accessibility 20, Repeat Demand 15, Competition 10, Execution 10, Compliance 10, Timing 5.
7. Writes the **U.S./NATO Procurement Watch** report.

A live progress panel shows each stage as it runs (Searching SAM.gov… → Enriching historical demand… → Scoring… → Generating Procurement Watch…) with running candidate counts, so it is obvious a broad search actually happened.

Target per run: 50–200 raw candidates → dedupe → filter → top 10–20 shown. If fewer than 10 qualify, the feed says "Only X opportunities passed the current criteria" — nothing is invented to pad the list.

## The Procurement Watch report

Generated after every hunt, dated, structured as:

- **TOP 3 TO INVESTIGATE** — three picks, each with a one-paragraph reason.
- **Executive Summary** — 2–5 bullets: screened count, strong candidates, strongest strategy, recurring-demand patterns, future signals.
- **Top Opportunities** (5–10) — buyer, solicitation, product, NSN/PN, qty/value, deadline, type, historical demand, source market, margin, gross profit, accessibility, why it fits, main risk, and 🟢 INVESTIGATE / 🟡 WATCH / 🔴 REJECT.
- **Sources Sought / Presolicitations** — kept separate from active bids.
- **Future Procurement Signals** — forecasts, frameworks, market surveys, procurement families.
- **Repeat Demand Signals** — per-NSN year-by-year quantities plus score and interpretation.
- **Interesting but Rejected** — short list with the one-line reason (OEM-only, margin, quantity, services-heavy, deadline).

Procurement families are detected by title/buyer similarity, so e.g. PzH2000 Packages 3/5/6/11/13 collapse into one **PROCUREMENT FAMILY: PzH2000 SPARES** entry with the individual notices nested underneath.

Narrative text (summary, why-it-fits, risk, recommendation rationale) is written by the built-in AI from the scored data only. Every factual field keeps its provenance — source name, URL, retrieval date, solicitation number — surfaced as **VIEW SOURCE** / **VIEW SOLICITATION** links. Anything derived is tagged **ESTIMATE**.

Each run is saved, so you get a dated history of reports you can reopen and compare.

## Technical approach

**Backend (Lovable Cloud + server functions)**
- Enable Lovable Cloud; tables `hunt_runs`, `opportunities`, `evidence`, `historical_awards`, with grants and RLS.
- `src/lib/hunt/` modules: `queries.ts` (strategy → query matrix), `adapters/sam.ts|dibbs.ts|nspa.ts|ncia.ts` (common `SearchAdapter` interface: `search(query, page) → RawNotice[]`), `normalize.ts`, `dedupe.ts`, `enrich.ts`, `suppliers.ts`, `score.ts`, `family.ts`, `report.ts`.
- SAM.gov adapter calls the live Opportunities API (`api.sam.gov/opportunities/v2/search`) with `ptype` covering active, presolicitation, sources sought, special notice and award history; paginates via `offset`/`limit` with caps and a per-run request budget. Needs a free SAM.gov API key stored as a secret — I'll prompt for it.
- DIBBS/NSPA/NCIA adapters implement the same interface against generated corpora (several hundred realistic notices) so the pipeline, pagination and dedupe behave identically; swapping in live fetchers later is a one-file change per source.
- `runHunt` server function orchestrates the pipeline, streams stage progress to the client (polled run-status record), persists the run, then calls the AI gateway (`google/gemini-3-flash`) with the scored data and a strict JSON schema for the narrative sections.

**Frontend**
- `/hunter` gains a report-first layout: progress panel while running, then Procurement Watch sections above the ranked feed. Existing card + investigation drawer are reused, extended with score breakdown, evidence links and repeat-demand chart.
- Sidebar gains a collapsed **Engine configuration** block: min/max raw candidates (50/200), final opportunities (10), deep investigations (10), and toggles for historical lookup, supplier discovery, future opportunities, sources sought, historical awards — all defaulting on.
- New `/hunter/history` listing saved runs.
- Capital-Light preset applies explicit boosts (COTS, standard parts, distributors, surplus, multiple approved sources) and penalties (software, consulting, manpower, integration, NRE, OEM-only).
- Manual at `/hunter/manual` updated to document the pipeline, scoring weights and report sections.

Out of scope, as requested: CRM, automated bidding, bulk procurement database UI.
