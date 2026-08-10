# Defense Procurement Arbitrage Engine

New page at `/engine` built from your supplied structure, data model and mock dataset. The Agentix landing page at `/` stays untouched.

## Files

- `src/lib/engine-data.ts` — `Opportunity`, `PricingHistory`, `EnginePrefs` types, `defaultPrefs`, `filterOpportunities()` and your 8 mock records (thermostatic regulator, servo valve, brake disc, pressure regulating valve, fuel pressurizing valve, pack assembly, brake rotor segment, ECS condenser), plus a handful more in the same style so the feed stays dense under default filters.
- `src/components/engine/EngineSidebar.tsx` — algorithm controls.
- `src/components/engine/EngineFeed.tsx` — data table, price sparkline, score badges, skeleton and empty states.
- `src/routes/engine.tsx` — layout controller, header, connection status dots.

## Left panel — Engine Search Preferences

Min Est. Margin (10-80%, default 25), Min Contract Value ($50k-$2M, default $150k), Max Incumbent Manufacturers (1-5, default 1), FSC Codes tag field (Enter to add, click chip to remove, seeded 4820 / 2530 / 4130), three Data Source switches (NSPA XML, SAM.gov API, DLA DIBBS), and a full-width neon "UPDATE ALGORITHM" button. Edits stay local until the button is pressed.

## Main view — Live Opportunity Feed

Dense monospace table: Viability Score badge (green high, amber mid, muted low), Source, NSN, Nomenclature, Est. Value, Margin %, Incumbent, Closing Date. Sorted by score. Clicking a row expands an intelligence panel with the full description, target qty, delivery terms, an inline SVG price sparkline and the historical award list. Update Algorithm shows skeleton rows for 1 second, then re-filters.

## Top right — Data Connection Status

Three labelled dots (NSPA XML Feed, SAM.gov REST API, WebFLIS Price Database); green when the matching source is enabled, red when off. WebFLIS reflects the DIBBS switch.

## Adaptations to this codebase

- Route uses `createFileRoute("/engine")({ head, component })` — this project uses TanStack Start file-based routing, not default-exported page components.
- Your HSL terminal tokens are added as oklch equivalents scoped to an engine page container class in `src/styles.css`, so the existing Agentix landing styling is not overridden globally.
- Shadcn Slider, Switch, Table, Badge, Skeleton, Button, Input are already installed — no new dependencies.
- Client-side only: no backend, no auth, no persistence.
