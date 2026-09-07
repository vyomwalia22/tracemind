import { formatDataSource, formatDateRange } from "@/components/investigation/format";
import type { InvestigationRetrievalResponse } from "@/types/investigation-response";

export function InvestigationOverview({ retrieval }: { retrieval: InvestigationRetrievalResponse }) {
  const items = [
    `${retrieval.recordCount.toLocaleString()} RECORD${retrieval.recordCount === 1 ? "" : "S"}`,
    `WINDOW ${retrieval.evidenceWindow.complete ? "COMPLETE" : "TRUNCATED"}`,
    retrieval.dataSources.map(formatDataSource).join(" / ").toUpperCase(),
    formatDateRange(retrieval.evidenceWindow.oldestTimestamp, retrieval.evidenceWindow.newestTimestamp).toUpperCase(),
  ];

  return (
    <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
      {items.map((item, index) => (
        <span key={item}>
          {index > 0 && <span className="mx-2.5 text-muted-2">·</span>}
          {item}
        </span>
      ))}
    </p>
  );
}
