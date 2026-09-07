import { describe, expect, it } from "vitest";

import {
  evidenceLabel,
  formatCompactAmount,
  formatDataSource,
  splitFindingStatement,
  truncateMiddle,
} from "@/components/investigation/format";

describe("evidenceLabel", () => {
  it("pads a zero-based index into a three-digit display label", () => {
    expect(evidenceLabel(0)).toBe("E-001");
    expect(evidenceLabel(16)).toBe("E-017");
    expect(evidenceLabel(999)).toBe("E-1000");
  });
});

describe("formatDataSource", () => {
  it("relabels the known aave-v3-ethereum slug into a readable form", () => {
    expect(formatDataSource("aave-v3-ethereum")).toBe("Aave V3 / Ethereum");
  });

  it("falls back to the raw slug for anything unrecognized, rather than hiding it", () => {
    expect(formatDataSource("some-future-source")).toBe("some-future-source");
  });
});

describe("formatCompactAmount", () => {
  it("formats millions with two decimal places", () => {
    expect(formatCompactAmount("8201166.245891")).toEqual({ display: "8.20M", exact: "8201166.245891" });
    expect(formatCompactAmount("22044526.147106")).toEqual({ display: "22.04M", exact: "22044526.147106" });
  });

  it("formats sub-thousand values with two decimal places and no suffix", () => {
    expect(formatCompactAmount("79.233071436")).toEqual({ display: "79.23", exact: "79.233071436" });
  });

  it("never modifies the exact underlying value, even while rounding the display", () => {
    const result = formatCompactAmount("8201166.245891123456");
    expect(result.exact).toBe("8201166.245891123456");
  });

  it("preserves the sign for negative values", () => {
    expect(formatCompactAmount("-482000").display).toBe("-482K");
  });

  it("keeps small sub-1 values reasonably precise instead of rounding to 0.00", () => {
    expect(formatCompactAmount("0.00000001").display).toBe("0.00000001");
  });

  it("renders exact zero as 0", () => {
    expect(formatCompactAmount("0").display).toBe("0");
  });
});

describe("truncateMiddle", () => {
  it("truncates long hashes to a head...tail form", () => {
    expect(truncateMiddle("0x098bfa112233445566778899aabbccddeeff00bc8")).toBe("0x098b…0bc8");
  });

  it("leaves short values untouched", () => {
    expect(truncateMiddle("0xshort")).toBe("0xshort");
  });
});

describe("splitFindingStatement", () => {
  it("splits a multi-sentence statement into a title and explanation", () => {
    const result = splitFindingStatement("The wallet repaid debt early. This suggests active risk management.");
    expect(result.title).toBe("The wallet repaid debt early.");
    expect(result.explanation).toBe("This suggests active risk management.");
  });

  it("uses the whole statement as the title when it is a single short sentence", () => {
    const result = splitFindingStatement("The wallet supplied 120.5 USDC.");
    expect(result.title).toBe("The wallet supplied 120.5 USDC.");
    expect(result.explanation).toBeNull();
  });

  it("never drops any content for a long single-sentence statement", () => {
    const long = `The wallet ${"rotated debt between USDT and WETH ".repeat(6)}without ever fully repaying`;
    const result = splitFindingStatement(long);
    expect(result.explanation).toBe(long);
  });
});
