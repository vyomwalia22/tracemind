import { createAaveGraphClient } from "@/lib/graph/aave-config";
import { GraphClientError } from "@/lib/graph/errors";
import type {
  AaveProtocolActivity,
  AaveLiquidationProtocolActivity,
  AaveUserTransaction,
  AaveUserTransactionsResponse,
} from "@/lib/graph/aave-types";
import { isValidEvmWalletAddress } from "@/utils/investigation-validation";
import type { WalletAddress } from "@/types/investigation";

const AAVE_USER_ACTIVITY_QUERY = `
  query AaveUserActivity($wallet: Bytes!, $limit: Int!) {
    userTransactions(
      first: $limit
      where: { user: $wallet }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      timestamp
      txHash
      action
      user {
        id
      }
      ... on Supply {
        amount
        reserve {
          symbol
        }
      }
      ... on Borrow {
        amount
        reserve {
          symbol
        }
      }
      ... on Repay {
        amount
        reserve {
          symbol
        }
      }
      ... on LiquidationCall {
        collateralAmount
        principalAmount
        collateralReserve {
          symbol
        }
        principalReserve {
          symbol
        }
      }
    }
  }
`;

export async function getAaveWalletActivity(
  walletAddress: WalletAddress,
  limit = 25,
): Promise<AaveProtocolActivity[]> {
  if (!isValidEvmWalletAddress(walletAddress)) {
    throw new GraphClientError("configuration_error", "Aave wallet activity requires a valid EVM wallet address.");
  }

  const response = await createAaveGraphClient().request<AaveUserTransactionsResponse>({
    query: AAVE_USER_ACTIVITY_QUERY,
    variables: {
      wallet: walletAddress.toLowerCase(),
      limit: normalizeActivityLimit(limit),
    },
  });

  return response.userTransactions.map(normalizeAaveActivity);
}

function normalizeAaveActivity(transaction: AaveUserTransaction): AaveProtocolActivity {
  const baseActivity = {
    protocol: "aave-v3-ethereum" as const,
    id: transaction.id,
    timestamp: transaction.timestamp,
    transactionHash: transaction.txHash,
    action: transaction.action,
    walletAddress: transaction.user.id,
  };

  if (transaction.action === "LiquidationCall") {
    return normalizeLiquidationActivity(transaction, baseActivity);
  }

  return {
    ...baseActivity,
    activityType: "standard",
    amount: transaction.amount,
    reserveSymbol: transaction.reserve?.symbol,
  };
}

function normalizeLiquidationActivity(
  transaction: AaveUserTransaction,
  baseActivity: Omit<AaveLiquidationProtocolActivity, "activityType" | "collateralAmount" | "principalAmount" | "collateralReserveSymbol" | "principalReserveSymbol">,
): AaveLiquidationProtocolActivity {
  if (
    transaction.collateralAmount === undefined ||
    transaction.principalAmount === undefined ||
    transaction.collateralReserve?.symbol === undefined ||
    transaction.principalReserve?.symbol === undefined
  ) {
    throw new GraphClientError("invalid_response", "The Aave liquidation response was missing evidence fields.");
  }

  return {
    ...baseActivity,
    activityType: "liquidation",
    collateralAmount: transaction.collateralAmount,
    principalAmount: transaction.principalAmount,
    collateralReserveSymbol: transaction.collateralReserve.symbol,
    principalReserveSymbol: transaction.principalReserve.symbol,
  };
}

function normalizeActivityLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return 25;
  }

  return Math.min(100, Math.max(1, Math.trunc(limit)));
}
