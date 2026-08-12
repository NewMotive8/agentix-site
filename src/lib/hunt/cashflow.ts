import type { Opportunity } from "@/lib/hunter-data";
import type { CashClass, CashFlow, WorkingCapital } from "./types";

/** Deterministic 0..1 pseudo-random derived from a stable key. */
export function seeded(key: string, salt = ""): number {
  let h = 2166136261;
  const s = `${key}::${salt}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

const GOV_TERMS: { terms: string; days: number }[] = [
  { terms: "Prompt Payment Act — Net 30 after acceptance", days: 30 },
  { terms: "Net 30 after delivery & inspection", days: 30 },
  { terms: "Net 45 (WAWF invoicing)", days: 45 },
  { terms: "Progress payments, 80% on milestones", days: 20 },
];

const SUPPLIER_TERMS: { terms: string; depositPct: number; payDays: number; weight: number }[] = [
  { terms: "Net 90 (distributor open account)", depositPct: 0, payDays: 90, weight: 20 },
  { terms: "Net 60 (open account)", depositPct: 0, payDays: 60, weight: 25 },
  { terms: "Net 30 (open account)", depositPct: 0, payDays: 30, weight: 20 },
  { terms: "30% deposit, balance Net 30", depositPct: 30, payDays: 30, weight: 15 },
  { terms: "50% deposit, balance before shipment", depositPct: 50, payDays: 0, weight: 12 },
  { terms: "100% prepayment (OEM allocation)", depositPct: 100, payDays: 0, weight: 8 },
];

function pickSupplierTerms(seed: number) {
  const total = SUPPLIER_TERMS.reduce((a, t) => a + t.weight, 0);
  let x = seed * total;
  for (const t of SUPPLIER_TERMS) {
    x -= t.weight;
    if (x <= 0) return t;
  }
  return SUPPLIER_TERMS[0];
}

export function estimateCashFlow(opp: Opportunity): CashFlow {
  const gov = GOV_TERMS[Math.floor(seeded(opp.id, "gov") * GOV_TERMS.length)];
  const sup = pickSupplierTerms(seeded(opp.id, "sup"));

  const supplierCost = opp.investigation.waterfall.supplierCost * opp.quantity;
  const leadTimeDays = 30 + Math.round(seeded(opp.id, "lead") * 150);
  const moqUnits =
    seeded(opp.id, "moq") > 0.6 ? Math.max(opp.quantity, Math.ceil(opp.quantity * 1.5)) : opp.quantity;
  const moqOverhang = ((moqUnits - opp.quantity) * supplierCost) / Math.max(opp.quantity, 1);

  // Cash out before the government pays: deposit + any prepaid balance + MOQ overhang.
  const depositCash = (supplierCost * sup.depositPct) / 100;
  // Supplier invoices at shipment; the government pays roughly 15 days after that plus its
  // own terms. Only the portion falling due before that date has to be pre-funded.
  const govPaysAfterShipmentDays = 15 + gov.days;
  const balanceDueBeforeGovPayment =
    sup.payDays < govPaysAfterShipmentDays ? Math.max(0, supplierCost - depositCash) : 0;

  const cashRequired = Math.round(depositCash + balanceDueBeforeGovPayment + moqOverhang);
  const cashGapDays = Math.max(0, govPaysAfterShipmentDays - sup.payDays);
  // 14% annualised working-capital cost.
  const financingCost = Math.round((cashRequired * 0.14 * cashGapDays) / 365);

  const notes: string[] = [];
  if (sup.depositPct > 0) notes.push(`Supplier requires a ${sup.depositPct}% deposit up front.`);
  if (moqUnits > opp.quantity)
    notes.push(`Supplier MOQ is ${moqUnits} units vs ${opp.quantity} on the solicitation.`);
  if (leadTimeDays > 120) notes.push(`Lead time of ${leadTimeDays} days stretches the cash gap.`);
  if (sup.payDays >= govPaysAfterShipmentDays && sup.depositPct === 0)
    notes.push("Supplier terms cover the government payment cycle — little or no pre-funding.");

  return {
    govPaymentTerms: gov.terms,
    govPaymentDays: gov.days,
    supplierPaymentTerms: sup.terms,
    supplierDepositPct: sup.depositPct,
    moqUnits,
    leadTimeDays,
    cashRequired,
    cashGapDays,
    financingCost,
    classification: classify(cashRequired, opp.estValue),
    notes,
  };
}

function classify(cashRequired: number, estValue: number): CashClass {
  if (cashRequired <= Math.max(5000, estValue * 0.02)) return "COMPATIBLE";
  if (cashRequired <= Math.max(200_000, estValue * 0.4)) return "FINANCEABLE";
  return "INCOMPATIBLE";
}

export const CASH_LABEL: Record<CashClass, string> = {
  COMPATIBLE: "🟢 CASH-FLOW COMPATIBLE",
  FINANCEABLE: "🟡 FINANCEABLE",
  INCOMPATIBLE: "🔴 CASH-FLOW INCOMPATIBLE",
};

/** True when the opportunity's cash gap exceeds the working-capital setting for this hunt. */
export function exceedsWorkingCapital(cash: CashFlow, wc: WorkingCapital): boolean {
  if (wc.mode === "ignore" || wc.mode === "unlimited") return false;
  return cash.cashRequired > wc.limit;
}
