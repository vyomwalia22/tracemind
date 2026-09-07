"use client";

import { useState } from "react";

import { truncateMiddle } from "@/components/investigation/format";
import type { InvestigationFindingConfidence } from "@/types/investigation-report";

export function StatusMarker({
  status,
}: {
  status: "completed" | "insufficient_evidence" | "failed";
}) {
  const config = {
    completed: { label: "Completed", tone: "text-gold" },
    insufficient_evidence: { label: "Insufficient evidence", tone: "text-muted" },
    failed: { label: "Failed", tone: "text-negative" },
  }[status];

  return <span className={`font-mono text-xs uppercase tracking-[0.12em] ${config.tone}`}>[ {config.label} ]</span>;
}

export function ConfidenceReadout({ confidence }: { confidence: InvestigationFindingConfidence }) {
  const tone = confidence === "high" ? "text-gold" : confidence === "medium" ? "text-foreground/85" : "text-muted";

  return <p className={`font-mono text-xs uppercase tracking-[0.1em] ${tone}`}>{confidence} confidence</p>;
}

export function CopyableHash({
  value,
  headLength,
  tailLength,
}: {
  value: string;
  headLength?: number;
  tailLength?: number;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be unavailable (permissions, insecure context) -
      // fail silently, the full value remains visible via the title attribute.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={value}
      className="group inline-flex max-w-full items-center gap-1.5 font-mono text-foreground/80 transition-colors hover:text-cyan"
    >
      <span className="truncate">{truncateMiddle(value, headLength, tailLength)}</span>
      <span className="shrink-0 text-[10px] uppercase tracking-[0.06em] text-muted-2 group-hover:text-cyan" aria-hidden="true">
        {copied ? "copied" : "copy"}
      </span>
      <span className="sr-only">{copied ? "Copied to clipboard" : "Copy full value to clipboard"}</span>
    </button>
  );
}
