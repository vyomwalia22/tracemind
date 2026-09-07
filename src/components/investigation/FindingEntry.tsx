import { evidenceLabel, splitFindingStatement } from "@/components/investigation/format";
import { ConfidenceReadout } from "@/components/investigation/primitives";
import type { InvestigationFinding } from "@/types/investigation-report";

export function FindingEntry({
  index,
  finding,
  evidenceIndexById,
}: {
  index: number;
  finding: InvestigationFinding;
  evidenceIndexById: Map<string, number>;
}) {
  const { title, explanation } = splitFindingStatement(finding.statement);

  return (
    <article className="grid gap-4 py-8 first:pt-0 last:pb-0 sm:grid-cols-[5rem_1fr] sm:gap-8">
      <p className="font-mono text-4xl leading-none text-muted-2 sm:text-5xl">
        {String(index + 1).padStart(2, "0")}
      </p>

      <div className="min-w-0">
        <h3 className="font-display text-2xl leading-snug text-foreground sm:text-3xl">{title}</h3>
        <div className="mt-3 h-px w-16 bg-gradient-to-r from-gold/50 to-transparent" aria-hidden="true" />

        <div className="mt-3">
          <ConfidenceReadout confidence={finding.confidence} />
        </div>
        {explanation && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{explanation}</p>}

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-2">Evidence</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {finding.evidenceIds.map((evidenceId) => {
              const evidenceIndex = evidenceIndexById.get(evidenceId);
              const label = evidenceIndex !== undefined ? evidenceLabel(evidenceIndex) : evidenceId;

              return (
                <a
                  key={evidenceId}
                  href={`#evidence-${encodeURIComponent(evidenceId)}`}
                  title={evidenceId}
                  className="rounded-sm border border-border-strong px-2 py-1 font-mono text-xs text-foreground/75 transition-colors hover:border-cyan/50 hover:text-cyan"
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
