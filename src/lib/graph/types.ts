export interface GraphQLRequestVariables {
  readonly [key: string]: unknown;
}

export interface GraphQLRequest<TVariables extends GraphQLRequestVariables = GraphQLRequestVariables> {
  query: string;
  variables?: TVariables;
  operationName?: string;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface GraphQLResponse<TData> {
  data?: TData;
  errors?: GraphQLError[];
}

export interface GraphClientConfig {
  apiKey: string;
  endpoint: string;
  fetch?: typeof fetch;
}

export interface GraphGatewayConfig {
  apiKey: string;
  subgraphId: string;
}