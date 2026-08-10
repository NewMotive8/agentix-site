import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Opportunity, Recommendation } from "@/lib/hunter-data";
import { currency } from "./OpportunityCard";

const RECO_TONE: Record<Recommendation, string> = {
  PURSUE: "border-primary/60 bg-primary/15 text-primary",
  "INVESTIGATE FURTHER": "border-signal-amber/60 bg-signal-amber/10 text-signal-amber",
  "LOW PRIORITY": "border-border bg-muted text-muted-foreground",
  REJECT: "border-destructive/60 bg-destructive/15 text-destructive",
};

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-primary">
        {n} // {title}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function pad(label: string, value: string) {
  return `${label.padEnd(18, " ")}${value.padStart(10, " ")}`;
}

export function InvestigationDrawer({
  opp,
  onClose,
}: {
  opp: Opportunity | null;
  onClose: () => void;
}) {
  if (!opp) return null;
  const inv = opp.investigation;
  const w = inv.waterfall;
  const gp = w.govPrice - w.supplierCost - w.freight - w.inspCert;

  return (
    <Sheet open={Boolean(opp)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="terminal w-full overflow-y-auto border-border p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {opp.nsn} // {opp.partNumber}
          </div>
          <SheetTitle className="text-[15px] font-bold tracking-tight text-foreground">
            {opp.product}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 px-6 pb-10 pt-2 text-[11px]">
          <Section n="01" title="Demand & Product">
            <div className="grid grid-cols-2 gap-3 text-muted-foreground">
              <div>
                FSC <span className="text-foreground">{opp.fsc}</span>
              </div>
              <div>
                Solicitation <span className="text-foreground">{opp.solicitation}</span>
              </div>
              <div className="col-span-2">
                End platform <span className="text-foreground">{inv.platform}</span>
              </div>
            </div>
            <table className="mt-3 w-full text-[11px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  <th className="py-1 font-normal">Fiscal Year</th>
                  <th className="py-1 font-normal">Qty Procured</th>
                  <th className="py-1 font-normal">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {inv.historicalQty.map((h) => (
                  <tr key={h.year} className="border-t border-border/60">
                    <td className="py-1">{h.year}</td>
                    <td className="py-1 tabular-nums">{h.qty} EA</td>
                    <td className="py-1 tabular-nums">
                      {h.unitPrice ? currency(h.unitPrice) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section n="02" title="OEM & Supply Market">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  <th className="py-1 font-normal">Source</th>
                  <th className="py-1 font-normal">Type</th>
                  <th className="py-1 font-normal">Geography</th>
                  <th className="py-1 font-normal">Est. Price</th>
                  <th className="py-1 font-normal">Qualification</th>
                </tr>
              </thead>
              <tbody>
                {inv.sources.map((s) => (
                  <tr key={s.name} className="border-t border-border/60">
                    <td className="py-1.5">{s.name}</td>
                    <td className="py-1.5 text-muted-foreground">{s.type}</td>
                    <td className="py-1.5 text-muted-foreground">{s.geography}</td>
                    <td className="py-1.5 tabular-nums">{currency(s.estPrice)}</td>
                    <td
                      className={cn(
                        "py-1.5",
                        s.qualification === "Unqualified"
                          ? "text-muted-foreground"
                          : s.qualification === "Requires SAR"
                            ? "text-signal-amber"
                            : "text-primary",
                      )}
                    >
                      {s.qualification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section n="03" title="Compliance Flags">
            <div className="flex flex-wrap gap-2">
              {inv.compliance.map((c) => (
                <span
                  key={c.label}
                  className={cn(
                    "rounded-sm border px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
                    c.state === "required"
                      ? "border-destructive/50 bg-destructive/10 text-destructive"
                      : c.state === "watch"
                        ? "border-signal-amber/50 bg-signal-amber/10 text-signal-amber"
                        : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {c.label} · {c.state}
                </span>
              ))}
            </div>
          </Section>

          <Section n="04" title="Economics Waterfall (per unit)">
            <pre className="overflow-x-auto rounded-sm border border-border bg-background p-4 text-[11px] leading-relaxed">
{`  ${pad("Gov Price:", currency(w.govPrice))}
- ${pad("Supplier Cost:", currency(w.supplierCost))}
- ${pad("Freight:", currency(w.freight))}
- ${pad("Insp/Cert:", currency(w.inspCert))}
  ==============================
= ${pad("Est. GP:", currency(gp))}`}
            </pre>
            <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Line total ({opp.quantity} EA):{" "}
              <span className="text-primary">{currency(gp * opp.quantity)}</span>
            </div>
          </Section>

          <Section n="05" title="Final Recommendation">
            <span
              className={cn(
                "inline-block rounded-sm border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]",
                RECO_TONE[inv.recommendation],
              )}
            >
              {inv.recommendation}
            </span>
            <ul className="mt-3 space-y-1.5 text-muted-foreground">
              {inv.rationale.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-primary">›</span>
                  {r}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
