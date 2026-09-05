import type { AaveProtocolActivity } from "@/lib/graph/aave-types";
import type { EvidenceId, InvestigationEvidenceItem } from "@/types/investigation-report";

export function buildAaveInvestigationEvidence(
  activity: readonly AaveProtocolActivity[],
): InvestigationEvidenceItem[] {
  return activity.map(toEvidenceItem);
}

function toEvidenceItem(activity: AaveProtocolActivity): InvestigationEvidenceItem {
  return {
    evidenceId: activity.id as EvidenceId,
    protocol: activity.protocol,
    timestamp: activity.timestamp,
    transactionHash: activity.transactionHash,
    action: activity.action,
    detail: describeActivity(activity),
  };
}

function describeActivity(activity: AaveProtocolActivity): string {
  if (activity.activityType === "liquidation") {
    return `Liquidation: collateral seized ${activity.collateralAmount} ${activity.collateralReserveSymbol}, principal repaid ${activity.principalAmount} ${activity.principalReserveSymbol}.`;
  }

  const amount = activity.amount ?? "unknown amount";
  const symbol = activity.reserveSymbol ?? "unknown asset";
  return `${activity.action}: ${amount} ${symbol}.`;
}
