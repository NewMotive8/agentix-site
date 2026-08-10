# Procurement Hunter — In-App Manual

A built-in manual page for the hunting tool, reachable at any time from the sidebar. It combines a one-screen quick reference with a full step-by-step walkthrough on the same page, so you can skim or read deeply.

## Where it lives

- New page at `/hunter/manual`.
- A small `HELP / MANUAL` button in the Hunt Controls header (next to the crosshair title) opens it.
- A `BACK TO HUNT` link at the top of the manual returns you to the hunting screen.
- Same terminal aesthetic: dark zinc background, monospace, green/amber/blue accents.

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

- New route file `src/routes/hunter.manual.tsx` with its own `head()` metadata. Because `hunter.tsx` currently renders the page directly, it becomes a layout rendering `<Outlet />`, and the existing hunting screen moves to `src/routes/hunter.index.tsx` unchanged — the URL `/hunter` keeps working exactly as today.
- Manual content lives in `src/lib/hunter-manual.ts` as structured data (sections, rows, glossary entries), rendered by a small `src/components/hunter/ManualSection.tsx`, so preset and parameter descriptions stay consistent with `hunter-data.ts`.
- Static content only: no backend, no new dependencies. Uses existing shadcn primitives and Lucide icons.