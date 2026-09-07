// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatElapsed, InvestigationLoading } from "@/components/investigation/InvestigationLoading";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("formatElapsed", () => {
  it("formats sub-minute durations as seconds only", () => {
    expect(formatElapsed(0)).toBe("0s");
    expect(formatElapsed(42)).toBe("42s");
  });

  it("formats durations over a minute as minutes and seconds", () => {
    expect(formatElapsed(90)).toBe("1m 30s");
  });
});

describe("InvestigationLoading", () => {
  it("shows the wallet and question context immediately, and does not look frozen as time passes", () => {
    render(<InvestigationLoading walletAddress="0x1111111111111111111111111111111111111111" question="What happened?" />);

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText("0x1111111111111111111111111111111111111111")).toBeTruthy();
    expect(screen.getByText("What happened?", { exact: false })).toBeTruthy();
    expect(screen.getByText(/elapsed/)).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(screen.getByText(/^5s/)).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText(/^1m 5s/)).toBeTruthy();
  });

  it("never claims a stage is complete - it only highlights a current focus among neutral steps", () => {
    render(<InvestigationLoading walletAddress="0x1111111111111111111111111111111111111111" question="What happened?" />);

    // All five pipeline stages are always shown; none are marked done/checked.
    expect(screen.getByText("Retrieving chain data")).toBeTruthy();
    expect(screen.getByText("Normalizing activity")).toBeTruthy();
    expect(screen.getByText("Computing exposure")).toBeTruthy();
    expect(screen.getByText("Reasoning over evidence")).toBeTruthy();
    expect(screen.getByText("Building report")).toBeTruthy();
    expect(screen.queryByText(/done|complete/i)).toBeNull();

    const firstRender = screen.getByRole("status").textContent;

    act(() => {
      vi.advanceTimersByTime(45_000);
    });

    const laterRender = screen.getByRole("status").textContent;
    expect(laterRender).not.toBe(firstRender);
  });
});
