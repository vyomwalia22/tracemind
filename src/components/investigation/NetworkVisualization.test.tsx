// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NetworkVisualization } from "@/components/investigation/NetworkVisualization";

afterEach(cleanup);

describe("NetworkVisualization", () => {
  it("renders an illustrative diagram, clearly labeled as such", () => {
    render(<NetworkVisualization />);

    expect(screen.getByRole("img")).toBeTruthy();
    expect(screen.getByText("Illustrative — live investigation begins below")).toBeTruthy();
    expect(screen.getByText("Wallet")).toBeTruthy();
  });
});
