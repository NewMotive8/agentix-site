import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HuntControls } from "@/components/hunter/HuntControls";
import { OpportunityCard } from "@/components/hunter/OpportunityCard";
import { InvestigationDrawer } from "@/components/hunter/InvestigationDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  defaultParams,
  opportunities,
  runHunt,
  type HuntParams,
  type Opportunity,
} from "@/lib/hunter-data";

export const Route = createFileRoute("/hunter")({
  head: () => ({
    meta: [
      { title: "Procurement Hunter — Defense Arbitrage Engine | Agentix" },
      {
        name: "description",
        content:
          "Terminal-grade defense procurement arbitrage engine: score SAM.gov, DLA DIBBS, NSPA and NCIA tenders by margin, demand history and source accessibility.",
      },
      { property: "og:title", content: "Procurement Hunter — Defense Arbitrage Engine" },
      {
        property: "og:description",
        content:
          "Set hunt parameters, run the algorithm and investigate scored defense procurement opportunities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HunterPage,
});

function HunterPage() {
  const [params, setParams] = useState<HuntParams>(defaultParams);
  const [results, setResults] = useState<Opportunity[]>(() => runHunt(defaultParams, opportunities));
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<Opportunity | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const runHuntNow = () => {
    setRunning(true);
    window.setTimeout(() => {
      setResults(runHunt(params, opportunities));
      setDismissed([]);
      setRunning(false);
    }, 1500);
  };

  const visible = results.filter((o) => !dismissed.includes(o.id));

  return (
    <div className="terminal flex h-screen overflow-hidden">
      <div className="w-[280px] shrink-0">
        <HuntControls params={params} onChange={setParams} onRun={runHuntNow} running={running} />
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Opportunity Feed</span>
          <span className="text-primary">
            {running ? "RUNNING HUNT…" : `${visible.length} TARGETS // SORTED BY SCORE`}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {running ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-52 w-full rounded-sm bg-muted" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              No opportunities match current hunt parameters.
            </div>
          ) : (
            <div className="space-y-4">
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

      <InvestigationDrawer opp={active} onClose={() => setActive(null)} />
    </div>
  );
}
