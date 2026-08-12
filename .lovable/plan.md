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

1. **Discover broadly** — multi-query matrix per source; wide net, no premature filtering. Reports queries run and pages fetched.
2. **Collect & normalise** — extract fields with evidence, canonicalise, de-duplicate across sources and methods.
3. **Analyse & filter** — classify notice type from source-stated fields, apply FSC/value/deadline/set-aside relevance, score with the existing engine where the data supports it, mark the rest `ANALYSIS NOT AVAILABLE`. Cash-flow gate and working-capital constraint apply as today.
4. **Deep-investigate** — the top-ranked opportunities get a second research pass: fetch the attached solicitation documents, look for prior awards and historical pricing, identify the buying office and platform, and note incumbents where publicly stated. Everything found is written into the investigation drawer with its source link and evidence quote; gaps are listed explicitly as open questions.
5. **U.S./NATO Procurement Watch** — the written report: executive read, top opportunities with reasoning, families/recurring demand, sources-sought and future signals, and a per-source coverage table (method, pages searched, records kept, what was not reachable).

## Report integrity

- Header reads `LIVE PROCUREMENT DATA` only when every displayed record is live with URL + timestamp + method. One simulated record downgrades the whole report.
- Coverage honesty: the report states what each source actually returned and where web coverage is partial (e.g. DIBBS listings behind a session, NCIA HTML-only pages) rather than implying full coverage.
- Live mode never falls back to the demo corpus. Zero results is a valid, explained outcome.

## Technical notes

- New `src/lib/hunt/sources/web/`: `profiles.ts` (per-source search patterns, URL allowlist, extraction hints), `search.server.ts` (Firecrawl search + scrape), `extract.server.ts` (AI extraction returning field + evidence snippet + confidence), `adapter.ts` (implements the existing `AdapterResult` contract).
- `LiveNotice` gains `method: "API" | "WEB" | "DOCUMENT"`, `sourceName`, and `fieldEvidence: Record<string, { value; quote; url }>`; `Provenance` mirrors it. `SourceStatusReport` gains `method` and `coverageNote`.
- The live branch of `runPipeline` becomes staged and streams stage progress; stages 4 and 5 run as separate server functions so deep investigation and report generation can be shown progressing.
- Deep investigation and report writing use the Lovable AI gateway with strict grounding: the model may use only supplied page text and must return a citation per claim; unsupported claims are dropped rather than rendered.
- URL allowlist enforced server-side — only official domains (sam.gov, dla.mil / dibbs.bsm.dla.mil, nspa.nato.int, ncia.nato.int, nato.int) are scraped; anything else is discarded.
- Per-run page budget and rate caps, surfaced in the run summary.