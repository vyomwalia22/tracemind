import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { InvestigationProviderError } from "@/lib/investigation/errors";
import { aiInvestigationOutputSchema } from "@/lib/investigation/report-schema";
import type {
  InvestigationProvider,
  InvestigationProviderRequest,
  InvestigationProviderResult,
} from "@/lib/investigation/provider";

const CLAUDE_INVESTIGATION_MODEL = "claude-opus-5";
const MAX_OUTPUT_TOKENS = 16000;

const SYSTEM_PROMPT = `You are a blockchain forensics analyst investigating Aave V3 Ethereum protocol activity for a single wallet.

Rules you must follow:
- Only use the evidence items provided in the user message. Never invent transactions, amounts, counterparties, reserves, or dates.
- Every finding's "evidenceIds" must be exact "evidenceId" values copied verbatim from the provided evidence list. Never fabricate an evidence id.
- Every finding must cite at least one evidence id that supports it.
- Every evidence amount is already normalized to its human-readable decimal value using the reserve's exact on-chain decimals. Use the normalized amount as given - never re-derive, rescale, or guess token decimals yourself.
- The "Computed aggregates" JSON block contains deterministic, code-computed totals (per-asset supply/borrow/repay/liquidation sums, net borrow exposure, and event counts). Treat every value in it as verified ground truth arithmetic: never recompute, re-derive, or "double check" a total yourself, and never invent an aggregate figure that is not present in that block.
- Use the per-transaction evidence list for qualitative reasoning (patterns, timing, counterparties) and to cite individual transaction evidenceIds; use the computed aggregates for any numeric totals, sums, or exposure figures instead of computing them yourself from the evidence list.
- The "Evidence window" JSON block states whether the retrieved evidence is complete. "complete": true means every matching on-chain record within the defined retrieval scope was retrieved. "truncated": true means a safety limit was reached and more matching activity may exist beyond what was retrieved. When truncated is true, you must explicitly disclose this limitation in your summary and must never imply the retrieved evidence represents the wallet's complete history.
- Never invent activity, transactions, or amounts outside the retrieved evidence, regardless of what the evidence window says about completeness.
- If the evidence does not support an answer to the question, say so plainly in the summary and return fewer findings (or none) rather than guessing.
- Do not speculate about off-chain identity, intent, or wrongdoing beyond what the evidence shows.`;

/**
 * Reads credentials the way the installed Anthropic SDK does: an explicit
 * API key (recommended), or a bearer token explicitly issued for this
 * application via ANTHROPIC_AUTH_TOKEN. Neither is read here beyond an
 * existence check - `new Anthropic()` performs the actual resolution, so no
 * secret is duplicated in this module.
 *
 * ANTHROPIC_AUTH_TOKEN is sent as a plain `Authorization: Bearer` header by
 * this SDK version - it is not a bridge to an interactive Claude Pro/Max or
 * Claude Code login. Those sessions store their credentials elsewhere and
 * are never read by this module or the Anthropic SDK's default resolution;
 * only a credential explicitly placed in this application's own environment
 * (ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN) will work here.
 */
export function createClaudeInvestigationProvider(): InvestigationProvider {
  const hasApiKey = (process.env.ANTHROPIC_API_KEY?.trim().length ?? 0) > 0;
  const hasAuthToken = (process.env.ANTHROPIC_AUTH_TOKEN?.trim().length ?? 0) > 0;

  if (!hasApiKey && !hasAuthToken) {
    throw new InvestigationProviderError(
      "configuration_error",
      "The AI investigation provider is not configured. Set ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN.",
    );
  }

  const client = new Anthropic();

  return {
    async generateInvestigationOutput(
      request: InvestigationProviderRequest,
    ): Promise<InvestigationProviderResult> {
      try {
        const message = await client.messages.parse({
          model: CLAUDE_INVESTIGATION_MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: SYSTEM_PROMPT,
          output_config: {
            effort: "high",
            format: zodOutputFormat(aiInvestigationOutputSchema),
          },
          messages: [{ role: "user", content: buildUserPrompt(request) }],
        });

        if (message.parsed_output === null) {
          throw new InvestigationProviderError(
            "invalid_output",
            "The AI response did not match the required report schema.",
          );
        }

        return { output: message.parsed_output, model: message.model };
      } catch (cause) {
        throw toProviderError(cause);
      }
    },
  };
}

export function buildUserPrompt(request: InvestigationProviderRequest): string {
  return [
    `Wallet address: ${request.walletAddress}`,
    `Investigation question: ${request.question}`,
    "Evidence window (retrieval completeness; disclose truncation, never imply this is the wallet's complete history):",
    JSON.stringify(request.evidenceWindow, null, 2),
    "Computed aggregates (deterministic server-side calculations; ground truth for arithmetic, do not recompute or invent additional figures):",
    JSON.stringify(request.computedAggregates, null, 2),
    "Evidence (JSON array; evidenceId values must be copied verbatim):",
    JSON.stringify(request.evidence, null, 2),
  ].join("\n\n");
}

function toProviderError(cause: unknown): InvestigationProviderError {
  if (cause instanceof InvestigationProviderError) {
    return cause;
  }

  if (cause instanceof Anthropic.AuthenticationError) {
    return new InvestigationProviderError(
      "configuration_error",
      "The AI provider rejected the configured credentials.",
      { cause },
    );
  }

  if (cause instanceof Anthropic.RateLimitError) {
    return new InvestigationProviderError(
      "rate_limited",
      "The AI provider is rate limiting requests. Try again shortly.",
      { cause },
    );
  }

  if (cause instanceof Anthropic.APIConnectionError) {
    return new InvestigationProviderError("network_error", "The request to the AI provider failed.", { cause });
  }

  if (cause instanceof Anthropic.APIError) {
    return new InvestigationProviderError(
      "provider_error",
      `The AI provider returned an error: ${cause.message}`,
      { cause },
    );
  }

  if (cause instanceof Anthropic.AnthropicError) {
    return new InvestigationProviderError("invalid_output", cause.message, { cause });
  }

  return new InvestigationProviderError(
    "provider_error",
    "The AI investigation request failed unexpectedly.",
    { cause },
  );
}
