import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, Search, X, Calendar, Package, Hash } from "lucide-react";
import type { Opportunity } from "@/lib/hunter-data";

export const currency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export function LevelBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "bad" | "info";
}) {
  const tones = {
    good: "border-primary/50 bg-primary/10 text-primary",
    warn: "border-signal-amber/50 bg-signal-amber/10 text-signal-amber",
    bad: "border-border bg-muted text-muted-foreground",
    info: "border-signal-blue/50 bg-signal-blue/10 text-signal-blue",
  } as const;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      {label}:
      <span className={cn("rounded-sm border px-1.5 py-0.5 font-bold", tones[tone])}>{value}</span>
    </span>
  );
}

export function toneFor(v: string): "good" | "warn" | "bad" {
  if (v === "HIGH" || v === "VERY HIGH") return "good";
  if (v === "MED") return "warn";
  return "bad";
}

export function OpportunityCard({
  opp,
  saved,
  onInvestigate,
  onSave,
  onDismiss,
}: {
  opp: Opportunity;
  saved: boolean;
  onInvestigate: () => void;
  onSave: () => void;
  onDismiss: () => void;
}) {
  const scoreTone =
    opp.score > 80
      ? "border-primary/60 bg-primary/15 text-primary"
      : opp.score > 60
        ? "border-signal-amber/60 bg-signal-amber/10 text-signal-amber"
        : "border-border bg-muted text-muted-foreground";

  return (
    <article className="rounded-sm border border-border bg-card/60 p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {opp.agency} — {opp.solicitation}
            <span className="ml-2 text-signal-blue">{opp.sourceLabel}</span>
          </div>
          <h3 className="mt-1 text-[13px] font-bold tracking-tight">{opp.product}</h3>
        </div>
        <div className={cn("shrink-0 rounded-sm border px-2.5 py-1 text-center", scoreTone)}>
          <div className="text-[9px] uppercase tracking-[0.15em] opacity-80">Opportunity Score</div>
          <div className="text-base font-bold tabular-nums leading-tight">{opp.score}/100</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Hash className="h-3 w-3" />
          <span className="tabular-nums text-foreground">{opp.nsn}</span> / {opp.partNumber}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Package className="h-3 w-3" />
          QTY <span className="tabular-nums text-foreground">{opp.quantity} EA</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          DEADLINE <span className="tabular-nums text-foreground">{opp.deadline}</span>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        <LevelBadge label="Historical Demand" value={opp.demand} tone={toneFor(opp.demand)} />
        <LevelBadge label="Source Accessibility" value={opp.accessibility} tone={toneFor(opp.accessibility)} />
        <LevelBadge label="Pricing Confidence" value={opp.pricingConfidence} tone={toneFor(opp.pricingConfidence)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 border-y border-border py-2 text-[11px]">
        <span className="text-muted-foreground">
          EST. VALUE <span className="ml-1 tabular-nums text-foreground">{currency(opp.estValue)}</span>
        </span>
        <span className="text-muted-foreground">
          EST. MARGIN <span className="ml-1 tabular-nums text-primary">{opp.estMargin}%</span>
        </span>
        <span className="text-muted-foreground">
          EST. GROSS PROFIT{" "}
          <span className="ml-1 tabular-nums text-primary">{currency(opp.estGrossProfit)}</span>
        </span>
      </div>

      <p className="mt-3 max-w-4xl text-[11px] leading-relaxed text-muted-foreground">
        <span className="text-signal-blue">AI // </span>
        {opp.aiSummary}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={onInvestigate}
          size="sm"
          className="h-7 gap-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.18em]"
        >
          <Search className="h-3 w-3" /> Investigate
        </Button>
        <Button
          onClick={onSave}
          size="sm"
          variant="outline"
          className={cn(
            "h-7 gap-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.18em]",
            saved && "border-primary/60 text-primary",
          )}
        >
          <Bookmark className="h-3 w-3" /> {saved ? "Saved" : "Save"}
        </Button>
        <Button
          onClick={onDismiss}
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"
        >
          <X className="h-3 w-3" /> Dismiss
        </Button>
      </div>
    </article>
  );
}
