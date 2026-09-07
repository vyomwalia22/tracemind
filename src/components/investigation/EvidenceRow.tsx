"use client";

import { useState } from "react";

import { evidenceLabel, formatClock, formatTimestamp } from "@/components/investigation/format";
import { CopyableHash } from "@/components/investigation/primitives";
import type { AaveProtocolActivity } from "@/lib/graph/aave-types";

export function EvidenceRow({
  activity,
  index,
  citingFindingIndexes,
}: {
  activity: AaveProtocolActivity;
  index: number;
  citingFindingIndexes: number[];
}) {
  const [expanded, setExpanded] = useState(false);
  const label = evidenceLabel(index);

  const asset =
    activity.activityType === "liquidation"
      ? `${activity.collateralReserveSymbol}/${activity.principalReserveSymbol}`
      : (activity.reserveSymbol ?? "—");

  const amount =
    activity.activityType === "liquidation"
      ? `${activity.collateralAmountNormalized} / ${activity.principalAmountNormalized}`
      : (activity.amountNormalized ?? "unavailable");

  function toggle() {
    setExpanded((value) => !value);
  }

  return (
    <div
      id={`evidence-${encodeURIComponent(activity.id)}`}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`Evidence ${label}, ${expanded ? "collapse" : "expand"} details`}
      data-selected={expanded ? "true" : undefined}
      onClick={toggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      }}
      className="evidence-row cursor-pointer px-3 py-3 transition-colors hover:bg-foreground/[0.03]"
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-6 sm:items-baseline sm:gap-3">
        <span className="font-mono text-xs text-cyan/85">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-2" title={formatTimestamp(activity.timestamp)}>
          {formatClock(activity.timestamp)}
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.06em] text-foreground/80">{activity.action}</span>
        <span className="font-mono text-xs text-muted">{asset}</span>
        <span className="font-mono text-sm text-foreground" title={`${amount} ${asset}`}>
          {amount}
        </span>
        <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <CopyableHash value={activity.transactionHash} />
        </span>
      </div>

      {expanded && (
        <div
          className="mt-3 grid gap-4 border-t border-border pt-3 sm:grid-cols-2"
          onClick={(event) => event.stopPropagation()}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-muted-2">Timestamp</p>
            <p className="mt-1 font-mono text-xs text-foreground/80">{formatTimestamp(activity.timestamp)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-muted-2">Cited by</p>
            <p className="mt-1 font-mono text-xs text-foreground/80">
              {citingFindingIndexes.length > 0
                ? citingFindingIndexes.map((findingIndex) => `Finding ${String(findingIndex + 1).padStart(2, "0")}`).join(" · ")
                : "No findings cite this record"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
