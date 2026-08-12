# Live Mode without API keys — web research discovery + full 5-stage analyst workflow

LIVE MODE stops meaning "SAM.gov API key present". It means every record came from a verified real-world source, whether that was an API, a public web page, or a published procurement document. When no API credential exists, the hunt still runs — via web research. Demo/simulated data stays quarantined behind Developer Settings and never appears in a live run.

## Source method, not source type

Every live record carries a method badge:

```text
API       structured feed (SAM.gov API when a key exists)
WEB       official public web page (search + extraction)
DOCUMENT  published PDF/doc (solicitation, notice, award list)
SIMULATED demo mode only, never in a live run
```

Each record must carry: official source URL, retrieval timestamp, source name, solicitation/reference number where published, and per-field evidence (the quoted snippet the value was extracted from). Any field without evidence is `NOT AVAILABLE` — never inferred, never estimated silently.

## WebResearchAdapter

One adapter, driven per-source by a site profile, covering SAM.gov, DLA/DIBBS, NSPA, NCIA and the NATO procurement portal. For each source it:

1. Runs targeted site-scoped searches built from the hunt parameters (FSC/NSN, keywords, notice terminology, date window).
2. Scrapes each promising result page for its real content.
3. Extracts structured fields from the page text with strict, evidence-bound extraction — reference number, buyer, notice type, posted/closing dates, description, linked documents.
4. Records the raw page text and URL alongside the normalised record so provenance can always be audited.

Web discovery needs a scraping/search backend. I will connect **Firecrawl** for search + scrape, and use the built-in Lovable AI for the evidence-bound field extraction and the written analysis. API adapters stay in place and take precedence over web results for the same source when credentials exist; a notice already retrieved by API is merged with its web hit, not duplicated.

The source panel becomes method-aware, e.g. `SAM.gov — LIVE (API)`, `NSPA — LIVE (WEB)`, `DIBBS — LIVE (WEB, limited)`. A source shows NOT CONNECTED only if both its API and its web profile fail.

## The five-stage workflow

The run does not stop at a result list. Stages are shown live in the progress panel and each has visible output in the report.

1. **Discover broadly** — category matrix across every source; wide net, no premature filtering. Reports categories searched, queries run and pages fetched.
2. **Collect & normalise** — extract fields with evidence, canonicalise, de-duplicate across sources and methods.
3. **Analyse & filter** — classify notice type from source-stated fields, then apply execution constraints and score. Strategy (Capital-Light, working capital, margin, value) is applied **here, after discovery** — it decides whether an opportunity is executable, never whether it is discovered. Records the engine cannot score are marked `ANALYSIS NOT AVAILABLE` rather than dropped.
4. **Deep-investigate** — the top-ranked opportunities get a second research pass: fetch the attached solicitation documents, look for prior awards and historical pricing, identify the buying office and platform, and note incumbents where publicly stated. Everything found is written into the investigation drawer with its source link and evidence quote; gaps are listed explicitly as open questions.
5. **U.S./NATO Procurement Watch** — the written report (see Report section below).

## Category-based discovery engine

Discovery is driven by a category/query matrix, not one broad search.

**Category Coverage control** in the sidebar: `ALL CATEGORIES` (default), selected categories, specific FSC/PSC, specific NAICS, keywords, or NSN / part number.

Category families shipped from the start, with no assumption that any is inherently attractive: aerospace/aircraft parts; ground vehicles and vehicle parts; ships/maritime; weapons-system components and spares; industrial machinery; pumps/valves/mechanical; electrical/electronics; communications equipment; IT/networking/COTS technology; medical/healthcare; food/subsistence; clothing/uniforms/footwear/textiles; batteries/power; tools and industrial consumables; chemicals/materials; construction/building materials; packaging; facilities supplies; transportation/logistics supplies; other COTS products; other government supply categories.

**Query generation** per category: category terms x procurement terms x product terms x classification terms x strategy terms.

- Procurement terms: solicitation, RFQ, RFP, IFB, sources sought, presolicitation, RFI, future opportunity, IDIQ, framework, requirements contract, spares, replacement, recurring, annual requirement.
- Product terms are generated from the category's own vocabulary, not a single keyword.
- Classification terms use that category's FSC/PSC and NAICS codes where they exist.
- Every executed query is recorded with the source it was run against and how many candidates it produced.

**Coverage Weight** per category (0.5 reduced / 1.0 normal / 2.0 priority, user-editable) controls how many queries and pages that category gets — search depth only. A 0.5-weight category can still surface the top-ranked opportunity.

**Broad default**: ALL CATEGORIES at balanced weight. The engine keeps expanding queries and paginating until the raw-candidate target (default 50–200+, configurable) is met or the search space is exhausted. If fewer exist, the report states the real number — results are never manufactured.

**Dedicated category hunt**: switching to a single category (e.g. CATEGORY: Food) runs a much deeper pass for that category — its full terminology set, FSC/PSC/NAICS, military-specific vocabulary, recurring/annual-requirement phrasing, solicitation and sources-sought phrasing, and historical-award phrasing. Same architecture for every category.

## NATO coverage

NATO discovery covers the NATO procurement portal (which aggregates NATO HQ, ACT, ACO, NSPA and NCIA open opportunities) plus NSPA and NCIA directly where reachable. NCIA is captured as three distinct layers, kept separate in the report: Current Opportunities, Future Opportunities, and Contract Awards.

## Procurement family detection

After discovery, related notices consolidate into families (e.g. AIRCRAFT FILTERS — multiple solicitations, multiple NSNs, historical awards, recurring demand). A family is a first-class intelligence object with its own card, aggregate value, buyer list and recurrence read.

## Report

## Supplier discovery is a separate research layer

The official-domain allowlist governs procurement-source discovery and procurement facts. It does not govern supplier research.

During Stage 4 Deep Investigation the engine may research the broader public web to identify potential manufacturers, OEMs, authorised distributors, alternate sources and commercial suppliers. This research is rendered in its own clearly separated panel and is never presented as government-confirmed information.

- Every supplier claim carries its source URL and retrieval date.
- Geography is not pre-weighted. U.S., European, Israeli, Turkish, Indian, Asian and other manufacturers and distributors are searched on technical and commercial suitability alone, subject to the solicitation's own country-of-origin, export and compliance requirements — which are quoted from the notice, not assumed.
- Each supplier is typed explicitly: `OEM`, `AUTHORIZED DISTRIBUTOR`, `APPROVED ALTERNATE`, `MANUFACTURER`, `DISTRIBUTOR`, `SURPLUS / STOCKIST`, `UNVERIFIED SUPPLIER`.
- Authorisation and approved-source status are **never inferred from the fact that a company sells the product**. `AUTHORIZED DISTRIBUTOR` requires an OEM or government statement to that effect, with the quote and URL; `APPROVED ALTERNATE` requires a government/QPL/approved-source-list statement. Absent that evidence the supplier is `UNVERIFIED SUPPLIER`, regardless of how the company describes itself.

## Run coverage statement and live progress

The run opens with a large, unmissable coverage statement before anything else renders:

```text
LIVE HUNT

Universe: All Categories
Sources: SAM.gov · DIBBS · NSPA · NCIA · NATO
Discovery: Web + API where available
Raw target: 100
Working-capital limit: $0
Deep investigations: 10
```

While it runs, per-category progress streams beneath it:

```text
Aerospace   — 18 queries — 42 hits
Industrial  — 16 queries — 31 hits
Medical     — 14 queries — 19 hits
Food        — 12 queries — 27 hits
...
```

The finished coverage statement stays at the top of the report as the run's header, so what was searched is always visible next to what was found.

The Procurement Watch states, in a coverage block: categories searched, queries executed, candidates discovered, candidates after deduplication, candidates passing execution constraints, deep investigations performed, top opportunities, categories producing the strongest opportunities, and categories searched that produced nothing strong. Plus the per-source coverage table (method, pages searched, records kept, what was not reachable). Search coverage is auditable end to end.

The objective is not maximum results: explore broadly enough not to miss anything attractive, then narrow hard to opportunities that are profitable, recurring or sizeable, accessible, compliant and executable under the user's current constraints.

## Report integrity

- Header reads `LIVE PROCUREMENT DATA` only when every displayed record is live with URL + timestamp + method. One simulated record downgrades the whole report.
- Coverage honesty: the report states what each source actually returned and where web coverage is partial (e.g. DIBBS listings behind a session, NCIA HTML-only pages) rather than implying full coverage.
- Live mode never falls back to the demo corpus. Zero results is a valid, explained outcome.

## Technical notes

- New `src/lib/hunt/sources/web/`: `profiles.ts` (per-source search patterns, URL allowlist, extraction hints), `search.server.ts` (Firecrawl search + scrape), `extract.server.ts` (AI extraction returning field + evidence snippet + confidence), `adapter.ts` (implements the existing `AdapterResult` contract).
- New `src/lib/hunt/categories.ts`: category family definitions (id, label, product vocabulary, FSC/PSC + NAICS codes, default weight) and `src/lib/hunt/querymatrix.ts` building the weighted query set and returning a `QueryPlan` with per-query provenance.
- `HuntParams` gains `coverage: { mode: "all" | "categories" | "fsc" | "naics" | "keywords" | "nsn"; categories: string[]; weights: Record<string, number>; rawCandidateTarget: number }`.
- `HuntRun` gains `coverage: { categoriesSearched[]; queries: { text; source; category; hits }[]; strongCategories[]; emptyCategories[] }` for the auditable coverage block.
- `LiveNotice` gains `method: "API" | "WEB" | "DOCUMENT"`, `sourceName`, and `fieldEvidence: Record<string, { value; quote; url }>`; `Provenance` mirrors it. `SourceStatusReport` gains `method` and `coverageNote`.
- The live branch of `runPipeline` becomes staged and streams stage progress (per-category progress during discovery); stages 4 and 5 run as separate server functions so deep investigation and report generation can be shown progressing.
- Execution constraints and scoring move strictly downstream of discovery — no strategy filter is allowed to shape a query.
- Deep investigation and report writing use the Lovable AI gateway with strict grounding: the model may use only supplied page text and must return a citation per claim; unsupported claims are dropped rather than rendered.
- URL allowlist enforced server-side — only official domains (sam.gov, dla.mil / dibbs.bsm.dla.mil, nspa.nato.int, ncia.nato.int, nato.int and the NATO procurement portal) are scraped; anything else is discarded.
- Per-run page budget and rate caps, surfaced in the run summary.