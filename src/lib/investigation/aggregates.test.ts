import { describe, expect, it } from "vitest";

import type { AaveProtocolActivity } from "@/lib/graph/aave-types";
import { computeAaveActivityAggregates } from "@/lib/investigation/aggregates";
import type { WalletAddress } from "@/types/investigation";

const WALLET_ADDRESS = "0x2222222222222222222222222222222222222222" as WalletAddress;

function standardActivity(overrides: {
  id: string;
  action: string;
  amount?: string;
  reserveSymbol?: string;
  reserveDecimals?: number;
  timestamp?: number;
}): AaveProtocolActivity {
  return {
    protocol: "aave-v3-ethereum",
    id: overrides.id,
    timestamp: overrides.timestamp ?? 1_700_000_000,
    transactionHash: `0x${overrides.id}`,
    action: overrides.action,
    walletAddress: WALLET_ADDRESS,
    activityType: "standard",
    amount: overrides.amount,
    reserveSymbol: overrides.reserveSymbol,
    reserveDecimals: overrides.reserveDecimals,
  };
}

function liquidationActivity(overrides: {
  id: string;
  collateralAmount: string;
  collateralReserveSymbol: string;
  collateralReserveDecimals: number;
  principalAmount: string;
  principalReserveSymbol: string;
  principalReserveDecimals: number;
  timestamp?: number;
}): AaveProtocolActivity {
  return {
    protocol: "aave-v3-ethereum",
    id: overrides.id,
    timestamp: overrides.timestamp ?? 1_700_000_000,
    transactionHash: `0x${overrides.id}`,
    action: "LiquidationCall",
    walletAddress: WALLET_ADDRESS,
    activityType: "liquidation",
    collateralAmount: overrides.collateralAmount,
    collateralAmountNormalized: "",
    collateralReserveSymbol: overrides.collateralReserveSymbol,
    collateralReserveDecimals: overrides.collateralReserveDecimals,
    principalAmount: overrides.principalAmount,
    principalAmountNormalized: "",
    principalReserveSymbol: overrides.principalReserveSymbol,
    principalReserveDecimals: overrides.principalReserveDecimals,
  };
}

describe("computeAaveActivityAggregates", () => {
  it("returns an empty structure for zero activity", () => {
    const aggregates = computeAaveActivityAggregates([]);

    expect(aggregates).toEqual({
      perAsset: {},
      eventCountByAction: {},
      totalEventCount: 0,
    });
  });

  it("aggregates supply, borrow, and repay independently for a single asset", () => {
    const aggregates = computeAaveActivityAggregates([
      standardActivity({ id: "1", action: "Supply", amount: "100000000", reserveSymbol: "USDC", reserveDecimals: 6 }),
      standardActivity({ id: "2", action: "Supply", amount: "50000000", reserveSymbol: "USDC", reserveDecimals: 6 }),
      standardActivity({ id: "3", action: "Borrow", amount: "30000000", reserveSymbol: "USDC", reserveDecimals: 6 }),
      standardActivity({ id: "4", action: "Repay", amount: "10000000", reserveSymbol: "USDC", reserveDecimals: 6 }),
    ]);

    const usdc = aggregates.perAsset.USDC;
    expect(usdc.totalSupply).toEqual({ raw: "150000000", normalized: "150", eventCount: 2 });
    expect(usdc.totalBorrow).toEqual({ raw: "30000000", normalized: "30", eventCount: 1 });
    expect(usdc.totalRepay).toEqual({ raw: "10000000", normalized: "10", eventCount: 1 });
    expect(usdc.netBorrowExposure).toEqual({ raw: "20000000", normalized: "20", eventCount: 2 });
  });

  it("keeps different assets in separate buckets and never combines their totals", () => {
    const aggregates = computeAaveActivityAggregates([
      standardActivity({ id: "1", action: "Supply", amount: "100000000", reserveSymbol: "USDC", reserveDecimals: 6 }),
      standardActivity({ id: "2", action: "Supply", amount: "2000000000000000000", reserveSymbol: "WETH", reserveDecimals: 18 }),
      standardActivity({ id: "3", action: "Borrow", amount: "1", reserveSymbol: "WBTC", reserveDecimals: 8 }),
    ]);

    expect(Object.keys(aggregates.perAsset).sort()).toEqual(["USDC", "WBTC", "WETH"]);
    expect(aggregates.perAsset.USDC.totalSupply).toEqual({ raw: "100000000", normalized: "100", eventCount: 1 });
    expect(aggregates.perAsset.WETH.totalSupply).toEqual({ raw: "2000000000000000000", normalized: "2", eventCount: 1 });
    expect(aggregates.perAsset.WBTC.totalBorrow).toEqual({ raw: "1", normalized: "0.00000001", eventCount: 1 });

    // No cross-contamination: USDC's borrow/repay must stay untouched by WETH/WBTC activity.
    expect(aggregates.perAsset.USDC.totalBorrow).toEqual({ raw: "0", normalized: "0", eventCount: 0 });
    expect(aggregates.perAsset.WETH.totalBorrow).toEqual({ raw: "0", normalized: "0", eventCount: 0 });
  });

  it("computes a negative net borrow exposure when visible repayments exceed visible borrows", () => {
    const aggregates = computeAaveActivityAggregates([
      standardActivity({ id: "1", action: "Repay", amount: "5000000000000000000", reserveSymbol: "WETH", reserveDecimals: 18 }),
    ]);

    expect(aggregates.perAsset.WETH.totalBorrow.raw).toBe("0");
    expect(aggregates.perAsset.WETH.netBorrowExposure).toEqual({ raw: "-5000000000000000000", normalized: "-5", eventCount: 1 });
  });

  it("folds liquidation legs into the collateral and principal asset buckets, and principal repayment reduces net borrow exposure", () => {
    const aggregates = computeAaveActivityAggregates([
      standardActivity({ id: "1", action: "Borrow", amount: "100000000", reserveSymbol: "USDC", reserveDecimals: 6 }),
      liquidationActivity({
        id: "2",
        collateralAmount: "20000000000000000",
        collateralReserveSymbol: "WETH",
        collateralReserveDecimals: 18,
        principalAmount: "40000000",
        principalReserveSymbol: "USDC",
        principalReserveDecimals: 6,
      }),
    ]);

    expect(aggregates.perAsset.WETH.totalLiquidationCollateralSeized).toEqual({
      raw: "20000000000000000",
      normalized: "0.02",
      eventCount: 1,
    });
    expect(aggregates.perAsset.USDC.totalLiquidationPrincipalRepaid).toEqual({
      raw: "40000000",
      normalized: "40",
      eventCount: 1,
    });
    // 100 USDC borrowed - 0 repaid - 40 USDC repaid via liquidation = 60 USDC still outstanding.
    expect(aggregates.perAsset.USDC.netBorrowExposure).toEqual({ raw: "60000000", normalized: "60", eventCount: 2 });
    // Collateral seizure never touches borrow/repay totals for WETH.
    expect(aggregates.perAsset.WETH.totalBorrow).toEqual({ raw: "0", normalized: "0", eventCount: 0 });
  });

  it("counts events per action, including actions with no amount evidence", () => {
    const aggregates = computeAaveActivityAggregates([
      standardActivity({ id: "1", action: "Supply", amount: "100000000", reserveSymbol: "USDC", reserveDecimals: 6 }),
      standardActivity({ id: "2", action: "Supply", amount: "50000000", reserveSymbol: "USDC", reserveDecimals: 6 }),
      standardActivity({ id: "3", action: "UsageAsCollateral" }),
    ]);

    expect(aggregates.eventCountByAction).toEqual({ Supply: 2, UsageAsCollateral: 1 });
    expect(aggregates.totalEventCount).toBe(3);
  });

  it("does not lose precision on large 18-decimal amounts", () => {
    const aggregates = computeAaveActivityAggregates([
      standardActivity({ id: "1", action: "Supply", amount: "123456789012345678901234", reserveSymbol: "WETH", reserveDecimals: 18 }),
      standardActivity({ id: "2", action: "Supply", amount: "1", reserveSymbol: "WETH", reserveDecimals: 18 }),
    ]);

    expect(aggregates.perAsset.WETH.totalSupply).toEqual({
      raw: "123456789012345678901235",
      normalized: "123456.789012345678901235",
      eventCount: 2,
    });
  });

  it("ignores standard activity missing amount/reserve evidence rather than throwing", () => {
    const aggregates = computeAaveActivityAggregates([standardActivity({ id: "1", action: "RedeemUnderlying" })]);

    expect(aggregates.perAsset).toEqual({});
    expect(aggregates.eventCountByAction).toEqual({ RedeemUnderlying: 1 });
  });
});
