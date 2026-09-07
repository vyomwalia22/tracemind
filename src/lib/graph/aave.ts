import { createAaveGraphClient } from "@/lib/graph/aave-config";
import type { GraphClient } from "@/lib/graph/client";
import { normalizeBaseUnitAmount } from "@/lib/graph/decimal";
import { GraphClientError } from "@/lib/graph/errors";
import type {
  AaveEvidenceWindow,
  AaveProtocolActivity,
  AaveLiquidationProtocolActivity,
  AaveUserTransaction,
  AaveUserTransactionsResponse,
} from "@/lib/graph/aave-types";
import { isValidEvmWalletAddress } from "@/utils/investigation-validation";
import type { WalletAddress } from "@/types/investigation";

/** Records requested per page. Ordering by `id` (the store's own primary key) makes `id_gt` an exact, gap-free, duplicate-free cursor regardless of what the id string encodes. */
export const AAVE_ACTIVITY_PAGE_SIZE = 100;

/** Explicit safety cap on total records fetched for a single investigation - a deliberately bounded window, not a silent truncation. Keep as a multiple of AAVE_ACTIVITY_PAGE_SIZE so the cap lands on a clean page boundary. */
export const MAX_AAVE_ACTIVITY_RECORDS = 1000;

const AAVE_USER_ACTIVITY_PAGE_QUERY = `
  query AaveUserActivityPage($wallet: Bytes!, $limit: Int!, $afterId: String!) {
    userTransactions(
      first: $limit
      where: { user: $wallet, id_gt: $afterId }
      orderBy: id
      orderDirection: asc
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
          decimals
        }
      }
      ... on Borrow {
        amount
        reserve {
          symbol
          decimals
        }
      }
      ... on Repay {
        amount
        reserve {
          symbol
          decimals
        }
      }
      ... on LiquidationCall {
        collateralAmount
        principalAmount
        collateralReserve {
          symbol
          decimals
        }
        principalReserve {
          symbol
          decimals
        }
      }
    }
  }
`;

export interface GetAaveWalletActivityOptions {
  /** Safety cap on total records retrieved. Defaults to MAX_AAVE_ACTIVITY_RECORDS. */
  maxRecords?: number;
  /** Test/DI seam - defaults to the real Aave subgraph client. */
  client?: GraphClient;
}

export interface AaveWalletActivityResult {
  activity: AaveProtocolActivity[];
  evidenceWindow: AaveEvidenceWindow;
}

export async function getAaveWalletActivity(
  walletAddress: WalletAddress,
  options: GetAaveWalletActivityOptions = {},
): Promise<AaveWalletActivityResult> {
  if (!isValidEvmWalletAddress(walletAddress)) {
    throw new GraphClientError("configuration_error", "Aave wallet activity requires a valid EVM wallet address.");
  }

  const client = options.client ?? createAaveGraphClient();
  const maxRecords = normalizeMaxRecords(options.maxRecords);

  const { transactions, truncated } = await fetchAllUserTransactions(client, walletAddress, maxRecords);

  const activity = transactions
    .map(normalizeAaveActivity)
    .sort((a, b) => b.timestamp - a.timestamp);

  return { activity, evidenceWindow: buildEvidenceWindow(activity, truncated) };
}

async function fetchAllUserTransactions(
  client: GraphClient,
  walletAddress: WalletAddress,
  maxRecords: number,
): Promise<{ transactions: AaveUserTransaction[]; truncated: boolean }> {
  const transactions: AaveUserTransaction[] = [];
  let cursor = "";

  for (;;) {
    const response = await client.request<AaveUserTransactionsResponse>({
      query: AAVE_USER_ACTIVITY_PAGE_QUERY,
      variables: {
        wallet: walletAddress.toLowerCase(),
        limit: AAVE_ACTIVITY_PAGE_SIZE,
        afterId: cursor,
      },
    });

    const page = response.userTransactions;
    transactions.push(...page);

    if (page.length < AAVE_ACTIVITY_PAGE_SIZE) {
      // Fewer records than requested means the store has no more - fully exhausted.
      return { transactions, truncated: false };
    }

    cursor = page[page.length - 1].id;

    if (transactions.length >= maxRecords) {
      // Hit the safety cap right on a full page - more records may exist beyond it.
      return { transactions, truncated: true };
    }
  }
}

function buildEvidenceWindow(activity: readonly AaveProtocolActivity[], truncated: boolean): AaveEvidenceWindow {
  if (activity.length === 0) {
    return { complete: !truncated, recordCount: 0, oldestTimestamp: null, newestTimestamp: null, truncated };
  }

  const timestamps = activity.map((item) => item.timestamp);

  return {
    complete: !truncated,
    recordCount: activity.length,
    oldestTimestamp: Math.min(...timestamps),
    newestTimestamp: Math.max(...timestamps),
    truncated,
  };
}

function normalizeMaxRecords(maxRecords: number | undefined): number {
  if (maxRecords === undefined || !Number.isFinite(maxRecords)) {
    return MAX_AAVE_ACTIVITY_RECORDS;
  }

  return Math.max(1, Math.trunc(maxRecords));
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

  const reserveDecimals = transaction.reserve?.decimals;

  return {
    ...baseActivity,
    activityType: "standard",
    amount: transaction.amount,
    amountNormalized:
      transaction.amount !== undefined && reserveDecimals !== undefined
        ? normalizeBaseUnitAmount(transaction.amount, reserveDecimals)
        : undefined,
    reserveSymbol: transaction.reserve?.symbol,
    reserveDecimals,
  };
}

function normalizeLiquidationActivity(
  transaction: AaveUserTransaction,
  baseActivity: Omit<
    AaveLiquidationProtocolActivity,
    | "activityType"
    | "collateralAmount"
    | "collateralAmountNormalized"
    | "principalAmount"
    | "principalAmountNormalized"
    | "collateralReserveSymbol"
    | "collateralReserveDecimals"
    | "principalReserveSymbol"
    | "principalReserveDecimals"
  >,
): AaveLiquidationProtocolActivity {
  if (
    transaction.collateralAmount === undefined ||
    transaction.principalAmount === undefined ||
    transaction.collateralReserve?.symbol === undefined ||
    transaction.collateralReserve?.decimals === undefined ||
    transaction.principalReserve?.symbol === undefined ||
    transaction.principalReserve?.decimals === undefined
  ) {
    throw new GraphClientError("invalid_response", "The Aave liquidation response was missing evidence fields.");
  }

  return {
    ...baseActivity,
    activityType: "liquidation",
    collateralAmount: transaction.collateralAmount,
    collateralAmountNormalized: normalizeBaseUnitAmount(transaction.collateralAmount, transaction.collateralReserve.decimals),
    principalAmount: transaction.principalAmount,
    principalAmountNormalized: normalizeBaseUnitAmount(transaction.principalAmount, transaction.principalReserve.decimals),
    collateralReserveSymbol: transaction.collateralReserve.symbol,
    collateralReserveDecimals: transaction.collateralReserve.decimals,
    principalReserveSymbol: transaction.principalReserve.symbol,
    principalReserveDecimals: transaction.principalReserve.decimals,
  };
}
