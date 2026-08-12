import type { AdapterResult } from "./sources/types";
import { emptyResult, mmddyyyy, samSearchUrl, toLiveNotice, type SamEnvelope } from "./sources/sam";

export type SamSearchInput = { keywords: string[]; fscCodes: string[]; lookbackDays: number };

const PAGE_SIZE = 100;
const MAX_PAGES = 3;

export async function searchSam(input: SamSearchInput): Promise<AdapterResult> {
  const apiKey = process.env["SAM_GOV_API_KEY"];
  if (!apiKey) {
    return emptyResult(
      "NOT_CONFIGURED",
      "LIVE ACCESS NOT CONFIGURED — add a SAM.gov API key (SAM_GOV_API_KEY) to enable live search.",
    );
  }

  const to = new Date();
  const from = new Date(to.getTime() - input.lookbackDays * 86_400_000);
  const base: Record<string, string> = {
    api_key: apiKey,
    postedFrom: mmddyyyy(from),
    postedTo: mmddyyyy(to),
    limit: String(PAGE_SIZE),
  };

  // One query per classification (FSC) code, or one broad query when none are set.
  // ptype is intentionally omitted: we retrieve the broad universe and classify from
  // each record's own type/baseType field.
  const variants: Record<string, string>[] =
    input.fscCodes.length > 0
      ? input.fscCodes.slice(0, 8).map((c) => ({ ...base, ccode: c }))
      : [{ ...base }];

  const retrievedAt = new Date().toISOString();
  const notices: AdapterResult["notices"] = [];
  const seen = new Set<string>();
  let queriesRun = 0;
  let lastError = "";

  for (const v of variants) {
    for (let page = 0; page < MAX_PAGES; page++) {
      const url = samSearchUrl({ ...v, offset: String(page * PAGE_SIZE) });
      queriesRun++;
      let env: SamEnvelope;
      try {
        const res = await fetch(url, { headers: { accept: "application/json" } });
        if (!res.ok) {
          lastError = `SAM.gov returned HTTP ${res.status}${res.status === 401 || res.status === 403 ? " — API key rejected" : ""}`;
          break;
        }
        env = (await res.json()) as SamEnvelope;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Network error contacting SAM.gov";
        break;
      }
      const rows = env.opportunitiesData ?? [];
      for (const rec of rows) {
        const key = rec.noticeId ?? `${rec.solicitationNumber}|${rec.title}`;
        if (seen.has(key)) continue;
        seen.add(key);
        notices.push(toLiveNotice(rec, retrievedAt));
      }
      if (rows.length < PAGE_SIZE) break;
    }
  }

  if (notices.length === 0 && lastError) {
    return { key: "sam", state: "ERROR", detail: lastError, notices: [], queriesRun };
  }

  return {
    key: "sam",
    state: "LIVE",
    detail: lastError
      ? `LIVE — partial results (${lastError})`
      : `LIVE — SAM.gov Opportunities API v2, posted ${base.postedFrom}–${base.postedTo}`,
    notices,
    queriesRun,
  };
}
