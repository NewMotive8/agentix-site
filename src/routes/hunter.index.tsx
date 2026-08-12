import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import { HuntControls } from "@/components/hunter/HuntControls";
import { OpportunityCard } from "@/components/hunter/OpportunityCard";
import { InvestigationDrawer } from "@/components/hunter/InvestigationDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHunterLight } from "@/lib/hunter-theme";
import { defaultParams, type HuntParams } from "@/lib/hunter-data";
import { PIPELINE_STAGES, runPipeline } from "@/lib/hunt/pipeline";
import {
  defaultWorkingCapital,
  workingCapitalLabel,
  type HuntMode,
  type HuntRun,
  type Scored,
  type WorkingCapital,
} from "@/lib/hunt/types";
import { statusLine } from "@/lib/hunt/sources/registry";

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

function currency(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-[19px] font-bold">{title}</h3>
      {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function HunterPage() {
  const { light, toggle } = useHunterLight();
  const [params, setParams] = useState<HuntParams>(defaultParams);
  const [workingCapital, setWorkingCapital] = useState<WorkingCapital>(defaultWorkingCapital);
  const [mode, setMode] = useState<HuntMode>("live");
  const [run, setRun] = useState<HuntRun | null>(null);
  const [running, setRunning] = useState(true);
  const [stage, setStage] = useState(0);
  const [active, setActive] = useState<Scored | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [ranAtLabel, setRanAtLabel] = useState("");

  const start = (nextMode: HuntMode = mode) => {
    setRunning(true);
    setStage(0);
    const finished = runPipeline({ params, workingCapital, mode: nextMode });
    const step = async (i: number) => {
      if (i >= PIPELINE_STAGES.length) {
        const result = await finished;
        setRun(result);
        setRanAtLabel(new Date(result.ranAt).toLocaleString());
        setDismissed([]);
        setRunning(false);
        return;
      }
      setStage(i);
      window.setTimeout(() => void step(i + 1), 260);
    };
    void step(0);
  };

  // Live mode is the default: run once on mount, in the browser only.
  useEffect(() => {
    start("live");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = (run?.qualified ?? []).filter((o) => !dismissed.includes(o.id));
  const constrained = (run?.capitalConstrained ?? []).filter((o) => !dismissed.includes(o.id));

  const cardProps = (opp: Scored) => ({
    opp,
    saved: saved.includes(opp.id),
    onInvestigate: () => setActive(opp),
    onSave: () =>
      setSaved((s) => (s.includes(opp.id) ? s.filter((i) => i !== opp.id) : [...s, opp.id])),
    onDismiss: () => setDismissed((d) => [...d, opp.id]),
  });

  return (
    <div className={cn("hunter flex h-screen overflow-hidden", light && "hunter-light")}>
      <div className="w-[340px] shrink-0">
        <HuntControls
          params={params}
          workingCapital={workingCapital}
          onWorkingCapitalChange={setWorkingCapital}
          onChange={setParams}
          onRun={() => start()}
          running={running}
          mode={mode}
          onModeChange={(m) => {
            setMode(m);
            start(m);
          }}
          sourceStatuses={run?.sourceStatuses ?? []}
        />
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
        {run && !run.integrity.liveClean && (
          <div className="border-b border-signal-amber/60 bg-signal-amber/15 px-6 py-2.5 text-[15px] font-bold text-signal-amber">
            DEMO — SIMULATED DATA · developer mode — {run.integrity.reason} These are not real
            procurement opportunities.
          </div>
        )}
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="text-[20px] font-bold">
              {run?.isDemo
                ? "DEMO — SIMULATED DATA"
                : run?.sourceStatuses.some((s) => s.state === "LIVE")
                  ? "LIVE PROCUREMENT DATA"
                  : "LIVE MODE — NO SOURCES CONNECTED"}
            </h2>
            <p className="text-[15px] text-muted-foreground">
              Procurement Watch · working-capital limit:{" "}
              <span className="data font-bold text-primary">
                {workingCapitalLabel(run?.workingCapital ?? workingCapital)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[16px] font-semibold text-primary">
              {running ? "Running…" : `${visible.length} qualified · ${constrained.length} capital constrained`}
            </span>
            <Button variant="outline" size="sm" onClick={toggle} className="h-10 gap-2 text-[14px]">
              {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {light ? "Dark" : "Light"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {running || !run ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-[18px] font-bold">
                  {mode === "live" ? "Hunting live sources…" : "Replaying simulated corpus…"}
                </h3>
                <ul className="mt-3 space-y-1 text-[15px]">
                  {(run?.sourceStatuses ?? []).map((s) => (
                    <li
                      key={s.key}
                      className={cn("data font-semibold", s.state === "LIVE" ? "text-primary" : "text-muted-foreground")}
                    >
                      {statusLine(s)}
                    </li>
                  ))}
                </ul>
                <ol className="mt-4 space-y-2">
                  {PIPELINE_STAGES.map((s, i) => (
                    <li
                      key={s.key}
                      className={cn(
                        "flex items-baseline justify-between gap-4 rounded-md border px-4 py-2.5 text-[16px]",
                        i < stage
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : i === stage
                            ? "border-primary bg-primary/20 font-bold text-primary"
                            : "border-border text-muted-foreground",
                      )}
                    >
                      <span>{s.label}</span>
                      <span className="text-[14px]">{s.detail}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-5xl space-y-6">
              <Section
                title="Executive summary"
                subtitle={`Run ${ranAtLabel} · ${run.queriesRun} queries · ${run.rawCandidates} raw candidates · ${run.afterDedupe} after de-duplication`}
              >
                <ul className="mb-4 space-y-1 text-[15px]">
                  {run.sourceStatuses.map((s) => (
                    <li
                      key={s.key}
                      className={cn("data font-semibold", s.state === "LIVE" ? "text-primary" : "text-muted-foreground")}
                    >
                      {statusLine(s)} {s.state === "LIVE" ? `· ${s.count} notices` : `· ${s.detail}`}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1.5 text-[16px] leading-relaxed text-foreground">
                  {run.summary.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </Section>

              {run.top3.length > 0 && (
                <Section title="Top 3 to investigate" subtitle="Best combination of attractiveness and executability.">
                  <ol className="space-y-3">
                    {run.top3.map((o, i) => (
                      <li key={o.id} className="rounded-md border border-primary/40 bg-primary/5 p-4">
                        <div className="text-[17px] font-bold">
                          {i + 1}. {o.product}
                        </div>
                        <p className="mt-1 text-[16px] leading-relaxed text-muted-foreground">
                          {o.agency} · {o.solicitation} — Opportunity {o.opportunityScore}, Execution{" "}
                          {o.executionScore}, executable margin {o.executableMarginPct}%, cash before payment{" "}
                          {currency(o.cash.cashRequired)}. {o.verdictReason}
                        </p>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {visible.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-[18px] font-semibold">
                    Only {visible.length} opportunities passed the current criteria.
                  </p>
                  <p className="mt-2 text-[16px] text-muted-foreground">
                    Raise the working-capital limit, lower the minimum margin or contract value, or turn on
                    more sources, then run the hunt again.
                  </p>
                </div>
              ) : (
                visible.map((opp) => <OpportunityCard key={opp.id} {...cardProps(opp)} />)
              )}

              {constrained.length > 0 && (
                <Section
                  title="Potential opportunities — financing required"
                  subtitle={`Attractive, but above the working-capital limit of ${workingCapitalLabel(run.workingCapital)}. Tagged CAPITAL CONSTRAINED, not rejected — re-run when financing capacity changes.`}
                >
                  <div className="space-y-6">
                    {constrained.map((opp) => (
                      <OpportunityCard key={opp.id} {...cardProps(opp)} />
                    ))}
                  </div>
                </Section>
              )}

              {run.sourcesSought.length > 0 && (
                <Section title="Sources sought / presolicitations" subtitle="Kept separate from active bids.">
                  <ul className="space-y-2 text-[16px]">
                    {run.sourcesSought.map((o) => (
                      <li key={o.id}>
                        <span className="font-semibold">{o.product}</span> — {o.agency} · {o.solicitation}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {run.futureSignals.length > 0 && (
                <Section title="Future procurement signals" subtitle="Forecasts, frameworks and market surveys.">
                  <ul className="space-y-2 text-[16px]">
                    {run.futureSignals.map((o) => (
                      <li key={o.id}>
                        <span className="font-semibold">{o.product}</span> — {o.agency}, deadline {o.deadline}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {run.families.length > 0 && (
                <Section title="Procurement families" subtitle="Related notices consolidated before scoring.">
                  <ul className="space-y-2 text-[16px]">
                    {run.families.map((f) => (
                      <li key={f.id}>
                        <span className="font-semibold">{f.label}</span> — {f.members.length} notices,{" "}
                        {currency(f.aggregateValue)} aggregate, buyers: {f.buyers.join(", ")}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section title="Repeat demand signals" subtitle="Per-NSN history behind the demand score.">
                <ul className="space-y-2 text-[16px]">
                  {[...run.qualified, ...run.capitalConstrained]
                    .filter((o) => o.repeatDemandScore >= 50)
                    .slice(0, 8)
                    .map((o) => (
                      <li key={o.id}>
                        <span className="data font-semibold">{o.nsn}</span> — score {o.repeatDemandScore};{" "}
                        {o.investigation.historicalQty.map((h) => `${h.year}: ${h.qty}`).join(" · ")}
                      </li>
                    ))}
                </ul>
              </Section>

              {run.rejected.length > 0 && (
                <Section title="Interesting but rejected" subtitle="One line each, so nothing disappears silently.">
                  <ul className="space-y-2 text-[16px] text-muted-foreground">
                    {run.rejected.map(({ opp, reason }) => (
                      <li key={opp.id}>
                        <span className="font-semibold text-foreground">{opp.product}</span> — {reason}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          )}
        </div>
      </main>

      <InvestigationDrawer opp={active} light={light} onClose={() => setActive(null)} />
    </div>
  );
}
