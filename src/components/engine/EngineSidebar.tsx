import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EnginePrefs } from "@/lib/engine-data";

interface EngineSidebarProps {
  initialPrefs: EnginePrefs;
  onUpdate: (prefs: EnginePrefs) => void;
  onSourcesChange?: (sources: EnginePrefs["sources"]) => void;
}

const SOURCE_LABELS: Record<keyof EnginePrefs["sources"], string> = {
  nspa: "NSPA XML",
  sam: "SAM.gov API",
  dla: "DLA DIBBS",
};

export function EngineSidebar({ initialPrefs, onUpdate, onSourcesChange }: EngineSidebarProps) {
  const [prefs, setPrefs] = useState<EnginePrefs>(initialPrefs);
  const [tagInput, setTagInput] = useState("");

  const addFsc = (raw: string) => {
    const code = raw.trim();
    if (!code) return;
    if (!prefs.fscCodes.includes(code)) {
      setPrefs({ ...prefs, fscCodes: [...prefs.fscCodes, code] });
    }
    setTagInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFsc(tagInput);
    } else if (e.key === "Backspace" && !tagInput && prefs.fscCodes.length) {
      setPrefs({ ...prefs, fscCodes: prefs.fscCodes.slice(0, -1) });
    }
  };

  const removeFsc = (code: string) =>
    setPrefs({ ...prefs, fscCodes: prefs.fscCodes.filter((c) => c !== code) });

  const formatValue = (val: number) =>
    val >= 1_000_000 ? `$${(val / 1_000_000).toFixed(2)}M` : `$${Math.round(val / 1000)}k`;

  return (
    <aside className="flex h-full flex-col gap-6 overflow-y-auto border-r border-border bg-card/40 p-4 text-xs">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-primary">
          Engine Search Preferences
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
          Adjust constraints, then commit with UPDATE ALGORITHM.
        </p>
      </div>

      <section className="space-y-5 border-t border-border pt-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Algorithm Constraints
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground">Min Est. Margin</label>
            <span className="text-primary">{prefs.minMargin}%</span>
          </div>
          <Slider
            min={10}
            max={80}
            step={1}
            value={[prefs.minMargin]}
            onValueChange={([v]) => setPrefs({ ...prefs, minMargin: v })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground">Min Contract Value</label>
            <span className="text-primary">{formatValue(prefs.minValue)}</span>
          </div>
          <Slider
            min={50000}
            max={2000000}
            step={25000}
            value={[prefs.minValue]}
            onValueChange={([v]) => setPrefs({ ...prefs, minValue: v })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground">Max Incumbent Manufacturers</label>
            <span className="text-primary">{prefs.maxIncumbents}</span>
          </div>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[prefs.maxIncumbents]}
            onValueChange={([v]) => setPrefs({ ...prefs, maxIncumbents: v })}
          />
        </div>
      </section>

      <section className="space-y-3 border-t border-border pt-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          FSC Codes to Target
        </div>
        <div className="flex flex-wrap gap-1.5">
          {prefs.fscCodes.length === 0 && (
            <span className="text-[10px] text-muted-foreground">ALL FSC CLASSES</span>
          )}
          {prefs.fscCodes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => removeFsc(code)}
              className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/20"
            >
              {code}
              <span aria-hidden>x</span>
              <span className="sr-only">Remove {code}</span>
            </button>
          ))}
        </div>
        <Input
          value={tagInput}
          placeholder="Add FSC code + Enter"
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addFsc(tagInput)}
          className="h-8 rounded-sm bg-background font-mono text-xs"
        />
      </section>

      <section className="space-y-3 border-t border-border pt-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Data Sources
        </div>
        {(Object.keys(SOURCE_LABELS) as Array<keyof EnginePrefs["sources"]>).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-muted-foreground">{SOURCE_LABELS[key]}</span>
            <Switch
              checked={prefs.sources[key]}
              onCheckedChange={(checked) => {
                const sources = { ...prefs.sources, [key]: checked };
                setPrefs({ ...prefs, sources });
                onSourcesChange?.(sources);
              }}
            />
          </div>
        ))}
      </section>

      <div className="mt-auto border-t border-border pt-5">
        <Button
          onClick={() => onUpdate(prefs)}
          className="w-full rounded-sm text-[11px] font-bold uppercase tracking-[0.2em]"
        >
          Update Algorithm
        </Button>
      </div>
    </aside>
  );
}