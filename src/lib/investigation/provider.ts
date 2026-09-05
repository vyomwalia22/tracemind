import type { InvestigationQuestion, WalletAddress } from "@/types/investigation";
import type { InvestigationEvidenceItem } from "@/types/investigation-report";

export interface InvestigationProviderRequest {
  walletAddress: WalletAddress;
  question: InvestigationQuestion;
  evidence: InvestigationEvidenceItem[];
}

export interface InvestigationProviderResult {
  /** Unvalidated model output. Callers must validate before trusting it. */
  output: unknown;
  model: string;
}

export interface InvestigationProvider {
  generateInvestigationOutput(request: InvestigationProviderRequest): Promise<InvestigationProviderResult>;
}
