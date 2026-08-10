import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, Search, X } from "lucide-react";
import type { Opportunity } from "@/lib/hunter-data";

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
  opp: Opportunity;
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

  return (
    <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
        <div className="min-w-0">
          <div className="text-[14px] text-muted-foreground">
            {opp.agency} · Solicitation <span className="data">{opp.solicitation}</span> ·{" "}
            <span className="font-semibold text-signal-blue">{opp.sourceLabel}</span>
          </div>
          <h3 className="mt-1.5 text-[21px] font-bold leading-snug">{opp.product}</h3>
        </div>
        <div className={cn("shrink-0 rounded-lg border-2 px-4 py-2 text-center", band.cls)}>
          <div className="data text-[30px] font-bold leading-none">{opp.score}</div>
          <div className="text-[13px] font-semibold">out of 100</div>
          <div className="text-[14px] font-bold">{band.word}</div>
        </div>
      </div>

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
        <Stat label="Estimated margin" value={`${opp.estMargin}%`} strong />
        <Stat label="Estimated gross profit" value={currency(opp.estGrossProfit)} strong />
      </div>

      <div className="mt-5 rounded-md border border-border bg-muted/40 p-4">
        <div className="text-[13px] font-semibold uppercase tracking-wide text-signal-blue">
          Analysis
        </div>
        <p className="mt-1.5 text-[16px] leading-relaxed text-foreground">{opp.aiSummary}</p>
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
    </article>
  );
}
