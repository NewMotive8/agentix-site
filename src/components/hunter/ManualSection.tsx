import type { ManualRow } from "@/lib/hunter-manual";

export function ManualSection({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-border pt-8">
      <h2 className="text-[26px] font-bold tracking-tight">{title}</h2>
      {intro && <p className="mt-2 max-w-3xl text-[17px] leading-relaxed">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DefinitionList({ rows }: { rows: ManualRow[] }) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {rows.map((r) => (
        <div key={r.term} className="grid gap-1 px-5 py-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
          <dt className="text-[17px] font-bold text-primary">{r.term}</dt>
          <dd className="text-[17px] leading-relaxed">{r.text}</dd>
        </div>
      ))}
    </dl>
  );
}

export function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((s, i) => (
        <li key={s} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary text-[16px] font-bold text-primary">
            {i + 1}
          </span>
          <span className="pt-0.5 text-[17px] leading-relaxed">{s}</span>
        </li>
      ))}
    </ol>
  );
}
