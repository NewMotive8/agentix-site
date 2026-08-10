import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRESETS,
  SOURCE_LABELS,
  type HuntParams,
  type PresetKey,
  type SourceKey,
} from "@/lib/hunter-data";

interface Props {
  params: HuntParams;
  onChange: (p: HuntParams) => void;
  onRun: () => void;
  running: boolean;
}

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v / 1000)}k`;

export function HuntControls({ params, onChange, onRun, running }: Props) {
  const [preset, setPreset] = useState<PresetKey | null>(null);
  const [tag, setTag] = useState("");

  const patch = (p: Partial<HuntParams>) => onChange({ ...params, ...p });

  const addTag = (raw: string) => {
    const code = raw.trim();
    setTag("");
    if (!code || params.fscCodes.includes(code)) return;
    patch({ fscCodes: [...params.fscCodes, code] });
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-border bg-card/40 text-xs">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Crosshair className="h-4 w-4 text-primary" />
        <h1 className="text-[12px] font-bold uppercase tracking-[0.22em]">Procurement Hunter</h1>
      </div>

      <div className="flex-1 space-y-6 p-4">
        <section className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Strategy Presets
          </div>
          <div className="grid grid-cols-2 gap-1.5">
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
                  className={cn(
                    "rounded-sm border px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
                    p.key === "repeat" && "col-span-2",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  [ {p.label} ]
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-5 border-t border-border pt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Algorithm Parameters
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Est. Margin</span>
              <span className="text-primary tabular-nums">{params.minMargin}%</span>
            </div>
            <Slider
              min={10}
              max={80}
              step={1}
              value={[params.minMargin]}
              onValueChange={([v]) => patch({ minMargin: v })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Contract Value</span>
              <span className="text-primary tabular-nums">{money(params.minValue)}</span>
            </div>
            <Slider
              min={50000}
              max={2000000}
              step={25000}
              value={[params.minValue]}
              onValueChange={([v]) => patch({ minValue: v })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preferred Max Incumbents</span>
              <span className="text-primary tabular-nums">{params.maxIncumbents}</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[params.maxIncumbents]}
              onValueChange={([v]) => patch({ maxIncumbents: v })}
            />
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground">FSC Codes</div>
            <div className="flex flex-wrap gap-1.5">
              {params.fscCodes.length === 0 && (
                <span className="text-[10px] text-muted-foreground">ALL FSC CLASSES</span>
              )}
              {params.fscCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => patch({ fscCodes: params.fscCodes.filter((c) => c !== code) })}
                  className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20"
                >
                  {code}
                  <X className="h-2.5 w-2.5" />
                </button>
              ))}
            </div>
            <Input
              value={tag}
              placeholder="Add FSC code + Enter"
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tag);
                }
              }}
              onBlur={() => addTag(tag)}
              className="h-8 rounded-sm bg-background font-mono text-xs"
            />
          </div>
        </section>

        <section className="space-y-3 border-t border-border pt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sources</div>
          {(Object.keys(SOURCE_LABELS) as SourceKey[]).map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-muted-foreground">
              <Checkbox
                checked={params.sources[key]}
                onCheckedChange={(c) =>
                  patch({ sources: { ...params.sources, [key]: Boolean(c) } })
                }
                className="h-3.5 w-3.5 rounded-[2px]"
              />
              {SOURCE_LABELS[key]}
            </label>
          ))}
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card/80 p-4 backdrop-blur">
        <Button
          onClick={onRun}
          disabled={running}
          className="w-full gap-2 rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] shadow-[0_0_18px_-4px_var(--primary)]"
        >
          <Play className="h-3.5 w-3.5" />
          {running ? "Hunting…" : "Run Hunt"}
        </Button>
      </div>
    </aside>
  );
}
