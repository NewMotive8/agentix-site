import {
  opportunities as CORPUS,
  SOURCE_LABELS,
  type HuntParams,
  type Opportunity,
  type SourceKey,
} from "@/lib/hunter-data";
import { noticeKind, scoreOpportunity } from "./score";
import { workingCapitalLabel, type HuntRun, type ProcurementFamily, type Scored, type WorkingCapital } from "./types";

/** Strategy x terminology x FSC query matrix. Simulated adapters echo the corpus, but the
 *  matrix size is real and reported, so a broad search is visible in the progress panel. */
const PROCUREMENT_TERMS = ["solicitation", "RFQ", "RFP", "sources sought", "presolicitation"];
const PRODUCT_TERMS = ["spare parts", "component", "assembly", "overhaul kit", "repair parts"];

export function buildQueryMatrix(params: HuntParams): string[] {
  const fsc = params.fscCodes.length > 0 ? params.fscCodes : ["*"];
  const out: string[] = [];
  for (const p of PROCUREMENT_TERMS)
    for (const t of PRODUCT_TERMS) for (const f of fsc) out.push(`${p} "${t}" FSC:${f}`);
  return out;
}

export type AdapterResult = { source: SourceKey; notices: Opportunity[]; pages: number };

/** Simulated adapter — same interface a live fetcher will implement. */
export function searchAdapter(source: SourceKey, pageSize = 8): AdapterResult {
  const notices = CORPUS.filter((o) => o.source === source);
  return { source, notices, pages: Math.max(1, Math.ceil(notices.length / pageSize)) };
}

function canonicalKey(o: Opportunity): string {
  return [o.solicitation, o.source, o.nsn || o.partNumber, o.agency]
    .join("|")
    .toLowerCase()
    .replace(/[^a-z0-9|]/g, "");
}

function buildFamilies(items: Scored[]): ProcurementFamily[] {
  const groups = new Map<string, Scored[]>();
  for (const it of items) {
    const key = it.investigation.platform.split(/[,(]/)[0].trim().toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), it]);
  }
  const families: ProcurementFamily[] = [];
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const id = `fam-${key.replace(/\s+/g, "-")}`;
    const label = members[0].investigation.platform.split(/[,(]/)[0].trim().toUpperCase();
    for (const m of members) {
      m.familyId = id;
      m.familyLabel = label;
    }
    families.push({
      id,
      label,
      members,
      aggregateValue: members.reduce((a, m) => a + m.estValue, 0),
      buyers: Array.from(new Set(members.map((m) => m.agency))),
    });
  }
  return families.sort((a, b) => b.aggregateValue - a.aggregateValue);
}

export type RunInput = { params: HuntParams; workingCapital: WorkingCapital; demoMode: boolean };

export function runPipeline({ params, workingCapital, demoMode }: RunInput): HuntRun {
  const queries = buildQueryMatrix(params);
  const sourceKeysUsed = (Object.keys(params.sources) as SourceKey[]).filter((k) => params.sources[k]);

  // 1-2. Search + paginate
  const raw: Opportunity[] = [];
  for (const key of sourceKeysUsed) raw.push(...searchAdapter(key).notices);

  // 3. Dedupe
  const seen = new Set<string>();
  const deduped = raw.filter((o) => {
    const k = canonicalKey(o);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // 4-7. Enrich + score (both scores, cash-flow gate applied inside)
  const scored = deduped.map((o) => scoreOpportunity(o, workingCapital, demoMode));

  const qualified: Scored[] = [];
  const capitalConstrained: Scored[] = [];
  const rejected: { opp: Scored; reason: string }[] = [];

  for (const s of scored) {
    if (s.executableMarginPct < params.minMargin) {
      rejected.push({ opp: s, reason: `Executable margin ${s.executableMarginPct}% below ${params.minMargin}%` });
      continue;
    }
    if (s.estValue < params.minValue) {
      rejected.push({ opp: s, reason: "Contract value below your minimum" });
      continue;
    }
    if (s.incumbents > params.maxIncumbents) {
      rejected.push({ opp: s, reason: `${s.incumbents} incumbents — above your limit` });
      continue;
    }
    if (params.fscCodes.length > 0 && !params.fscCodes.includes(s.fsc)) {
      rejected.push({ opp: s, reason: `FSC ${s.fsc} not in your list` });
      continue;
    }
    if (s.capitalConstrained) {
      capitalConstrained.push(s);
      continue;
    }
    qualified.push(s);
  }

  const byScore = (a: Scored, b: Scored) =>
    b.opportunityScore + b.executionScore - (a.opportunityScore + a.executionScore);
  qualified.sort(byScore);
  capitalConstrained.sort(byScore);

  const families = buildFamilies([...qualified, ...capitalConstrained]);
  const sourcesSought = qualified.filter((o) => noticeKind(o) === "SOURCES_SOUGHT");
  const futureSignals = qualified.filter((o) => noticeKind(o) === "FUTURE");
  const active = qualified.filter((o) => noticeKind(o) === "ACTIVE");
  const top3 = active.slice(0, 3);

  const summary = [
    `${scored.length} notices screened from ${sourceKeysUsed.map((k) => SOURCE_LABELS[k]).join(", ")} across ${queries.length} queries.`,
    `${qualified.length} opportunities passed every constraint; ${capitalConstrained.length} were set aside as CAPITAL CONSTRAINED.`,
    `Working-capital limit for this hunt: ${workingCapitalLabel(workingCapital)}.`,
    families.length > 0
      ? `${families.length} procurement families detected — largest is ${families[0].label} at ${money(families[0].aggregateValue)} aggregate value.`
      : "No multi-notice procurement families detected in this run.",
    `${qualified.filter((o) => o.repeatDemandScore >= 60).length} opportunities show strong repeat demand across three or more fiscal years.`,
  ];

  return {
    id: `run-${Date.now()}`,
    ranAt: new Date().toISOString(),
    isDemo: demoMode,
    workingCapital,
    queriesRun: queries.length,
    rawCandidates: raw.length,
    afterDedupe: deduped.length,
    qualified,
    capitalConstrained,
    rejected: rejected.sort((a, b) => b.opp.opportunityScore - a.opp.opportunityScore).slice(0, 12),
    families,
    sourcesSought,
    futureSignals,
    sourceKeysUsed,
    top3,
    summary,
  };
}

export const PIPELINE_STAGES = [
  { key: "search", label: "Searching sources", detail: "Running the query matrix with pagination" },
  { key: "dedupe", label: "Normalising & de-duplicating", detail: "Canonical key per notice" },
  { key: "enrich", label: "Enriching historical demand", detail: "Prior awards, quantities, unit prices" },
  { key: "family", label: "Detecting procurement families", detail: "Grouping by platform and program" },
  { key: "cash", label: "Applying the cash-flow gate", detail: "Payment timing, deposits, MOQ, lead time" },
  { key: "score", label: "Scoring", detail: "Opportunity Score and Commercial Execution Score" },
  { key: "report", label: "Generating Procurement Watch", detail: "Ranking and writing the report" },
];

function money(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}
