import { GraphClientError } from "@/lib/graph/errors";
import { createGraphClient, type GraphClient } from "@/lib/graph/client";

export const AAVE_V3_ETHEREUM_SUBGRAPH_ID = "Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g";
export const AAVE_V3_ETHEREUM_ENDPOINT = `https://gateway.thegraph.com/api/subgraphs/id/${AAVE_V3_ETHEREUM_SUBGRAPH_ID}`;

export function createAaveGraphClient(): GraphClient {
  const apiKey = process.env.THE_GRAPH_API_KEY?.trim() ?? "";

  if (apiKey.length === 0) {
    throw new GraphClientError("configuration_error", "The Graph API key is required for Aave queries.");
  }

  return createGraphClient({
    apiKey,
    endpoint: AAVE_V3_ETHEREUM_ENDPOINT,
  });
}