import {
  opportunities as CORPUS,
  SOURCE_LABELS,
  type HuntParams,
  type Opportunity,
  type SourceKey,
} from "@/lib/hunter-data";
import { noticeKind, scoreOpportunity } from "./score";
import { estimateCashFlow } from "./cashflow";
import { runLiveAdapter, toStatusReport } from "./sources/registry";
import type { AdapterResult, LiveNotice, SourceStatusReport } from "./sources/types";
import {
  workingCapitalLabel,
  type HuntMode,
  type HuntRun,
  type ProcurementFamily,
  type Scored,
  type WorkingCapital,
} from "./types";

/** Strategy x terminology x FSC query matrix (demo mode only). */
const PROCUREMENT_TERMS = ["solicitation", "RFQ", "RFP", "sources sought", "presolicitation"];
const PRODUCT_TERMS = ["spare parts", "component", "assembly", "overhaul kit", "repair parts"];

export function buildQueryMatrix(params: HuntParams): string[] {
  const fsc = params.fscCodes.length > 0 ? params.fscCodes : ["*"];
  const out: string[] = [];
  for (const p of PROCUREMENT_TERMS)
    for (const t of PRODUCT_TERMS) for (const f of fsc) out.push(`${p} "${t}" FSC:${f}`);
  return out;
}

/** Simulated corpus reader — DEMO MODE ONLY. Never called from the live path. */
export function simulatedCorpus(source: SourceKey): Opportunity[] {
  return CORPUS.filter((o) => o.source === source);
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

export type RunInput = {
  params: HuntParams;
  workingCapital: WorkingCapital;
  mode: HuntMode;
  lookbackDays?: number;
};

const money = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

function emptyRun(base: Partial<HuntRun>): HuntRun {
  return {
    id: `run-${Date.now()}`,
    ranAt: new Date().toISOString(),
    mode: "live",
    isDemo: false,
    sourceStatuses: [],
    integrity: { liveClean: true },
    workingCapital: { mode: "limit", limit: 0 },
    queriesRun: 0,
    rawCandidates: 0,
    afterDedupe: 0,
    qualified: [],
    capitalConstrained: [],
    rejected: [],
    families: [],
    sourcesSought: [],
    futureSignals: [],
    sourceKeysUsed: [],
    top3: [],
    summary: [],
    ...base,
  };
}

export async function runPipeline(input: RunInput): Promise<HuntRun> {
  return input.mode === "demo" ? runDemo(input) : runLive(input);
}

/* ------------------------------------------------------------------ DEMO */

function runDemo({ params, workingCapital }: RunInput): HuntRun {
  const queries = buildQueryMatrix(params);
  const sourceKeysUsed = (Object.keys(params.sources) as SourceKey[]).filter((k) => params.sources[k]);

  const raw: Opportunity[] = [];
  for (const key of sourceKeysUsed) raw.push(...simulatedCorpus(key));

  const seen = new Set<string>();
  const deduped = raw.filter((o) => {
    const k = canonicalKey(o);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const scored = deduped.map((o) => scoreOpportunity(o, workingCapital, true));
  const { qualified, capitalConstrained, rejected } = applyConstraints(scored, params);

  const families = buildFamilies([...qualified, ...capitalConstrained]);
  const sourcesSought = qualified.filter((o) => noticeKind(o) === "SOURCES_SOUGHT");
  const futureSignals = qualified.filter((o) => noticeKind(o) === "FUTURE");
  const active = qualified.filter((o) => noticeKind(o) === "ACTIVE");

  const summary = [
    `Simulated corpus replayed for ${sourceKeysUsed.map((k) => SOURCE_LABELS[k]).join(", ")}. Nothing here was searched live.`,
    `${scored.length} simulated notices screened; ${qualified.length} passed every constraint, ${capitalConstrained.length} tagged CAPITAL CONSTRAINED.`,
    `Working-capital limit for this hunt: ${workingCapitalLabel(workingCapital)}.`,
    families.length > 0
      ? `${families.length} procurement families detected — largest is ${families[0].label} at ${money(families[0].aggregateValue)} aggregate value.`
      : "No multi-notice procurement families detected in this run.",
  ];

  return emptyRun({
    mode: "demo",
    isDemo: true,
    sourceStatuses: sourceKeysUsed.map((k) => ({
      key: k,
      label: SOURCE_LABELS[k],
      state: "NOT_CONFIGURED" as const,
      detail: "DEMO — simulated corpus, no live connection used",
      count: simulatedCorpus(k).length,
    })),
    integrity: { liveClean: false, reason: "Demo mode — every record is simulated." },
    workingCapital,
    queriesRun: queries.length,
    rawCandidates: raw.length,
    afterDedupe: deduped.length,
    qualified,
    capitalConstrained,
    rejected,
    families,
    sourcesSought,
    futureSignals,
    sourceKeysUsed,
    top3: active.slice(0, 3),
    summary,
  });
}

/* ------------------------------------------------------------------ LIVE */

const OPEN_CLASSES = new Set(["SOLICITATION", "COMBINED_SYNOPSIS"]);
const SOUGHT_CLASSES = new Set(["SOURCES_SOUGHT", "PRESOLICITATION"]);
const FUTURE_CLASSES = new Set(["SPECIAL_NOTICE", "INTENT_TO_BUNDLE"]);

/** Wraps a live notice as a Scored record without inventing any economics. */
function liveScored(n: LiveNotice): Scored {
  const o = n.opportunity;
  return {
    ...o,
    provenance: {
      status: "LIVE",
      sourceUrl: n.sourceUrl,
      retrievedAt: n.retrievedAt,
      evidenceIds: [`${o.source}:${o.solicitation}`],
      rawNoticeType: n.rawNoticeType,
      raw: n.raw,
    },
    cash: estimateCashFlow(o),
    opportunityScore: 0,
    executionScore: 0,
    theoreticalMarginPct: 0,
    executableMarginPct: 0,
    executableGrossProfit: 0,
    constraints: [],
    repeatDemandScore: 0,
    familyId: null,
    familyLabel: null,
    capitalConstrained: false,
    analysisAvailable: false,
    verdict: "WATCH",
    verdictReason:
      "Live notice. Economics, quantities and supplier data are not published by this source, so no score is calculated — open the original notice to evaluate.",
  };
}

async function runLive({ params, workingCapital, lookbackDays = 90 }: RunInput): Promise<HuntRun> {
  const sourceKeysUsed = (Object.keys(params.sources) as SourceKey[]).filter((k) => params.sources[k]);

  const results: AdapterResult[] = await Promise.all(
    sourceKeysUsed.map((k) =>
      runLiveAdapter(k, { keywords: [], fscCodes: params.fscCodes, lookbackDays }),
    ),
  );

  const statuses: SourceStatusReport[] = results.map(toStatusReport);
  const notices = results.flatMap((r) => r.notices);
  const queriesRun = results.reduce((a, r) => a + r.queriesRun, 0);

  const seen = new Set<string>();
  const deduped = notices.filter((n) => {
    const k = canonicalKey(n.opportunity);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const scored = deduped.map((n) => liveScored(n));

  const qualified = scored.filter((s) => OPEN_CLASSES.has(String(s.liveNoticeClass)) || s.liveNoticeClass === undefined);
  const sourcesSought = scored.filter((s) => SOUGHT_CLASSES.has(String(s.liveNoticeClass)));
  const futureSignals = scored.filter((s) => FUTURE_CLASSES.has(String(s.liveNoticeClass)));
  const rejected = scored
    .filter((s) => !qualified.includes(s) && !sourcesSought.includes(s) && !futureSignals.includes(s))
    .map((opp) => ({
      opp,
      reason: `Notice type reported by source: ${opp.provenance.rawNoticeType ?? "unknown"}`,
    }))
    .slice(0, 20);

  const live = statuses.filter((s) => s.state === "LIVE");
  const offline = statuses.filter((s) => s.state !== "LIVE");

  const summary = [
    live.length > 0
      ? `Live retrieval from ${live.map((s) => s.label).join(", ")} — ${notices.length} notices returned across ${queriesRun} API calls.`
      : "No source returned live data for this hunt.",
    offline.length > 0
      ? `Not searched: ${offline.map((s) => `${s.label} (${s.detail})`).join(" · ")}`
      : "All selected sources are connected.",
    `${qualified.length} open solicitations · ${sourcesSought.length} sources sought / presolicitations · ${futureSignals.length} special notices.`,
    "Notice types come from each record's own type field. Quantities, NSNs, prices and supplier data are not published by these APIs and are shown as NOT AVAILABLE rather than estimated.",
    `Working-capital limit for this hunt: ${workingCapitalLabel(workingCapital)}.`,
  ];

  return emptyRun({
    mode: "live",
    isDemo: false,
    sourceStatuses: statuses,
    integrity: scored.every((s) => s.provenance.status === "LIVE")
      ? { liveClean: true }
      : { liveClean: false, reason: "A non-live record was present in the result set." },
    workingCapital,
    queriesRun,
    rawCandidates: notices.length,
    afterDedupe: deduped.length,
    qualified,
    capitalConstrained: [],
    rejected,
    families: [],
    sourcesSought,
    futureSignals,
    sourceKeysUsed,
    top3: [],
    summary,
  });
}

function applyConstraints(scored: Scored[], params: HuntParams) {
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

  return {
    qualified,
    capitalConstrained,
    rejected: rejected.sort((a, b) => b.opp.opportunityScore - a.opp.opportunityScore).slice(0, 12),
  };
}

export const PIPELINE_STAGES = [
  { key: "search", label: "Searching sources", detail: "Querying each connected source" },
  { key: "dedupe", label: "Normalising & de-duplicating", detail: "Canonical key per notice" },
  { key: "classify", label: "Classifying notices", detail: "From each record's own type field" },
  { key: "enrich", label: "Enriching historical demand", detail: "Prior awards, quantities, unit prices" },
  { key: "cash", label: "Applying the cash-flow gate", detail: "Payment timing, deposits, MOQ, lead time" },
  { key: "score", label: "Scoring", detail: "Opportunity Score and Commercial Execution Score" },
  { key: "report", label: "Generating Procurement Watch", detail: "Ranking and writing the report" },
];
