import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Opportunity, Recommendation } from "@/lib/hunter-data";
import { currency } from "./OpportunityCard";

const RECO_TONE: Record<Recommendation, string> = {
  PURSUE: "border-primary bg-primary/15 text-primary",
  "INVESTIGATE FURTHER": "border-signal-amber bg-signal-amber/15 text-signal-amber",
  "LOW PRIORITY": "border-border bg-muted text-muted-foreground",
  REJECT: "border-destructive bg-destructive/15 text-destructive",
};

const RECO_LABEL: Record<Recommendation, string> = {
  PURSUE: "Pursue this",
  "INVESTIGATE FURTHER": "Look into it further",
  "LOW PRIORITY": "Low priority",
  REJECT: "Reject",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-6">
      <h3 className="text-[19px] font-bold">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const th = "py-2 text-left text-[14px] font-semibold text-muted-foreground";
const td = "py-3 text-[16px]";

export function InvestigationDrawer({
  opp,
  light,
  onClose,
}: {
  opp: Opportunity | null;
  light: boolean;
  onClose: () => void;
}) {
  if (!opp) return null;
  const inv = opp.investigation;
  const w = inv.waterfall;
  const gp = w.govPrice - w.supplierCost - w.freight - w.inspCert;

  const rows: [string, string][] = [
    ["Government pays", currency(w.govPrice)],
    ["Supplier cost", `- ${currency(w.supplierCost)}`],
    ["Freight", `- ${currency(w.freight)}`],
    ["Inspection / certification", `- ${currency(w.inspCert)}`],
  ];

  return (
    <Sheet open={Boolean(opp)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className={cn("hunter w-full overflow-y-auto p-0 sm:max-w-3xl", light && "hunter-light")}
      >
        <SheetHeader className="border-b border-border px-7 py-5">
          <SheetTitle className="text-[24px] font-bold leading-tight text-foreground">
            {opp.product}
          </SheetTitle>
          <div className="data text-[15px] text-muted-foreground">
            NSN {opp.nsn} · Part {opp.partNumber}
          </div>
        </SheetHeader>

        <div className="space-y-6 px-7 pb-16 pt-4">
          <Section title="1. Demand and product">
            <div className="grid gap-3 text-[16px] sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Category (FSC): </span>
                <span className="data font-semibold">{opp.fsc}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Solicitation: </span>
                <span className="data font-semibold">{opp.solicitation}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Used on: </span>
                <span className="font-semibold">{inv.platform}</span>
              </div>
            </div>
            <table className="mt-4 w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className={th}>Year</th>
                  <th className={th}>Quantity bought</th>
                  <th className={th}>Price paid per unit</th>
                </tr>
              </thead>
              <tbody>
                {inv.historicalQty.map((h) => (
                  <tr key={h.year} className="border-b border-border/60">
                    <td className={cn(td, "data font-semibold")}>{h.year}</td>
                    <td className={cn(td, "data")}>{h.qty} units</td>
                    <td className={cn(td, "data")}>{h.unitPrice ? currency(h.unitPrice) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="2. Who can supply it">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className={th}>Supplier</th>
                  <th className={th}>Type</th>
                  <th className={th}>Location</th>
                  <th className={th}>Price</th>
                  <th className={th}>Approval status</th>
                </tr>
              </thead>
              <tbody>
                {inv.sources.map((s) => (
                  <tr key={s.name} className="border-b border-border/60">
                    <td className={cn(td, "font-semibold")}>{s.name}</td>
                    <td className={cn(td, "text-muted-foreground")}>{s.type}</td>
                    <td className={cn(td, "text-muted-foreground")}>{s.geography}</td>
                    <td className={cn(td, "data")}>{currency(s.estPrice)}</td>
                    <td
                      className={cn(
                        td,
                        "font-semibold",
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

          <Section title="3. Compliance requirements">
            <div className="flex flex-wrap gap-3">
              {inv.compliance.map((c) => (
                <span
                  key={c.label}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-[15px] font-semibold",
                    c.state === "required"
                      ? "border-destructive bg-destructive/15 text-destructive"
                      : c.state === "watch"
                        ? "border-signal-amber bg-signal-amber/15 text-signal-amber"
                        : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {c.label} — {c.state === "required" ? "applies" : c.state === "watch" ? "check this" : "not an issue"}
                </span>
              ))}
            </div>
          </Section>

          <Section title="4. Where the money goes (per unit)">
            <div className="data overflow-hidden rounded-md border border-border">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 text-[17px]"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-primary/10 px-4 py-3 text-[19px] font-bold text-primary">
                <span>Gross profit per unit</span>
                <span>{currency(gp)}</span>
              </div>
            </div>
            <p className="mt-3 text-[17px]">
              Total for {opp.quantity} units:{" "}
              <span className="data font-bold text-primary">{currency(gp * opp.quantity)}</span>
            </p>
          </Section>

          <Section title="5. Recommendation">
            <span
              className={cn(
                "inline-block rounded-md border-2 px-4 py-2 text-[18px] font-bold",
                RECO_TONE[inv.recommendation],
              )}
            >
              {RECO_LABEL[inv.recommendation]}
            </span>
            <ul className="mt-4 space-y-2.5">
              {inv.rationale.map((r) => (
                <li key={r} className="flex gap-3 text-[16px] leading-relaxed">
                  <span className="font-bold text-primary">•</span>
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
