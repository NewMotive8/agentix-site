import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, Search, X } from "lucide-react";
import type { Opportunity } from "@/lib/hunter-data";
import type { Scored } from "@/lib/hunt/types";
import { CASH_LABEL } from "@/lib/hunt/cashflow";

export const currency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export type Tone = "good" | "warn" | "bad" | "info";

export const TONE_CLASS: Record<Tone, string> = {
  good: "border-primary/60 bg-primary/15 text-primary",
  warn: "border-signal-amber/60 bg-signal-amber/15 text-signal-amber",
  bad: "border-border bg-muted text-muted-foreground",
  info: "border-signal-blue/60 bg-signal-blue/15 text-signal-blue",
};

export function toneFor(v: string): Tone {
  if (v === "HIGH" || v === "VERY HIGH") return "good";
  if (v === "MED") return "warn";
  return "bad";
}

const READABLE: Record<string, string> = {
  "VERY HIGH": "Very high",
  HIGH: "High",
  MED: "Medium",
  LOW: "Low",
  "VERY LOW": "Very low",
};

export function LevelBadge({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[13px] text-muted-foreground">{label}</div>
      <span
        className={cn(
          "mt-1 inline-block rounded-md border px-2.5 py-1 text-[15px] font-bold",
          TONE_CLASS[toneFor(value)],
        )}
      >
        {READABLE[value] ?? value}
      </span>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <div className="text-[13px] text-muted-foreground">{label}</div>
      <div className={cn("data mt-0.5 text-[17px]", strong ? "font-bold text-primary" : "font-semibold")}>
        {value}
      </div>
    </div>
  );
}

export function OpportunityCard({
  opp,
  saved,
  onInvestigate,
  onSave,
  onDismiss,
}: {
  opp: Scored;
  saved: boolean;
  onInvestigate: () => void;
  onSave: () => void;
  onDismiss: () => void;
}) {
  const band =
    opp.score > 80
      ? { cls: "border-primary bg-primary/15 text-primary", word: "Strong" }
      : opp.score > 60
        ? { cls: "border-signal-amber bg-signal-amber/15 text-signal-amber", word: "Moderate" }
        : { cls: "border-border bg-muted text-muted-foreground", word: "Weak" };

  const execBand =
    opp.executionScore > 70
      ? { cls: "border-primary bg-primary/15 text-primary", word: "Doable" }
      : opp.executionScore > 45
        ? { cls: "border-signal-amber bg-signal-amber/15 text-signal-amber", word: "Hard" }
        : { cls: "border-border bg-muted text-muted-foreground", word: "Blocked" };

  const cashTone =
    opp.cash.classification === "COMPATIBLE"
      ? "border-primary/60 bg-primary/10 text-primary"
      : opp.cash.classification === "FINANCEABLE"
        ? "border-signal-amber/60 bg-signal-amber/10 text-signal-amber"
        : "border-destructive/60 bg-destructive/10 text-destructive";

  return (
    <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
        <div className="min-w-0">
          <div className="text-[14px] text-muted-foreground">
            {opp.agency} · Solicitation <span className="data">{opp.solicitation}</span> ·{" "}
            <span className="font-semibold text-signal-blue">{opp.sourceLabel}</span>
          </div>
          <h3 className="mt-1.5 text-[21px] font-bold leading-snug">{opp.product}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 font-bold",
                opp.provenance.status === "LIVE"
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-signal-amber/60 bg-signal-amber/15 text-signal-amber",
              )}
            >
              {opp.provenance.status === "LIVE" ? "LIVE" : "DEMO — SIMULATED"}
            </span>
            {opp.provenance.rawNoticeType && (
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
                Notice type: {opp.provenance.rawNoticeType}
              </span>
            )}
            <a
              href={opp.provenance.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-signal-blue underline underline-offset-2"
            >
              Open original notice
            </a>
            <span className="text-muted-foreground">Retrieved {opp.provenance.retrievedAt.slice(0, 19).replace("T", " ")} UTC</span>
          </div>
        </div>
        {opp.analysisAvailable && (
        <div className="flex shrink-0 gap-3">
          <div className={cn("rounded-lg border-2 px-4 py-2 text-center", band.cls)}>
            <div className="data text-[30px] font-bold leading-none">{opp.opportunityScore}</div>
            <div className="text-[13px] font-semibold">Opportunity</div>
            <div className="text-[14px] font-bold">{band.word}</div>
          </div>
          <div className={cn("rounded-lg border-2 px-4 py-2 text-center", execBand.cls)}>
            <div className="data text-[30px] font-bold leading-none">{opp.executionScore}</div>
            <div className="text-[13px] font-semibold">Execution</div>
            <div className="text-[14px] font-bold">{execBand.word}</div>
          </div>
        </div>
        )}
      </div>

      {!opp.analysisAvailable && (
        <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
          <div className="text-[15px] font-bold text-foreground">
            Scores and economics: NOT AVAILABLE
          </div>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            This source publishes the notice only. Quantities, NSNs, unit prices, incumbents and
            supplier data are not part of its response, so nothing is estimated here.
          </p>
          {opp.deadline && (
            <p className="mt-2 text-[15px] text-foreground">
              Response deadline: <span className="data font-semibold">{opp.deadline}</span>
              {opp.fsc && <> · Classification code <span className="data font-semibold">{opp.fsc}</span></>}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="h-12 gap-2 px-6 text-[16px] font-bold">
              <a href={opp.provenance.sourceUrl} target="_blank" rel="noreferrer">
                <Search className="h-5 w-5" /> Open on {opp.sourceLabel}
              </a>
            </Button>
            <Button onClick={onSave} variant="outline" className={cn("h-12 gap-2 px-5 text-[16px]", saved && "border-primary text-primary")}>
              <Bookmark className="h-5 w-5" /> {saved ? "Saved" : "Save"}
            </Button>
            <Button onClick={onDismiss} variant="ghost" className="h-12 gap-2 px-5 text-[16px]">
              <X className="h-5 w-5" /> Dismiss
            </Button>
          </div>
        </div>
      )}

      {opp.analysisAvailable && (
      <>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
        <Stat label="NSN / Part number" value={`${opp.nsn}  ${opp.partNumber}`} />
        <Stat label="Quantity" value={`${opp.quantity} units`} />
        <Stat label="Bid deadline" value={opp.deadline} />
      </div>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
        <LevelBadge label="Past demand for this part" value={opp.demand} />
        <LevelBadge label="How easy to source" value={opp.accessibility} />
        <LevelBadge label="Confidence in pricing" value={opp.pricingConfidence} />
      </div>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
        <Stat label="Contract value" value={currency(opp.estValue)} />
        <Stat
          label="Margin — theoretical / executable"
          value={`${opp.theoreticalMarginPct}% → ${opp.executableMarginPct}%`}
          strong
        />
        <Stat label="Executable gross profit" value={currency(opp.executableGrossProfit)} strong />
      </div>

      <div className={cn("mt-5 rounded-md border p-4", cashTone)}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[16px] font-bold">{CASH_LABEL[opp.cash.classification]}</span>
          {opp.capitalConstrained && (
            <span className="rounded-md border border-destructive/60 bg-destructive/15 px-2.5 py-1 text-[14px] font-bold text-destructive">
              CAPITAL CONSTRAINED
            </span>
          )}
          <span className="rounded-md border border-border bg-background/40 px-2.5 py-1 text-[13px] font-semibold text-muted-foreground">
            {opp.provenance.status}
          </span>
        </div>
        <div className="mt-3 grid gap-4 text-foreground sm:grid-cols-3">
          <Stat label="Cash needed before government pays" value={currency(opp.cash.cashRequired)} />
          <Stat label="Cash gap" value={`${opp.cash.cashGapDays} days · financing ${currency(opp.cash.financingCost)}`} />
          <Stat label="Supplier MOQ / lead time" value={`${opp.cash.moqUnits} units · ${opp.cash.leadTimeDays} days`} />
          <Stat label="Government payment terms" value={opp.cash.govPaymentTerms} />
          <Stat label="Supplier payment terms" value={opp.cash.supplierPaymentTerms} />
          <Stat
            label="Compliance restrictions"
            value={
              opp.constraints.filter((c) => c.state !== "clear").map((c) => c.label).join(", ") ||
              "None flagged"
            }
          />
        </div>
      </div>

      <div className="mt-5 rounded-md border border-border bg-muted/40 p-4">
        <div className="text-[13px] font-semibold uppercase tracking-wide text-signal-blue">
          Analysis — {opp.verdict}
        </div>
        <p className="mt-1.5 text-[16px] leading-relaxed text-foreground">{opp.aiSummary}</p>
        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">{opp.verdictReason}</p>
        {opp.familyLabel && (
          <p className="mt-2 text-[15px] font-semibold text-signal-blue">
            Procurement family: {opp.familyLabel}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={onInvestigate} className="h-12 gap-2 px-6 text-[16px] font-bold">
          <Search className="h-5 w-5" /> Investigate
        </Button>
        <Button
          onClick={onSave}
          variant="outline"
          className={cn("h-12 gap-2 px-5 text-[16px]", saved && "border-primary text-primary")}
        >
          <Bookmark className="h-5 w-5" /> {saved ? "Saved" : "Save"}
        </Button>
        <Button onClick={onDismiss} variant="ghost" className="h-12 gap-2 px-5 text-[16px]">
          <X className="h-5 w-5" /> Dismiss
        </Button>
      </div>
      </>
      )}
    </article>
  );
}
