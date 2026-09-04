import type { WalletAddress } from "@/types/investigation";

export interface AaveUserReference {
  id: WalletAddress;
}

export interface AaveReserveReference {
  symbol: string;
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
  amount?: string;
  reserveSymbol?: string;
}

export interface AaveLiquidationProtocolActivity extends AaveProtocolActivityBase {
  activityType: "liquidation";
  collateralAmount: string;
  principalAmount: string;
  collateralReserveSymbol: string;
  principalReserveSymbol: string;
}

export type AaveProtocolActivity =
  | AaveStandardProtocolActivity
  | AaveLiquidationProtocolActivity;