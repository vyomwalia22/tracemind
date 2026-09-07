import { describe, expect, it, vi } from "vitest";

import {
  sampleAaveActivity,
  sampleEvidenceWindow,
  sampleLiquidationActivity,
  sampleSupplyActivity,
  sampleWalletAddress,
} from "@/lib/investigation/__fixtures__/aave-activity";
import { runInvestigation } from "@/lib/investigation/engine";
import { InvestigationProviderError } from "@/lib/investigation/errors";
import type { InvestigationProvider, InvestigationProviderResult } from "@/lib/investigation/provider";
import type { InvestigationQuestion } from "@/types/investigation";

const QUESTION = "What did this wallet do?" as InvestigationQuestion;

function providerReturning(result: InvestigationProviderResult): () => InvestigationProvider {
  return () => ({
    generateInvestigationOutput: vi.fn().mockResolvedValue(result),
  });
}

function providerThrowing(error: unknown): () => InvestigationProvider {
  return () => ({
    generateInvestigationOutput: vi.fn().mockRejectedValue(error),
  });
}

describe("runInvestigation", () => {
  it("returns insufficient_evidence and never calls the provider when there is no activity", async () => {
    const createProvider = vi.fn();

    const outcome = await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: [],
      evidenceWindow: { complete: true, recordCount: 0, oldestTimestamp: null, newestTimestamp: null, truncated: false },
      createProvider,
    });

    expect(outcome).toEqual({ status: "insufficient_evidence" });
    expect(createProvider).not.toHaveBeenCalled();
  });

  it("returns a completed report for valid, evidence-backed AI output (successful structured analysis)", async () => {
    const outcome = await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: sampleEvidenceWindow,
      createProvider: providerReturning({
        model: "claude-opus-5",
        output: {
          summary: "The wallet supplied USDC and was later liquidated.",
          findings: [
            {
              statement: "The wallet supplied 120.5 USDC.",
              evidenceIds: ["0xaaa1:0"],
              confidence: "high",
            },
            {
              statement: "The wallet's position was liquidated, seizing WETH collateral.",
              evidenceIds: ["0xaaa2:1"],
              confidence: "high",
            },
          ],
        },
      }),
    });

    expect(outcome.status).toBe("completed");
    if (outcome.status === "completed") {
      expect(outcome.report.findings).toHaveLength(2);
      expect(outcome.report.evidenceCount).toBe(2);
      expect(outcome.report.model).toBe("claude-opus-5");
      expect(outcome.report.walletAddress).toBe(sampleWalletAddress);
    }
  });

  it("passes deterministic computed aggregates, the evidence window, and stable evidence ids to the provider", async () => {
    const generateInvestigationOutput = vi.fn().mockResolvedValue({
      model: "claude-opus-5",
      output: { summary: "The wallet supplied USDC and was later liquidated.", findings: [] },
    });

    await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: sampleEvidenceWindow,
      createProvider: () => ({ generateInvestigationOutput }),
    });

    expect(generateInvestigationOutput).toHaveBeenCalledTimes(1);
    const request = generateInvestigationOutput.mock.calls[0][0];

    expect(request.evidence.map((item: { evidenceId: string }) => item.evidenceId)).toEqual([
      sampleSupplyActivity.id,
      sampleLiquidationActivity.id,
    ]);
    expect(request.computedAggregates.totalEventCount).toBe(sampleAaveActivity.length);
    expect(request.computedAggregates.perAsset.USDC.totalSupply).toEqual({
      raw: "120500000",
      normalized: "120.5",
      eventCount: 1,
    });
    expect(request.computedAggregates.perAsset.WETH.totalLiquidationCollateralSeized).toEqual({
      raw: "20000000000000000",
      normalized: "0.02",
      eventCount: 1,
    });
    expect(request.evidenceWindow).toEqual(sampleEvidenceWindow);
  });

  it("passes a truncated evidence window through unchanged so the provider can disclose incompleteness", async () => {
    const generateInvestigationOutput = vi.fn().mockResolvedValue({
      model: "claude-opus-5",
      output: { summary: "The wallet supplied USDC and was later liquidated.", findings: [] },
    });
    const truncatedWindow = { ...sampleEvidenceWindow, complete: false, truncated: true };

    await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: truncatedWindow,
      createProvider: () => ({ generateInvestigationOutput }),
    });

    const request = generateInvestigationOutput.mock.calls[0][0];
    expect(request.evidenceWindow).toEqual(truncatedWindow);
  });

  it("rejects malformed AI output that fails schema validation", async () => {
    const outcome = await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: sampleEvidenceWindow,
      createProvider: providerReturning({
        model: "claude-opus-5",
        output: { summary: 42, findings: "not an array" },
      }),
    });

    expect(outcome.status).toBe("failed");
    if (outcome.status === "failed") {
      expect(outcome.error.code).toBe("invalid_output");
    }
  });

  it("rejects AI output missing required fields entirely", async () => {
    const outcome = await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: sampleEvidenceWindow,
      createProvider: providerReturning({
        model: "claude-opus-5",
        output: {},
      }),
    });

    expect(outcome.status).toBe("failed");
    if (outcome.status === "failed") {
      expect(outcome.error.code).toBe("invalid_output");
    }
  });

  it("rejects a structurally valid report that cites an evidence id outside the retrieved dataset", async () => {
    const outcome = await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: sampleEvidenceWindow,
      createProvider: providerReturning({
        model: "claude-opus-5",
        output: {
          summary: "The wallet sent funds to a known exploiter.",
          findings: [
            {
              statement: "The wallet sent funds to a known exploiter address.",
              evidenceIds: ["0xfabricated:0"],
              confidence: "high",
            },
          ],
        },
      }),
    });

    expect(outcome.status).toBe("failed");
    if (outcome.status === "failed") {
      expect(outcome.error.code).toBe("invalid_output");
    }
  });

  it("surfaces provider configuration errors explicitly instead of fabricating a report", async () => {
    const outcome = await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: sampleEvidenceWindow,
      createProvider: () => {
        throw new InvestigationProviderError("configuration_error", "The AI investigation provider is not configured.");
      },
    });

    expect(outcome).toEqual({
      status: "failed",
      error: {
        code: "configuration_error",
        message: "The AI investigation provider is not configured.",
      },
    });
  });

  it("surfaces provider call failures (e.g. rate limiting) explicitly", async () => {
    const outcome = await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: sampleEvidenceWindow,
      createProvider: providerThrowing(
        new InvestigationProviderError("rate_limited", "The AI provider is rate limiting requests."),
      ),
    });

    expect(outcome.status).toBe("failed");
    if (outcome.status === "failed") {
      expect(outcome.error.code).toBe("rate_limited");
    }
  });

  it("maps an unexpected thrown value to a generic provider_error", async () => {
    const outcome = await runInvestigation({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      aaveActivity: sampleAaveActivity,
      evidenceWindow: sampleEvidenceWindow,
      createProvider: providerThrowing(new Error("boom")),
    });

    expect(outcome.status).toBe("failed");
    if (outcome.status === "failed") {
      expect(outcome.error.code).toBe("provider_error");
    }
  });
});
