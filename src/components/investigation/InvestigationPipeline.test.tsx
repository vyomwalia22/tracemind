// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InvestigationPipeline } from "@/components/investigation/InvestigationPipeline";

afterEach(cleanup);

describe("InvestigationPipeline", () => {
  it("renders every stage of the truthful pipeline", () => {
    render(<InvestigationPipeline />);

    expect(screen.getByText("Wallet")).toBeTruthy();
    expect(screen.getByText("The Graph")).toBeTruthy();
    expect(screen.getByText("Normalize")).toBeTruthy();
    expect(screen.getByText("Compute")).toBeTruthy();
    expect(screen.getByText("Reason")).toBeTruthy();
    expect(screen.getByText("Trace")).toBeTruthy();
  });
});
