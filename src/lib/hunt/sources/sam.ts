/**
 * SAM.gov Get Opportunities Public API — v2
 * Verified against the official GSA documentation:
 *   https://open.gsa.gov/api/get-opportunities-public-api/
 *
 * Endpoint (production): https://api.sam.gov/opportunities/v2/search
 * Required params: api_key, postedFrom, postedTo  (MM/dd/yyyy, span <= 1 year)
 * Pagination: limit (max 1000, default 1), offset (default 0)
 * Documented ptype codes: u=Justification, p=Presolicitation, a=Award Notice,
 *   r=Sources Sought, s=Special Notice, o=Solicitation, g=Sale of Surplus Property,
 *   k=Combined Synopsis/Solicitation, i=Intent to Bundle Requirements.
 *   (f and l are retired.)  We deliberately do NOT send ptype: we retrieve the broad
 *   universe and classify afterwards from the record's own `type` / `baseType`.
 * Other documented filters used here: ccode (classification code / FSC), ncode (NAICS),
 *   title, state, typeOfSetAside, rdlfrom/rdlto.
 * Response envelope: { totalRecords, limit, offset, opportunitiesData: [...] }
 * Auth: api_key query parameter (the form used in every official example).
 * Rate limit: api.data.gov default 1,000 requests/hour per key.
 */
import type { Opportunity } from "@/lib/hunter-data";
import type { AdapterResult, LiveNotice } from "./types";

export const SAM_ENDPOINT = "https://api.sam.gov/opportunities/v2/search";

export type SamRecord = {
  noticeId?: string;
  title?: string;
  solicitationNumber?: string;
  fullParentPathName?: string;
  organizationType?: string;
  type?: string;
  baseType?: string;
  postedDate?: string;
  responseDeadLine?: string | null;
  reponseDeadLine?: string | null;
  naicsCode?: string;
  classificationCode?: string;
  active?: string;
  setAside?: string;
  setAsideCode?: string;
  uiLink?: string;
  description?: string;
  award?: unknown;
  pointOfContact?: unknown;
  placeOfPerformance?: unknown;
};

export type SamEnvelope = {
  totalRecords?: number;
  limit?: number;
  offset?: number;
  opportunitiesData?: SamRecord[];
};

/** Notice classification taken ONLY from the record's own type fields. */
export type NoticeClass =
  | "SOLICITATION"
  | "COMBINED_SYNOPSIS"
  | "PRESOLICITATION"
  | "SOURCES_SOUGHT"
  | "SPECIAL_NOTICE"
  | "AWARD"
  | "JUSTIFICATION"
  | "SURPLUS_SALE"
  | "INTENT_TO_BUNDLE"
  | "UNCLASSIFIED";

const TYPE_MAP: Record<string, NoticeClass> = {
  "solicitation": "SOLICITATION",
  "combined synopsis/solicitation": "COMBINED_SYNOPSIS",
  "presolicitation": "PRESOLICITATION",
  "pre solicitation": "PRESOLICITATION",
  "sources sought": "SOURCES_SOUGHT",
  "special notice": "SPECIAL_NOTICE",
  "award notice": "AWARD",
  "justification": "JUSTIFICATION",
  "justification (j&a)": "JUSTIFICATION",
  "sale of surplus property": "SURPLUS_SALE",
  "intent to bundle requirements (dod-funded)": "INTENT_TO_BUNDLE",
};

export function classifyNotice(rec: SamRecord): { cls: NoticeClass; raw: string } {
  const raw = (rec.type || rec.baseType || "").trim();
  const cls = TYPE_MAP[raw.toLowerCase()] ?? "UNCLASSIFIED";
  return { cls, raw: raw || "(no type field returned)" };
}

export function mmddyyyy(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}`;
}

function deadlineOf(rec: SamRecord): string {
  const v = rec.responseDeadLine ?? rec.reponseDeadLine ?? "";
  return v ? String(v).slice(0, 10) : "";
}

/**
 * Maps a live SAM record onto the app's Opportunity shape.
 * Nothing is invented: quantities, NSNs, prices, incumbents and supplier data are
 * NOT published by this API, so they are left empty and surfaced as NOT AVAILABLE.
 */
export function toOpportunity(rec: SamRecord, cls: NoticeClass): Opportunity {
  const id = `sam-${rec.noticeId ?? rec.solicitationNumber ?? Math.abs(hash(JSON.stringify(rec)))}`;
  return {
    id,
    score: 0,
    agency: rec.fullParentPathName?.split(".").slice(-1)[0]?.trim() || rec.fullParentPathName || "Unknown agency",
    solicitation: rec.solicitationNumber || rec.noticeId || "—",
    product: rec.title || "(untitled notice)",
    nsn: "",
    partNumber: "",
    fsc: rec.classificationCode || "",
    quantity: 0,
    deadline: deadlineOf(rec),
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 0,
    demand: "LOW",
    accessibility: "LOW",
    pricingConfidence: "LOW",
    estValue: 0,
    estMargin: 0,
    estGrossProfit: 0,
    aiSummary: "",
    liveNoticeClass: cls,
    dataGaps: [
      "Quantity, NSN and unit pricing are not published by the SAM.gov Opportunities API",
      "Supplier market, incumbents and award history require a separate source",
    ],
    investigation: {
      platform: rec.title || "Unknown",
      historicalQty: [],
      sources: [],
      compliance: [],
      waterfall: { govPrice: 0, supplierCost: 0, freight: 0, inspCert: 0 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [],
    },
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

export function samSearchUrl(params: Record<string, string>): string {
  const q = new URLSearchParams(params);
  return `${SAM_ENDPOINT}?${q.toString()}`;
}

export function noticeUrl(rec: SamRecord): string {
  // uiLink requires a signed-in role; the public search deep link always resolves.
  return rec.noticeId
    ? `https://sam.gov/opp/${rec.noticeId}/view`
    : rec.uiLink || "https://sam.gov/search";
}

export function toLiveNotice(rec: SamRecord, retrievedAt: string): LiveNotice {
  const { cls, raw } = classifyNotice(rec);
  return {
    opportunity: toOpportunity(rec, cls),
    sourceUrl: noticeUrl(rec),
    retrievedAt,
    rawNoticeType: raw,
    raw: rec as unknown as Record<string, unknown>,
  };
}

export function emptyResult(state: AdapterResult["state"], detail: string): AdapterResult {
  return { key: "sam", state, detail, notices: [], queriesRun: 0 };
}
