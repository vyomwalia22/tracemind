"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Retrieving chain data",
  "Normalizing activity",
  "Computing exposure",
  "Reasoning over evidence",
  "Building report",
];

const SECONDS_PER_STEP = 15;

export interface InvestigationLoadingProps {
  walletAddress: string;
  question: string;
}

export function InvestigationLoading({ walletAddress, question }: InvestigationLoadingProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // A cosmetic pacing indicator only - the backend gives no real per-stage
  // signal, so no step is ever marked "done"; only the current focus changes.
  const activeIndex = Math.min(STEPS.length - 1, Math.floor(elapsedSeconds / SECONDS_PER_STEP));

  return (
    <div role="status" aria-live="polite" className="border-y border-border py-10 sm:py-14">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-cyan">
        <span className="animate-pulse-dot size-1.5 rounded-full bg-cyan" aria-hidden="true" />
        Investigation / 001 · Status · Analyzing
      </p>

      <p className="mt-5 break-all font-mono text-sm text-foreground/90">{walletAddress}</p>
      <p className="mt-1 text-sm text-muted">&ldquo;{question}&rdquo;</p>

      <ol className="mt-8 space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className={`flex items-baseline gap-3 font-mono text-sm transition-colors ${
              index === activeIndex ? "text-cyan" : "text-muted-2"
            }`}
          >
            <span>{String(index + 1).padStart(2, "0")} /</span>
            <span className="uppercase tracking-[0.04em]">{step}</span>
          </li>
        ))}
      </ol>

      <div className="relative mt-8 h-px w-full bg-border-strong">
        <div className="animate-progress-sweep absolute inset-y-0 left-0 h-full w-1/3 bg-cyan" />
      </div>
      <p className="mt-2 font-mono text-xs text-muted-2">
        {formatElapsed(elapsedSeconds)} elapsed · real analysis can take up to ~90 seconds
      </p>
    </div>
  );
}

export function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
