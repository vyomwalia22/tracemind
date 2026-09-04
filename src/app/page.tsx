"use client";

import { useState } from "react";

import {
  isValidEvmWalletAddress,
  isValidInvestigationQuestion,
} from "@/utils/investigation-validation";
import type { AaveProtocolActivity } from "@/lib/graph/aave-types";
import type { InvestigationRetrievalResponse } from "@/types/investigation-response";

const examplePrompts = [
  "Investigate this wallet and tell me if anything unusual happened recently.",
  "Which addresses has this wallet interacted with most often?",
  "Look for sudden changes in this wallet's activity or assets.",
];

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [question, setQuestion] = useState("");
  const [requestState, setRequestState] = useState<"idle" | "validating" | "invalid" | "unavailable" | "retrieved">("idle");
  const [retrieval, setRetrieval] = useState<InvestigationRetrievalResponse | null>(null);
  const isReady = isValidEvmWalletAddress(`0x${wallet.trim()}`) && isValidInvestigationQuestion(question);

  async function submitInvestigation() {
    setRequestState("validating");

    try {
      const response = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: `0x${wallet.trim()}`,
          question: question.trim(),
        }),
      });

      const payload: unknown = await response.json();

      if (response.ok && isRetrievalResponse(payload)) {
        setRetrieval(payload);
        setRequestState("retrieved");
      } else {
        setRetrieval(null);
        setRequestState(response.status === 400 ? "invalid" : "unavailable");
      }
    } catch {
      setRetrieval(null);
      setRequestState("unavailable");
    }
  }

  function updateWallet(value: string) {
    setWallet(value.replace(/^0x/i, ""));
    setRetrieval(null);
    setRequestState("idle");
  }

  function updateQuestion(value: string) {
    setQuestion(value);
    setRetrieval(null);
    setRequestState("idle");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
      <header className="flex items-center justify-between border-b border-ink/10 pb-5 sm:pb-6">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center bg-coral text-sm font-bold text-ink" aria-hidden="true">T</span>
          <span className="text-sm font-semibold tracking-[0.18em] text-ink">TRACEMIND</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45 sm:text-xs">Investigation / 02</span>
      </header>

      <section className="grid flex-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:py-20">
        <div className="animate-rise max-w-xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-coral sm:text-xs">Onchain intelligence, grounded</p>
          <h1 className="max-w-xl text-[clamp(3.25rem,8vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-ink">
            Ask about a wallet.<br />
            <span className="text-coral">Trace the evidence.</span>
          </h1>
          <p className="mt-7 max-w-md text-[15px] leading-7 text-ink/60 sm:mt-8 sm:text-base">
            Turn onchain activity into clear, evidence-backed answers. Give TraceMind a wallet and a question to investigate.
          </p>
          <div className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink/45 sm:mt-12">
            <span className="size-2 rounded-full bg-coral" aria-hidden="true" />
            <span>Evidence layer in development</span>
          </div>
        </div>

        <form className="animate-rise-delayed border border-ink/15 bg-white/75 p-5 shadow-[6px_6px_0_var(--color-coral)] sm:p-8 lg:max-w-2xl lg:justify-self-end" onSubmit={(event) => { event.preventDefault(); void submitInvestigation(); }}>
          <div className="mb-7 flex items-start justify-between gap-4 sm:mb-8">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-coral">New inquiry</p>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">Begin an investigation</h2>
            </div>
            <span className="flex shrink-0 items-center gap-2 border border-ink/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/45">
              <span className={`size-1.5 rounded-full ${isReady ? "bg-coral" : "bg-ink/25"}`} aria-hidden="true" />
              {isReady ? "Ready" : "Standby"}
            </span>
          </div>

          <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50" htmlFor="wallet">Wallet address</label>
          <div className="relative mb-6">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-coral" aria-hidden="true">0x</span>
            <input id="wallet" name="wallet" type="text" value={wallet} onChange={(event) => updateWallet(event.target.value)} placeholder="a3f8...91c2" autoComplete="off" spellCheck="false" aria-describedby="wallet-help" className="h-12 w-full border border-ink/15 bg-transparent py-3 pl-10 pr-4 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink/30 hover:border-ink/35 focus:border-coral focus:ring-2 focus:ring-coral/20" />
          </div>
          <p id="wallet-help" className="-mt-4 mb-6 font-mono text-[10px] leading-5 text-ink/40">Paste a public EVM wallet address beginning with 0x.</p>

          <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50" htmlFor="question">Investigation question</label>
          <textarea
            id="question"
            name="question"
            value={question}
            onChange={(event) => updateQuestion(event.target.value)}
            placeholder="What should we look for?"
            aria-describedby="question-help"
            rows={4}
            className="w-full resize-none border border-ink/15 bg-transparent p-4 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink/30 hover:border-ink/35 focus:border-coral focus:ring-2 focus:ring-coral/20"
          />
          <p id="question-help" className="mt-2 font-mono text-[10px] leading-5 text-ink/40">Ask about patterns, counterparties, timing, or anything that needs a closer look.</p>

          <div className="mt-6 border-t border-ink/10 pt-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => updateQuestion(prompt)} className="border border-ink/15 px-3 py-2 text-left text-xs leading-4 text-ink/65 transition-colors hover:border-coral hover:bg-coral/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2">
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {requestState === "invalid" && <p role="alert" className="mt-5 border-l-2 border-coral bg-coral/10 px-3 py-2 text-xs leading-5 text-ink">Check the wallet address and question, then try again.</p>}
          {requestState === "unavailable" && <p role="status" className="mt-5 border-l-2 border-ink/30 bg-ink/5 px-3 py-2 text-xs leading-5 text-ink">Request validated. The investigation pipeline is not connected yet.</p>}
          {requestState === "retrieved" && retrieval && <RetrievalSummary retrieval={retrieval} />}

          <button type="submit" disabled={!isReady || requestState === "validating"} aria-disabled={!isReady || requestState === "validating"} className="mt-6 flex h-12 w-full items-center justify-center gap-3 bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:bg-coral hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40 disabled:hover:bg-ink/15 disabled:hover:text-ink/40">
            {requestState === "validating" ? "Validating request..." : isReady ? "Send investigation request" : "Enter a wallet and question"}
            <span aria-hidden="true">-&gt;</span>
          </button>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink/35">Data retrieval only. AI investigation is not enabled.</p>
        </form>
      </section>

      <footer className="flex flex-col gap-2 border-t border-ink/10 pt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/40 sm:flex-row sm:items-center sm:justify-between">
        <span>Live evidence layer in progress</span>
        <span>TraceMind / 2026</span>
      </footer>
    </main>
  );
}

function RetrievalSummary({ retrieval }: { retrieval: InvestigationRetrievalResponse }) {
  return (
    <section className="mt-5 border border-coral/35 bg-coral/5 p-4" aria-live="polite" aria-label="Investigation data retrieved">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-coral">Investigation data retrieved</p>
          <p className="mt-1 text-sm font-semibold text-ink">{retrieval.recordCount} Aave activity record{retrieval.recordCount === 1 ? "" : "s"}</p>
        </div>
        <span className="border border-coral/30 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink/55">The Graph / Aave</span>
      </div>

      {retrieval.recordCount === 0 ? (
        <p className="mt-4 text-xs leading-5 text-ink/65">No Aave activity was found for the tested wallet. No investigation conclusion has been generated.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {retrieval.aaveActivity.map((activity) => <ActivityRecord key={activity.id} activity={activity} />)}
        </div>
      )}
    </section>
  );
}

function ActivityRecord({ activity }: { activity: AaveProtocolActivity }) {
  return (
    <article className="border-t border-ink/10 pt-3 text-xs text-ink/70">
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <span className="font-semibold text-ink">{activity.action}</span>
        <span className="font-mono text-[10px] text-ink/45">{new Date(activity.timestamp * 1000).toLocaleString()}</span>
      </div>
      <p className="mt-1 break-all font-mono text-[10px] text-ink/50">{activity.transactionHash}</p>
      {activity.activityType === "liquidation" ? (
        <p className="mt-2 leading-5">Collateral: {activity.collateralAmount} {activity.collateralReserveSymbol} · Principal: {activity.principalAmount} {activity.principalReserveSymbol}</p>
      ) : (
        <p className="mt-2 leading-5">{activity.amount ?? "Amount unavailable"}{activity.reserveSymbol ? ` ${activity.reserveSymbol}` : ""}</p>
      )}
    </article>
  );
}

function isRetrievalResponse(value: unknown): value is InvestigationRetrievalResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;
  return response.success === true && response.status === "data_retrieved" && Array.isArray(response.aaveActivity) && typeof response.recordCount === "number";
}
