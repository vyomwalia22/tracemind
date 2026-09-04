import { GraphClientError } from "@/lib/graph/errors";
import type {
  GraphClientConfig,
  GraphGatewayConfig,
  GraphQLRequest,
  GraphQLRequestVariables,
  GraphQLResponse,
} from "@/lib/graph/types";

export interface GraphClient {
  request<TData, TVariables extends GraphQLRequestVariables = GraphQLRequestVariables>(
    request: GraphQLRequest<TVariables>,
  ): Promise<TData>;
}

export function createGraphGatewayEndpoint(config: GraphGatewayConfig): string {
  const apiKey = config.apiKey.trim();
  const subgraphId = config.subgraphId.trim();

  if (apiKey.length === 0) {
    throw new GraphClientError("configuration_error", "The Graph API key is required.");
  }

  if (subgraphId.length === 0) {
    throw new GraphClientError("configuration_error", "The Graph subgraph ID is required.");
  }

  return `https://gateway.thegraph.com/api/${encodeURIComponent(apiKey)}/subgraphs/id/${encodeURIComponent(subgraphId)}`;
}

export function createGraphClient(config: GraphClientConfig): GraphClient {
  const endpoint = config.endpoint.trim();
  const apiKey = config.apiKey.trim();

  if (apiKey.length === 0) {
    throw new GraphClientError("configuration_error", "The Graph API key is required.");
  }

  if (endpoint.length === 0) {
    throw new GraphClientError("configuration_error", "The Graph endpoint is required.");
  }

  let parsedEndpoint: URL;

  try {
    parsedEndpoint = new URL(endpoint);
  } catch (cause) {
    throw new GraphClientError("configuration_error", "The Graph endpoint must be a valid URL.", { cause });
  }

  const requestFetch = config.fetch ?? fetch;

  return {
    async request<TData, TVariables extends GraphQLRequestVariables = GraphQLRequestVariables>(
      request: GraphQLRequest<TVariables>,
    ): Promise<TData> {
      if (request.query.trim().length === 0) {
        throw new GraphClientError("configuration_error", "The GraphQL query is required.");
      }

      let response: Response;

      try {
        response = await requestFetch(parsedEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(request),
        });
      } catch (cause) {
        throw new GraphClientError("network_error", "The request to The Graph failed.", { cause });
      }

      if (!response.ok) {
        throw new GraphClientError("http_error", `The Graph request failed with HTTP ${response.status}.`, {
          status: response.status,
        });
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch (cause) {
        throw new GraphClientError("invalid_response", "The Graph returned an invalid JSON response.", { cause });
      }

      if (!isGraphQLResponse<TData>(payload)) {
        throw new GraphClientError("invalid_response", "The Graph returned an unexpected response shape.");
      }

      if (payload.errors && payload.errors.length > 0) {
        throw new GraphClientError("graphql_error", "The Graph returned GraphQL errors.", {
          graphQLErrors: payload.errors,
        });
      }

      if (payload.data === undefined) {
        throw new GraphClientError("invalid_response", "The Graph response did not contain data.");
      }

      return payload.data;
    },
  };
}

function isGraphQLResponse<TData>(value: unknown): value is GraphQLResponse<TData> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const response = value as Record<string, unknown>;

  if (response.errors !== undefined && !isGraphQLErrorList(response.errors)) {
    return false;
  }

  return response.data !== undefined || response.errors !== undefined;
}

function isGraphQLErrorList(value: unknown): boolean {
  return Array.isArray(value) && value.every((error) => (
    typeof error === "object" &&
    error !== null &&
    !Array.isArray(error) &&
    typeof (error as Record<string, unknown>).message === "string"
  ));
}
