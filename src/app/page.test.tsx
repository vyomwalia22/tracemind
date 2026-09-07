// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Home from "@/app/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const VALID_WALLET_HEX = "1111111111111111111111111111111111111111";
const QUESTION_TEXT = "What did this wallet do?";

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText("Wallet"), { target: { value: VALID_WALLET_HEX } });
  fireEvent.change(screen.getByLabelText("Question"), { target: { value: QUESTION_TEXT } });
  fireEvent.click(screen.getByRole("button", { name: /Begin investigation/ }));
}

describe("Home page investigation flow", () => {
  it("shows a running-investigation loading state immediately after submit, before the response arrives", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    render(<Home />);
    fillAndSubmit();

    expect(await screen.findByRole("status")).toBeTruthy();
    expect(screen.getByText(/Analyzing/)).toBeTruthy();
    expect(screen.getAllByText(QUESTION_TEXT, { exact: false }).length).toBeGreaterThan(0);

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        status: "data_retrieved",
        walletAddress: `0x${VALID_WALLET_HEX}`,
        question: QUESTION_TEXT,
        dataSources: ["aave-v3-ethereum"],
        aaveActivity: [],
        recordCount: 0,
        evidenceWindow: { complete: true, recordCount: 0, oldestTimestamp: null, newestTimestamp: null, truncated: false },
        investigation: { status: "insufficient_evidence" },
      }),
    } as Response);

    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });

  it("renders the investigation result once a successful response arrives", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          status: "data_retrieved",
          walletAddress: `0x${VALID_WALLET_HEX}`,
          question: QUESTION_TEXT,
          dataSources: ["aave-v3-ethereum"],
          aaveActivity: [],
          recordCount: 0,
          evidenceWindow: { complete: true, recordCount: 0, oldestTimestamp: null, newestTimestamp: null, truncated: false },
          investigation: { status: "insufficient_evidence" },
        }),
      }),
    );

    render(<Home />);
    fillAndSubmit();

    expect((await screen.findAllByText(/Insufficient evidence/)).length).toBeGreaterThan(0);
    expect(screen.getByTitle(`0x${VALID_WALLET_HEX}`)).toBeTruthy();
  });

  it("shows a clear inline validation state when the backend rejects the request (400)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: { code: "validation_failed", message: "Investigation request is invalid.", fields: [] },
        }),
      }),
    );

    render(<Home />);
    fillAndSubmit();

    expect(await screen.findByText("Investigation request is invalid.")).toBeTruthy();
  });

  it("shows a clear error state when the request fails outright (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    render(<Home />);
    fillAndSubmit();

    expect((await screen.findAllByText(/Status · Failed/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Could not reach the investigation service/)).toBeTruthy();
  });
});
