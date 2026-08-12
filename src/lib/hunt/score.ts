import type { Opportunity } from "@/lib/hunter-data";
import type { CashFlow, Constraint, Scored, WorkingCapital } from "./types";
import { estimateCashFlow, exceedsWorkingCapital, seeded } from "./cashflow";

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
  const cash = estimateCashFlow(opp);
  const repeat = repeatDemandScore(opp);
  const w = opp.investigation.waterfall;
  const unitCost = w.supplierCost + w.freight + w.inspCert;
  const theoreticalMarginPct = Math.round(((w.govPrice - unitCost) / w.govPrice) * 100);
  const grossProfit = (w.govPrice - unitCost) * opp.quantity;
  const executableGrossProfit = Math.round(grossProfit - cash.financingCost);
  const executableMarginPct = Math.max(
    0,
    Math.round((executableGrossProfit / (w.govPrice * opp.quantity)) * 100),
  );
  const constraints = buildConstraints(opp);
  const oScore = opportunityScore(opp, repeat, executableMarginPct);
  const eScore = executionScore(opp, cash);
  const capitalConstrained = exceedsWorkingCapital(cash, wc);

  let verdict: Scored["verdict"] = "WATCH";
  let verdictReason = "";
  if (capitalConstrained) {
    verdict = "WATCH";
    verdictReason = `Needs ${money(cash.cashRequired)} of cash before the government pays — above the working-capital limit for this hunt.`;
  } else if (oScore >= 70 && eScore >= 65) {
    verdict = "INVESTIGATE";
    verdictReason = "Attractive economics and a realistic path to win and deliver.";
  } else if (oScore < 45 || eScore < 40) {
    verdict = "REJECT";
    verdictReason =
      eScore < 40
        ? "Execution barriers (sources, qualification or compliance) make this impractical right now."
        : "Economics are too weak to justify the effort.";
  } else {
    verdictReason =
      oScore >= 70
        ? "Attractive, but execution capacity is the limiting factor."
        : "Worth monitoring; neither economics nor execution are compelling yet.";
  }

  return {
    ...opp,
    score: oScore,
    provenance: {
      status: isDemo ? "SIMULATED" : "LIVE",
      sourceUrl: sourceUrlFor(opp),
      retrievedAt: new Date().toISOString(),
      evidenceIds: [`${opp.source}:${opp.solicitation}`],
    },
    cash,
    opportunityScore: oScore,
    executionScore: eScore,
    theoreticalMarginPct,
    executableMarginPct,
    executableGrossProfit,
    constraints,
    repeatDemandScore: repeat,
    familyId: null,
    familyLabel: null,
    capitalConstrained,
    verdict,
    verdictReason,
  };
}

export function noticeKind(opp: Opportunity): "ACTIVE" | "SOURCES_SOUGHT" | "FUTURE" {
  const r = seeded(opp.id, "kind");
  if (r > 0.82) return "SOURCES_SOUGHT";
  if (r > 0.7) return "FUTURE";
  return "ACTIVE";
}

function sourceUrlFor(opp: Opportunity): string {
  switch (opp.source) {
    case "sam":
      return `https://sam.gov/search/?keywords=${encodeURIComponent(opp.solicitation)}`;
    case "dibbs":
      return `https://www.dibbs.bsm.dla.mil/RFQ/RFQNsn.aspx?value=${encodeURIComponent(opp.nsn)}`;
    case "nspa":
      return "https://eportal.nspa.nato.int/";
    default:
      return "https://www.ncia.nato.int/business/opportunities.html";
  }
}

function money(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}
