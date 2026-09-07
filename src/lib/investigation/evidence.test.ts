import { describe, expect, it } from "vitest";

import { sampleAaveActivity, sampleLiquidationActivity, sampleSupplyActivity } from "@/lib/investigation/__fixtures__/aave-activity";
import { buildAaveInvestigationEvidence } from "@/lib/investigation/evidence";

describe("buildAaveInvestigationEvidence", () => {
  it("maps each activity record to a bounded evidence item", () => {
    const evidence = buildAaveInvestigationEvidence(sampleAaveActivity);

    expect(evidence).toHaveLength(2);
    expect(evidence[0]).toMatchObject({
      evidenceId: sampleSupplyActivity.id,
      protocol: "aave-v3-ethereum",
      transactionHash: sampleSupplyActivity.transactionHash,
      action: "Supply",
    });
    expect(evidence[0].detail).toBe("Supply: 120.5 (raw base units: 120500000, decimals: 6) USDC.");
  });

  it("describes liquidation activity with both legs of the trade, each with raw and normalized amounts", () => {
    const evidence = buildAaveInvestigationEvidence([sampleLiquidationActivity]);

    expect(evidence[0].evidenceId).toBe(sampleLiquidationActivity.id);
    expect(evidence[0].detail).toBe(
      "Liquidation: collateral seized 0.02 (raw base units: 20000000000000000, decimals: 18) WETH, " +
        "principal repaid 50 (raw base units: 50000000, decimals: 6) USDC.",
    );
  });

  it("never lets amount normalization drop or rename the evidence id used for evidence-binding", () => {
    const evidence = buildAaveInvestigationEvidence([sampleSupplyActivity, sampleLiquidationActivity]);

    expect(evidence.map((item) => item.evidenceId)).toEqual([sampleSupplyActivity.id, sampleLiquidationActivity.id]);
  });

  it("returns an empty list for no activity", () => {
    expect(buildAaveInvestigationEvidence([])).toEqual([]);
  });
});
