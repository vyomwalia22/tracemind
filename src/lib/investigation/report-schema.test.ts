import { describe, expect, it } from "vitest";

import { aiInvestigationOutputSchema } from "@/lib/investigation/report-schema";

describe("aiInvestigationOutputSchema", () => {
  it("accepts a well-formed report", () => {
    const result = aiInvestigationOutputSchema.safeParse({
      summary: "The wallet supplied USDC and was later liquidated.",
      findings: [
        {
          statement: "The wallet supplied 120.5 USDC.",
          evidenceIds: ["0xaaa1:0"],
          confidence: "high",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts a report with no findings", () => {
    const result = aiInvestigationOutputSchema.safeParse({
      summary: "No activity supports an answer to this question.",
      findings: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing summary", () => {
    const result = aiInvestigationOutputSchema.safeParse({
      findings: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty summary", () => {
    const result = aiInvestigationOutputSchema.safeParse({
      summary: "",
      findings: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a finding with no evidence ids", () => {
    const result = aiInvestigationOutputSchema.safeParse({
      summary: "Something happened.",
      findings: [{ statement: "Unsupported claim.", evidenceIds: [], confidence: "low" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a finding with an invalid confidence value", () => {
    const result = aiInvestigationOutputSchema.safeParse({
      summary: "Something happened.",
      findings: [{ statement: "Claim.", evidenceIds: ["0xaaa1:0"], confidence: "certain" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a finding missing a statement", () => {
    const result = aiInvestigationOutputSchema.safeParse({
      summary: "Something happened.",
      findings: [{ evidenceIds: ["0xaaa1:0"], confidence: "low" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects entirely malformed output", () => {
    const result = aiInvestigationOutputSchema.safeParse("not a report");

    expect(result.success).toBe(false);
  });

  it("rejects null", () => {
    const result = aiInvestigationOutputSchema.safeParse(null);

    expect(result.success).toBe(false);
  });
});
