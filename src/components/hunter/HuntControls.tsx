import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, Play, Square, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_FAMILIES } from "@/lib/hunt/categories";
import { coverageReady, MAX_CATEGORIES, type Coverage, type CoverageMode } from "@/lib/hunt/querymatrix";
import {
  WORKING_CAPITAL_PRESETS,
  workingCapitalLabel,
  type HuntMode,
  type SourceStatusReport,
  type WorkingCapital,
} from "@/lib/hunt/types";
import {
  PRESETS,
  SOURCE_LABELS,
  type HuntParams,
  type PresetKey,
  type SourceKey,
} from "@/lib/hunter-data";

interface Props {
  params: HuntParams;
  workingCapital: WorkingCapital;
  onWorkingCapitalChange: (wc: WorkingCapital) => void;
  onChange: (p: HuntParams) => void;
  coverage: Coverage;
  onCoverageChange: (c: Coverage) => void;
  onRun: () => void;
  onStop: () => void;
  running: boolean;
  mode: HuntMode;
  onModeChange: (m: HuntMode) => void;
  sourceStatuses: SourceStatusReport[];
}

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v / 1000)}k`;

const PRESET_HINTS: Record<PresetKey, string> = {
  anchor: "Few competitors, high margin",
  cluster: "Wide net across all sources",
  capital: "Large contracts only",
  nato: "European / NATO buyers",
  repeat: "Parts bought year after year",
};

const SOURCE_HINTS: Record<SourceKey, string> = {
  sam: "US federal tenders",
  dibbs: "Defense Logistics Agency bids",
  nspa: "NATO Support & Procurement Agency",
  ncia: "NATO Communications & Information Agency",
  nato: "NATO HQ, ACT and ACO procurement pages",
};

const COVERAGE_MODES: { key: CoverageMode; label: string; hint: string }[] = [
  { key: "categories", label: "Pick categories", hint: `Choose up to ${MAX_CATEGORIES} markets to hunt in` },
  { key: "fsc", label: "Specific FSC / PSC", hint: "Enter classification codes" },
  { key: "naics", label: "Specific NAICS", hint: "Enter NAICS codes" },
  { key: "keywords", label: "Keywords", hint: "Enter your own search terms" },
  { key: "nsn", label: "NSN / part number", hint: "Enter exact NSNs or part numbers" },
];

function Field({
  label,
  hint,
  value,
  children,
}: {
  label: string;
  hint: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-semibold text-foreground">{label}</span>
        {value && <span className="data text-[16px] font-bold text-primary">{value}</span>}
      </div>
      <p className="text-[13px] leading-snug text-muted-foreground">{hint}</p>
      {children}
    </div>
  );
}

export function HuntControls({
  params,
  workingCapital,
  onWorkingCapitalChange,
  onChange,
  coverage,
  onCoverageChange,
  onRun,
  onStop,
  running,
  mode,
  onModeChange,
  sourceStatuses,
}: Props) {
  const [preset, setPreset] = useState<PresetKey | null>(null);
  const [tag, setTag] = useState("");
  const [custom, setCustom] = useState("");
  const [advanced, setAdvanced] = useState(false);

  const patch = (p: Partial<HuntParams>) => onChange({ ...params, ...p });
  const patchCoverage = (c: Partial<Coverage>) => onCoverageChange({ ...coverage, ...c });

  const addTag = (raw: string) => {
    const code = raw.trim();
    setTag("");
    if (!code || params.fscCodes.includes(code)) return;
    patch({ fscCodes: [...params.fscCodes, code] });
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Crosshair className="h-6 w-6 shrink-0 text-primary" />
          <h1 className="truncate text-[19px] font-bold tracking-tight">Procurement Hunter</h1>
        </div>
        <Button asChild variant="outline" size="sm" className="h-9 shrink-0 gap-1.5 text-[14px]">
          <Link to="/hunter/manual">
            <BookOpen className="h-4 w-4" /> Help
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-8 px-5 py-6">
        <section className="space-y-3">
          <h2 className="text-[17px] font-bold">Connected sources</h2>
          <p className="text-[13px] leading-snug text-muted-foreground">
            {mode === "live"
              ? "Only these sources are searched. Nothing is simulated."
              : "Developer demo mode is on — no source is contacted."}
          </p>
          <ul className="space-y-1.5">
            {(Object.keys(SOURCE_LABELS) as SourceKey[]).map((key) => {
              const st = sourceStatuses.find((s) => s.key === key);
              const live = mode === "live" && st?.state === "LIVE";
              const error = mode === "live" && st?.state === "ERROR";
              return (
                <li
                  key={key}
                  className={cn(
                    "rounded-md border px-3 py-2",
                    live
                      ? "border-primary/50 bg-primary/10"
                      : error
                        ? "border-destructive/50 bg-destructive/10"
                        : "border-border bg-muted/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold text-foreground">{SOURCE_LABELS[key]}</span>
                    <span
                      className={cn(
                        "data text-[13px] font-bold",
                        live ? "text-primary" : error ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {mode === "demo" ? "DEMO" : live ? "LIVE ✓" : error ? "ERROR" : "NOT CONNECTED"}
                    </span>
                  </div>
                  {st && !live && (
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{st.detail}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-[17px] font-bold">Strategy presets</h2>
          <p className="text-[13px] leading-snug text-muted-foreground">
            A preset fills in the settings below. Nothing is searched until you press Run hunt.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => {
              const active = preset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setPreset(p.key);
                    onChange({ ...p.params, sources: { ...p.params.sources } });
                  }}
                  title={PRESET_HINTS[p.key]}
                  className={cn(
                    "rounded-md border px-3 py-2.5 text-left text-[15px] font-semibold transition-colors",
                    p.key === "repeat" && "col-span-2",
                    active
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-foreground hover:border-primary/60 hover:bg-muted",
                  )}
                >
                  {p.label === "REPEAT DEMAND" ? "Repeat demand" : p.label.charAt(0) + p.label.slice(1).toLowerCase()}
                  <span className="mt-0.5 block text-[12px] font-normal leading-snug text-muted-foreground">
                    {PRESET_HINTS[p.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-6 border-t border-border pt-6">
          <h2 className="text-[17px] font-bold">Search settings</h2>

          <Field
            label="Category coverage"
            hint={`Aim the hunt: up to ${MAX_CATEGORIES} markets, or type your own terms.`}
          >
            <div className="grid grid-cols-2 gap-2">
              {COVERAGE_MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => patchCoverage({ mode: m.key })}
                  title={m.hint}
                  className={cn(
                    "rounded-md border px-2.5 py-2 text-left text-[14px] font-semibold transition-colors",
                    coverage.mode === m.key
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-foreground hover:border-primary/60 hover:bg-muted",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {coverage.mode === "categories" && (
              <div className="mt-3 rounded-md border border-border p-3">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    {coverage.categories.length} of {MAX_CATEGORIES} selected
                  </span>
                  {coverage.categories.length >= MAX_CATEGORIES && (
                    <span className="text-[12px] text-muted-foreground">Deselect one to change</span>
                  )}
                </div>
                <div className="max-h-64 space-y-1.5 overflow-y-auto">
                  {CATEGORY_FAMILIES.map((c) => {
                    const on = coverage.categories.includes(c.id);
                    const full = !on && coverage.categories.length >= MAX_CATEGORIES;
                    return (
                      <label
                        key={c.id}
                        className={cn(
                          "flex items-start gap-2.5",
                          full ? "cursor-not-allowed opacity-45" : "cursor-pointer",
                        )}
                      >
                        <Checkbox
                          checked={on}
                          disabled={full}
                          onCheckedChange={(v) =>
                            patchCoverage({
                              categories: v
                                ? [...coverage.categories, c.id].slice(0, MAX_CATEGORIES)
                                : coverage.categories.filter((x) => x !== c.id),
                            })
                          }
                          className="mt-0.5 size-5"
                        />
                        <span className="text-[14px] font-semibold text-foreground">{c.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {["fsc", "naics", "keywords", "nsn"].includes(coverage.mode) && (
              <Input
                value={coverage.terms}
                placeholder="Comma separated, e.g. 1650, 2530"
                onChange={(e) => patchCoverage({ terms: e.target.value })}
                className="mt-3 h-11 text-[15px]"
              />
            )}
          </Field>

          <Field
            label="Coverage weight"
            hint="How many searches each category receives. Higher means broader, slower hunts."
            value={`${coverage.weight.toFixed(1)}x`}
          >
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[coverage.weight]}
              onValueChange={([v]) => patchCoverage({ weight: v })}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6"
            />
          </Field>

          <Field
            label="Raw candidate target"
            hint="Discovery keeps searching categories until it reaches this many raw candidates."
            value={String(coverage.rawTarget)}
          >
            <Slider
              min={20}
              max={300}
              step={10}
              value={[coverage.rawTarget]}
              onValueChange={([v]) => patchCoverage({ rawTarget: v })}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6"
            />
          </Field>

          <Field
            label="Deep investigations"
            hint="How many of the strongest opportunities get documents read and suppliers researched."
            value={String(coverage.deepInvestigations)}
          >
            <Slider
              min={0}
              max={25}
              step={1}
              value={[coverage.deepInvestigations]}
              onValueChange={([v]) => patchCoverage({ deepInvestigations: v })}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6"
            />
          </Field>

          <Field
            label="Minimum margin"
            hint="Skip anything with less profit margin than this."
            value={`${params.minMargin}%`}
          >
            <Slider
              min={10}
              max={80}
              step={1}
              value={[params.minMargin]}
              onValueChange={([v]) => patch({ minMargin: v })}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6"
            />
          </Field>

          <Field
            label="Minimum contract value"
            hint="Skip contracts smaller than this total value."
            value={money(params.minValue)}
          >
            <Slider
              min={50000}
              max={2000000}
              step={25000}
              value={[params.minValue]}
              onValueChange={([v]) => patch({ minValue: v })}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6"
            />
          </Field>

          <Field
            label="Maximum competitors"
            hint="The most existing suppliers you are willing to compete against."
            value={String(params.maxIncumbents)}
          >
            <Slider
              min={1}
              max={10}
              step={1}
              value={[params.maxIncumbents]}
              onValueChange={([v]) => patch({ maxIncumbents: v })}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6"
            />
          </Field>

          <Field
            label="FSC codes"
            hint="Product categories to target. Leave empty to search all of them."
          >
            <div className="flex flex-wrap gap-2">
              {params.fscCodes.length === 0 && (
                <span className="text-[14px] text-muted-foreground">All categories</span>
              )}
              {params.fscCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => patch({ fscCodes: params.fscCodes.filter((c) => c !== code) })}
                  aria-label={`Remove FSC ${code}`}
                  className="data inline-flex items-center gap-1.5 rounded-md border border-primary/50 bg-primary/15 px-2.5 py-1 text-[14px] font-semibold text-primary hover:bg-primary/25"
                >
                  {code}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <Input
              value={tag}
              placeholder="Type a code and press Enter"
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tag);
                }
              }}
              onBlur={() => addTag(tag)}
              className="h-11 text-[15px]"
            />
          </Field>
        </section>

        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-[17px] font-bold">Execution constraints</h2>
          <Field
            label="Working capital"
            hint="Maximum cash required before the government pays. Opportunities above this stay visible, tagged CAPITAL CONSTRAINED."
            value={workingCapitalLabel(workingCapital)}
          >
            <div className="grid grid-cols-3 gap-2">
              {WORKING_CAPITAL_PRESETS.map((o) => {
                const on = workingCapital.mode === "limit" && workingCapital.limit === o.limit;
                return (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => onWorkingCapitalChange({ mode: "limit", limit: o.limit })}
                    className={cn(
                      "data rounded-md border px-2 py-2 text-[15px] font-bold transition-colors",
                      on
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border text-foreground hover:border-primary/60 hover:bg-muted",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onWorkingCapitalChange({ mode: "unlimited", limit: 0 })}
                className={cn(
                  "rounded-md border px-2 py-2 text-[14px] font-semibold transition-colors",
                  workingCapital.mode === "unlimited"
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-foreground hover:border-primary/60 hover:bg-muted",
                )}
              >
                Unlimited
              </button>
              <button
                type="button"
                onClick={() => onWorkingCapitalChange({ mode: "ignore", limit: 0 })}
                className={cn(
                  "rounded-md border px-2 py-2 text-[14px] font-semibold transition-colors",
                  workingCapital.mode === "ignore"
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-foreground hover:border-primary/60 hover:bg-muted",
                )}
              >
                Ignore constraint
              </button>
            </div>
            <Input
              value={custom}
              placeholder="Custom limit in dollars, e.g. 75000"
              inputMode="numeric"
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const n = Number(custom.replace(/[^0-9]/g, ""));
                if (!Number.isNaN(n)) onWorkingCapitalChange({ mode: "limit", limit: n });
              }}
              onBlur={() => {
                const n = Number(custom.replace(/[^0-9]/g, ""));
                if (custom && !Number.isNaN(n)) onWorkingCapitalChange({ mode: "limit", limit: n });
              }}
              className="mt-2 h-11 text-[15px]"
            />
          </Field>
        </section>

        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-[17px] font-bold">Where to search</h2>
          {(Object.keys(SOURCE_LABELS) as SourceKey[]).map((key) => (
            <label key={key} className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={params.sources[key]}
                onCheckedChange={(c) => patch({ sources: { ...params.sources, [key]: Boolean(c) } })}
                className="mt-0.5 size-5"
              />
              <span>
                <span className="block text-[15px] font-semibold text-foreground">
                  {SOURCE_LABELS[key]}
                </span>
                <span className="block text-[13px] leading-snug text-muted-foreground">
                  {SOURCE_HINTS[key]}
                </span>
              </span>
            </label>
          ))}
        </section>

        <section className="space-y-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            className="text-[14px] font-semibold text-muted-foreground underline-offset-4 hover:underline"
          >
            {advanced ? "Hide" : "Show"} advanced / developer settings
          </button>
          {advanced && (
            <div className="space-y-3 rounded-md border border-border bg-muted/40 p-4">
              <p className="text-[13px] leading-snug text-muted-foreground">
                For testing only. Demo mode replays a simulated corpus and never contacts a real
                source. Results are not real procurement opportunities.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["live", "demo"] as HuntMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onModeChange(m)}
                    className={cn(
                      "rounded-md border px-2 py-2 text-[14px] font-bold transition-colors",
                      mode === m
                        ? m === "demo"
                          ? "border-signal-amber bg-signal-amber/20 text-signal-amber"
                          : "border-primary bg-primary/20 text-primary"
                        : "border-border text-foreground hover:border-primary/60 hover:bg-muted",
                    )}
                  >
                    {m === "live" ? "LIVE MODE" : "DEMO MODE"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card p-5">
        {!coverageReady(coverage) && (
          <p className="mb-2 text-[13px] font-semibold text-signal-amber">
            {coverage.mode === "categories"
              ? "Pick at least one category to aim the hunt."
              : "Type at least one search term first."}
          </p>
        )}
        {running ? (
          <Button
            onClick={onStop}
            variant="outline"
            className="h-14 w-full gap-2 border-destructive text-[17px] font-bold text-destructive hover:bg-destructive/10"
          >
            <Square className="h-5 w-5" /> Stop search
          </Button>
        ) : (
          <Button
            onClick={onRun}
            disabled={!coverageReady(coverage)}
            className="h-14 w-full gap-2 text-[17px] font-bold"
          >
            <Play className="h-5 w-5" /> Run hunt
          </Button>
        )}
      </div>
    </aside>
  );
}
