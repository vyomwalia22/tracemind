import { describe, expect, it } from "vitest";

import { sampleAaveActivity, sampleWalletAddress } from "@/lib/investigation/__fixtures__/aave-activity";
import { buildAaveInvestigationEvidence } from "@/lib/investigation/evidence";
import type { AiInvestigationOutput } from "@/lib/investigation/report-schema";
import { buildInvestigationReport } from "@/lib/investigation/report-validation";
import type { InvestigationQuestion } from "@/types/investigation";

const QUESTION = "What did this wallet do?" as InvestigationQuestion;

describe("buildInvestigationReport", () => {
  it("builds a report when every evidence reference is valid", () => {
    const evidence = buildAaveInvestigationEvidence(sampleAaveActivity);
    const output: AiInvestigationOutput = {
      summary: "The wallet supplied USDC and was later liquidated.",
      findings: [
        { statement: "The wallet supplied 120.5 USDC.", evidenceIds: [evidence[0].evidenceId], confidence: "high" },
        {
          statement: "The wallet's position was liquidated.",
          evidenceIds: [evidence[1].evidenceId],
          confidence: "high",
        },
      ],
    };

    const result = buildInvestigationReport({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      evidence,
      output,
      model: "claude-opus-5",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.report.findings).toHaveLength(2);
      expect(result.report.evidenceCount).toBe(2);
      expect(result.report.dataSources).toEqual(["aave-v3-ethereum"]);
    }
  });

  it("rejects a finding that cites an evidence id outside the retrieved dataset", () => {
    const evidence = buildAaveInvestigationEvidence(sampleAaveActivity);
    const output: AiInvestigationOutput = {
      summary: "The wallet interacted with a counterparty.",
      findings: [
        {
          statement: "The wallet sent funds to an unrelated address.",
          evidenceIds: ["0xdeadbeef:99"],
          confidence: "medium",
        },
      ],
    };

    const result = buildInvestigationReport({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      evidence,
      output,
      model: "claude-opus-5",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain("0xdeadbeef:99");
    }
  });

  it("rejects the whole report if only one finding among several is invalid", () => {
    const evidence = buildAaveInvestigationEvidence(sampleAaveActivity);
    const output: AiInvestigationOutput = {
      summary: "Mixed findings.",
      findings: [
        { statement: "Valid finding.", evidenceIds: [evidence[0].evidenceId], confidence: "high" },
        { statement: "Fabricated finding.", evidenceIds: ["not-real-evidence"], confidence: "low" },
      ],
    };

    const result = buildInvestigationReport({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      evidence,
      output,
      model: "claude-opus-5",
    });

    expect(result.success).toBe(false);
  });

  it("builds a report with zero findings when the AI found nothing supportable", () => {
    const evidence = buildAaveInvestigationEvidence(sampleAaveActivity);
    const output: AiInvestigationOutput = {
      summary: "The evidence does not support an answer to this question.",
      findings: [],
    };

    const result = buildInvestigationReport({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      evidence,
      output,
      model: "claude-opus-5",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.report.findings).toHaveLength(0);
    }
  });
});
