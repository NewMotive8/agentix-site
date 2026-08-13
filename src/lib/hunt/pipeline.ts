import {
  opportunities as CORPUS,
  SOURCE_LABELS,
  type HuntParams,
  type Opportunity,
  type SourceKey,
} from "@/lib/hunter-data";
import { noticeKind, scoreOpportunity } from "./score";
import { estimateCashFlow } from "./cashflow";
import { activeCategories, buildQueryPlan, type Coverage } from "./querymatrix";
import { discoverCategoryFn, deepInvestigateFn, estimateOpportunityFn } from "./hunt.functions";
import { scoreLiveSignal } from "./signal";
import type { LiveNotice, SourceStatusReport } from "./sources/types";
import {
  workingCapitalLabel,
  type CategoryProgress,
  type DeepInvestigation,
  type HuntMode,
  type HuntRun,
  type ProcurementFamily,
  type Scored,
  type WorkingCapital,
} from "./types";

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
    const key = (it.categoryLabel ?? it.investigation.platform).split(/[,(]/)[0].trim().toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), it]);
  }
  const families: ProcurementFamily[] = [];
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const id = `fam-${key.replace(/\s+/g, "-")}`;
    const label = (members[0].categoryLabel ?? members[0].investigation.platform)
      .split(/[,(]/)[0]
      .trim()
      .toUpperCase();
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
  return families.sort((a, b) => b.members.length - a.members.length);
}

export type RunInput = {
  params: HuntParams;
  workingCapital: WorkingCapital;
  mode: HuntMode;
  coverage: Coverage;
  lookbackDays?: number;
  /** Abort the hunt cooperatively; whatever was found so far is still reported. */
  signal?: AbortSignal;
  onProgress?: (p: { categories: CategoryProgress[]; stage: number }) => void;
};

const money = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

function coverageStatement(input: RunInput, sources: SourceKey[], discovery: string) {
  const { coverage, workingCapital } = input;
  const universe =
    coverage.mode === "categories"
      ? activeCategories(coverage).map((c) => c.label).join(" · ")
      : `${coverage.mode.toUpperCase()}: ${coverage.terms || "(none entered)"}`;
  return {
    universe,
    sources: sources.map((k) => SOURCE_LABELS[k]).join(" · "),
    discovery,
    rawTarget: coverage.rawTarget,
    workingCapital: workingCapitalLabel(workingCapital),
    deepInvestigations: coverage.deepInvestigations,
  };
}

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
    categories: [],
    deepInvestigations: [],
    coverageStatement: {
      universe: "",
      sources: "",
      discovery: "Web + API where available",
      rawTarget: 100,
      workingCapital: "$0",
      deepInvestigations: 10,
    },
    ...base,
  };
}

export async function runPipeline(input: RunInput): Promise<HuntRun> {
  return input.mode === "demo" ? runDemo(input) : runLive(input);
}

/* ------------------------------------------------------------------ DEMO */

function runDemo(input: RunInput): HuntRun {
  const { params, workingCapital, coverage } = input;
  const sourceKeysUsed = (Object.keys(params.sources) as SourceKey[]).filter((k) => params.sources[k]);
  const queries = buildQueryPlan(coverage, sourceKeysUsed);

  const raw: Opportunity[] = [];
  for (const key of sourceKeysUsed) raw.push(...simulatedCorpus(key));

  const seen = new Set<string>();
  const deduped = raw.filter((o) => {
    const k = canonicalKey(o);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const scored = deduped.map((o) => {
    const s = scoreOpportunity(o, workingCapital, true);
    s.provenance.method = "SIMULATED";
    return s;
  });
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
    coverageStatement: coverageStatement(input, sourceKeysUsed, "SIMULATED — developer demo mode"),
  });
}

/* ------------------------------------------------------------------ LIVE */

const OPEN_CLASSES = new Set(["SOLICITATION", "COMBINED_SYNOPSIS", "UNCLASSIFIED"]);
const SOUGHT_CLASSES = new Set(["SOURCES_SOUGHT", "PRESOLICITATION"]);
const FUTURE_CLASSES = new Set(["SPECIAL_NOTICE", "INTENT_TO_BUNDLE"]);

/** Wraps a live notice as a Scored record without inventing any economics. */
function liveScored(n: LiveNotice): Scored {
  const o = n.opportunity;
  return {
    ...o,
    provenance: {
      status: "LIVE",
      method: n.method,
      sourceUrl: n.sourceUrl,
      retrievedAt: n.retrievedAt,
      evidenceIds: [`${o.source}:${o.solicitation}`],
      rawNoticeType: n.rawNoticeType,
      rawJson: n.rawJson,
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
    categoryId: n.categoryId,
    categoryLabel: n.categoryLabel,
    fieldEvidence: n.evidence,
    verdict: "WATCH",
    verdictReason:
      "Live record. Quantities, prices and supplier data are not published at the discovery layer — run the deep investigation or open the original notice.",
  };
}

async function runLive(input: RunInput): Promise<HuntRun> {
  const { params, workingCapital, coverage, onProgress } = input;
  const stopped = () => input.signal?.aborted === true;
  const sourceKeysUsed = (Object.keys(params.sources) as SourceKey[]).filter((k) => params.sources[k]);
  const cats = activeCategories(coverage);

  const progress: CategoryProgress[] = cats.map((c) => ({
    id: c.id,
    label: c.label,
    queries: 0,
    hits: 0,
    state: "pending",
  }));
  const emit = (stage: number) => onProgress?.({ categories: progress.map((p) => ({ ...p })), stage });
  emit(0);

  const notices: LiveNotice[] = [];
  let queriesRun = 0;
  const errors: string[] = [];
  const apiUsed = new Set<SourceKey>();
  let webConfigured = true;

  // Stage 1 — discover broadly, category by category, until the raw target is met.
  for (let i = 0; i < cats.length; i++) {
    const c = cats[i];
    progress[i].state = "running";
    emit(0);
    try {
      const res = await discoverCategoryFn({
        data: { categoryId: c.id, sources: sourceKeysUsed, coverage },
      });
      queriesRun += res.queriesRun;
      webConfigured = res.webConfigured;
      for (const k of res.apiUsed) apiUsed.add(k);
      for (const e of res.errors) if (errors.length < 5) errors.push(e);
      notices.push(...res.notices);
      progress[i].queries = res.queriesRun;
      progress[i].hits = res.notices.length;
    } catch (err) {
      if (errors.length < 5) errors.push(err instanceof Error ? err.message : "discovery failed");
    }
    progress[i].state = "done";
    emit(0);
    if (stopped() || notices.length >= coverage.rawTarget) {
      for (let j = i + 1; j < cats.length; j++) progress[j].state = "done";
      break;
    }
  }

  // Stage 2 — normalise and de-duplicate.
  emit(1);
  const seenUrl = new Set<string>();
  const seenKey = new Set<string>();
  const deduped = notices.filter((n) => {
    const k = canonicalKey(n.opportunity);
    if (seenUrl.has(n.sourceUrl) || seenKey.has(k)) return false;
    seenUrl.add(n.sourceUrl);
    seenKey.add(k);
    return true;
  });

  // Stage 3 — classify and filter.
  emit(2);
  const scored = deduped.map(liveScored);
  const cls = (s: Scored) => String(s.liveNoticeClass ?? "UNCLASSIFIED");
  const qualified = scored.filter((s) => OPEN_CLASSES.has(cls(s)));
  const sourcesSought = scored.filter((s) => SOUGHT_CLASSES.has(cls(s)));
  const futureSignals = scored.filter((s) => FUTURE_CLASSES.has(cls(s)));
  const rejected = scored
    .filter((s) => !OPEN_CLASSES.has(cls(s)) && !SOUGHT_CLASSES.has(cls(s)) && !FUTURE_CLASSES.has(cls(s)))
    .map((opp) => ({ opp, reason: `Notice type reported by source: ${opp.provenance.rawNoticeType ?? "unknown"}` }))
    .slice(0, 20);

  const families = buildFamilies(qualified);

  // Stage 4 — deep investigation of the strongest opportunities.
  emit(3);
  const deepInvestigations: DeepInvestigation[] = [];
  // Provisional signal ordering (no research yet) so the best notices are researched first.
  for (const s of qualified) s.signal = scoreLiveSignal(s);
  qualified.sort((a, b) => (b.signal?.score ?? 0) - (a.signal?.score ?? 0));
  const targets = qualified.slice(0, Math.max(0, coverage.deepInvestigations));
  for (const t of targets) {
    if (stopped()) break;
    try {
      const res = await deepInvestigateFn({
        data: {
          opportunityId: t.id,
          title: t.product,
          url: t.provenance.sourceUrl,
          solicitation: t.solicitation,
          sourceLabel: t.sourceLabel,
        },
      });
      if (!res) continue;
      deepInvestigations.push(res);
      t.deep = res;
      if (res.summary?.length > 0) t.aiSummary = res.summary.join(" ");
      if (res.complianceFlags?.length > 0) {
        t.constraints = res.complianceFlags.map((label) => ({
          label,
          state: "watch" as const,
          evidence: `Extracted from the official notice page (${t.provenance.sourceUrl}), retrieved ${res.ranAt.slice(0, 10)}.`,
        }));
      }
      t.signal = scoreLiveSignal(t, res);
      try {
        t.estimates = await estimateOpportunityFn({
          data: {
            title: t.product,
            buyer: t.agency,
            categoryLabel: t.categoryLabel ?? "",
            solicitation: t.solicitation,
            noticeSummary: [t.aiSummary, ...(res.requirements ?? [])].join(" ").slice(0, 5000),
            supplierCount: res.suppliers?.length ?? 0,
          },
        });
      } catch {
        /* an estimate failure never invents data */
      }
    } catch {
      /* an investigation failure never invents data */
    }
    emit(3);
  }

  qualified.sort((a, b) => (b.signal?.score ?? 0) - (a.signal?.score ?? 0));

  // Stage 5 — report.
  emit(4);
  const statuses: SourceStatusReport[] = sourceKeysUsed.map((k) => {
    const count = deduped.filter((n) => n.opportunity.source === k).length;
    const method = apiUsed.has(k) ? "API + WEB" : "WEB";
    return {
      key: k,
      label: SOURCE_LABELS[k],
      state: !webConfigured && !apiUsed.has(k) ? "NOT_CONFIGURED" : count > 0 ? "LIVE" : "ERROR",
      detail: !webConfigured
        ? "LIVE ACCESS NOT CONFIGURED — web research connector unavailable"
        : count > 0
          ? `LIVE — ${method} discovery, ${count} records`
          : "Connected, but no records matched this run's queries",
      count,
    };
  });

  const catsSearched = progress.filter((p) => p.queries > 0);
  const summary = [
    `Coverage: ${catsSearched.length} categories searched · ${queriesRun} queries executed · ${notices.length} raw candidates · ${deduped.length} after de-duplication.`,
    catsSearched.length > 0
      ? `Per category — ${catsSearched.map((p) => `${p.label}: ${p.queries} queries, ${p.hits} hits`).join(" · ")}.`
      : "No category returned any candidate.",
    `Discovery method: ${apiUsed.size > 0 ? "structured API where credentials exist, public official web pages elsewhere" : "public official web pages (no procurement API credentials configured)"}. Simulated records are never used in LIVE MODE.`,
    `${qualified.length} open/unclassified notices · ${sourcesSought.length} sources sought or presolicitation · ${futureSignals.length} future signals.`,
    `${deepInvestigations.length} deep investigations completed; ${deepInvestigations.reduce((a, d) => a + d.suppliers.length, 0)} supplier candidates identified from public commercial sources (not government-confirmed).`,
    `Working-capital limit for this hunt: ${workingCapitalLabel(workingCapital)} — applied after discovery, never before it.`,
    errors.length > 0 ? `Retrieval issues: ${errors.join(" · ")}` : "No retrieval errors.",
  ];
  if (stopped()) summary.unshift("Hunt stopped by the operator — these are partial results from the work completed before the stop.");

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
    families,
    sourcesSought,
    futureSignals,
    sourceKeysUsed,
    top3: qualified.slice(0, 3),
    summary,
    categories: progress,
    deepInvestigations,
    cancelled: stopped(),
    coverageStatement: coverageStatement(
      input,
      sourceKeysUsed,
      apiUsed.size > 0 ? "Web + API where available" : "Web (official procurement domains)",
    ),
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
  { key: "discover", label: "1 · Discovering broadly", detail: "Category x source x terminology query matrix" },
  { key: "normalize", label: "2 · Collecting & normalising", detail: "Provenance, de-duplication, canonical keys" },
  { key: "analyze", label: "3 · Analysing & filtering", detail: "Notice classification and strategy filters" },
  { key: "deep", label: "4 · Deep investigation", detail: "Notice documents, requirements, supplier research" },
  { key: "report", label: "5 · Procurement Watch", detail: "U.S. / NATO report with auditable coverage" },
];
