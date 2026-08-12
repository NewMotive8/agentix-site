/**
 * Live web-research layer.
 *
 * Procurement discovery is restricted to official procurement domains
 * (SAM.gov, DLA/DIBBS, NSPA, NCIA, NATO). Supplier research (stage 4 only) is
 * allowed to use the broader public web and is never presented as
 * government-confirmed information.
 *
 * All calls go through the Lovable connector gateway (Firecrawl) and the
 * Lovable AI gateway. No simulated data is ever produced here.
 */
import type { SourceKey } from "@/lib/hunter-data";
import { isOfficialUrl } from "./querymatrix";
import type { LiveNotice } from "./sources/types";
import type { SupplierClaim, SupplierType } from "./types";

const FIRECRAWL_GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";

type SearchHit = { url: string; title: string; description: string };

function keys() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const firecrawl = process.env["FIRECRAWL_API_KEY"];
  if (!lovable || !firecrawl) return null;
  return { lovable, firecrawl };
}

export function webResearchConfigured(): boolean {
  return keys() !== null;
}

export async function firecrawlSearch(query: string, limit: number): Promise<SearchHit[]> {
  const k = keys();
  if (!k) throw new Error("Firecrawl connection is not configured for this project.");
  const res = await fetch(`${FIRECRAWL_GATEWAY}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${k.lovable}`,
      "X-Connection-Api-Key": k.firecrawl,
    },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firecrawl search failed [${res.status}]: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    success?: boolean;
    data?: { web?: SearchHit[] } | SearchHit[];
  };
  const data = json.data;
  const rows = Array.isArray(data) ? data : (data?.web ?? []);
  return rows
    .filter((r) => typeof r?.url === "string")
    .map((r) => ({ url: r.url, title: r.title ?? "", description: r.description ?? "" }));
}

export async function firecrawlScrape(url: string): Promise<string> {
  const k = keys();
  if (!k) throw new Error("Firecrawl connection is not configured for this project.");
  const res = await fetch(`${FIRECRAWL_GATEWAY}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${k.lovable}`,
      "X-Connection-Api-Key": k.firecrawl,
    },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firecrawl scrape failed [${res.status}]: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    markdown?: string;
    data?: { markdown?: string };
  };
  return json.markdown ?? json.data?.markdown ?? "";
}

export async function aiJson<T>(system: string, user: string): Promise<T | null> {
  const k = keys();
  if (!k) return null;
  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${k.lovable}` },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------- notice extraction */

const SOLICITATION_RE = /\b([A-Z0-9]{2,}[-A-Z0-9]{4,})\b/;

const CLASS_PATTERNS: { re: RegExp; cls: string }[] = [
  { re: /combined synopsis/i, cls: "COMBINED_SYNOPSIS" },
  { re: /sources sought/i, cls: "SOURCES_SOUGHT" },
  { re: /pre-?solicitation/i, cls: "PRESOLICITATION" },
  { re: /special notice/i, cls: "SPECIAL_NOTICE" },
  { re: /award notice|contract award/i, cls: "AWARD" },
  { re: /request for (quotation|quote|proposal)|invitation for bid|solicitation|tender|RFQ|RFP|IFB|call for tender/i, cls: "SOLICITATION" },
];

function classifyFromText(text: string): { cls: string; quote: string } {
  for (const p of CLASS_PATTERNS) {
    const m = text.match(p.re);
    if (m) return { cls: p.cls, quote: m[0] };
  }
  return { cls: "UNCLASSIFIED", quote: "" };
}

export function hitToNotice(
  hit: SearchHit,
  source: SourceKey,
  sourceLabel: string,
  category: { id: string; label: string },
  retrievedAt: string,
): LiveNotice {
  const text = `${hit.title} ${hit.description}`;
  const { cls, quote } = classifyFromText(text);
  const sol = hit.title.match(SOLICITATION_RE)?.[1] ?? hit.url.split("/").filter(Boolean).slice(-2)[0] ?? "—";
  return {
    opportunity: {
      id: `web-${source}-${Math.abs(hash(hit.url))}`,
      score: 0,
      agency: sourceLabel,
      solicitation: sol,
      product: hit.title || hit.url,
      nsn: "",
      partNumber: "",
      fsc: "",
      quantity: 0,
      deadline: "",
      source,
      sourceLabel,
      incumbents: 0,
      demand: "LOW",
      accessibility: "LOW",
      pricingConfidence: "LOW",
      estValue: 0,
      estMargin: 0,
      estGrossProfit: 0,
      aiSummary: hit.description,
      liveNoticeClass: cls,
      dataGaps: [
        "Quantity, NSN and unit pricing are not published on the discovered page",
        "Supplier market and award history require stage-4 deep investigation",
      ],
      investigation: {
        platform: category.label,
        historicalQty: [],
        sources: [],
        compliance: [],
        waterfall: { govPrice: 0, supplierCost: 0, freight: 0, inspCert: 0 },
        recommendation: "INVESTIGATE FURTHER",
        rationale: [],
      },
    },
    sourceUrl: hit.url,
    retrievedAt,
    rawNoticeType: quote ? `${cls} (from page text: "${quote}")` : "(notice type not stated on the discovered page)",
    rawJson: JSON.stringify(hit),
    method: "WEB",
    categoryId: category.id,
    categoryLabel: category.label,
    evidence: [
      {
        field: "title",
        value: hit.title,
        sourceUrl: hit.url,
        retrievedAt,
        quote: hit.description.slice(0, 240),
      },
    ],
  };
}

export function filterOfficial(hits: SearchHit[], keysAllowed: SourceKey[]) {
  const out: { hit: SearchHit; source: SourceKey }[] = [];
  for (const hit of hits) {
    const source = isOfficialUrl(hit.url, keysAllowed);
    if (source) out.push({ hit, source });
  }
  return out;
}

/* --------------------------------------------------------- supplier research */

const SUPPLIER_TYPES: SupplierType[] = [
  "OEM",
  "AUTHORIZED DISTRIBUTOR",
  "APPROVED ALTERNATE",
  "MANUFACTURER",
  "DISTRIBUTOR",
  "SURPLUS / STOCKIST",
  "UNVERIFIED SUPPLIER",
];

export function normaliseSupplier(raw: Partial<SupplierClaim>, retrievedAt: string): SupplierClaim | null {
  if (!raw?.name || !raw?.sourceUrl) return null;
  const type = SUPPLIER_TYPES.includes(raw.type as SupplierType)
    ? (raw.type as SupplierType)
    : "UNVERIFIED SUPPLIER";
  return {
    name: String(raw.name).slice(0, 120),
    type,
    country: raw.country ? String(raw.country).slice(0, 60) : "Not stated",
    sourceUrl: String(raw.sourceUrl),
    retrievedAt,
    evidence: raw.evidence ? String(raw.evidence).slice(0, 400) : "No supporting quote captured.",
    governmentConfirmed: false,
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
