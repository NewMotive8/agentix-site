import type { Opportunity, SourceKey } from "@/lib/hunter-data";
import type { SourceStatusReport } from "./sources/types";

export type { SourceStatusReport };

export type SourceStatus = "LIVE" | "HISTORICAL" | "SIMULATED" | "ESTIMATE";

export type HuntMode = "demo" | "live";

export type CashClass = "COMPATIBLE" | "FINANCEABLE" | "INCOMPATIBLE";

export type WorkingCapitalMode = "limit" | "unlimited" | "ignore";

export type WorkingCapital = {
  mode: WorkingCapitalMode;
  /** Maximum acceptable cash gap in USD when mode === "limit". */
  limit: number;
};

export const WORKING_CAPITAL_PRESETS: { label: string; limit: number }[] = [
  { label: "$0", limit: 0 },
  { label: "$25K", limit: 25_000 },
  { label: "$50K", limit: 50_000 },
  { label: "$100K", limit: 100_000 },
  { label: "$250K", limit: 250_000 },
  { label: "$500K", limit: 500_000 },
];

export const defaultWorkingCapital: WorkingCapital = { mode: "limit", limit: 0 };

export function workingCapitalLabel(wc: WorkingCapital): string {
  if (wc.mode === "ignore") return "Working-capital constraint ignored";
  if (wc.mode === "unlimited") return "Unlimited";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(wc.limit);
}

export type CashFlow = {
  govPaymentTerms: string;
  govPaymentDays: number;
  supplierPaymentTerms: string;
  supplierDepositPct: number;
  moqUnits: number;
  leadTimeDays: number;
  /** USD that must leave the company before the government pays. */
  cashRequired: number;
  cashGapDays: number;
  financingCost: number;
  classification: CashClass;
  notes: string[];
};

export type Provenance = {
  status: SourceStatus;
  sourceUrl: string;
  retrievedAt: string;
  evidenceIds: string[];
  /** Notice type exactly as the source reported it (live records only). */
  rawNoticeType?: string;
  /** Untouched source payload, kept for auditing live records. */
  raw?: Record<string, unknown>;
};

export type Constraint = {
  label: string;
  state: "required" | "clear" | "watch" | "blocking";
  evidence: string;
};

export type Scored = Opportunity & {
  provenance: Provenance;
  cash: CashFlow;
  opportunityScore: number;
  executionScore: number;
  theoreticalMarginPct: number;
  executableMarginPct: number;
  executableGrossProfit: number;
  constraints: Constraint[];
  repeatDemandScore: number;
  familyId: string | null;
  familyLabel: string | null;
  capitalConstrained: boolean;
  verdict: "INVESTIGATE" | "WATCH" | "REJECT";
  verdictReason: string;
};

export type HuntStage = {
  key: string;
  label: string;
  detail: string;
};

export type ProcurementFamily = {
  id: string;
  label: string;
  members: Scored[];
  aggregateValue: number;
  buyers: string[];
};

export type HuntRun = {
  id: string;
  ranAt: string;
  mode: HuntMode;
  isDemo: boolean;
  /** Per-source connectivity for this run. */
  sourceStatuses: SourceStatusReport[];
  /** A report may only call itself LIVE PROCUREMENT DATA when liveClean is true. */
  integrity: { liveClean: boolean; reason?: string };
  workingCapital: WorkingCapital;
  queriesRun: number;
  rawCandidates: number;
  afterDedupe: number;
  qualified: Scored[];
  capitalConstrained: Scored[];
  rejected: { opp: Scored; reason: string }[];
  families: ProcurementFamily[];
  sourcesSought: Scored[];
  futureSignals: Scored[];
  sourceKeysUsed: SourceKey[];
  top3: Scored[];
  summary: string[];
};
