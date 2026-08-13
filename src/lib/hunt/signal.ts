/**
 * Signal score — built ONLY from facts the source actually published.
 * No prices, margins or suppliers are invented here. Estimates live in a
 * separate, clearly-labelled structure (see estimate.server.ts).
 */
import type { DeepInvestigation, Scored, SignalScore } from "./types";

function daysUntil(deadline: string): number | null {
  if (!deadline) return null;
  const t = Date.parse(deadline);
  if (Number.isNaN(t)) return null;
  return Math.round((t - Date.now()) / 86_400_000);
}

const OPEN = new Set(["SOLICITATION", "COMBINED_SYNOPSIS"]);

export function scoreLiveSignal(o: Scored, deep?: DeepInvestigation): SignalScore {
  const reasons: string[] = [];
  let score = 20;

  const cls = String(o.liveNoticeClass ?? "UNCLASSIFIED");
  if (OPEN.has(cls)) {
    score += 30;
    reasons.push("Open for bidding right now — the buyer is asking for quotes, not testing the market.");
  } else if (cls === "UNCLASSIFIED") {
    score += 12;
    reasons.push("The page does not state where this sits in the buying cycle — worth one click to confirm.");
  } else {
    score += 5;
    reasons.push("Early-stage notice: useful for positioning, not yet a bid.");
  }

  const d = daysUntil(o.deadline);
  if (d === null) {
    reasons.push("No closing date published — check the original notice before you spend time on it.");
  } else if (d < 0) {
    score -= 10;
    reasons.push("The published closing date has passed.");
  } else if (d < 7) {
    score += 6;
    reasons.push(`Closes in ${d} day${d === 1 ? "" : "s"} — only worth it if you can quote immediately.`);
  } else if (d <= 60) {
    score += 18;
    reasons.push(`${d} days to respond — enough time to price it properly and line up a supplier.`);
  } else {
    score += 10;
    reasons.push(`Closes in ${d} days — plenty of runway to prepare.`);
  }

  const ids = [o.nsn, o.partNumber, o.fsc].filter(Boolean).length;
  if (ids > 0) {
    score += Math.min(15, ids * 7);
    reasons.push("The item is identified by an official part or class code, so it can be priced against real supply.");
  }

  if (deep) {
    if (deep.summary.length > 0) {
      score += 10;
      reasons.push("We read the buyer's own document, so the description below comes from the notice itself.");
    }
    if (deep.suppliers.length > 0) {
      score += 10;
      reasons.push(
        `${deep.suppliers.length} possible ${deep.suppliers.length === 1 ? "supplier" : "suppliers"} found on the open web — you would not be starting from zero.`,
      );
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const risk =
    deep && deep.complianceFlags.length > 0
      ? `Main obstacle: ${deep.complianceFlags.slice(0, 3).join("; ")}.`
      : deep && deep.suppliers.length === 0
        ? "Main unknown: no supplier has been evidenced yet, so cost and lead time are open questions."
        : "Main unknown: the buyer has not published quantity or price, so the money side is unproven.";

  const verdict: SignalScore["verdict"] =
    score >= 70 ? "Worth pursuing" : score >= 45 ? "Worth watching" : "Low priority";

  return { score, verdict, reasons: reasons.slice(0, 5), risk };
}