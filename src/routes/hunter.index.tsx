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
import { defaultParams, SOURCE_LABELS, type HuntParams } from "@/lib/hunter-data";
import { PIPELINE_STAGES, runPipeline } from "@/lib/hunt/pipeline";
import { defaultCoverage, type Coverage } from "@/lib/hunt/querymatrix";
import {
  defaultWorkingCapital,
  workingCapitalLabel,
  type CategoryProgress,
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
  const [coverage, setCoverage] = useState<Coverage>(defaultCoverage);
  const [progress, setProgress] = useState<CategoryProgress[]>([]);
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
    setProgress([]);
    void runPipeline({
      params,
      workingCapital,
      coverage,
      mode: nextMode,
      onProgress: (p) => {
        setProgress(p.categories);
        setStage(p.stage);
      },
    }).then((result) => {
      setRun(result);
      setRanAtLabel(new Date(result.ranAt).toLocaleString());
      setDismissed([]);
      setStage(PIPELINE_STAGES.length - 1);
      setRunning(false);
    });
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
          coverage={coverage}
          onCoverageChange={setCoverage}
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
              {!run
                ? mode === "demo"
                  ? "DEMO — SIMULATED DATA"
                  : "LIVE MODE"
                : run.isDemo
                  ? "DEMO — SIMULATED DATA"
                  : run.sourceStatuses.some((s) => s.state === "LIVE")
                    ? "LIVE PROCUREMENT DATA"
                    : "LIVE MODE — NO SOURCES REACHABLE"}
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
              <div className="rounded-lg border-2 border-primary bg-primary/10 p-6">
                <h3 className="data text-[22px] font-bold tracking-wide text-primary">
                  {mode === "live" ? "LIVE HUNT" : "DEMO HUNT — SIMULATED"}
                </h3>
                <dl className="mt-3 grid gap-x-8 gap-y-1.5 text-[16px] sm:grid-cols-2">
                  {[
                    ["Universe", coverage.mode === "all" ? "All categories" : coverage.mode === "categories" ? `${coverage.categories.length || "all"} selected categories` : `${coverage.mode.toUpperCase()}: ${coverage.terms || "(none entered)"}`],
                    ["Sources", (Object.keys(params.sources) as (keyof typeof params.sources)[]).filter((k) => params.sources[k]).map((k) => SOURCE_LABELS[k]).join(" · ")],
                    ["Discovery", mode === "live" ? "Web (official procurement domains) + API where available" : "Simulated corpus"],
                    ["Raw target", String(coverage.rawTarget)],
                    ["Working-capital limit", workingCapitalLabel(workingCapital)],
                    ["Deep investigations", String(coverage.deepInvestigations)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="font-semibold text-muted-foreground">{k}:</dt>
                      <dd className="data font-bold text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {progress.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-[18px] font-bold">Category coverage</h3>
                  <ul className="mt-3 space-y-1">
                    {progress.map((c) => (
                      <li
                        key={c.id}
                        className={cn(
                          "data flex items-baseline justify-between gap-4 rounded-md px-3 py-1.5 text-[16px]",
                          c.state === "running"
                            ? "bg-primary/20 font-bold text-primary"
                            : c.state === "done"
                              ? "text-foreground"
                              : "text-muted-foreground",
                        )}
                      >
                        <span>{c.label}</span>
                        <span>
                          {c.state === "pending"
                            ? "queued"
                            : `${c.queries} queries — ${c.hits} hits${c.state === "running" ? " …" : ""}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                <div className="mb-4 rounded-md border border-primary/50 bg-primary/10 p-4 text-[15px]">
                  <div className="data font-bold text-primary">
                    {run.isDemo ? "DEMO HUNT — SIMULATED DATA" : "LIVE HUNT"}
                  </div>
                  <div className="mt-1 text-foreground">
                    Universe: {run.coverageStatement.universe} · Sources: {run.coverageStatement.sources} ·
                    Discovery: {run.coverageStatement.discovery} · Raw target:{" "}
                    {run.coverageStatement.rawTarget} · Working-capital limit:{" "}
                    {run.coverageStatement.workingCapital} · Deep investigations:{" "}
                    {run.coverageStatement.deepInvestigations}
                  </div>
                </div>
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

              {run.categories.length > 0 && (
                <Section
                  title="Coverage audit"
                  subtitle="Every category the engine searched, with the queries executed and hits returned."
                >
                  <ul className="space-y-1 text-[16px]">
                    {run.categories.map((c) => (
                      <li key={c.id} className="data flex justify-between gap-4">
                        <span>{c.label}</span>
                        <span className={c.hits > 0 ? "font-bold text-primary" : "text-muted-foreground"}>
                          {c.queries} queries — {c.hits} hits
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {run.deepInvestigations.length > 0 && (
                <Section
                  title="Deep investigations"
                  subtitle="Stage 4 — official notice documents read, then supplier research on the open web. Supplier findings are commercial research, not government-confirmed."
                >
                  <div className="space-y-5">
                    {run.deepInvestigations.map((d) => {
                      const opp = [...run.qualified, ...run.capitalConstrained].find(
                        (o) => o.id === d.opportunityId,
                      );
                      return (
                        <div key={d.opportunityId} className="rounded-md border border-border p-4">
                          <div className="text-[17px] font-bold">{opp?.product ?? d.opportunityId}</div>
                          {d.summary.length > 0 && (
                            <ul className="mt-2 space-y-1 text-[16px] text-foreground">
                              {d.summary.map((s) => (
                                <li key={s}>• {s}</li>
                              ))}
                            </ul>
                          )}
                          {d.complianceFlags.length > 0 && (
                            <p className="mt-2 text-[15px] text-signal-amber">
                              Compliance flags: {d.complianceFlags.join(" · ")}
                            </p>
                          )}
                          {d.suppliers.length > 0 ? (
                            <div className="mt-3 space-y-1.5">
                              <div className="text-[13px] font-semibold uppercase tracking-wide text-signal-blue">
                                Potential suppliers — public web research, not government-confirmed
                              </div>
                              {d.suppliers.map((s) => (
                                <div key={`${s.name}-${s.sourceUrl}`} className="text-[15px]">
                                  <span className="font-bold">{s.name}</span>{" "}
                                  <span className="data rounded border border-border px-1.5 py-0.5 text-[13px] font-semibold text-muted-foreground">
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
                                  <span className="text-muted-foreground">
                                    retrieved {s.retrievedAt.slice(0, 10)} — {s.evidence}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-[15px] text-muted-foreground">{d.note}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

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
