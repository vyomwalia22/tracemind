import type { AaveEvidenceWindow, AaveProtocolActivity } from "@/lib/graph/aave-types";
import type { WalletAddress } from "@/types/investigation";

const WALLET_ADDRESS = "0x1111111111111111111111111111111111111111" as WalletAddress;

export const sampleWalletAddress = WALLET_ADDRESS;

export const sampleSupplyActivity: AaveProtocolActivity = {
  protocol: "aave-v3-ethereum",
  id: "0xaaa1:0",
  timestamp: 1_700_000_000,
  transactionHash: "0xaaa1",
  action: "Supply",
  walletAddress: WALLET_ADDRESS,
  activityType: "standard",
  amount: "120500000",
  amountNormalized: "120.5",
  reserveSymbol: "USDC",
  reserveDecimals: 6,
};

export const sampleLiquidationActivity: AaveProtocolActivity = {
  protocol: "aave-v3-ethereum",
  id: "0xaaa2:1",
  timestamp: 1_700_100_000,
  transactionHash: "0xaaa2",
  action: "LiquidationCall",
  walletAddress: WALLET_ADDRESS,
  activityType: "liquidation",
  collateralAmount: "20000000000000000",
  collateralAmountNormalized: "0.02",
  collateralReserveSymbol: "WETH",
  collateralReserveDecimals: 18,
  principalAmount: "50000000",
  principalAmountNormalized: "50",
  principalReserveSymbol: "USDC",
  principalReserveDecimals: 6,
};

export const sampleAaveActivity: AaveProtocolActivity[] = [sampleSupplyActivity, sampleLiquidationActivity];

export const sampleEvidenceWindow: AaveEvidenceWindow = {
  complete: true,
  recordCount: sampleAaveActivity.length,
  oldestTimestamp: sampleSupplyActivity.timestamp,
  newestTimestamp: sampleLiquidationActivity.timestamp,
  truncated: false,
};
