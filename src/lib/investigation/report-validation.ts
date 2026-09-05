import type { AiInvestigationOutput } from "@/lib/investigation/report-schema";
import type { InvestigationQuestion, WalletAddress } from "@/types/investigation";
import type {
  EvidenceId,
  InvestigationEvidenceItem,
  InvestigationFinding,
  InvestigationReport,
} from "@/types/investigation-report";

export interface BuildInvestigationReportParams {
  walletAddress: WalletAddress;
  question: InvestigationQuestion;
  evidence: InvestigationEvidenceItem[];
  output: AiInvestigationOutput;
  model: string;
  generatedAt?: string;
}

export type BuildInvestigationReportResult =
  | { success: true; report: InvestigationReport }
  | { success: false; errors: string[] };

/**
 * Binds the AI's structurally-valid output to the retrieved evidence set. Every
 * evidenceId a finding cites must exist in `evidence` - anything else means the
 * model referenced evidence it was never given, so the whole report is rejected
 * rather than silently dropping the offending finding.
 */
export function buildInvestigationReport(params: BuildInvestigationReportParams): BuildInvestigationReportResult {
  const allowedEvidenceIds = new Set<string>(params.evidence.map((item) => item.evidenceId));
  const errors: string[] = [];
  const findings: InvestigationFinding[] = [];

  params.output.findings.forEach((finding, index) => {
    const invalidEvidenceIds = finding.evidenceIds.filter((id) => !allowedEvidenceIds.has(id));

    if (invalidEvidenceIds.length > 0) {
      errors.push(
        `Finding ${index + 1} references evidence not present in the retrieved dataset: ${invalidEvidenceIds.join(", ")}.`,
      );
      return;
    }

    findings.push({
      statement: finding.statement,
      evidenceIds: finding.evidenceIds as EvidenceId[],
      confidence: finding.confidence,
    });
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    report: {
      walletAddress: params.walletAddress,
      question: params.question,
      summary: params.output.summary,
      findings,
      dataSources: ["aave-v3-ethereum"],
      evidenceCount: params.evidence.length,
      model: params.model,
      generatedAt: params.generatedAt ?? new Date().toISOString(),
    },
  };
}
