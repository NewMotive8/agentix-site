import { SOURCE_LABELS, type SourceKey } from "@/lib/hunter-data";
import { fetchSamNotices } from "../sam.functions";
import { notConfiguredAdapter } from "./stubs";
import type { AdapterResult, SourceStatusReport } from "./types";

export type LiveSearchInput = {
  keywords: string[];
  fscCodes: string[];
  /** How many days back to search (SAM requires an explicit posted-date window). */
  lookbackDays: number;
};

/** Runs the real adapter for a source. Never returns simulated records. */
export async function runLiveAdapter(key: SourceKey, input: LiveSearchInput): Promise<AdapterResult> {
  if (key !== "sam") return notConfiguredAdapter(key);
  try {
    return (await fetchSamNotices({ data: input })) as AdapterResult;
  } catch (err) {
    return {
      key,
      state: "ERROR",
      detail: err instanceof Error ? err.message : "Unknown error contacting SAM.gov",
      notices: [],
      queriesRun: 0,
    };
  }
}

export function toStatusReport(r: AdapterResult): SourceStatusReport {
  return {
    key: r.key,
    label: SOURCE_LABELS[r.key],
    state: r.state,
    detail: r.detail,
    count: r.notices.length,
  };
}

export function statusLine(s: SourceStatusReport): string {
  if (s.state === "LIVE") return `${s.label} — LIVE ✓`;
  if (s.state === "ERROR") return `${s.label} — ERROR`;
  return `${s.label} — NOT CONNECTED`;
}
