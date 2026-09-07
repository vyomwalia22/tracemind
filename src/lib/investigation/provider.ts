import type { AaveEvidenceWindow } from "@/lib/graph/aave-types";
import type { AaveActivityAggregates } from "@/lib/investigation/aggregates";
import type { InvestigationQuestion, WalletAddress } from "@/types/investigation";
import type { InvestigationEvidenceItem } from "@/types/investigation-report";

export interface InvestigationProviderRequest {
  walletAddress: WalletAddress;
  question: InvestigationQuestion;
  evidence: InvestigationEvidenceItem[];
  /** Deterministic, code-computed totals - ground truth for arithmetic, never derived by the AI. */
  computedAggregates: AaveActivityAggregates;
  /** Whether the retrieved evidence is the wallet's complete history or a bounded/truncated window. */
  evidenceWindow: AaveEvidenceWindow;
}

export interface InvestigationProviderResult {
  /** Unvalidated model output. Callers must validate before trusting it. */
  output: unknown;
  model: string;
}

export interface InvestigationProvider {
  generateInvestigationOutput(request: InvestigationProviderRequest): Promise<InvestigationProviderResult>;
}
