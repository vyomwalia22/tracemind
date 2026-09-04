"use client";

import { useState } from "react";

const examplePrompts = [
  "Investigate this wallet and tell me if anything unusual happened recently.",
  "Which addresses has this wallet interacted with most often?",
  "Look for sudden changes in this wallet's activity or assets.",
];

const walletPattern = /^[a-fA-F0-9]{40}$/;

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [question, setQuestion] = useState("");
  const isReady = walletPattern.test(wallet.trim()) && question.trim().length > 0;

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

        <form className="animate-rise-delayed border border-ink/15 bg-white/75 p-5 shadow-[6px_6px_0_var(--color-coral)] sm:p-8 lg:max-w-2xl lg:justify-self-end" onSubmit={(event) => event.preventDefault()}>
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
            <input id="wallet" name="wallet" type="text" value={wallet} onChange={(event) => setWallet(event.target.value.replace(/^0x/i, ""))} placeholder="a3f8...91c2" autoComplete="off" spellCheck="false" aria-describedby="wallet-help" className="h-12 w-full border border-ink/15 bg-transparent py-3 pl-10 pr-4 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink/30 hover:border-ink/35 focus:border-coral focus:ring-2 focus:ring-coral/20" />
          </div>
          <p id="wallet-help" className="-mt-4 mb-6 font-mono text-[10px] leading-5 text-ink/40">Paste a public EVM wallet address beginning with 0x.</p>

          <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50" htmlFor="question">Investigation question</label>
          <textarea
            id="question"
            name="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
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
                <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="border border-ink/15 px-3 py-2 text-left text-xs leading-4 text-ink/65 transition-colors hover:border-coral hover:bg-coral/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2">
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={!isReady} aria-disabled={!isReady} className="mt-6 flex h-12 w-full items-center justify-center gap-3 bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:bg-coral hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40 disabled:hover:bg-ink/15 disabled:hover:text-ink/40">
            {isReady ? "Investigation ready" : "Enter a wallet and question"}
            <span aria-hidden="true">-&gt;</span>
          </button>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink/35">Investigation engine available in the next milestone</p>
        </form>
      </section>

      <footer className="flex flex-col gap-2 border-t border-ink/10 pt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/40 sm:flex-row sm:items-center sm:justify-between">
        <span>Live evidence layer in progress</span>
        <span>TraceMind / 2026</span>
      </footer>
    </main>
  );
}
