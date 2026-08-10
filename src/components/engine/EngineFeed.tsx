import { Fragment, useState } from "react";
import type { Opportunity, PricingHistory } from "@/lib/engine-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const currency = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);

function PriceSparkline({ history }: { history: PricingHistory[] }) {
  if (history.length < 2) {
    return <span className="text-[10px] text-muted-foreground">INSUFFICIENT DATA</span>;
  }
  const prices = history.map((h) => h.price).reverse();
  const min = Math.min(...prices) * 0.95;
  const max = Math.max(...prices) * 1.05;
  const width = 160;
  const height = 36;
  const coords = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - min) / (max - min || 1)) * height;
    return { x, y };
  });

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={1.5}
      />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={2} fill="var(--primary)" />
      ))}
    </svg>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 85
      ? "border-primary/50 bg-primary/15 text-primary"
      : score >= 70
        ? "border-signal-amber/50 bg-signal-amber/10 text-signal-amber"
        : "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex w-9 justify-center rounded-sm border px-1 py-0.5 text-[11px] font-bold tabular-nums",
        tone,
      )}
    >
      {score}
    </span>
  );
}

const COLUMNS = [
  "Score",
  "Source",
  "NSN / Part Number",
  "Nomenclature",
  "Est. Value",
  "Margin",
  "Incumbent OEM",
  "Closing",
];

export function EngineFeed({ data, loading }: { data: Opportunity[]; loading: boolean }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Live Opportunity Feed</span>
        <span className="text-primary">
          {loading
            ? "RECOMPUTING ALGORITHM…"
            : `FOUND ${data.length} TARGETS // SORTED BY VIABILITY`}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-sm bg-muted" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-10 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          No opportunities match current algorithm constraints.
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Table className="text-[11px]">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {COLUMNS.map((c) => (
                  <TableHead
                    key={c}
                    className="h-8 whitespace-nowrap text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((opp) => (
                <Fragment key={opp.id}>
                  <TableRow
                    onClick={() => setExpandedRow(expandedRow === opp.id ? null : opp.id)}
                    className={cn(
                      "cursor-pointer border-border hover:bg-muted/60",
                      expandedRow === opp.id && "bg-muted/60",
                    )}
                  >
                    <TableCell className="py-1.5">
                      <ScoreBadge score={opp.score} />
                    </TableCell>
                    <TableCell className="py-1.5 whitespace-nowrap text-muted-foreground">
                      {opp.source}
                    </TableCell>
                    <TableCell className="py-1.5 whitespace-nowrap tabular-nums">
                      {opp.nsn}
                      <span className="ml-2 text-muted-foreground">{opp.partNumber}</span>
                    </TableCell>
                    <TableCell className="py-1.5">{opp.nomenclature}</TableCell>
                    <TableCell className="py-1.5 whitespace-nowrap tabular-nums">
                      {currency(opp.estValue)}
                    </TableCell>
                    <TableCell className="py-1.5 tabular-nums text-primary">
                      {opp.estMargin}%
                    </TableCell>
                    <TableCell className="py-1.5 text-muted-foreground">
                      {opp.incumbents.join(", ")}
                    </TableCell>
                    <TableCell className="py-1.5 whitespace-nowrap tabular-nums">
                      {opp.closingDate}
                    </TableCell>
                  </TableRow>

                  {expandedRow === opp.id && (
                    <TableRow className="border-border bg-card/60 hover:bg-card/60">
                      <TableCell colSpan={COLUMNS.length} className="p-0">
                        <div className="grid gap-8 border-l-2 border-primary px-6 py-5 md:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.2em] text-primary">
                                Intelligence Summary
                              </div>
                              <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
                                {opp.details.description}
                              </p>
                            </div>
                            <div className="flex gap-10">
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                  Target Qty
                                </div>
                                <div className="mt-1 tabular-nums">{opp.details.qty} EA</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                  Delivery Requirement
                                </div>
                                <div className="mt-1">{opp.details.deliveryTerms}</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-primary">
                              Historical Award Economics
                            </div>
                            <div className="mt-3">
                              <PriceSparkline history={opp.details.history} />
                            </div>
                            <div className="mt-3 space-y-1">
                              {opp.details.history.map((h) => (
                                <div
                                  key={`${h.date}-${h.vendor}`}
                                  className="flex items-center justify-between border-b border-border/60 py-1 text-[11px]"
                                >
                                  <span className="tabular-nums text-muted-foreground">
                                    {h.date}
                                  </span>
                                  <span>{h.vendor}</span>
                                  <span className="tabular-nums">{currency(h.price)}/ea</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}