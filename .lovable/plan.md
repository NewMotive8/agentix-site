# Procurement Hunter — Discovery Pipeline & Procurement Watch

Replace the current single-pass filter over a static list with a real multi-query discovery pipeline that runs on the server, plus a generated intelligence report.

## What changes for you

Press **RUN PROCUREMENT HUNT** and the engine works like an analyst instead of a search box:

1. Builds 40–80 distinct queries from the active strategy preset (procurement terms x product terms x FSC codes x strategy terms).
2. Runs them against four adapters — SAM.gov (live), DLA DIBBS, NSPA, NCIA (simulated corpora until we get access) — following pagination until the raw-candidate cap is hit.
3. Normalizes and deduplicates by canonical key (solicitation no. + source + NSN/part + buyer, punctuation/case stripped).
4. Enriches every NSN/part with historical demand (previous awards, quantities, unit prices, awardees, CAGE) and computes a Repeat Demand Score.
5. Consolidates related solicitations, historical awards and future notices into **procurement families** (same platform / product / program) *before* scoring, so a family is scored as one commercial opportunity.
6. Discovers supply market (OEM, distributors, alternates, surplus) and assigns Source Accessibility VERY HIGH → VERY LOW. Geography is never pre-weighted.
7. Scores every record twice — Opportunity Score and Commercial Execution Score (see below).
8. Writes the **U.S./NATO Procurement Watch** report.

A live progress panel shows each stage as it runs (Searching SAM.gov… → Enriching historical demand… → Scoring… → Generating Procurement Watch…) with running candidate counts, so it is obvious a broad search actually happened.

Target per run: 50–200 raw candidates → dedupe → filter → top 10–20 shown. If fewer than 10 qualify, the feed says "Only X opportunities passed the current criteria" — nothing is invented to pad the list.

## Data integrity — live vs simulated

Every record carries `source_status` (`LIVE` | `HISTORICAL` | `SIMULATED` | `ESTIMATE`), `source_url`, `retrieved_at` and `evidence_ids`, shown on the card, in the drawer and in the report.

- Simulated records are for development and UI testing only. Any report containing one is hard-stamped **DEMO** in the header and on every affected row, and cannot be presented as a live watch.
- A live Procurement Watch contains only `LIVE`/`HISTORICAL` records with real provenance. If a source is unavailable, the report says so instead of backfilling from a corpus.
- Field-level `ESTIMATE` tagging still applies to any derived number (margin, landed cost, value) even on live records.
- A run-level mode switch picks **Live** (real adapters only) or **Demo** (simulated allowed, report stamped).

## Two scores, always shown together

- **Opportunity Score (0–100)** — attractiveness: Economics 30, Source Accessibility 20, Repeat Demand 15, Competition 10, Execution Simplicity 10, Compliance 10, Timing 5.
- **Commercial Execution Score (0–100)** — can we actually win and deliver: source availability and qualification path, technical-data access, compliance/eligibility barriers, lead time vs deadline, capital intensity and NRE, logistics/certification burden, incumbent entrenchment.

Nothing is presented as actionable on Opportunity Score alone. Cards, the ranked feed and the report display both, and the recommendation (🟢 / 🟡 / 🔴) is driven by the pair — high attractiveness with low executability surfaces as 🟡 WATCH with the blocking constraint named.

## Cash-flow gate — the hard constraint

Working capital is the binding near-term constraint, so cash-flow feasibility is evaluated **before** any other opportunity-specific constraint, and it overrides margin.

The pipeline estimates, per opportunity: government payment timing (e.g. Net 30 / Prompt Payment Act / progress payments), supplier payment terms, supplier deposit requirement, MOQ and inventory requirement, production lead time, **cash required before government payment**, and any financing requirement.

Each opportunity is then classified:

- 🟢 **CASH-FLOW COMPATIBLE** — near-zero cash needed before the government pays.
- 🟡 **FINANCEABLE** — meaningful cash gap, coverable with financing; the required amount and duration are stated.
- 🔴 **CASH-FLOW INCOMPATIBLE** — deposits, MOQ or lead time force substantial pre-funding.

Under the Capital-Light strategy, 🔴 items are auto-rejected (listed in *Interesting but Rejected* with the cash reason) and 🟡 items are heavily penalized. Ranking follows executable economics: a lower-margin, near-zero-working-capital opportunity outranks a high-margin one with a large upfront cash requirement.

The engine reports **theoretical gross margin** and **commercially executable gross margin** (after financing cost and the cash gap) as separate figures — the executable number drives the score.

After the cash-flow gate, each opportunity is evaluated against its own constraint set, taken from the solicitation text and authoritative procurement rules with evidence attached, never assumed: country of origin, China restrictions, U.S.-only, NATO/allied-country requirements, Buy American, Berry Amendment, Trade Agreements Act, specialty metals, approved-source and OEM-only requirements, QPL/qualification, ITAR/EAR export control, certification, security clearance, bonding, insurance and delivery terms. No country is treated as permitted or prohibited by default.

Prominent on every card and report entry: Estimated Gross Profit · Estimated Gross Margin · Cash Required Before Government Payment · Cash-Flow Compatibility · Supplier Payment Terms · Government Payment Terms · Compliance Restrictions.

## Cash-flow constraint is configurable

The working-capital constraint is on by default but never hard-coded. The Engine Configuration panel gains an **Execution Constraints → Working Capital** control: *Maximum cash required before government payment* — `$0` (default, zero-upfront-capital mode), `$25K`, `$50K`, `$100K`, `$250K`, `$500K`, `Custom`, `Unlimited`, and `Ignore working-capital constraint`.

The selected value is the maximum acceptable cash gap for the current hunt:

- `$0` — only cash-flow-compatible opportunities qualify.
- `$100K` — opportunities needing up to $100K of pre-funding may qualify, subject to financing cost and the other constraints.
- `Unlimited` — working capital excludes nothing, but the estimated cash requirement is still displayed and folded into the economics.

Opportunity attractiveness and current execution capacity stay separate. An opportunity that fails the active cash constraint is never permanently rejected: it is tagged **CAPITAL CONSTRAINED** and shown in its own report/feed section, *Potential Opportunities — Financing Required*, so the same procurement universe can be re-run when financing capacity changes.

Every report states the active setting prominently — `Working-capital limit for this hunt: $0` — and the engine never silently applies a different threshold than the one selected.

## The Procurement Watch report

Generated after every hunt, dated, structured as:

- **TOP 3 TO INVESTIGATE** — three picks, each with a one-paragraph reason.
- **Executive Summary** — 2–5 bullets: screened count, strong candidates, strongest strategy, recurring-demand patterns, future signals.
- **Top Opportunities** (5–10) — buyer, solicitation, product, NSN/PN, qty/value, deadline, type, historical demand, source market, margin, gross profit, accessibility, why it fits, main risk, and 🟢 INVESTIGATE / 🟡 WATCH / 🔴 REJECT.
- **Sources Sought / Presolicitations** — kept separate from active bids (SAM federal discovery layer).
- **Future Procurement Signals** — forecasts, frameworks, market surveys, procurement families.
- **Repeat Demand Signals** — per-NSN year-by-year quantities plus score and interpretation.
- **Interesting but Rejected** — short list with the one-line reason (OEM-only, margin, quantity, services-heavy, deadline).

Procurement families are built before scoring from platform/program/product signals (title, buyer, NSN/FSC neighbourhood, part-number stems), so e.g. PzH2000 Packages 3/5/6/11/13 plus their prior awards and forecast notices collapse into one **PROCUREMENT FAMILY: PzH2000 SPARES** carrying the aggregate demand history, with the individual notices nested underneath.

Sources are treated as distinct intelligence layers, not interchangeable feeds:

- **SAM.gov** — federal opportunity and pre-solicitation discovery (active, presolicitation, sources sought, special notice, forecast).
- **DLA DIBBS** — DLA supply solicitations plus award and NSN history; the primary repeat-demand evidence layer.
- **NSPA** — current procurement (RFP/IFB/RFQ) *and* future-business signals: forecasts, procurement families, recurring NSN requirements.
- **NCIA** — current opportunities, future/planned procurements and past awards, with unreleased future notices flagged as early warning.

Narrative text (summary, why-it-fits, risk, recommendation rationale) is written by the built-in AI from the scored data only. Every factual field keeps its provenance — source name, URL, retrieval date, solicitation number — surfaced as **VIEW SOURCE** / **VIEW SOLICITATION** links. Anything derived is tagged **ESTIMATE**.

Each run is saved, so you get a dated history of reports you can reopen and compare.

## Technical approach

**Backend (Lovable Cloud + server functions)**
- Enable Lovable Cloud; tables `hunt_runs`, `opportunities`, `evidence`, `historical_awards`, with grants and RLS.
- `src/lib/hunt/` modules: `queries.ts` (strategy → query matrix), `adapters/sam.ts|dibbs.ts|nspa.ts|ncia.ts` (common `SearchAdapter` interface: `search(query, page) → RawNotice[]`, each declaring its intelligence layer and emitting `source_status`), `normalize.ts`, `dedupe.ts`, `family.ts` (runs before scoring), `enrich.ts`, `suppliers.ts`, `cashflow.ts` (payment timing, cash gap, classification), `constraints.ts` (compliance/eligibility extraction with evidence), `score.ts` (both scores), `report.ts`.
- Every persisted record stores `source_status`, `source_url`, `retrieved_at`, `evidence_ids`; a run is flagged `is_demo` when any contributing record is `SIMULATED`, and the report renderer cannot drop that stamp.
- SAM.gov adapter calls the live Opportunities API (`api.sam.gov/opportunities/v2/search`) with `ptype` covering active, presolicitation, sources sought, special notice and award history; paginates via `offset`/`limit` with caps and a per-run request budget. Needs a free SAM.gov API key stored as a secret — I'll prompt for it.
- DIBBS/NSPA/NCIA adapters implement the same interface against generated corpora (several hundred realistic notices) so the pipeline, pagination and dedupe behave identically; swapping in live fetchers later is a one-file change per source.
- `runHunt` server function orchestrates the pipeline, streams stage progress to the client (polled run-status record), persists the run, then calls the AI gateway (`google/gemini-3-flash`) with the scored data and a strict JSON schema for the narrative sections.

**Frontend**
- `/hunter` gains a report-first layout: progress panel while running, then Procurement Watch sections above the ranked feed. Existing card + investigation drawer are reused, extended with both score breakdowns, data-status chips, evidence links and repeat-demand chart.
- Sidebar gains a collapsed **Engine configuration** block: min/max raw candidates (50/200), final opportunities (10), deep investigations (10), and toggles for historical lookup, supplier discovery, future opportunities, sources sought, historical awards — all defaulting on.
- New `/hunter/history` listing saved runs.
- Capital-Light preset applies explicit boosts (COTS, standard parts, distributors, surplus, multiple approved sources) and penalties (software, consulting, manpower, integration, NRE, OEM-only).
- Manual at `/hunter/manual` updated to document the pipeline, scoring weights and report sections.

Success is measured as credible, commercially executable opportunities per run — not raw result volume.

Out of scope, as requested: CRM, automated bidding, bulk procurement database UI.
