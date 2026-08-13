/**
 * Estimate layer. Everything produced here is an ESTIMATE and is displayed in a
 * separate panel from verified data. It never feeds the signal score.
 */
import { aiJson } from "./web.server";
import type { EstimateConfidence, EstimateItem, Estimates } from "./types";

export type EstimateInput = {
  title: string;
  buyer: string;
  categoryLabel: string;
  solicitation: string;
  noticeSummary: string;
  supplierCount: number;
};

type AiEstimates = {
  estimates?: { label?: string; value?: string; confidence?: string; basis?: string }[];
};

const CONF: EstimateConfidence[] = ["HIGH", "MEDIUM", "LOW"];

export async function estimateOpportunity(input: EstimateInput): Promise<Estimates> {
  const ranAt = new Date().toISOString();
  const empty: Estimates = {
    items: [],
    ranAt,
    note: "No estimate could be produced for this notice.",
  };

  const ai = await aiJson<AiEstimates>(
    "You are a defense-procurement business analyst. You produce ESTIMATES for a small trading company, clearly marked as estimates. Use plain business English, no procurement jargon. Be honest: when the evidence is thin, say so and set confidence to LOW. Reply with JSON only.",
    `Notice: ${input.title}\nBuyer: ${input.buyer}\nCategory: ${input.categoryLabel}\nReference: ${input.solicitation}\nWhat the notice says: ${input.noticeSummary.slice(0, 4000)}\nSupplier candidates already found: ${input.supplierCount}\n\nReturn JSON with exactly these four estimates:\n{"estimates":[\n {"label":"Likely contract size","value":"e.g. $150k - $400k","confidence":"HIGH|MEDIUM|LOW","basis":"one short sentence"},\n {"label":"Likely gross margin","value":"e.g. 12% - 20%","confidence":"...","basis":"..."},\n {"label":"Money needed up front","value":"e.g. $30k - $80k before the buyer pays","confidence":"...","basis":"..."},\n {"label":"How hard to source","value":"e.g. Several suppliers available","confidence":"...","basis":"..."}\n]}`,
  );

  const items: EstimateItem[] = [];
  for (const raw of ai?.estimates ?? []) {
    if (!raw?.label || !raw?.value) continue;
    const confidence = CONF.includes(String(raw.confidence).toUpperCase() as EstimateConfidence)
      ? (String(raw.confidence).toUpperCase() as EstimateConfidence)
      : "LOW";
    items.push({
      label: String(raw.label).slice(0, 60),
      value: String(raw.value).slice(0, 80),
      confidence,
      basis: raw.basis ? String(raw.basis).slice(0, 220) : "No basis given.",
    });
  }

  if (items.length === 0) return empty;
  return {
    items: items.slice(0, 4),
    ranAt,
    note: "Estimated from the notice text and comparable public procurement — not published by the buyer.",
  };
}