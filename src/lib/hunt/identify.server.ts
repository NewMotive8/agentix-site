/**
 * Item identification layer.
 *
 * Discovery gives us a page title, which is often a portal name rather than a
 * product ("DLA Medical Equipment Electronic CATalog (ECAT)"). This layer reads
 * the notice page and answers the only question that matters first: what is
 * actually being bought? Nothing is invented — empty fields mean the page did
 * not say it.
 */
import { aiJson, firecrawlScrape, webResearchConfigured } from "./web.server";
import type { ItemIdentity, ItemKind } from "./types";

export type IdentifyInput = {
  opportunityId: string;
  title: string;
  url: string;
  categoryLabel: string;
};

export type IdentifyResult = {
  identity: ItemIdentity;
  /** Page text, returned so stage 4 does not fetch the same page twice. */
  markdown: string;
};

const KINDS: ItemKind[] = ["SINGLE", "FEW", "CATALOGUE", "UNKNOWN"];

type AiIdentity = {
  productName?: string;
  whatItIs?: string;
  quantity?: string;
  itemKind?: string;
  itemListUrl?: string;
  imageUrl?: string;
  confidence?: string;
};

/** Absolute image URLs found in the scraped markdown, as candidates for the AI. */
function imageCandidates(markdown: string, pageUrl: string): string[] {
  const out: string[] = [];
  const re = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) && out.length < 12) {
    const u = m[1];
    if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(u) && !/logo|icon|banner|seal|favicon|sprite/i.test(u)) {
      out.push(u);
    }
  }
  try {
    const host = new URL(pageUrl).hostname;
    return out.filter((u) => {
      try {
        return new URL(u).hostname.length > 0 && host.length > 0;
      } catch {
        return false;
      }
    });
  } catch {
    return out;
  }
}

function blank(input: IdentifyInput, note: string): ItemIdentity {
  return {
    productName: input.title,
    whatItIs: "",
    quantity: "",
    itemKind: "UNKNOWN",
    itemListUrl: "",
    imageUrl: "",
    confidence: "LOW",
    sourceUrl: input.url,
    ranAt: new Date().toISOString(),
    note,
  };
}

export async function identifyItem(input: IdentifyInput): Promise<IdentifyResult> {
  const ranAt = new Date().toISOString();
  if (!webResearchConfigured()) {
    return { identity: blank(input, "Web research is not configured for this project."), markdown: "" };
  }

  let markdown = "";
  try {
    markdown = await firecrawlScrape(input.url);
  } catch (err) {
    return {
      identity: blank(input, err instanceof Error ? err.message : "Could not read the notice page."),
      markdown: "",
    };
  }

  if (!markdown.trim()) {
    return { identity: blank(input, "The notice page returned no readable text."), markdown: "" };
  }

  const images = imageCandidates(markdown, input.url);

  const ai = await aiJson<AiIdentity>(
    "You read official procurement notice pages and say, in plain business English, what is actually being bought. You never invent a product, a quantity or an image. If the page is a portal, catalogue or programme landing page rather than one procurement of an identifiable item, say so. Reply with JSON only.",
    `Page URL: ${input.url}\nPage title as found: ${input.title}\nCategory being hunted: ${input.categoryLabel}\n\nImage URLs found on the page (pick one ONLY if it clearly shows the item being bought, otherwise return ""):\n${images.join("\n") || "(none)"}\n\nReturn JSON:\n{"productName":"plain-English name of the item, max 90 chars, e.g. 'Portable patient monitor, 12-lead' — never a portal or programme name",\n "whatItIs":"one sentence explaining what the item is and what it is used for, max 160 chars",\n "quantity":"quantity and unit exactly as published, e.g. '250 each' — empty string if not published",\n "itemKind":"SINGLE if one identifiable item, FEW if a short list of items, CATALOGUE if a catalogue/framework/portal covering many or unspecified items, UNKNOWN if the page does not say",\n "itemListUrl":"absolute URL of the line-item list or attachment when itemKind is FEW or CATALOGUE, otherwise \\"\\"",\n "imageUrl":"one of the image URLs above that depicts the item, otherwise \\"\\"",\n "confidence":"HIGH|MEDIUM|LOW — how certain the product identification is"}\n\nPAGE CONTENT:\n${markdown.slice(0, 16000)}`,
  );

  if (!ai?.productName) {
    return { identity: blank(input, "The page text did not identify a specific product."), markdown };
  }

  const kind = KINDS.includes(String(ai.itemKind).toUpperCase() as ItemKind)
    ? (String(ai.itemKind).toUpperCase() as ItemKind)
    : "UNKNOWN";
  const conf = ["HIGH", "MEDIUM", "LOW"].includes(String(ai.confidence).toUpperCase())
    ? (String(ai.confidence).toUpperCase() as ItemIdentity["confidence"])
    : "LOW";
  const image = ai.imageUrl && images.includes(ai.imageUrl) ? ai.imageUrl : "";

  return {
    identity: {
      productName: String(ai.productName).slice(0, 90),
      whatItIs: ai.whatItIs ? String(ai.whatItIs).slice(0, 200) : "",
      quantity: ai.quantity ? String(ai.quantity).slice(0, 40) : "",
      itemKind: kind,
      itemListUrl: ai.itemListUrl && /^https?:\/\//.test(ai.itemListUrl) ? String(ai.itemListUrl) : "",
      imageUrl: image,
      confidence: conf,
      sourceUrl: input.url,
      ranAt,
      note: "",
    },
    markdown,
  };
}
