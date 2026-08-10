# Defense Procurement Arbitrage Engine

A new standalone page at `/engine` (the existing Agentix landing page at `/` stays untouched), built as a dark, high-density terminal-style console.

## Layout

```text
+---------------------------------------------------------------+
| AGENTIX // ARBITRAGE ENGINE      [*] NSPA [*] SAM [*] WebFLIS  |
+------------------+--------------------------------------------+
| ENGINE SEARCH    |  LIVE OPPORTUNITY FEED                      |
| PREFERENCES      |  Score | Src | NSN | Nomenclature | Value    |
|                  |        | Margin | Incumbent | Closing       |
| sliders,         |  -- rows, click to expand --                |
| tags, switches   |                                             |
| [UPDATE ALGO]    |                                             |
+------------------+--------------------------------------------+
```

## Left panel — algorithm controls

- Minimum Est. Margin — slider, 10–80%, default 25%
- Minimum Contract Value — slider, $50k–$2M (step $25k), default $150k
- Max Incumbent Manufacturers — slider, 1–5, default 1
- FSC Codes to Target — tag input; type a code and press Enter to add a chip, click x to remove. Presets seeded (4820 valves, 2530 brake components, 4130 refrigeration/thermostatic)
- Data Sources — three switches: NSPA XML, SAM.gov API, DLA DIBBS
- "Update Algorithm" button — full width, neon-green accent

Controls only change the pending parameters; nothing filters until Update Algorithm is pressed.

## Main view — live opportunity feed

Dense monospace table with columns: Viability Score (0–100 colored badge), Source, NSN / Part Number, Nomenclature, Est. Value, Est. Margin %, Incumbent OEM, Closing Date.

- Row click expands an inline detail row: full tender description, delivery terms, quantity, and a small historical pricing table (last 4 awards: date, unit price, awarded vendor) plus a price trend line.
- Clicking Update Algorithm shows skeleton rows for 1 second, then renders the filtered set.
- Header strip above the table shows result count and active filter summary; empty state when filters exclude everything.

## Top right — connection status

Three labelled indicator dots (NSPA XML Feed, SAM.gov REST API, WebFLIS Price Database) — green pulsing when connected, red when offline. Status is mock/local and tied to the corresponding source switch where applicable.

## Mock data

~18 realistic records across aerospace valves (hydraulic shutoff, poppet, bleed air), brake plates/discs (rotor segments, wheel brake assemblies) and thermostatic regulators, with plausible NSNs, part numbers, OEMs (Meggitt, Parker Hannifin, Safran, Honeywell, Eaton, Collins Aerospace), values, margins and closing dates.

## Technical notes

- New route file `src/routes/engine.tsx` with its own `head()` metadata.
- Shadcn Slider, Switch, Table, Badge, Skeleton, Button, Input — all already in the project.
- Mock dataset + filter logic in `src/lib/engine-data.ts`; panel and feed split into components under `src/components/engine/`.
- Terminal palette added as tokens in `src/styles.css` (zinc/slate surfaces, neon green + amber accents) rather than hardcoded colors; JetBrains Mono is already loaded for the data grid.
- Client-side state only — no backend, no auth, no persistence.
