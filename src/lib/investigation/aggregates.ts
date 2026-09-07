import type { AaveProtocolActivity } from "@/lib/graph/aave-types";
import { normalizeBaseUnitAmount, normalizeSignedBaseUnitAmount } from "@/lib/graph/decimal";

export interface AggregateAmount {
  /** Exact integer sum in the asset's base units, as a signed decimal string. */
  raw: string;
  /** Human-readable value, normalized using the asset's exact reserve decimals. */
  normalized: string;
  /** Number of evidence records that contributed to this total. */
  eventCount: number;
}

export interface AssetAggregate {
  symbol: string;
  decimals: number;
  totalSupply: AggregateAmount;
  totalBorrow: AggregateAmount;
  totalRepay: AggregateAmount;
  totalLiquidationCollateralSeized: AggregateAmount;
  totalLiquidationPrincipalRepaid: AggregateAmount;
  /**
   * totalBorrow - totalRepay - totalLiquidationPrincipalRepaid: debt in this
   * asset still outstanding within the retrieved evidence window. Only borrow
   * and repayment legs are netted - supply/collateral amounts are never
   * combined with debt amounts, since they are separate on-chain balances.
   * Can be negative, which means repayments visible in the evidence exceed
   * borrows visible in the evidence (debt predating the retrieved window).
   */
  netBorrowExposure: AggregateAmount;
}

export interface AaveActivityAggregates {
  perAsset: Record<string, AssetAggregate>;
  eventCountByAction: Record<string, number>;
  totalEventCount: number;
}

interface MutableSum {
  raw: bigint;
  eventCount: number;
}

interface MutableAssetBucket {
  symbol: string;
  decimals: number;
  totalSupply: MutableSum;
  totalBorrow: MutableSum;
  totalRepay: MutableSum;
  totalLiquidationCollateralSeized: MutableSum;
  totalLiquidationPrincipalRepaid: MutableSum;
}

function zeroSum(): MutableSum {
  return { raw: BigInt(0), eventCount: 0 };
}

function addToSum(sum: MutableSum, rawAmount: string): void {
  sum.raw += BigInt(rawAmount);
  sum.eventCount += 1;
}

function toAggregateAmount(sum: MutableSum, decimals: number): AggregateAmount {
  return {
    raw: sum.raw.toString(),
    normalized: normalizeBaseUnitAmount(sum.raw.toString(), decimals),
    eventCount: sum.eventCount,
  };
}

/**
 * Computes deterministic, code-only totals from the retrieved Aave activity:
 * per-asset supply/borrow/repay/liquidation sums and net borrow exposure,
 * plus event counts. Assets are bucketed strictly by reserve symbol so
 * different tokens (e.g. USDC vs WETH) are never combined. This exists so the
 * AI provider never has to perform (or re-derive) financial arithmetic
 * itself - see the "computedAggregates" section of the provider prompt.
 */
export function computeAaveActivityAggregates(
  activity: readonly AaveProtocolActivity[],
): AaveActivityAggregates {
  const buckets = new Map<string, MutableAssetBucket>();
  const eventCountByAction: Record<string, number> = {};

  function bucketFor(symbol: string, decimals: number): MutableAssetBucket {
    const existing = buckets.get(symbol);

    if (existing) {
      return existing;
    }

    const created: MutableAssetBucket = {
      symbol,
      decimals,
      totalSupply: zeroSum(),
      totalBorrow: zeroSum(),
      totalRepay: zeroSum(),
      totalLiquidationCollateralSeized: zeroSum(),
      totalLiquidationPrincipalRepaid: zeroSum(),
    };
    buckets.set(symbol, created);
    return created;
  }

  for (const item of activity) {
    eventCountByAction[item.action] = (eventCountByAction[item.action] ?? 0) + 1;

    if (item.activityType === "liquidation") {
      addToSum(
        bucketFor(item.collateralReserveSymbol, item.collateralReserveDecimals).totalLiquidationCollateralSeized,
        item.collateralAmount,
      );
      addToSum(
        bucketFor(item.principalReserveSymbol, item.principalReserveDecimals).totalLiquidationPrincipalRepaid,
        item.principalAmount,
      );
      continue;
    }

    if (item.amount === undefined || item.reserveSymbol === undefined || item.reserveDecimals === undefined) {
      continue;
    }

    const bucket = bucketFor(item.reserveSymbol, item.reserveDecimals);

    if (item.action === "Supply") {
      addToSum(bucket.totalSupply, item.amount);
    } else if (item.action === "Borrow") {
      addToSum(bucket.totalBorrow, item.amount);
    } else if (item.action === "Repay") {
      addToSum(bucket.totalRepay, item.amount);
    }
  }

  const perAsset: Record<string, AssetAggregate> = {};

  for (const bucket of buckets.values()) {
    const netBorrowExposureRaw =
      bucket.totalBorrow.raw - bucket.totalRepay.raw - bucket.totalLiquidationPrincipalRepaid.raw;
    const netBorrowExposureEventCount =
      bucket.totalBorrow.eventCount + bucket.totalRepay.eventCount + bucket.totalLiquidationPrincipalRepaid.eventCount;

    perAsset[bucket.symbol] = {
      symbol: bucket.symbol,
      decimals: bucket.decimals,
      totalSupply: toAggregateAmount(bucket.totalSupply, bucket.decimals),
      totalBorrow: toAggregateAmount(bucket.totalBorrow, bucket.decimals),
      totalRepay: toAggregateAmount(bucket.totalRepay, bucket.decimals),
      totalLiquidationCollateralSeized: toAggregateAmount(bucket.totalLiquidationCollateralSeized, bucket.decimals),
      totalLiquidationPrincipalRepaid: toAggregateAmount(bucket.totalLiquidationPrincipalRepaid, bucket.decimals),
      netBorrowExposure: {
        raw: netBorrowExposureRaw.toString(),
        normalized: normalizeSignedBaseUnitAmount(netBorrowExposureRaw, bucket.decimals),
        eventCount: netBorrowExposureEventCount,
      },
    };
  }

  return { perAsset, eventCountByAction, totalEventCount: activity.length };
}
