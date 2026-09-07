import type { WalletAddress } from "@/types/investigation";

export interface AaveUserReference {
  id: WalletAddress;
}

export interface AaveReserveReference {
  symbol: string;
  decimals: number;
}

export interface AaveUserTransaction {
  id: string;
  timestamp: number;
  txHash: string;
  action: string;
  user: AaveUserReference;
  amount?: string;
  reserve?: AaveReserveReference;
  collateralAmount?: string;
  principalAmount?: string;
  collateralReserve?: AaveReserveReference;
  principalReserve?: AaveReserveReference;
}

export interface AaveUserTransactionsResponse {
  userTransactions: AaveUserTransaction[];
}

interface AaveProtocolActivityBase {
  protocol: "aave-v3-ethereum";
  id: string;
  timestamp: number;
  transactionHash: string;
  action: string;
  walletAddress: WalletAddress;
}

export interface AaveStandardProtocolActivity extends AaveProtocolActivityBase {
  activityType: "standard";
  /** Raw base-unit amount exactly as returned by the subgraph. */
  amount?: string;
  /** Human-readable amount, normalized using `reserveDecimals`. */
  amountNormalized?: string;
  reserveSymbol?: string;
  reserveDecimals?: number;
}

export interface AaveLiquidationProtocolActivity extends AaveProtocolActivityBase {
  activityType: "liquidation";
  /** Raw base-unit amount exactly as returned by the subgraph. */
  collateralAmount: string;
  /** Human-readable amount, normalized using `collateralReserveDecimals`. */
  collateralAmountNormalized: string;
  /** Raw base-unit amount exactly as returned by the subgraph. */
  principalAmount: string;
  /** Human-readable amount, normalized using `principalReserveDecimals`. */
  principalAmountNormalized: string;
  collateralReserveSymbol: string;
  collateralReserveDecimals: number;
  principalReserveSymbol: string;
  principalReserveDecimals: number;
}

export type AaveProtocolActivity =
  | AaveStandardProtocolActivity
  | AaveLiquidationProtocolActivity;

/**
 * Describes how complete the retrieved activity is relative to the wallet's
 * full on-chain history. `complete` and `truncated` are always each other's
 * negation - both are kept as explicit, separately named fields so a reader
 * (human or model) never has to infer one from the other.
 */
export interface AaveEvidenceWindow {
  /** True only when every matching record was retrieved - no safety limit was hit. */
  complete: boolean;
  recordCount: number;
  /** Unix seconds. Null when recordCount is 0. */
  oldestTimestamp: number | null;
  /** Unix seconds. Null when recordCount is 0. */
  newestTimestamp: number | null;
  /** True when a safety limit was reached and more matching activity may exist beyond it. */
  truncated: boolean;
}