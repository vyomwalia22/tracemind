import type { AaveProtocolActivity } from "@/lib/graph/aave-types";
import { buildAaveInvestigationEvidence } from "@/lib/investigation/evidence";
import { InvestigationProviderError } from "@/lib/investigation/errors";
import type { InvestigationProvider } from "@/lib/investigation/provider";
import { aiInvestigationOutputSchema } from "@/lib/investigation/report-schema";
import { buildInvestigationReport } from "@/lib/investigation/report-validation";
import type { InvestigationQuestion, WalletAddress } from "@/types/investigation";
import type { InvestigationOutcome, InvestigationReportError } from "@/types/investigation-report";

export interface RunInvestigationParams {
  walletAddress: WalletAddress;
  question: InvestigationQuestion;
  aaveActivity: readonly AaveProtocolActivity[];
  createProvider: () => InvestigationProvider;
}

/**
 * Orchestrates the AI investigation phase: builds bounded evidence from the
 * already-retrieved Aave activity, asks the provider for a structured report,
 * then validates the output before it is ever treated as a real finding.
 * Never throws - configuration and provider failures become an explicit
 * `failed` outcome so the caller never has to guess whether a result is real.
 */
export async function runInvestigation(params: RunInvestigationParams): Promise<InvestigationOutcome> {
  const evidence = buildAaveInvestigationEvidence(params.aaveActivity);

  if (evidence.length === 0) {
    return { status: "insufficient_evidence" };
  }

  let provider: InvestigationProvider;

  try {
    provider = params.createProvider();
  } catch (error) {
    return { status: "failed", error: toReportError(error) };
  }

  let providerResult;

  try {
    providerResult = await provider.generateInvestigationOutput({
      walletAddress: params.walletAddress,
      question: params.question,
      evidence,
    });
  } catch (error) {
    return { status: "failed", error: toReportError(error) };
  }

  const parsedOutput = aiInvestigationOutputSchema.safeParse(providerResult.output);

  if (!parsedOutput.success) {
    return {
      status: "failed",
      error: {
        code: "invalid_output",
        message: "The AI response did not match the required report schema.",
      },
    };
  }

  const built = buildInvestigationReport({
    walletAddress: params.walletAddress,
    question: params.question,
    evidence,
    output: parsedOutput.data,
    model: providerResult.model,
  });

  if (!built.success) {
    return {
      status: "failed",
      error: { code: "invalid_output", message: built.errors.join(" ") },
    };
  }

  return { status: "completed", report: built.report };
}

function toReportError(error: unknown): InvestigationReportError {
  if (error instanceof InvestigationProviderError) {
    return { code: error.code, message: error.message };
  }

  return { code: "provider_error", message: "The AI investigation could not be completed." };
}
