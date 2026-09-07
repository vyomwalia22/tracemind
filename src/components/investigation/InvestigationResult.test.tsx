// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InvestigationResult } from "@/components/investigation/InvestigationResult";
import type { AaveEvidenceWindow, AaveProtocolActivity } from "@/lib/graph/aave-types";
import type { InvestigationOutcome } from "@/types/investigation-report";
import type { InvestigationRetrievalResponse } from "@/types/investigation-response";
import type { InvestigationQuestion, WalletAddress } from "@/types/investigation";

afterEach(cleanup);

const WALLET_ADDRESS = "0x1111111111111111111111111111111111111111" as WalletAddress;
const QUESTION = "What did this wallet do?" as InvestigationQuestion;
const noop = () => {};

const supplyActivity: AaveProtocolActivity = {
  protocol: "aave-v3-ethereum",
  id: "evid-supply-1",
  timestamp: 1_700_000_000,
  transactionHash: "0xsupplytx",
  action: "Supply",
  walletAddress: WALLET_ADDRESS,
  activityType: "standard",
  amount: "120500000",
  amountNormalized: "120.5",
  reserveSymbol: "USDC",
  reserveDecimals: 6,
};

const borrowActivity: AaveProtocolActivity = {
  protocol: "aave-v3-ethereum",
  id: "evid-borrow-1",
  timestamp: 1_700_050_000,
  transactionHash: "0xborrowtx",
  action: "Borrow",
  walletAddress: WALLET_ADDRESS,
  activityType: "standard",
  amount: "2000000000000000000",
  amountNormalized: "2",
  reserveSymbol: "WETH",
  reserveDecimals: 18,
};

const completeWindow: AaveEvidenceWindow = {
  complete: true,
  recordCount: 2,
  oldestTimestamp: 1_700_000_000,
  newestTimestamp: 1_700_050_000,
  truncated: false,
};

function baseRetrieval(overrides: Partial<InvestigationRetrievalResponse> = {}): InvestigationRetrievalResponse {
  return {
    success: true,
    status: "data_retrieved",
    walletAddress: WALLET_ADDRESS,
    question: QUESTION,
    dataSources: ["aave-v3-ethereum"],
    aaveActivity: [supplyActivity, borrowActivity],
    recordCount: 2,
    evidenceWindow: completeWindow,
    investigation: { status: "insufficient_evidence" },
    ...overrides,
  };
}

describe("InvestigationResult", () => {
  it("renders a completed investigation: summary, findings, confidence, evidence citations, aggregates, and evidence records", () => {
    const investigation: InvestigationOutcome = {
      status: "completed",
      report: {
        walletAddress: WALLET_ADDRESS,
        question: QUESTION,
        summary: "The wallet supplied USDC and borrowed WETH.",
        findings: [
          {
            statement: "The wallet supplied 120.5 USDC.",
            evidenceIds: [supplyActivity.id] as never,
            confidence: "high",
          },
          {
            statement: "The wallet borrowed 2 WETH.",
            evidenceIds: [borrowActivity.id] as never,
            confidence: "medium",
          },
        ],
        dataSources: ["aave-v3-ethereum"],
        evidenceCount: 2,
        model: "claude-opus-5",
        generatedAt: "2026-09-06T17:59:53.896Z",
      },
    };

    render(<InvestigationResult retrieval={baseRetrieval({ investigation })} onRetry={noop} onReturnToDesk={noop} />);

    // Wallet + question context stay visible (wallet is truncated for display, full value in the title attribute).
    expect(screen.getByTitle(WALLET_ADDRESS)).toBeTruthy();
    expect(screen.getByText(QUESTION, { exact: false })).toBeTruthy();

    // Status + summary.
    expect(screen.getByText(/Completed/)).toBeTruthy();
    expect(screen.getByText(investigation.status === "completed" ? investigation.report.summary : "")).toBeTruthy();

    // Findings with confidence and evidence citations (E-00N display labels, not raw evidence ids).
    expect(screen.getByText("The wallet supplied 120.5 USDC.")).toBeTruthy();
    expect(screen.getByText("high confidence")).toBeTruthy();
    expect(screen.getByText("medium confidence")).toBeTruthy();
    // E-001/E-002 each appear twice: once as a finding's evidence reference, once as the ledger row id - the same label is used consistently in both places.
    expect(screen.getAllByText("E-001").length).toBe(2);
    expect(screen.getAllByText("E-002").length).toBe(2);

    // Deterministic aggregates section is present and distinct from AI findings.
    expect(screen.getByText("Computed from the chain")).toBeTruthy();
    expect(screen.getByText(/Findings \/ 02/)).toBeTruthy();
    expect(screen.getByText("Evidence / Receipts")).toBeTruthy();

    // Raw evidence records rendered (transaction hash truncated on-screen, full value in the title attribute).
    expect(screen.getByTitle("0xsupplytx")).toBeTruthy();
    expect(screen.getByTitle("0xborrowtx")).toBeTruthy();
  });

  it("visibly connects each finding to its evidence via a matching in-page anchor, and reveals the citing finding on expand", () => {
    const investigation: InvestigationOutcome = {
      status: "completed",
      report: {
        walletAddress: WALLET_ADDRESS,
        question: QUESTION,
        summary: "Summary.",
        findings: [
          { statement: "The wallet supplied USDC.", evidenceIds: [supplyActivity.id] as never, confidence: "high" },
        ],
        dataSources: ["aave-v3-ethereum"],
        evidenceCount: 2,
        model: "claude-opus-5",
        generatedAt: "2026-09-06T17:59:53.896Z",
      },
    };

    const { container } = render(
      <InvestigationResult retrieval={baseRetrieval({ investigation })} onRetry={noop} onReturnToDesk={noop} />,
    );

    const citationLink = screen.getByRole("link", { name: "E-001" });
    const href = citationLink.getAttribute("href");
    expect(href).toBe(`#evidence-${supplyActivity.id}`);

    const targetId = href!.slice(1);
    const targetElement = container.querySelector(`[id="${targetId}"]`);
    expect(targetElement).not.toBeNull();
    expect(within(targetElement as HTMLElement).getByTitle("0xsupplytx")).toBeTruthy();

    // Expanding the evidence row reveals which finding cites it.
    fireEvent.click(targetElement as HTMLElement);
    expect(within(targetElement as HTMLElement).getByText(/Finding 01/)).toBeTruthy();
  });

  it("never renders a finding without its supporting evidence references", () => {
    const investigation: InvestigationOutcome = {
      status: "completed",
      report: {
        walletAddress: WALLET_ADDRESS,
        question: QUESTION,
        summary: "Summary.",
        findings: [{ statement: "Cited finding.", evidenceIds: [supplyActivity.id] as never, confidence: "low" }],
        dataSources: ["aave-v3-ethereum"],
        evidenceCount: 2,
        model: "claude-opus-5",
        generatedAt: "2026-09-06T17:59:53.896Z",
      },
    };

    render(<InvestigationResult retrieval={baseRetrieval({ investigation })} onRetry={noop} onReturnToDesk={noop} />);

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^#evidence-/);
    }
  });

  it("renders a clear insufficient_evidence state without any findings or fake success", () => {
    render(
      <InvestigationResult
        retrieval={baseRetrieval({ investigation: { status: "insufficient_evidence" } })}
        onRetry={noop}
        onReturnToDesk={noop}
      />,
    );

    expect(screen.getAllByText(/Insufficient evidence/).length).toBeGreaterThan(0);
    expect(screen.getByText(/could not establish a sufficiently supported conclusion/)).toBeTruthy();
    expect(screen.queryByText(/Findings \//)).toBeNull();
    expect(screen.queryByText("Computed from the chain")).toBeNull();
    expect(screen.getByRole("button", { name: /Return to desk/ })).toBeTruthy();
  });

  it("renders a clear failed state with the error message and retry/return actions, never a fake success", () => {
    const investigation: InvestigationOutcome = {
      status: "failed",
      error: { code: "rate_limited", message: "The AI provider is rate limiting requests." },
    };
    const onRetry = vi.fn();
    const onReturnToDesk = vi.fn();

    render(<InvestigationResult retrieval={baseRetrieval({ investigation })} onRetry={onRetry} onReturnToDesk={onReturnToDesk} />);

    expect(screen.getAllByText(/Failed/).length).toBeGreaterThan(0);
    expect(screen.getByText(/The AI provider is rate limiting requests\./)).toBeTruthy();
    expect(screen.queryByText(/Findings \//)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Retry investigation/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Return to desk/ }));
    expect(onReturnToDesk).toHaveBeenCalledTimes(1);
  });

  it("shows a visible warning banner when the evidence window is truncated", () => {
    const truncatedWindow: AaveEvidenceWindow = { ...completeWindow, complete: false, truncated: true };

    render(
      <InvestigationResult
        retrieval={baseRetrieval({ evidenceWindow: truncatedWindow, investigation: { status: "insufficient_evidence" } })}
        onRetry={noop}
        onReturnToDesk={noop}
      />,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Evidence window · Truncated/)).toBeTruthy();
    expect(screen.getAllByText(/Truncated/).length).toBeGreaterThan(0);
  });

  it("does not show a truncation warning when the evidence window is complete", () => {
    render(
      <InvestigationResult
        retrieval={baseRetrieval({ investigation: { status: "insufficient_evidence" } })}
        onRetry={noop}
        onReturnToDesk={noop}
      />,
    );

    expect(screen.queryByText(/Evidence window · Truncated/)).toBeNull();
    expect(screen.getByText(/COMPLETE/)).toBeTruthy();
  });
});
