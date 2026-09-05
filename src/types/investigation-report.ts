import type { InvestigationQuestion, WalletAddress } from "@/types/investigation";

export type EvidenceId = string & { readonly __brand: "EvidenceId" };

export interface InvestigationEvidenceItem {
  evidenceId: EvidenceId;
  protocol: "aave-v3-ethereum";
  timestamp: number;
  transactionHash: string;
  action: string;
  detail: string;
}

export type InvestigationFindingConfidence = "low" | "medium" | "high";

export interface InvestigationFinding {
  statement: string;
  evidenceIds: EvidenceId[];
  confidence: InvestigationFindingConfidence;
}

export interface InvestigationReport {
  walletAddress: WalletAddress;
  question: InvestigationQuestion;
  summary: string;
  findings: InvestigationFinding[];
  dataSources: readonly ["aave-v3-ethereum"];
  evidenceCount: number;
  model: string;
  generatedAt: string;
}

export type InvestigationReportErrorCode =
  | "configuration_error"
  | "provider_error"
  | "network_error"
  | "rate_limited"
  | "invalid_output";

export interface InvestigationReportError {
  code: InvestigationReportErrorCode;
  message: string;
}

export type InvestigationOutcome =
  | { status: "completed"; report: InvestigationReport }
  | { status: "insufficient_evidence" }
  | { status: "failed"; error: InvestigationReportError };
