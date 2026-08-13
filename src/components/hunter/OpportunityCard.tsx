import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, ChevronDown, ExternalLink, Layers, Search, X } from "lucide-react";
import type { Opportunity } from "@/lib/hunter-data";
import type { EstimateConfidence, Scored } from "@/lib/hunt/types";
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

const CONF_LABEL: Record<EstimateConfidence, string> = {
  HIGH: "High confidence",
  MEDIUM: "Medium confidence",
  LOW: "Low confidence",
};

const CONF_CLASS: Record<EstimateConfidence, string> = {
  HIGH: "border-primary/60 bg-primary/10 text-primary",
  MEDIUM: "border-signal-amber/60 bg-signal-amber/15 text-signal-amber",
  LOW: "border-border bg-muted text-muted-foreground",
};

/** Collapsible detail block — the card stays short until you ask for more. */
function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[16px] font-bold"
      >
        {title}
        <ChevronDown className={cn("h-5 w-5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-border p-4">{children}</div>}
    </div>
  );
}

/** Pulls one estimate line out by keyword so it can headline the card. */
function estimateOf(opp: Scored, keyword: string) {
  return opp.estimates?.items.find((e) => e.label.toLowerCase().includes(keyword));
}

const KIND_LABEL: Record<string, string> = {
  SINGLE: "One item",
  FEW: "A few items",
  CATALOGUE: "Many items — catalogue or framework",
  UNKNOWN: "Item not stated on the page",
};

/** Live notice: business framing first, procurement codes as secondary metadata. */
function LiveBody({ opp }: { opp: Scored }) {
  const [openReport, setOpenReport] = useState(false);
  const sig = opp.signal;
  const deep = opp.deep;
  const codes = [
    opp.nsn && `NSN ${opp.nsn}`,
    opp.partNumber && `P/N ${opp.partNumber}`,
    opp.fsc && `Class ${opp.fsc}`,
    opp.solicitation && opp.solicitation !== "—" && `Ref ${opp.solicitation}`,
    opp.provenance.rawNoticeType,
  ].filter(Boolean) as string[];

  return (
    <>
      {sig && (
        <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
          <div className="text-[15px] font-bold text-foreground">Why this is interesting</div>
          <ul className="mt-2 space-y-1.5 text-[16px] leading-relaxed text-foreground">
            {sig.reasons.slice(0, 3).map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
          <p className="mt-2 text-[16px] leading-relaxed text-signal-amber">{sig.risk}</p>
        </div>
      )}

      {opp.estimates && opp.estimates.items.length > 0 && (
        <Fold title="Money — full estimate">
          <div className="grid gap-4 sm:grid-cols-2">
            {opp.estimates.items.map((e) => (
              <div key={e.label}>
                <div className="text-[13px] text-muted-foreground">{e.label}</div>
                <div className="data mt-0.5 text-[17px] font-bold text-foreground">{e.value}</div>
                <span
                  className={cn(
                    "mt-1 inline-block rounded border px-1.5 py-0.5 text-[12px] font-semibold",
                    CONF_CLASS[e.confidence],
                  )}
                >
                  {CONF_LABEL[e.confidence]}
                </span>
                <p className="mt-1 text-[14px] leading-snug text-muted-foreground">{e.basis}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">{opp.estimates.note}</p>
        </Fold>
      )}

      {deep && (
        <div className="mt-4 rounded-md border border-border">
          <button
            type="button"
            onClick={() => setOpenReport((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[16px] font-bold"
          >
            Full research report
            <ChevronDown className={cn("h-5 w-5 transition-transform", openReport && "rotate-180")} />
          </button>
          {openReport && (
            <div className="space-y-4 border-t border-border p-4">
              {codes.length > 0 && (
                <p className="text-[13px] text-muted-foreground">{codes.join(" · ")}</p>
              )}
              {deep.summary.length > 0 && (
                <div>
                  <div className="text-[15px] font-bold">What the buyer is asking for</div>
                  <ul className="mt-1.5 space-y-1 text-[16px] text-foreground">
                    {deep.summary.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {deep.requirements.length > 0 && (
                <div>
                  <div className="text-[15px] font-bold">What you would have to deliver</div>
                  <ul className="mt-1.5 space-y-1 text-[16px] text-foreground">
                    {deep.requirements.slice(0, 8).map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {deep.complianceFlags.length > 0 && (
                <div>
                  <div className="text-[15px] font-bold">Rules that could block you</div>
                  <p className="mt-1 text-[16px] text-signal-amber">{deep.complianceFlags.join(" · ")}</p>
                </div>
              )}
              <div>
                <div className="text-[15px] font-bold">Who could supply it</div>
                <p className="text-[13px] text-muted-foreground">
                  Commercial web research — not confirmed by the buyer.
                </p>
                {deep.suppliers.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {deep.suppliers.map((s) => (
                      <div key={`${s.name}-${s.sourceUrl}`} className="text-[15px]">
                        <span className="font-bold">{s.name}</span>{" "}
                        <span className="data rounded border border-border px-1.5 py-0.5 text-[12px] font-semibold text-muted-foreground">
                          {s.type}
                        </span>{" "}
                        · {s.country} ·{" "}
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-signal-blue underline underline-offset-2"
                        >
                          source
                        </a>{" "}
                        <span className="text-muted-foreground">{s.evidence}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-[15px] text-muted-foreground">
                    {deep.note || "No supplier could be evidenced from public sources yet."}
                  </p>
                )}
              </div>
              {deep.documentUrls.length > 0 && (
                <div className="space-y-1 text-[15px]">
                  <div className="text-[15px] font-bold">Documents found</div>
                  {deep.documentUrls.map((u) => (
                    <a
                      key={u}
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-signal-blue underline underline-offset-2"
                    >
                      {u}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
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

  const sig = opp.signal;
  const sigBand = !sig
    ? { cls: "border-border bg-muted text-muted-foreground" }
    : sig.score >= 70
      ? { cls: "border-primary bg-primary/15 text-primary" }
      : sig.score >= 45
        ? { cls: "border-signal-amber bg-signal-amber/15 text-signal-amber" }
        : { cls: "border-border bg-muted text-muted-foreground" };

  const id = opp.identity;
  const size = estimateOf(opp, "contract size");
  const margin = estimateOf(opp, "margin");
  const meta = [
    id?.quantity && `Qty ${id.quantity}`,
    opp.deadline && `Closes ${opp.deadline}`,
    id && KIND_LABEL[id.itemKind],
  ].filter(Boolean) as string[];

  return (
    <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
        <div className="flex min-w-0 gap-4">
          {id?.imageUrl ? (
            <a
              href={id.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden shrink-0 sm:block"
              title="Picture found on the notice page"
            >
              <img
                src={id.imageUrl}
                alt={id.productName}
                loading="lazy"
                className="h-24 w-24 rounded-md border border-border object-contain bg-muted/40"
              />
            </a>
          ) : id?.itemKind === "CATALOGUE" || id?.itemKind === "FEW" ? (
            <div className="hidden h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/40 text-center text-[12px] text-muted-foreground sm:flex">
              <Layers className="h-6 w-6" />
              Many items
            </div>
          ) : null}

          <div className="min-w-0">
            <h3 className="text-[22px] font-bold leading-snug">{id?.productName || opp.product}</h3>
            {id?.whatItIs && (
              <p className="mt-1 text-[16px] leading-snug text-foreground">{id.whatItIs}</p>
            )}
            <div className="mt-1.5 text-[14px] text-muted-foreground">
              <span className="font-semibold text-foreground">{opp.agency}</span> ·{" "}
              <span className="font-semibold text-signal-blue">{opp.sourceLabel}</span>
              {meta.length > 0 && <> · {meta.join(" · ")}</>}
            </div>
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
              <a
                href={opp.provenance.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-signal-blue underline underline-offset-2"
              >
                Open original notice
              </a>
              {id?.itemListUrl && (
                <a
                  href={id.itemListUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-signal-blue underline underline-offset-2"
                >
                  See the item list
                </a>
              )}
              {id?.note && <span className="text-muted-foreground">{id.note}</span>}
            </div>
          </div>
        </div>
        {opp.analysisAvailable ? (
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
        ) : sig ? (
          <div className="flex shrink-0 items-start gap-3">
            {(size || margin) && (
              <div className="rounded-lg border-2 border-primary/60 bg-primary/10 px-4 py-2 text-right">
                {size && (
                  <>
                    <div className="text-[12px] font-semibold text-muted-foreground">Deal size</div>
                    <div className="data text-[19px] font-bold text-primary">{size.value}</div>
                  </>
                )}
                {margin && (
                  <>
                    <div className="mt-1 text-[12px] font-semibold text-muted-foreground">Margin</div>
                    <div className="data text-[19px] font-bold text-primary">{margin.value}</div>
                  </>
                )}
                <div className="text-[11px] text-muted-foreground">estimate</div>
              </div>
            )}
            <div className={cn("rounded-lg border-2 px-4 py-2 text-center", sigBand.cls)}>
              <div className="data text-[30px] font-bold leading-none">{sig.score}</div>
              <div className="text-[13px] font-semibold">Signal</div>
              <div className="text-[14px] font-bold">{sig.verdict}</div>
            </div>
          </div>
        ) : (
          <span />
        )}
      </div>

      {!opp.analysisAvailable && (
        <>
          <LiveBody opp={opp} />
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="h-12 gap-2 px-6 text-[16px] font-bold">
              <a href={opp.provenance.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-5 w-5" /> Open the original notice
              </a>
            </Button>
            <Button onClick={onSave} variant="outline" className={cn("h-12 gap-2 px-5 text-[16px]", saved && "border-primary text-primary")}>
              <Bookmark className="h-5 w-5" /> {saved ? "Saved" : "Save"}
            </Button>
            <Button onClick={onDismiss} variant="ghost" className="h-12 gap-2 px-5 text-[16px]">
              <X className="h-5 w-5" /> Dismiss
            </Button>
          </div>
        </>
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
