import type { SourceKey } from "@/lib/hunter-data";
import { NOT_CONFIGURED_DETAIL, type AdapterResult } from "./types";

/**
 * DIBBS, NSPA and NCIA expose no public, programmatic opportunity API today.
 * Until a feed or authorised integration exists, these adapters return nothing
 * in LIVE MODE. They must never fall back to the simulated corpus.
 */
const REASONS: Partial<Record<SourceKey, string>> = {
  dibbs: `${NOT_CONFIGURED_DETAIL} — DLA DIBBS has no public API; requires an authorised feed or DLA account integration.`,
  nspa: `${NOT_CONFIGURED_DETAIL} — NSPA eProcurement requires supplier portal credentials.`,
  ncia: `${NOT_CONFIGURED_DETAIL} — NCIA publishes notices on its website only; no machine-readable feed configured.`,
};

export function notConfiguredAdapter(key: SourceKey): AdapterResult {
  return {
    key,
    state: "NOT_CONFIGURED",
    detail: REASONS[key] ?? NOT_CONFIGURED_DETAIL,
    notices: [],
    queriesRun: 0,
  };
}
