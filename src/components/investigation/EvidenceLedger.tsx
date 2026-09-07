import { EvidenceRow } from "@/components/investigation/EvidenceRow";
import type { AaveProtocolActivity } from "@/lib/graph/aave-types";

export function EvidenceLedger({
  activity,
  citingFindingsById,
}: {
  activity: AaveProtocolActivity[];
  citingFindingsById: Map<string, number[]>;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">Section 06 — The receipts</p>
      <h2 className="font-display mt-3 text-4xl leading-tight text-foreground sm:text-5xl">Evidence / Receipts</h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Every finding points back to retrieved onchain activity. Select a record to see its full detail.
      </p>

      {activity.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No Aave activity was found for this wallet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border-y border-border">
          <div className="hidden min-w-[640px] grid-cols-6 gap-3 px-3 pb-2 pt-2 text-xs uppercase tracking-[0.1em] text-muted-2 sm:grid">
            <span>ID</span>
            <span>Time</span>
            <span>Action</span>
            <span>Asset</span>
            <span>Amount</span>
            <span>Tx</span>
          </div>
          <div className="min-w-[640px] divide-y divide-border">
            {activity.map((item, index) => (
              <EvidenceRow
                key={item.id}
                activity={item}
                index={index}
                citingFindingIndexes={citingFindingsById.get(item.id) ?? []}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
