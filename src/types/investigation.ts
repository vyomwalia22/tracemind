export type WalletAddress = string & { readonly __brand: "WalletAddress" };
export type InvestigationQuestion = string & { readonly __brand: "InvestigationQuestion" };

export interface InvestigationRequest {
  walletAddress: WalletAddress;
  question: InvestigationQuestion;
}

export type InvestigationStatus = "queued" | "running" | "completed" | "failed";

export interface InvestigationResultBoundary {
  status: InvestigationStatus;
  result: never;
}

export interface InvestigationValidationError {
  field: "walletAddress" | "question";
  code: "invalid_format" | "required" | "too_long";
  message: string;
}