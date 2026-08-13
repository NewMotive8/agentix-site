# Make results say what the product actually is

## Why the descriptions are vague today

The product line on each card is just the **title of the web search result**. Nothing more.
When the engine finds a page like "DLA Medical Equipment Electronic CATalog (ECAT)", that string
is copied straight into the card as the "product". No page is read, no item is identified, no
quantity or profit is derived — the deep read only happens for the handful of items that reach
Stage 4, and even then its output is buried in a collapsed "Full research report".

So the card is showing a **portal name**, not a product. That is the root problem.

## What to change

### 1. Identify the item before showing it
For every candidate that survives filtering (not only the deep-investigated few), read the page
and extract a structured item identity:

- Plain-English product name ("Portable patient monitor, 12-lead")
- One-line description of what it is used for
- Quantity and unit of issue, if published
- Item kind: **Single item** / **Small set of items** / **Catalogue or framework (many items)**
- Where the item list lives, when it is a catalogue (link to the line-item page or attachment)

If the page is a catalogue/portal landing page with no identifiable item, label it
**Catalogue / portal — no single product** and either push it to the bottom or drop it,
per the setting below.

### 2. Rewrite the card so the answer is in the first two lines
Top of card, large type, in this order:

```text
[ Product name in plain English ]          Profit: $18k - $40k  ·  Signal 74
Buyer · Source · Closes 12 Sep · Qty 250 ea
One sentence: what this item is.
```

Everything else — codes, notice type, reasons, risk, compliance — moves below or into the
existing collapsible report. Target: no more than ~6 lines of text visible before the fold.

### 3. Product picture
When the item resolves to a single identifiable product, show a small thumbnail:

- Prefer a real image found on the notice page or the OEM/distributor page located during
  supplier research, with the source link under it.
- If no real image is found, show nothing rather than a decorative stand-in. A wrong picture on
  a procurement item is worse than no picture.
- For catalogue/multi-item notices, show an "Many items" marker plus the link to the item list
  instead of a picture.

### 4. Make the money the headline
Promote the estimated profit range from the estimate panel to the card headline, with a small
confidence dot. Keep the full estimate panel (contract size, margin, cash up front, sourcing
difficulty) but collapsed by default.

### 5. Cut the text volume
- "Why this is interesting" limited to 3 bullets, one line each.
- Procurement codes moved into the collapsed report.
- Notice-type / provenance badges reduced to one badge plus a source link.
- Deep report keeps everything, unchanged, for when you want it.

### 6. New control: "Hide catalogue / portal pages"
On by default, in the search panel. Turning it off restores the current behaviour so nothing is
lost, it just is not the default view any more.

## Technical notes

- New `src/lib/hunt/identify.server.ts`: scrape + AI extraction returning
  `{ productName, whatItIs, quantity, unit, itemKind, itemListUrl, imageUrl, confidence, evidence }`.
  Strict rules: nothing invented, empty fields when the page does not state it.
- Runs inside Stage 3 for all filtered candidates, batched and rate-limit-aware, reusing the
  retry logic already in `discovery.server.ts`; the scraped markdown is cached and reused by
  Stage 4 so the page is not fetched twice.
- Extend `Scored` in `src/lib/hunt/types.ts` with an `identity` field; `web.server.ts` keeps
  the raw hit title as a fallback only.
- `OpportunityCard.tsx` rebuilt around the new hierarchy; profit headline pulled from
  `estimates`. Image rendered only with a source URL attached.
- `HuntControls.tsx` gains the catalogue filter toggle; `hunter-manual.ts` updated to describe
  the new card and the catalogue filter.

## Trade-off to know about

Identifying items costs one page read per candidate, so a run gets slower and uses more research
credits. Mitigation: identification runs only on candidates that pass filtering, and the raw
target slider already caps how many that is.
