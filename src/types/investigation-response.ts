import type { AaveProtocolActivity } from "@/lib/graph/aave-types";
import type { InvestigationQuestion, WalletAddress } from "@/types/investigation";
import type { InvestigationOutcome } from "@/types/investigation-report";

export interface InvestigationRetrievalResponse {
  success: true;
  status: "data_retrieved";
  walletAddress: WalletAddress;
  question: InvestigationQuestion;
  dataSources: readonly ["aave-v3-ethereum"];
  aaveActivity: AaveProtocolActivity[];
  recordCount: number;
  investigation: InvestigationOutcome;
}