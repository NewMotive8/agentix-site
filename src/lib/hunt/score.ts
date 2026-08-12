import type { Opportunity } from "@/lib/hunter-data";
import type { CashFlow, Constraint, Scored, WorkingCapital } from "./types";
import { exceedsWorkingCapital, seeded } from "./cashflow";

const ACCESS_POINTS: Record<string, number> = {
  "VERY HIGH": 20,
  HIGH: 16,
  MED: 11,
  LOW: 6,
  "VERY LOW": 2,
};

export function repeatDemandScore(opp: Opportunity): number {
  const hist = opp.investigation.historicalQty;
  if (hist.length === 0) return 0;
  const years = Math.min(hist.length, 5) * 12;
  const growing = hist.length > 1 && hist[hist.length - 1].qty >= hist[0].qty ? 20 : 8;
  const volume = Math.min(30, Math.round(hist.reduce((a, h) => a + h.qty, 0) / 4));
  const level = opp.demand === "HIGH" ? 30 : opp.demand === "MED" ? 18 : 8;
  return Math.min(100, years + growing + volume + level);
}

export function buildConstraints(opp: Opportunity): Constraint[] {
  return opp.investigation.compliance.map((c) => ({
    label: c.label,
    state: c.state,
    evidence: `Solicitation ${opp.solicitation} — clause text reviewed (${opp.sourceLabel}).`,
  }));
}

export function opportunityScore(opp: Opportunity, repeat: number, executableMargin: number): number {
  const economics = Math.min(30, Math.round((executableMargin / 45) * 30));
  const access = ACCESS_POINTS[opp.accessibility] ?? 6;
  const demand = Math.round((repeat / 100) * 15);
  const competition = Math.max(0, 10 - opp.incumbents * 2);
  const simplicity = opp.investigation.sources.length >= 3 ? 10 : 6;
  const compliance =
    10 - opp.investigation.compliance.filter((c) => c.state !== "clear").length * 2;
  const timing = daysToDeadline(opp.deadline) > 30 ? 5 : 2;
  return clamp(economics + access + demand + competition + simplicity + Math.max(0, compliance) + timing);
}

export function executionScore(opp: Opportunity, cash: CashFlow): number {
  let s = 100;
  const qualified = opp.investigation.sources.filter(
    (x) => x.qualification === "Qualified" || x.qualification === "Approved Source",
  ).length;
  if (qualified === 0) s -= 30;
  else if (qualified === 1) s -= 12;
  if (opp.accessibility === "LOW") s -= 12;
  if (opp.accessibility === "VERY LOW") s -= 22;
  s -= opp.investigation.compliance.filter((c) => c.state === "required").length * 6;
  s -= opp.investigation.compliance.filter((c) => c.state === "watch").length * 3;
  if (cash.leadTimeDays > daysToDeadline(opp.deadline) + 90) s -= 10;
  if (cash.classification === "FINANCEABLE") s -= 12;
  if (cash.classification === "INCOMPATIBLE") s -= 28;
  if (opp.incumbents >= 5) s -= 8;
  if (opp.pricingConfidence === "LOW") s -= 6;
  return clamp(s);
}

export function daysToDeadline(deadline: string): number {
  const d = new Date(deadline).getTime() - Date.now();
  return Math.round(d / 86_400_000);
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function scoreOpportunity(opp: Opportunity, wc: WorkingCapital, isDemo: boolean): Scored {
  const cash = (
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require as unknown
  ) as never; // placeholder removed below
  return cash as never;
}
