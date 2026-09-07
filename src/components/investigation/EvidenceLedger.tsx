"use client";

import { useMemo, useState } from "react";

import { EvidenceRow } from "@/components/investigation/EvidenceRow";
import type { FindingSignalTone } from "@/components/investigation/format";
import type { AaveProtocolActivity } from "@/lib/graph/aave-types";

type EvidenceFilter = "all" | "signals" | "normal";

const FILTERS: Array<{ key: EvidenceFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "signals", label: "Signals" },
  { key: "normal", label: "Normal" },
];

export function EvidenceLedger({
  activity,
  citingFindingsById,
  evidenceToneById,
}: {
  activity: AaveProtocolActivity[];
  citingFindingsById: Map<string, number[]>;
  evidenceToneById: Map<string, FindingSignalTone>;
}) {
  const [filter, setFilter] = useState<EvidenceFilter>("all");

  // Original position (not the filtered position) - evidence labels/anchors
  // must stay stable no matter which filter view is active.
  const indexedActivity = useMemo(() => activity.map((item, index) => ({ item, index })), [activity]);

  const filteredActivity = useMemo(() => {
    if (filter === "all") {
      return indexedActivity;
    }

    return indexedActivity.filter(({ item }) => citingFindingsById.has(item.id) === (filter === "signals"));
  }, [indexedActivity, citingFindingsById, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">Section 06 — The receipts</p>
          <h2 className="font-display mt-3 text-4xl leading-tight text-foreground sm:text-5xl">Evidence / Receipts</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
            Every finding points back to retrieved onchain activity. Select a record to see its full detail.
          </p>
        </div>

        {activity.length > 0 && (
          <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-[0.1em]" role="group" aria-label="Filter evidence">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={
                  filter === key
                    ? "border-b border-gold pb-1 text-gold"
                    : "border-b border-transparent pb-1 text-muted-2 transition-colors hover:text-foreground"
                }
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

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
          {filteredActivity.length === 0 ? (
            <p className="min-w-[640px] px-3 py-6 text-sm text-muted">No evidence matches this filter.</p>
          ) : (
            <div className="min-w-[640px] divide-y divide-border">
              {filteredActivity.map(({ item, index }) => (
                <EvidenceRow
                  key={item.id}
                  activity={item}
                  index={index}
                  citingFindingIndexes={citingFindingsById.get(item.id) ?? []}
                  tone={evidenceToneById.get(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
