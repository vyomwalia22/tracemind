"use client";

import { useState } from "react";

import { AboutData } from "@/components/investigation/AboutData";
import { CasesNotice } from "@/components/investigation/CasesNotice";
import { DataTape } from "@/components/investigation/DataTape";
import { FinalCta } from "@/components/investigation/FinalCta";
import { IntakeDesk } from "@/components/investigation/IntakeDesk";
import { InvestigationLoading } from "@/components/investigation/InvestigationLoading";
import { InvestigationPipeline } from "@/components/investigation/InvestigationPipeline";
import { InvestigationResult } from "@/components/investigation/InvestigationResult";
import { LimitsNotice } from "@/components/investigation/LimitsNotice";
import { Methodology } from "@/components/investigation/Methodology";
import { Nav } from "@/components/investigation/Nav";
import { NetworkVisualization } from "@/components/investigation/NetworkVisualization";
import { ScrollReveal } from "@/components/investigation/ScrollReveal";
import {
  isValidEvmWalletAddress,
  isValidInvestigationQuestion,
} from "@/utils/investigation-validation";
import type { InvestigationValidationError } from "@/types/investigation";
import type { InvestigationRetrievalResponse } from "@/types/investigation-response";

type RequestState = "idle" | "loading" | "invalid" | "error" | "success";

interface RequestIssue {
  message: string;
  fields?: InvestigationValidationError[];
}

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [question, setQuestion] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [retrieval, setRetrieval] = useState<InvestigationRetrievalResponse | null>(null);
  const [requestIssue, setRequestIssue] = useState<RequestIssue | null>(null);
  const [submittedWallet, setSubmittedWallet] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const isReady = isValidEvmWalletAddress(`0x${wallet.trim()}`) && isValidInvestigationQuestion(question);

  async function runInvestigation(walletAddress: string, trimmedQuestion: string) {
    setSubmittedWallet(walletAddress);
    setSubmittedQuestion(trimmedQuestion);
    setRetrieval(null);
    setRequestIssue(null);
    setRequestState("loading");

    try {
      const response = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, question: trimmedQuestion }),
      });

      const payload: unknown = await response.json();

      if (response.ok && isRetrievalResponse(payload)) {
        setRetrieval(payload);
        setRequestState("success");
        return;
      }

      if (isFailureResponse(payload)) {
        setRequestIssue({ message: payload.error.message, fields: payload.error.fields });
        setRequestState(response.status === 400 ? "invalid" : "error");
        return;
      }

      setRequestIssue({ message: "The investigation service returned an unexpected response." });
      setRequestState("error");
    } catch {
      setRequestIssue({ message: "Could not reach the investigation service. Check your connection and try again." });
      setRequestState("error");
    }
  }

  function submitInvestigation() {
    void runInvestigation(`0x${wallet.trim()}`, question.trim());
  }

  function retryInvestigation() {
    void runInvestigation(submittedWallet, submittedQuestion);
  }

  function returnToDesk() {
    setRequestState("idle");
    setRetrieval(null);
    setRequestIssue(null);
    document.getElementById("investigate")?.scrollIntoView({ behavior: "smooth" });
  }

  function updateWallet(value: string) {
    setWallet(value.replace(/^0x/i, ""));
    setRetrieval(null);
    setRequestIssue(null);
    setRequestState("idle");
  }

  function updateQuestion(value: string) {
    setQuestion(value);
    setRetrieval(null);
    setRequestIssue(null);
    setRequestState("idle");
  }

  return (
    <>
      <Nav />

      <main id="top" className="w-full">
        {/* 01 - Hero: the case file opens */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
            <p className="animate-rise font-mono text-xs uppercase tracking-[0.2em] text-muted-2">
              TraceMind — Onchain intelligence / 01
            </p>

            <div className="mt-8 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-10">
              <div>
                <h1 className="animate-rise-delayed font-display text-6xl leading-[0.95] tracking-tight text-foreground sm:text-7xl md:text-[5.4rem]">
                  Follow the
                  <br />
                  wallet.
                  <br />
                  <span className="text-gold italic">Find the evidence.</span>
                </h1>

                <p className="animate-rise-delayed mt-8 max-w-md text-[15px] leading-7 text-muted">
                  AI-powered onchain investigation. Ask a question about a wallet, trace its activity through live
                  blockchain data, and get findings backed by evidence you can inspect yourself.
                </p>

                <div className="animate-rise-delayed mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
                  <a
                    href="#investigate"
                    className="font-mono text-sm uppercase tracking-[0.1em] text-gold transition-colors hover:text-foreground"
                  >
                    Start investigation →
                  </a>
                  <a
                    href="#methodology"
                    className="font-mono text-sm uppercase tracking-[0.1em] text-muted transition-colors hover:text-cyan"
                  >
                    View methodology
                  </a>
                </div>
              </div>

              <div className="animate-rise-delayed lg:pb-2">
                <NetworkVisualization />
              </div>
            </div>
          </div>
        </section>

        {/* 02 - Live trace strip */}
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
            <DataTape />
          </div>
        </section>

        {/* 03 - The investigation: how a wallet becomes a trail */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-2">Section 01 — The trace</p>
              <p className="font-display mt-4 max-w-xl text-4xl leading-[1.05] text-foreground sm:text-5xl">
                A wallet is not a profile. <span className="text-gold italic">It is a trail.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal className="mt-14">
              <InvestigationPipeline />
            </ScrollReveal>
          </div>
        </section>

        {/* 04 - Open a case: the investigation intake */}
        <IntakeDesk
          wallet={wallet}
          question={question}
          isReady={isReady}
          isSubmitting={requestState === "loading"}
          invalidMessage={requestState === "invalid" ? (requestIssue?.message ?? "Check the wallet address and question, then try again.") : undefined}
          invalidFields={requestState === "invalid" ? requestIssue?.fields : undefined}
          onWalletChange={updateWallet}
          onQuestionChange={updateQuestion}
          onSubmit={submitInvestigation}
        />

        {(requestState === "loading" || requestState === "error" || requestState === "success") && (
          <section className="py-16">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              {requestState === "loading" && (
                <InvestigationLoading walletAddress={submittedWallet} question={submittedQuestion} />
              )}
              {requestState === "error" && (
                <div role="alert" className="border-l-2 border-negative py-1 pl-6">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-negative">Status · Failed</p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground/80">
                    {requestIssue?.message ?? "Something went wrong. Please try again."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                    <button
                      type="button"
                      onClick={submitInvestigation}
                      className="font-mono text-sm uppercase tracking-[0.1em] text-gold transition-colors hover:text-foreground"
                    >
                      Retry investigation →
                    </button>
                    <button
                      type="button"
                      onClick={returnToDesk}
                      className="font-mono text-sm uppercase tracking-[0.1em] text-muted transition-colors hover:text-foreground"
                    >
                      Return to desk
                    </button>
                  </div>
                </div>
              )}
              {requestState === "success" && retrieval && (
                <InvestigationResult retrieval={retrieval} onRetry={retryInvestigation} onReturnToDesk={returnToDesk} />
              )}
            </div>
          </section>
        )}

        {/* 05 - How TraceMind thinks */}
        <Methodology />

        {/* 06 - Evidence philosophy */}
        <AboutData />

        {/* 07 - Limits / honesty */}
        <LimitsNotice />

        {/* 08 - Final CTA */}
        <FinalCta />

        <CasesNotice />

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-5 py-8 text-[11px] text-muted-2 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>Live evidence retrieval and AI analysis</span>
            <span>TraceMind / 2026</span>
          </div>
        </footer>
      </main>
    </>
  );
}

interface InvestigationFailureResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: InvestigationValidationError[];
  };
}

function isRetrievalResponse(value: unknown): value is InvestigationRetrievalResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;
  return (
    response.success === true &&
    response.status === "data_retrieved" &&
    Array.isArray(response.aaveActivity) &&
    typeof response.recordCount === "number" &&
    typeof response.evidenceWindow === "object" &&
    response.evidenceWindow !== null &&
    typeof response.investigation === "object" &&
    response.investigation !== null
  );
}

function isFailureResponse(value: unknown): value is InvestigationFailureResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  if (response.success !== false || typeof response.error !== "object" || response.error === null) {
    return false;
  }

  const error = response.error as Record<string, unknown>;
  return typeof error.code === "string" && typeof error.message === "string";
}
