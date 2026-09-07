import { describe, expect, it } from "vitest";

import { normalizeBaseUnitAmount, normalizeSignedBaseUnitAmount } from "@/lib/graph/decimal";

describe("normalizeBaseUnitAmount", () => {
  it("normalizes a 6-decimal USDT amount", () => {
    expect(normalizeBaseUnitAmount("81045258", 6)).toBe("81.045258");
  });

  it("normalizes an 18-decimal WETH amount", () => {
    expect(normalizeBaseUnitAmount("1000300000000000000", 18)).toBe("1.0003");
  });

  it("strips trailing fractional zeros down to a whole number", () => {
    expect(normalizeBaseUnitAmount("1000000", 6)).toBe("1");
  });

  it("handles zero decimals as a plain integer", () => {
    expect(normalizeBaseUnitAmount("500", 0)).toBe("500");
  });

  it("handles zero amount", () => {
    expect(normalizeBaseUnitAmount("0", 6)).toBe("0");
  });

  it("pads small amounts that are entirely fractional", () => {
    expect(normalizeBaseUnitAmount("100", 8)).toBe("0.000001");
  });

  it("does not lose precision for amounts beyond Number.MAX_SAFE_INTEGER", () => {
    expect(normalizeBaseUnitAmount("123456789012345678901234", 18)).toBe("123456.789012345678901234");
  });
});

describe("normalizeSignedBaseUnitAmount", () => {
  it("normalizes a positive signed amount without a leading sign", () => {
    expect(normalizeSignedBaseUnitAmount(BigInt("1000300000000000000"), 18)).toBe("1.0003");
  });

  it("normalizes a negative signed amount with a leading minus sign", () => {
    expect(normalizeSignedBaseUnitAmount(BigInt("-1000300000000000000"), 18)).toBe("-1.0003");
  });

  it("normalizes zero without a sign", () => {
    expect(normalizeSignedBaseUnitAmount(BigInt(0), 6)).toBe("0");
  });
});
