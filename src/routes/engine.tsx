import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EngineSidebar } from "@/components/engine/EngineSidebar";
import { EngineFeed } from "@/components/engine/EngineFeed";
import {
  defaultPrefs,
  filterOpportunities,
  mockOpportunities,
  type EnginePrefs,
} from "@/lib/engine-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/engine")({
  head: () => ({
    meta: [
      { title: "Arbitrage Engine — Defense Procurement Terminal | Agentix" },
      {
        name: "description",
        content:
          "Live defense procurement arbitrage terminal: viability-scored NSPA, SAM.gov and DLA DIBBS tenders with margin, incumbent and historical award analytics.",
      },
      { property: "og:title", content: "Agentix Arbitrage Engine" },
      {
        property: "og:description",
        content:
          "High-density procurement terminal scoring defense tenders by margin, incumbency and award history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EnginePage,
});

function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          active ? "bg-primary pulse-dot" : "bg-destructive",
        )}
      />
      {label}
    </div>
  );
}

function EnginePage() {
  const [activePrefs, setActivePrefs] = useState<EnginePrefs>(defaultPrefs);
  const [liveSources, setLiveSources] = useState(defaultPrefs.sources);
  const [loading, setLoading] = useState(false);

  const filteredData = filterOpportunities(activePrefs, mockOpportunities);

  const handleUpdate = (newPrefs: EnginePrefs) => {
    setLoading(true);
    window.setTimeout(() => {
      setActivePrefs(newPrefs);
      setLiveSources(newPrefs.sources);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="terminal flex h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
          <h1 className="text-[11px] font-bold uppercase tracking-[0.3em]">
            Agentix // Arbitrage Engine
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <StatusDot active={liveSources.nspa} label="NSPA XML Feed" />
          <StatusDot active={liveSources.sam} label="SAM.gov REST API" />
          <StatusDot active={liveSources.dla} label="WebFLIS Price DB" />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[300px_1fr]">
        <EngineSidebar
          initialPrefs={defaultPrefs}
          onUpdate={handleUpdate}
          onSourcesChange={setLiveSources}
        />
        <main className="min-h-0 overflow-hidden">
          <EngineFeed data={filteredData} loading={loading} />
        </main>
      </div>
    </div>
  );
}