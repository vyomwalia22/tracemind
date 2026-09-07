import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  sampleAaveActivity,
  sampleEvidenceWindow,
  sampleWalletAddress,
} from "@/lib/investigation/__fixtures__/aave-activity";
import { computeAaveActivityAggregates } from "@/lib/investigation/aggregates";
import { buildAaveInvestigationEvidence } from "@/lib/investigation/evidence";
import { InvestigationProviderError } from "@/lib/investigation/errors";
import { buildUserPrompt, createClaudeInvestigationProvider } from "@/lib/investigation/providers/claude-provider";
import type { InvestigationQuestion } from "@/types/investigation";

const QUESTION = "What did this wallet do?" as InvestigationQuestion;

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
}

describe("createClaudeInvestigationProvider", () => {
  beforeEach(() => {
    resetEnv();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("throws a configuration_error when no credential is present", () => {
    expect(() => createClaudeInvestigationProvider()).toThrow(InvestigationProviderError);

    try {
      createClaudeInvestigationProvider();
      expect.unreachable("expected createClaudeInvestigationProvider to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(InvestigationProviderError);
      expect((error as InvestigationProviderError).code).toBe("configuration_error");
    }
  });

  it("throws a configuration_error when the credential is only whitespace", () => {
    process.env.ANTHROPIC_API_KEY = "   ";

    expect(() => createClaudeInvestigationProvider()).toThrow(InvestigationProviderError);
  });

  it("does not throw when ANTHROPIC_API_KEY is present", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";

    expect(() => createClaudeInvestigationProvider()).not.toThrow();
  });

  it("does not throw when only ANTHROPIC_AUTH_TOKEN (Claude Pro/Code OAuth) is present", () => {
    process.env.ANTHROPIC_AUTH_TOKEN = "oauth-test-token";

    expect(() => createClaudeInvestigationProvider()).not.toThrow();
  });
});

describe("buildUserPrompt", () => {
  it("includes a labeled, structured computed aggregates section ahead of the per-transaction evidence", () => {
    const evidence = buildAaveInvestigationEvidence(sampleAaveActivity);
    const computedAggregates = computeAaveActivityAggregates(sampleAaveActivity);

    const prompt = buildUserPrompt({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      evidence,
      computedAggregates,
      evidenceWindow: sampleEvidenceWindow,
    });

    expect(prompt).toContain("Computed aggregates (deterministic server-side calculations");
    expect(prompt).toContain(JSON.stringify(computedAggregates, null, 2));
    expect(prompt).toContain('"USDC"');
    expect(prompt).toContain('"totalSupply"');
    expect(prompt.indexOf("Computed aggregates")).toBeLessThan(prompt.indexOf("Evidence (JSON array"));
  });

  it("includes a labeled, structured evidence window section ahead of computed aggregates and evidence", () => {
    const evidence = buildAaveInvestigationEvidence(sampleAaveActivity);
    const computedAggregates = computeAaveActivityAggregates(sampleAaveActivity);

    const prompt = buildUserPrompt({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      evidence,
      computedAggregates,
      evidenceWindow: sampleEvidenceWindow,
    });

    expect(prompt).toContain("Evidence window (retrieval completeness");
    expect(prompt).toContain(JSON.stringify(sampleEvidenceWindow, null, 2));
    expect(prompt.indexOf("Evidence window")).toBeLessThan(prompt.indexOf("Computed aggregates"));
  });

  it("discloses truncation explicitly when the evidence window is incomplete", () => {
    const truncatedWindow = { ...sampleEvidenceWindow, complete: false, truncated: true };

    const prompt = buildUserPrompt({
      walletAddress: sampleWalletAddress,
      question: QUESTION,
      evidence: buildAaveInvestigationEvidence(sampleAaveActivity),
      computedAggregates: computeAaveActivityAggregates(sampleAaveActivity),
      evidenceWindow: truncatedWindow,
    });

    expect(prompt).toContain('"truncated": true');
    expect(prompt).toContain('"complete": false');
  });
});
