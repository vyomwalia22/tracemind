// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Nav } from "@/components/investigation/Nav";

afterEach(cleanup);

describe("Nav", () => {
  it("renders the wordmark and primary navigation links", () => {
    render(<Nav />);

    expect(screen.getByText("TRACE MIND")).toBeTruthy();
    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    expect(primaryNav).toBeTruthy();
    expect(screen.getAllByText("Investigate").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Methodology").length).toBeGreaterThan(0);
  });
});
