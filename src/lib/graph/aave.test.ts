import { describe, expect, it } from "vitest";

import { AAVE_ACTIVITY_PAGE_SIZE, getAaveWalletActivity } from "@/lib/graph/aave";
import type { AaveUserTransaction } from "@/lib/graph/aave-types";
import type { GraphClient } from "@/lib/graph/client";
import type { GraphQLRequest, GraphQLRequestVariables } from "@/lib/graph/types";
import { buildAaveInvestigationEvidence } from "@/lib/investigation/evidence";
import { computeAaveActivityAggregates } from "@/lib/investigation/aggregates";
import type { WalletAddress } from "@/types/investigation";

const WALLET_ADDRESS = "0x3333333333333333333333333333333333333333" as WalletAddress;

function tx(id: string, timestamp: number, amount = "1000000"): AaveUserTransaction {
  return {
    id,
    timestamp,
    txHash: `0x${id}`,
    action: "Supply",
    user: { id: WALLET_ADDRESS },
    amount,
    reserve: { symbol: "USDC", decimals: 6 },
  };
}

function fullPage(prefix: string, count: number, startTimestamp: number): AaveUserTransaction[] {
  return Array.from({ length: count }, (_, index) =>
    tx(`${prefix}-${String(index).padStart(4, "0")}`, startTimestamp + index),
  );
}

interface RecordedClient {
  client: GraphClient;
  requests: GraphQLRequest<GraphQLRequestVariables>[];
}

function fakeClient(pages: AaveUserTransaction[][]): RecordedClient {
  const requests: GraphQLRequest<GraphQLRequestVariables>[] = [];
  let callIndex = 0;

  const client: GraphClient = {
    async request<TData>(request: GraphQLRequest<GraphQLRequestVariables>): Promise<TData> {
      requests.push(request);
      const page = pages[callIndex] ?? [];
      callIndex += 1;
      return { userTransactions: page } as TData;
    },
  };

  return { client, requests };
}

describe("getAaveWalletActivity pagination", () => {
  it("returns a single-page result without further requests when the first page is not full", async () => {
    const { client, requests } = fakeClient([[tx("a", 1_700_000_000), tx("b", 1_700_000_001), tx("c", 1_700_000_002)]]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, { client });

    expect(requests).toHaveLength(1);
    expect(result.activity).toHaveLength(3);
    expect(result.evidenceWindow).toEqual({
      complete: true,
      recordCount: 3,
      oldestTimestamp: 1_700_000_000,
      newestTimestamp: 1_700_000_002,
      truncated: false,
    });
  });

  it("follows the cursor across multiple pages until a short page signals exhaustion", async () => {
    const page1 = fullPage("p1", AAVE_ACTIVITY_PAGE_SIZE, 1_700_000_000);
    const page2 = [tx("p2-0000", 1_700_100_000), tx("p2-0001", 1_700_100_001), tx("p2-0002", 1_700_100_002)];
    const { client, requests } = fakeClient([page1, page2]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, { client });

    expect(requests).toHaveLength(2);
    expect(result.activity).toHaveLength(AAVE_ACTIVITY_PAGE_SIZE + 3);
    expect(result.evidenceWindow.complete).toBe(true);
    expect(result.evidenceWindow.truncated).toBe(false);
    expect(result.evidenceWindow.recordCount).toBe(AAVE_ACTIVITY_PAGE_SIZE + 3);
  });

  it("recognizes exhaustion exactly at a page-size boundary (full page followed by an empty page)", async () => {
    const page1 = fullPage("p1", AAVE_ACTIVITY_PAGE_SIZE, 1_700_000_000);
    const { client, requests } = fakeClient([page1, []]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, { client });

    expect(requests).toHaveLength(2);
    expect(result.activity).toHaveLength(AAVE_ACTIVITY_PAGE_SIZE);
    expect(result.evidenceWindow.complete).toBe(true);
    expect(result.evidenceWindow.truncated).toBe(false);
  });

  it("returns an empty, complete result when the wallet has no activity", async () => {
    const { client, requests } = fakeClient([[]]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, { client });

    expect(requests).toHaveLength(1);
    expect(result.activity).toEqual([]);
    expect(result.evidenceWindow).toEqual({
      complete: true,
      recordCount: 0,
      oldestTimestamp: null,
      newestTimestamp: null,
      truncated: false,
    });
  });

  it("advances the cursor to the last record id of the previous page on every request", async () => {
    const page1 = fullPage("p1", AAVE_ACTIVITY_PAGE_SIZE, 1_700_000_000);
    const page2 = fullPage("p2", AAVE_ACTIVITY_PAGE_SIZE, 1_700_100_000);
    const page3 = [tx("p3-0000", 1_700_200_000)];
    const { client, requests } = fakeClient([page1, page2, page3]);

    await getAaveWalletActivity(WALLET_ADDRESS, { client });

    expect(requests).toHaveLength(3);
    expect(requests[0].variables?.afterId).toBe("");
    expect(requests[1].variables?.afterId).toBe(page1[page1.length - 1].id);
    expect(requests[2].variables?.afterId).toBe(page2[page2.length - 1].id);
  });

  it("never produces duplicate evidence ids across pages", async () => {
    const page1 = fullPage("p1", AAVE_ACTIVITY_PAGE_SIZE, 1_700_000_000);
    const page2 = fullPage("p2", AAVE_ACTIVITY_PAGE_SIZE, 1_700_100_000);
    const page3 = fullPage("p3", 50, 1_700_200_000);
    const { client } = fakeClient([page1, page2, page3, []]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, { client });

    const ids = result.activity.map((item) => item.id);
    expect(ids).toHaveLength(250);
    expect(new Set(ids).size).toBe(250);
  });

  it("stops at the safety limit and marks the result truncated instead of fetching indefinitely", async () => {
    const page1 = fullPage("p1", AAVE_ACTIVITY_PAGE_SIZE, 1_700_000_000);
    const page2 = fullPage("p2", AAVE_ACTIVITY_PAGE_SIZE, 1_700_100_000);
    const page3 = fullPage("p3", AAVE_ACTIVITY_PAGE_SIZE, 1_700_200_000);
    const { client, requests } = fakeClient([page1, page2, page3]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, {
      client,
      maxRecords: AAVE_ACTIVITY_PAGE_SIZE * 2,
    });

    expect(requests).toHaveLength(2);
    expect(result.activity).toHaveLength(AAVE_ACTIVITY_PAGE_SIZE * 2);
    expect(result.evidenceWindow.truncated).toBe(true);
    expect(result.evidenceWindow.complete).toBe(false);
  });

  it("computes oldest/newest timestamps as the true min/max regardless of retrieval order", async () => {
    const page1 = [tx("a", 1_700_050_000), tx("b", 1_700_000_000), tx("c", 1_700_020_000)];
    const page2 = [tx("d", 1_700_100_000), tx("e", 1_700_010_000)];
    const { client } = fakeClient([page1, page2]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, { client, maxRecords: 3 });

    // maxRecords=3 caps after the first (short, 3-record) page, before page2 is ever requested.
    expect(result.evidenceWindow.oldestTimestamp).toBe(1_700_000_000);
    expect(result.evidenceWindow.newestTimestamp).toBe(1_700_050_000);
  });

  it("feeds the full multi-page dataset into deterministic aggregation without dropping records", async () => {
    const page1 = fullPage("p1", AAVE_ACTIVITY_PAGE_SIZE, 1_700_000_000);
    const page2 = [tx("p2-0000", 1_700_100_000, "500000")];
    const { client } = fakeClient([page1, page2]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, { client });
    const aggregates = computeAaveActivityAggregates(result.activity);

    expect(aggregates.totalEventCount).toBe(AAVE_ACTIVITY_PAGE_SIZE + 1);
    // page1 is AAVE_ACTIVITY_PAGE_SIZE Supply events of 1_000_000 raw (6 decimals) each, plus one 500_000 raw event.
    const expectedRawTotal = BigInt(AAVE_ACTIVITY_PAGE_SIZE) * BigInt(1_000_000) + BigInt(500_000);
    expect(aggregates.perAsset.USDC.totalSupply.raw).toBe(expectedRawTotal.toString());
  });

  it("preserves stable evidence ids matching the original transaction ids across a multi-page fetch", async () => {
    const page1 = fullPage("p1", AAVE_ACTIVITY_PAGE_SIZE, 1_700_000_000);
    const page2 = [tx("p2-0000", 1_700_100_000)];
    const { client } = fakeClient([page1, page2]);

    const result = await getAaveWalletActivity(WALLET_ADDRESS, { client });
    const evidence = buildAaveInvestigationEvidence(result.activity);

    const activityIds = new Set(result.activity.map((item) => item.id));
    const evidenceIds = new Set(evidence.map((item) => item.evidenceId));
    expect(evidenceIds).toEqual(activityIds);
    expect(evidence).toHaveLength(AAVE_ACTIVITY_PAGE_SIZE + 1);
  });
});
