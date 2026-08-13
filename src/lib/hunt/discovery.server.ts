import { SOURCE_LABELS, type SourceKey } from "@/lib/hunter-data";
import { CATEGORY_FAMILIES } from "./categories";
import { activeCategories, buildQueryPlan, CUSTOM_CATEGORY_ID, type Coverage } from "./querymatrix";
import { searchSam } from "./sam.server";
import type { LiveNotice } from "./sources/types";
import {
  aiJson,
  filterOfficial,
  firecrawlScrape,
  firecrawlSearch,
  hitToNotice,
  normaliseSupplier,
  webResearchConfigured,
} from "./web.server";
import type { DeepInvestigation, SupplierClaim } from "./types";

export type CategoryDiscoveryInput = {
  categoryId: string;
  sources: SourceKey[];
  coverage: Coverage;
};

export type CategoryDiscoveryResult = {
  categoryId: string;
  categoryLabel: string;
  queriesRun: number;
  notices: LiveNotice[];
  webConfigured: boolean;
  apiUsed: SourceKey[];
  errors: string[];
};

const HITS_PER_QUERY = 8;

/** Stage 1+2 for a single category: broad discovery, then normalisation. */
export async function discoverCategory(input: CategoryDiscoveryInput): Promise<CategoryDiscoveryResult> {
  const custom = input.categoryId === CUSTOM_CATEGORY_ID;
  const cat = custom
    ? activeCategories({ ...input.coverage, categories: [] })[0]
    : CATEGORY_FAMILIES.find((c) => c.id === input.categoryId);
  const label = cat?.label ?? input.categoryId;
  const errors: string[] = [];
  const notices: LiveNotice[] = [];
  const apiUsed: SourceKey[] = [];
  let queriesRun = 0;

  // Structured API sources first — higher quality than web discovery.
  if (input.sources.includes("sam") && process.env["SAM_GOV_API_KEY"]) {
    try {
      const res = await searchSam({
        keywords: cat?.vocabulary.slice(0, 3) ?? [],
        fscCodes: cat?.fsc.slice(0, 4) ?? [],
        lookbackDays: 90,
      });
      queriesRun += res.queriesRun;
      if (res.state === "LIVE") {
        apiUsed.push("sam");
        for (const n of res.notices)
          notices.push({ ...n, method: "API", categoryId: input.categoryId, categoryLabel: label });
      } else if (res.state === "ERROR") {
        errors.push(`SAM.gov API: ${res.detail}`);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "SAM.gov API error");
    }
  }

  if (!webResearchConfigured()) {
    return { categoryId: input.categoryId, categoryLabel: label, queriesRun, notices, webConfigured: false, apiUsed, errors };
  }

  const plan = buildQueryPlan(
    custom
      ? { ...input.coverage, categories: [] }
      : { ...input.coverage, categories: [input.categoryId] },
    input.sources,
  );
  const retrievedAt = new Date().toISOString();
  const seen = new Set(notices.map((n) => n.sourceUrl));

  // Searches run sequentially with one retry: the provider rate-limits bursts,
  // and a dropped query would silently shrink coverage.
  const batches: { hits: Awaited<ReturnType<typeof firecrawlSearch>>; error: string | null }[] = [];
  for (const q of plan) {
    let hits: Awaited<ReturnType<typeof firecrawlSearch>> = [];
    let error: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        hits = await firecrawlSearch(q.query, HITS_PER_QUERY);
        error = null;
        break;
      } catch (err) {
        error = err instanceof Error ? err.message : "search failed";
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    batches.push({ hits, error });
  }

  for (const b of batches) {
    queriesRun++;
    if (b.error) {
      if (errors.length < 3) errors.push(b.error);
      continue;
    }
    for (const { hit, source } of filterOfficial(b.hits, input.sources)) {
      if (seen.has(hit.url)) continue;
      seen.add(hit.url);
      notices.push(
        hitToNotice(hit, source, SOURCE_LABELS[source], { id: input.categoryId, label }, retrievedAt),
      );
    }
  }

  return { categoryId: input.categoryId, categoryLabel: label, queriesRun, notices, webConfigured: true, apiUsed, errors };
}

/* ------------------------------------------------------------ stage 4 */

export type DeepInput = {
  opportunityId: string;
  title: string;
  url: string;
  solicitation: string;
  sourceLabel: string;
  /** Page text already fetched during identification, so we do not scrape twice. */
  pageMarkdown?: string;
};

type AiNotice = {
  summary?: string[];
  requirements?: string[];
  complianceFlags?: string[];
  documentUrls?: string[];
  searchTerms?: string[];
};

type AiSuppliers = { suppliers?: Partial<SupplierClaim>[] };

export async function deepInvestigate(input: DeepInput): Promise<DeepInvestigation> {
  try {
    return await runDeepInvestigation(input);
  } catch (err) {
    return {
      opportunityId: input.opportunityId,
      summary: [],
      requirements: [],
      complianceFlags: [],
      suppliers: [],
      documentUrls: [],
      evidence: [],
      ranAt: new Date().toISOString(),
      note: err instanceof Error ? err.message : "The research pass could not be completed.",
    };
  }
}

async function runDeepInvestigation(input: DeepInput): Promise<DeepInvestigation> {
  const ranAt = new Date().toISOString();
  const base: DeepInvestigation = {
    opportunityId: input.opportunityId,
    summary: [],
    requirements: [],
    complianceFlags: [],
    suppliers: [],
    documentUrls: [],
    evidence: [],
    ranAt,
    note: "",
  };

  if (!webResearchConfigured()) {
    return { ...base, note: "Web research is not configured for this project." };
  }

  let markdown = input.pageMarkdown ?? "";
  if (!markdown) {
    try {
      markdown = await firecrawlScrape(input.url);
    } catch (err) {
      return { ...base, note: err instanceof Error ? err.message : "Could not retrieve the notice page." };
    }
  }

  const facts = await aiJson<AiNotice>(
    "You extract procurement facts from official notice pages. Only state what the page actually says. Never invent quantities, prices or suppliers. Reply with JSON only.",
    `Official page: ${input.url}\nSolicitation: ${input.solicitation}\n\nReturn JSON: {"summary":[3 short factual bullets],"requirements":[strings],"complianceFlags":[strings such as country-of-origin, ITAR, FAR clauses, certifications],"documentUrls":[absolute urls of attachments found in the text],"searchTerms":[3 precise product search terms for finding manufacturers of the item]}\n\nPAGE CONTENT:\n${markdown.slice(0, 18000)}`,
  );

  const evidence = [
    {
      field: "notice page",
      value: input.title,
      sourceUrl: input.url,
      retrievedAt: ranAt,
      quote: markdown.slice(0, 400),
    },
  ];

  const terms = (facts?.searchTerms ?? [input.title]).slice(0, 3);
  const supplierHits = (
    await Promise.all(
      terms.map(async (t) => {
        try {
          return await firecrawlSearch(`${t} manufacturer OR "authorized distributor" OR supplier`, 8);
        } catch {
          return [];
        }
      }),
    )
  ).flat();

  const suppliers: SupplierClaim[] = [];
  if (supplierHits.length > 0) {
    const typed = await aiJson<AiSuppliers>(
      "You classify companies found on the public web as potential suppliers for a defense procurement item. This is commercial research, NOT government-confirmed information. Never mark a company as OEM, AUTHORIZED DISTRIBUTOR or APPROVED ALTERNATE unless the cited page states that relationship explicitly; otherwise use MANUFACTURER, DISTRIBUTOR, SURPLUS / STOCKIST or UNVERIFIED SUPPLIER. Do not weight by geography: US, European, Israeli, Turkish, Indian and Asian companies are equally valid. Reply with JSON only.",
      `Item: ${input.title}\nSolicitation: ${input.solicitation}\n\nSearch results:\n${supplierHits
        .map((h) => `- ${h.title} | ${h.url} | ${h.description}`)
        .join("\n")
        .slice(0, 12000)}\n\nReturn JSON: {"suppliers":[{"name":"","type":"OEM|AUTHORIZED DISTRIBUTOR|APPROVED ALTERNATE|MANUFACTURER|DISTRIBUTOR|SURPLUS / STOCKIST|UNVERIFIED SUPPLIER","country":"","sourceUrl":"","evidence":"quote from the result supporting the classification"}]}`,
    );
    for (const raw of typed?.suppliers ?? []) {
      const s = normaliseSupplier(raw, ranAt);
      if (s) suppliers.push(s);
    }
  }

  return {
    opportunityId: input.opportunityId,
    summary: facts?.summary ?? [],
    requirements: facts?.requirements ?? [],
    complianceFlags: facts?.complianceFlags ?? [],
    suppliers,
    documentUrls: (facts?.documentUrls ?? []).slice(0, 10),
    evidence,
    ranAt,
    note: suppliers.length === 0 ? "No supplier candidates could be evidenced from public sources." : "",
  };
}
