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
    return (
      `Liquidation: collateral seized ${formatEvidenceAmount(activity.collateralAmountNormalized, activity.collateralAmount, activity.collateralReserveDecimals)} ${activity.collateralReserveSymbol}, ` +
      `principal repaid ${formatEvidenceAmount(activity.principalAmountNormalized, activity.principalAmount, activity.principalReserveDecimals)} ${activity.principalReserveSymbol}.`
    );
  }

  if (
    activity.amountNormalized === undefined ||
    activity.amount === undefined ||
    activity.reserveDecimals === undefined ||
    activity.reserveSymbol === undefined
  ) {
    return `${activity.action}: amount unavailable.`;
  }

  return `${activity.action}: ${formatEvidenceAmount(activity.amountNormalized, activity.amount, activity.reserveDecimals)} ${activity.reserveSymbol}.`;
}

/**
 * Amounts are already normalized server-side from on-chain base units using
 * the reserve's exact `decimals` - the raw value and decimals are included
 * verbatim so the model never has to guess or re-derive either one.
 */
function formatEvidenceAmount(normalizedAmount: string, rawAmount: string, decimals: number): string {
  return `${normalizedAmount} (raw base units: ${rawAmount}, decimals: ${decimals})`;
}
