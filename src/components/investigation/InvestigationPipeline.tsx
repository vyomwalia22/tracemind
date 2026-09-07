const STAGES = [
  { label: "Wallet", note: "A public address you provide.", tone: "gold" as const },
  { label: "The Graph", note: "Live Aave V3 activity, retrieved from an indexed subgraph.", tone: "cyan" as const },
  { label: "Normalize", note: "Raw base units become exact, human-readable amounts.", tone: "cyan" as const },
  { label: "Compute", note: "Per-asset totals calculated deterministically, before AI.", tone: "cyan" as const },
  { label: "Reason", note: "Claude evaluates only the retrieved evidence.", tone: "cyan" as const },
  { label: "Trace", note: "Every finding cites the exact records behind it.", tone: "gold" as const },
];

export function InvestigationPipeline() {
  return (
    <div className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
      {STAGES.map((stage, index) => (
        <div key={stage.label} className="group relative flex flex-1 items-center sm:flex-col sm:items-center">
          <div className="flex items-center gap-3 py-3 sm:flex-col sm:gap-2 sm:py-0">
            <span
              className={`size-2.5 shrink-0 rounded-full border transition-transform duration-300 group-hover:scale-125 ${
                stage.tone === "gold" ? "border-gold bg-gold/70" : "border-cyan bg-cyan/40"
              }`}
              aria-hidden="true"
            />
            <span
              className={`font-mono text-xs uppercase tracking-[0.08em] transition-colors ${
                stage.tone === "gold" ? "text-gold" : "text-foreground/80 group-hover:text-cyan"
              }`}
            >
              {stage.label}
            </span>
          </div>

          <p className="mt-1 max-w-[10rem] text-center text-[11px] leading-4 text-muted-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:mt-2">
            {stage.note}
          </p>

          {index < STAGES.length - 1 && (
            <span
              className="absolute left-[calc(50%+1.1rem)] top-[1.35rem] hidden h-px w-[calc(100%-2.2rem)] bg-border-strong sm:block"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}
