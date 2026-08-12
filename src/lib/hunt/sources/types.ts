import type { Opportunity, SourceKey } from "@/lib/hunter-data";
import type { DiscoveryMethod, FieldEvidence } from "../types";

/** Live-connectivity state of a single source adapter. */
export type ConnectorState = "LIVE" | "NOT_CONFIGURED" | "ERROR";

export type SourceStatusReport = {
  key: SourceKey;
  label: string;
  state: ConnectorState;
  /** Human-readable reason shown in the UI when the source is not LIVE. */
  detail: string;
  /** Notices returned by this source in the current run. */
  count: number;
};

/** A live notice: normalised app shape plus mandatory provenance and raw payload. */
export type LiveNotice = {
  opportunity: Opportunity;
  sourceUrl: string;
  retrievedAt: string;
  /** Notice type exactly as reported by the source. Never inferred from the title. */
  rawNoticeType: string;
  /** Untouched source record as JSON, kept so provenance can always be audited. */
  rawJson: string;
  /** How this record was obtained: structured API, public web page or document. */
  method: DiscoveryMethod;
  categoryId?: string;
  categoryLabel?: string;
  /** Field-level evidence supporting the extracted values. */
  evidence?: FieldEvidence[];
};

export type AdapterResult = {
  key: SourceKey;
  state: ConnectorState;
  detail: string;
  notices: LiveNotice[];
  queriesRun: number;
};

export const NOT_CONFIGURED_DETAIL = "LIVE ACCESS NOT CONFIGURED";
