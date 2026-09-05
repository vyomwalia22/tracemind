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
    expect(evidence[0].detail).toContain("120.5");
    expect(evidence[0].detail).toContain("USDC");
  });

  it("describes liquidation activity with both legs of the trade", () => {
    const evidence = buildAaveInvestigationEvidence([sampleLiquidationActivity]);

    expect(evidence[0].evidenceId).toBe(sampleLiquidationActivity.id);
    expect(evidence[0].detail).toContain("0.02");
    expect(evidence[0].detail).toContain("WETH");
    expect(evidence[0].detail).toContain("50");
    expect(evidence[0].detail).toContain("USDC");
  });

  it("returns an empty list for no activity", () => {
    expect(buildAaveInvestigationEvidence([])).toEqual([]);
  });
});
