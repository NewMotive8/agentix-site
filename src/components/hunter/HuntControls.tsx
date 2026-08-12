import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, Play, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WORKING_CAPITAL_PRESETS,
  workingCapitalLabel,
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
  onRun: () => void;
  running: boolean;
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
};

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
  onRun,
  running,
}: Props) {
  const [preset, setPreset] = useState<PresetKey | null>(null);
  const [tag, setTag] = useState("");
  const [custom, setCustom] = useState("");

  const patch = (p: Partial<HuntParams>) => onChange({ ...params, ...p });

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
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card p-5">
        <Button
          onClick={onRun}
          disabled={running}
          className="h-14 w-full gap-2 text-[17px] font-bold"
        >
          <Play className="h-5 w-5" />
          {running ? "Searching…" : "Run hunt"}
        </Button>
      </div>
    </aside>
  );
}
