"use client";

import { useState } from "react";

import {
  evidenceLabel,
  formatClock,
  formatLedgerAmount,
  formatTimestamp,
  type FindingSignalTone,
} from "@/components/investigation/format";
import { CopyableHash } from "@/components/investigation/primitives";
import type { AaveProtocolActivity } from "@/lib/graph/aave-types";

export function EvidenceRow({
  activity,
  index,
  citingFindingIndexes,
  tone,
}: {
  activity: AaveProtocolActivity;
  index: number;
  citingFindingIndexes: number[];
  tone?: FindingSignalTone;
}) {
  const [expanded, setExpanded] = useState(false);
  const label = evidenceLabel(index);
  const isSignal = citingFindingIndexes.length > 0;
  const dataTone = isSignal ? (tone === "anomaly" ? "anomaly" : tone === "normal" ? "normal" : "signal") : undefined;

  const asset =
    activity.activityType === "liquidation"
      ? `${activity.collateralReserveSymbol}/${activity.principalReserveSymbol}`
      : (activity.reserveSymbol ?? "—");

  const { display: amountDisplay, exact: amountExact } =
    activity.activityType === "liquidation"
      ? combineAmounts(
          formatLedgerAmount(activity.collateralAmountNormalized),
          formatLedgerAmount(activity.principalAmountNormalized),
        )
      : (activity.amountNormalized !== undefined
          ? formatLedgerAmount(activity.amountNormalized)
          : { display: "unavailable", exact: "unavailable" });

  function toggle() {
    setExpanded((value) => !value);
  }

  return (
    <div
      id={`evidence-${encodeURIComponent(activity.id)}`}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`Evidence ${label}, ${expanded ? "collapse" : "expand"} details${isSignal ? ", cited by a finding" : ""}`}
      data-selected={expanded ? "true" : undefined}
      data-tone={dataTone}
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
        <span className="font-mono text-sm tabular-nums text-foreground" title={`${amountExact} ${asset} (exact)`}>
          {amountDisplay}
        </span>
        <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <CopyableHash value={activity.transactionHash} />
        </span>
      </div>

      {expanded && (
        <div
          className="mt-3 grid gap-4 border-t border-border pt-3 sm:grid-cols-3"
          onClick={(event) => event.stopPropagation()}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-muted-2">Timestamp</p>
            <p className="mt-1 font-mono text-xs text-foreground/80">{formatTimestamp(activity.timestamp)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-muted-2">Amount (exact)</p>
            <p className="mt-1 font-mono text-xs text-foreground/80">
              {amountExact} {asset}
            </p>
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

function combineAmounts(
  collateral: { display: string; exact: string },
  principal: { display: string; exact: string },
): { display: string; exact: string } {
  return {
    display: `${collateral.display} / ${principal.display}`,
    exact: `${collateral.exact} / ${principal.exact}`,
  };
}
