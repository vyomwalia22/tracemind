import { ScrollReveal } from "@/components/investigation/ScrollReveal";

const STEPS = [
  { title: "The Graph", body: "Live blockchain data, retrieved directly from an indexed Aave V3 subgraph." },
  { title: "Normalize", body: "Raw base-unit values become exact, human-readable amounts using each reserve's real decimals." },
  { title: "Compute", body: "Per-asset supply, borrow, repay and net exposure are calculated deterministically, before any AI reasoning." },
  { title: "Reason", body: "Claude evaluates only the retrieved evidence and the computed totals - never invented activity." },
  { title: "Trace", body: "Every finding cites the exact evidence records that support it, so a claim can always be checked." },
];

export function Methodology() {
  return (
    <section id="methodology" className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <ScrollReveal>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">Section 05 — The method</p>
        <h2 className="font-display mt-4 max-w-lg text-4xl leading-tight text-foreground sm:text-5xl">
          How TraceMind <span className="italic text-gold">thinks.</span>
        </h2>
      </ScrollReveal>

      <div role="list" className="relative mt-14 pl-8 sm:pl-10">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan/40 via-border-strong to-transparent sm:left-[9px]" aria-hidden="true" />

        {STEPS.map((step, index) => (
          <ScrollReveal key={step.title}>
            <div role="listitem" className="group relative py-6 first:pt-0 last:pb-0">
              <span
                className="absolute -left-8 top-1.5 flex size-4 items-center justify-center rounded-full border border-cyan/50 bg-background text-[9px] font-mono text-cyan transition-colors group-hover:border-gold group-hover:text-gold sm:-left-10"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="grid gap-1.5 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-8">
                <span className="text-lg font-semibold uppercase tracking-tight text-foreground transition-colors group-hover:text-gold">
                  {step.title}
                </span>
                <span className="max-w-md text-sm leading-6 text-muted">{step.body}</span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
      </div>
    </section>
  );
}
