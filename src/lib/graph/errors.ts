export type GraphClientErrorCode =
  | "configuration_error"
  | "network_error"
  | "http_error"
  | "graphql_error"
  | "invalid_response";

export interface GraphClientErrorDetails {
  status?: number;
  graphQLErrors?: ReadonlyArray<{ message: string; locations?: Array<{ line: number; column: number }>; path?: Array<string | number>; extensions?: Record<string, unknown> }>;
  cause?: unknown;
}

export class GraphClientError extends Error {
  readonly code: GraphClientErrorCode;
  readonly details: GraphClientErrorDetails;

  constructor(code: GraphClientErrorCode, message: string, details: GraphClientErrorDetails = {}) {
    super(message);
    this.name = "GraphClientError";
    this.code = code;
    this.details = details;
  }
}