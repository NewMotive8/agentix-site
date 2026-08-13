import type { SourceKey } from "@/lib/hunter-data";
import { categoriesFor, type CategoryFamily } from "./categories";

/** Official procurement domains. Discovery of procurement FACTS is limited to these. */
export const OFFICIAL_DOMAINS: Record<SourceKey, string[]> = {
  sam: ["sam.gov"],
  dibbs: ["dibbs.bsm.dla.mil", "dla.mil"],
  nspa: ["nspa.nato.int"],
  ncia: ["ncia.nato.int"],
  nato: ["nato.int", "act.nato.int", "shape.nato.int"],
};

export const SOURCE_SITE_QUERY: Record<SourceKey, string> = {
  sam: "site:sam.gov",
  dibbs: "site:dibbs.bsm.dla.mil OR site:dla.mil",
  nspa: "site:nspa.nato.int",
  ncia: "site:ncia.nato.int",
  nato: "site:nato.int OR site:act.nato.int OR site:shape.nato.int",
};

export function isOfficialUrl(url: string, keys: SourceKey[]): SourceKey | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const key of keys) {
    for (const d of OFFICIAL_DOMAINS[key]) {
      if (host === d || host.endsWith(`.${d}`)) return key;
    }
  }
  return null;
}

const PROCUREMENT_TERMS = ["solicitation", "request for quotation", "tender notice", "invitation for bid"];
const CLASSIFICATION_TERMS = ["NSN", "FSC", "NAICS"];

export type PlannedQuery = {
  categoryId: string;
  categoryLabel: string;
  /** Sources whose official domains this query is restricted to. */
  sources: SourceKey[];
  query: string;
};

export type CoverageMode = "categories" | "fsc" | "naics" | "keywords" | "nsn";

/** A hunt must be aimed: at most three category families per run. */
export const MAX_CATEGORIES = 3;

export type Coverage = {
  mode: CoverageMode;
  /** Selected category ids when mode === "categories". */
  categories: string[];
  /** Free text used by fsc / naics / keywords / nsn modes. */
  terms: string;
  /** 0.5 – 2.0. Scales how many queries each category receives. */
  weight: number;
  /** Raw candidate target across the whole run. */
  rawTarget: number;
  /** How many of the strongest opportunities get a stage-4 deep investigation. */
  deepInvestigations: number;
};

export const defaultCoverage: Coverage = {
  mode: "categories",
  categories: ["aerospace"],
  terms: "",
  weight: 1,
  rawTarget: 100,
  deepInvestigations: 10,
};

/** True when the current coverage describes a runnable hunt. */
export function coverageReady(c: Coverage): boolean {
  if (c.mode === "categories") return c.categories.length > 0;
  return c.terms.trim().length > 0;
}

function termsFor(cat: CategoryFamily, coverage: Coverage): string[] {
  const perCategory = Math.max(2, Math.min(8, Math.round(3 * coverage.weight)));
  const custom = coverage.terms
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (coverage.mode === "keywords" || coverage.mode === "nsn") {
    return custom.slice(0, perCategory);
  }
  if (coverage.mode === "fsc") {
    const codes = custom.length > 0 ? custom : cat.fsc;
    return codes.slice(0, perCategory).map((c) => `FSC ${c}`);
  }
  if (coverage.mode === "naics") {
    const codes = custom.length > 0 ? custom : cat.naics;
    return codes.slice(0, perCategory).map((c) => `NAICS ${c}`);
  }
  const base = [...cat.vocabulary];
  // Add one classification-flavoured query so NSN/FSC-tagged notices are reachable.
  base.push(`${cat.vocabulary[0]} ${CLASSIFICATION_TERMS[0]}`);
  return base.slice(0, perCategory);
}

/** Builds the full category x source x terminology query matrix for a run. */
export function buildQueryPlan(coverage: Coverage, sources: SourceKey[]): PlannedQuery[] {
  const cats = categoriesFor(coverage.categories);
  const out: PlannedQuery[] = [];
  for (const cat of cats) {
    const terms = termsFor(cat, coverage);
    const siteFilter = sources.map((s) => SOURCE_SITE_QUERY[s]).join(" OR ");
    terms.forEach((term, i) => {
      const proc = PROCUREMENT_TERMS[i % PROCUREMENT_TERMS.length];
      out.push({
        categoryId: cat.id,
        categoryLabel: cat.label,
        sources,
        query: `${term} ${proc} ${siteFilter}`,
      });
    });
  }
  return out;
}

export function planByCategory(plan: PlannedQuery[]): Map<string, PlannedQuery[]> {
  const m = new Map<string, PlannedQuery[]>();
  for (const q of plan) m.set(q.categoryId, [...(m.get(q.categoryId) ?? []), q]);
  return m;
}
