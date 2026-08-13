# Procurement Hunter — Clear Results, Focused Search

## The problem today

In LIVE mode the discovery layer only ever returns a notice: title, buyer, URL, notice type. Every card therefore renders "Scores and economics: NOT AVAILABLE", both score dials are hidden, and no rationale is shown. On top of that, eight report sections (executive summary, coverage audit, deep investigations, top 3, families, repeat demand, sources sought, rejected) render **above** the cards. The page reads as a wall of audit text with unscored items buried underneath.

The old version felt clearer because every card had a score and a "why this is interesting" paragraph. That is what comes back.

## 1. Search focus: up to 3 categories, or keywords

- Remove the "All categories" coverage mode. A hunt must be aimed.
- Two ways to aim:
  - **Categories** — pick 1 to 3 of the 14 families. A counter shows "2 of 3 selected"; a 4th checkbox is disabled with a hint to deselect one first.
  - **Keywords / FSC / NAICS / NSN** — type terms, no category needed.
- Run hunt stays disabled, with an inline reason, until either a category or a term is present.
- Fewer categories also means faster runs and a coverage list short enough to read.

## 2. Every card gets a score and a reason again

**Signal score (0-100) — verified facts only.** Built from what the notice actually says:
- notice type (open solicitation scores above sources-sought / special notice)
- days left to the deadline (too soon and too far both lose points)
- whether an NSN, FSC/PSC or part number is present
- how well the title matches the category or keywords searched
- whether the deep investigation succeeded, and what it found (quantities stated, compliance flags)

**Why this is interesting.** 3 to 5 short bullets naming the exact facts behind the score, plus one bullet naming the main risk or unknown. Every bullet derives from retrieved text — nothing invented.

**Estimates block, clearly labelled.** Below the verified section, a visually distinct panel headed `ESTIMATED — not published by the source`: estimated contract value, margin range, cash needed before payment, supplier availability. Each carries a confidence level (High / Medium / Low) and a one-line basis. These never mix with verified fields and never feed the Signal score.

Cards keep the LIVE provenance badge, notice type, "Open original notice" link and retrieval timestamp.

## 3. Deep investigation moves onto the card

The separate "Deep investigations" section disappears. Its content (requirement summary, compliance flags, supplier candidates with tier, country, source link and evidence) attaches to the card it belongs to, inside a collapsible "Full research report" panel. Supplier findings keep the "commercial research, not government-confirmed" caveat.

## 4. Page layout: results first

```text
[ run bar: LIVE · 12 results · 3 categories · 48 queries · re-run ]

  Card — score, why, estimates, research report
  Card
  Card
  ...

  > Run report          (collapsed)
  > Coverage audit      (collapsed)
  > Not shown, and why  (collapsed)
```

- The large coverage statement shows only while a hunt runs; afterwards it collapses into the one-line run bar.
- Executive summary, coverage audit, procurement families, repeat-demand signals, sources sought, future signals and rejected items become collapsed panels **below** the cards.
- Results sort by Signal score, highest first.

## 5. Manual brought up to date

`/hunter/manual` currently describes the old demo-only card (FSC tag input, competitors, "Estimated gross profit") and never mentions LIVE mode, categories, coverage weight, deep investigations or provenance. Rewritten to match the tool as it is:
- Quick steps: pick up to 3 categories or type keywords, set working capital, run.
- What LIVE mode means, and why some numbers are estimates.
- How to read the new card: Signal score, "why this is interesting", the ESTIMATED block, the research report.
- Where Demo mode lives (Advanced settings) and that it is simulated.
- Glossary kept, with entries added for Signal score, estimate confidence and supplier tiers.

## Technical notes

- `src/lib/hunt/querymatrix.ts`: drop `"all"` from `CoverageMode`, default to `categories`, cap selection at 3, allow keyword modes with no category.
- `src/lib/hunt/score.ts`: add `scoreLiveSignal(notice, deep)` returning `{ score, reasons[], risk }` from verified fields only.
- New `src/lib/hunt/estimate.server.ts` plus a server function: AI-produced value/margin/cash/supplier estimates with confidence and basis, returned in a separate `estimates` field on `Scored` so verified and estimated data can never be confused.
- `src/lib/hunt/pipeline.ts`: attach signal score, reasons and estimates in stages 3/4; attach each `DeepInvestigation` to its opportunity; sort qualified by signal score.
- `src/components/hunter/OpportunityCard.tsx`: replace the "NOT AVAILABLE" branch with the Signal score dial, reasons list, ESTIMATED panel and collapsible research report.
- `src/routes/hunter.index.tsx`: cards-first order, report sections in collapsed panels, compact run bar.
- `src/components/hunter/HuntControls.tsx`: 3-category cap with counter, "All categories" removed, Run button gated.
- `src/lib/hunter-manual.ts` and `src/routes/hunter.manual.tsx`: rewritten content.