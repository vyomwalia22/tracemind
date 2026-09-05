import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { InvestigationProviderError } from "@/lib/investigation/errors";
import { createClaudeInvestigationProvider } from "@/lib/investigation/providers/claude-provider";

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
