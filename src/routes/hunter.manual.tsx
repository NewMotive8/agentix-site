import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHunterLight } from "@/lib/hunter-theme";
import {
  DefinitionList,
  ManualSection,
  NumberedList,
} from "@/components/hunter/ManualSection";
import {
  CARD_TABLE,
  CONTROL_TABLE,
  DRAWER_TABLE,
  GLOSSARY,
  PRESET_TABLE,
  QUICK_STEPS,
  WORKED_EXAMPLE,
} from "@/lib/hunter-manual";

export const Route = createFileRoute("/hunter/manual")({
  head: () => ({
    meta: [
      { title: "How to use Procurement Hunter — Manual | Agentix" },
      {
        name: "description",
        content:
          "Plain-language manual for Procurement Hunter: what every control does, how to read an opportunity card, how to use the investigation view, and a glossary of procurement terms.",
      },
      { property: "og:title", content: "Procurement Hunter — User Manual" },
      {
        property: "og:description",
        content: "Step-by-step guide to running hunts and reading the results.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManualPage,
});

const NAV = [
  { id: "quick", label: "Quick reference" },
  { id: "walkthrough", label: "Step-by-step" },
  { id: "presets", label: "Strategy presets" },
  { id: "controls", label: "Every control" },
  { id: "cards", label: "Reading a card" },
  { id: "drawer", label: "Investigation view" },
  { id: "glossary", label: "Glossary" },
];

function ManualPage() {
  const { light, toggle } = useHunterLight();

  return (
    <div className={cn("hunter min-h-screen", light && "hunter-light")}>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
        <Button asChild variant="outline" className="h-11 gap-2 text-[16px]">
          <Link to="/hunter">
            <ArrowLeft className="h-5 w-5" /> Back to hunt
          </Link>
        </Button>
        <h1 className="hidden text-[20px] font-bold sm:block">How to use Procurement Hunter</h1>
        <Button variant="outline" onClick={toggle} className="h-11 gap-2 text-[16px]">
          {light ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          {light ? "Dark" : "Light"}
        </Button>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-8">
        <nav className="sticky top-24 hidden h-fit w-56 shrink-0 lg:block">
          <div className="text-[14px] font-bold uppercase tracking-wide text-muted-foreground">
            On this page
          </div>
          <ul className="mt-3 space-y-2">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className="block rounded-md px-3 py-2 text-[16px] hover:bg-muted hover:text-primary"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 space-y-10 pb-20">
          <div>
            <h2 className="text-[30px] font-bold tracking-tight">Procurement Hunter manual</h2>
            <p className="mt-2 max-w-3xl text-[18px] leading-relaxed">
              This page explains everything the tool does, in plain language. Nothing here changes
              your settings — read as much or as little as you need, then press Back to hunt.
            </p>
          </div>

          <ManualSection
            id="quick"
            title="Quick reference"
            intro="The whole tool is four steps."
          >
            <NumberedList items={QUICK_STEPS} />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border-2 border-primary bg-primary/10 p-4">
                <div className="text-[20px] font-bold text-primary">Score above 80</div>
                <p className="mt-1 text-[16px]">Strong. Worth investigating today.</p>
              </div>
              <div className="rounded-lg border-2 border-signal-amber bg-signal-amber/10 p-4">
                <div className="text-[20px] font-bold text-signal-amber">Score 61 to 80</div>
                <p className="mt-1 text-[16px]">Moderate. Something needs checking first.</p>
              </div>
              <div className="rounded-lg border-2 border-border bg-muted p-4">
                <div className="text-[20px] font-bold text-muted-foreground">Score 60 or less</div>
                <p className="mt-1 text-[16px]">Weak. Only look if you have spare time.</p>
              </div>
            </div>
          </ManualSection>

          <ManualSection
            id="walkthrough"
            title="Step-by-step, with an example"
            intro="Follow this once and the rest becomes obvious."
          >
            <NumberedList items={WORKED_EXAMPLE} />
          </ManualSection>

          <ManualSection
            id="presets"
            title="Strategy presets"
            intro="Each preset is a saved combination of settings. Clicking one fills in the sliders and sources; it never searches on its own."
          >
            <DefinitionList rows={PRESET_TABLE} />
          </ManualSection>

          <ManualSection
            id="controls"
            title="Every control on the left panel"
          >
            <DefinitionList rows={CONTROL_TABLE} />
          </ManualSection>

          <ManualSection
            id="cards"
            title="Reading an opportunity card"
            intro="Each result is one card. Read the score first, then the three coloured badges, then the analysis paragraph."
          >
            <DefinitionList rows={CARD_TABLE} />
          </ManualSection>

          <ManualSection
            id="drawer"
            title="The investigation view"
            intro="Pressing Investigate slides in a panel with the full research on one part. Close it with the X or the Escape key."
          >
            <DefinitionList rows={DRAWER_TABLE} />
          </ManualSection>

          <ManualSection id="glossary" title="Glossary">
            <DefinitionList rows={GLOSSARY} />
          </ManualSection>
        </main>
      </div>
    </div>
  );
}
