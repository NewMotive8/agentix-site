# Procurement Hunter — Readability Overhaul + In-App Manual

Two parts: first make the tool comfortable to read, then add a manual you can open whenever you need a refresher.

## Part 1 — Readability pass (priority)

The current screen is terminal-dense: 10-11px type, all-caps with wide letter spacing, mid-grey text on near-black. That is the main problem. Changes:

- **Bigger text everywhere.** Body and data text goes from ~11px to 15-16px; card titles to 19px; sidebar labels to 14px. Nothing below 13px anywhere on the page.
- **Higher contrast.** Labels move from mid-grey to a light grey that clearly passes contrast on the dark background. Option included: a light "high-contrast day" mode toggle (dark text on white) if you prefer that for long sessions — the toggle sits in the header and remembers your choice.
- **Kill the all-caps + wide letter spacing** on anything longer than a couple of words. Headings become normal sentence case, which reads far faster.
- **Readable font.** Data values (prices, NSNs, quantities) stay monospace so columns line up; all prose, labels and headings switch to a clean sans-serif.
- **More breathing room.** Card padding, line height (1.6 on prose) and spacing between rows increase; each opportunity card gets clear internal separation between the header, metadata, badges, economics and summary blocks.
- **Fewer things per row.** Card metadata and economics stack into labelled pairs (label above value) instead of a crowded single line, so nothing has to be hunted for.
- **Bigger, clearer buttons.** Investigate / Save / Dismiss become full-size buttons with icons and normal-case text, comfortably clickable.
- **Colour used sparingly and meaningfully.** Green = good, amber = caution, red = risk, everything else neutral. Score badge gets larger numerals and a plain-language word under it (Strong / Moderate / Weak).
- **Sidebar clarity.** Wider sidebar, larger slider handles and value readouts, checkbox labels at full size, and a short one-line explanation under each parameter so you never have to guess what it filters.
- **Investigation drawer.** Wider panel, larger table text, generous row height, and the economics waterfall in a bigger monospace block with clear labels.

## Part 2 — In-App Manual

A built-in manual page, reachable at any time from the sidebar. It combines a one-screen quick reference with a full step-by-step walkthrough on the same page, so you can skim or read deeply. Written in the same enlarged, high-contrast style.

## Where it lives

- New page at `/hunter/manual`.
- A small `HELP / MANUAL` button in the Hunt Controls header (next to the crosshair title) opens it.
- A `BACK TO HUNT` link at the top of the manual returns you to the hunting screen.
- Large readable type, generous spacing, and short paragraphs — no dense terminal text.

## Page structure

**Left: sticky section index** (Quick Reference, Workflow, Controls, Reading a Card, Investigation Drawer, Glossary) — click to jump.

**Right: content sections**

1. **Quick Reference** — a dense cheat-sheet card at the top:
   - The 4-step loop: pick preset → tune parameters → RUN HUNT → investigate.
   - A compact table of every control and what it does in one line.
   - A legend strip for score colours and badge tones.

2. **Workflow walkthrough** — numbered steps with a worked example ("find single-incumbent aerospace valves above 30% margin"): which preset to start from, which sliders to move, what result to expect, and what to do when zero targets come back.

3. **Hunt Controls reference** — each of the five presets explained (what strategy it encodes and the exact parameters it sets), then each slider and the FSC tag field, then what turning each source on/off changes. Notes that presets stage values but do not run the search.

4. **Reading an Opportunity Card** — an annotated walkthrough: score bands (>80 green, >60 amber, below muted), what Historical Demand / Source Accessibility / Pricing Confidence indicate and how to weigh them together, how Est. Margin relates to Est. Gross Profit, how to read the AI summary's "main risk" clause, and what SAVE and DISMISS do (session-only, reset on the next hunt).

5. **Investigation Drawer** — section by section: demand history table, supply market table and what each qualification status means for effort (Approved Source / Qualified / Requires SAR / Unqualified), compliance chip states (required / watch / clear), how to read the economics waterfall and the line total, and how to act on each of the four recommendation verdicts.

6. **Glossary** — NSN, P/N, FSC, OEM, SAR, ITAR/EAR, Buy American, Berry Amendment, Source-Controlled, and the four data sources (SAM.gov, DLA DIBBS, NSPA, NCIA).

## Technical notes

- Readability work is presentation-only: type scale, contrast tokens and spacing in `src/styles.css` (a `.hunter` scope replacing the tight `.terminal` sizing for this page), plus className changes in `HuntControls.tsx`, `OpportunityCard.tsx` and `InvestigationDrawer.tsx`. Hunt logic and mock data are untouched.
- Optional light mode is a class toggle on the page container with a matching token set; preference stored in `localStorage`.
- New route file `src/routes/hunter.manual.tsx` with its own `head()` metadata. Because `hunter.tsx` currently renders the page directly, it becomes a layout rendering `<Outlet />`, and the existing hunting screen moves to `src/routes/hunter.index.tsx` unchanged — the URL `/hunter` keeps working exactly as today.
- Manual content lives in `src/lib/hunter-manual.ts` as structured data (sections, rows, glossary entries), rendered by a small `src/components/hunter/ManualSection.tsx`, so descriptions stay consistent with `hunter-data.ts`.
- Static content only: no backend, no new dependencies. Uses existing shadcn primitives and Lucide icons.