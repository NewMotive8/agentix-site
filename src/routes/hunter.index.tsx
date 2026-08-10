import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import { HuntControls } from "@/components/hunter/HuntControls";
import { OpportunityCard } from "@/components/hunter/OpportunityCard";
import { InvestigationDrawer } from "@/components/hunter/InvestigationDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHunterLight } from "@/lib/hunter-theme";
import {
  defaultParams,
  opportunities,
  runHunt,
  type HuntParams,
  type Opportunity,
} from "@/lib/hunter-data";

export const Route = createFileRoute("/hunter/")({
  head: () => ({
    meta: [
      { title: "Procurement Hunter — Defense Arbitrage Engine | Agentix" },
      {
        name: "description",
        content:
          "Scored defense procurement opportunities from SAM.gov, DLA DIBBS, NSPA and NCIA, with margin, demand history and supply-market analysis.",
      },
      { property: "og:title", content: "Procurement Hunter — Defense Arbitrage Engine" },
      {
        property: "og:description",
        content: "Set your search settings, run the hunt and investigate scored opportunities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HunterPage,
});

function HunterPage() {
  const { light, toggle } = useHunterLight();
  const [params, setParams] = useState<HuntParams>(defaultParams);
  const [results, setResults] = useState<Opportunity[]>(() => runHunt(defaultParams, opportunities));
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<Opportunity | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const start = () => {
    setRunning(true);
    window.setTimeout(() => {
      setResults(runHunt(params, opportunities));
      setDismissed([]);
      setRunning(false);
    }, 1500);
  };

  const visible = results.filter((o) => !dismissed.includes(o.id));

  return (
    <div className={cn("hunter flex h-screen overflow-hidden", light && "hunter-light")}>
      <div className="w-[340px] shrink-0">
        <HuntControls params={params} onChange={setParams} onRun={start} running={running} />
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <h2 className="text-[20px] font-bold">Opportunities</h2>
          <div className="flex items-center gap-4">
            <span className="text-[16px] font-semibold text-primary">
              {running ? "Searching…" : `${visible.length} results, best first`}
            </span>
            <Button variant="outline" size="sm" onClick={toggle} className="h-10 gap-2 text-[14px]">
              {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {light ? "Dark" : "Light"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {running ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-lg bg-muted" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="mx-auto mt-16 max-w-md rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-[18px] font-semibold">No results match your settings.</p>
              <p className="mt-2 text-[16px] text-muted-foreground">
                Lower the minimum margin or contract value, allow more competitors, or turn on more
                sources, then press Run hunt again.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl space-y-6">
              {visible.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  saved={saved.includes(opp.id)}
                  onInvestigate={() => setActive(opp)}
                  onSave={() =>
                    setSaved((s) =>
                      s.includes(opp.id) ? s.filter((i) => i !== opp.id) : [...s, opp.id],
                    )
                  }
                  onDismiss={() => setDismissed((d) => [...d, opp.id])}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <InvestigationDrawer opp={active} light={light} onClose={() => setActive(null)} />
    </div>
  );
}
