import type { InvestigationReportErrorCode } from "@/types/investigation-report";

export interface InvestigationProviderErrorDetails {
  cause?: unknown;
}

export class InvestigationProviderError extends Error {
  readonly code: InvestigationReportErrorCode;
  readonly details: InvestigationProviderErrorDetails;

  constructor(
    code: InvestigationReportErrorCode,
    message: string,
    details: InvestigationProviderErrorDetails = {},
  ) {
    super(message);
    this.name = "InvestigationProviderError";
    this.code = code;
    this.details = details;
  }
}
