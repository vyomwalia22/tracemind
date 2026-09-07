import { useMemo, type ReactNode } from "react";

import { AggregateTable } from "@/components/investigation/AggregateTable";
import { AssessmentSummary } from "@/components/investigation/AssessmentSummary";
import { EvidenceLedger } from "@/components/investigation/EvidenceLedger";
import { EvidenceWarning } from "@/components/investigation/EvidenceWarning";
import { classifyFindingSignal, type FindingSignalTone } from "@/components/investigation/format";
import { FindingEntry } from "@/components/investigation/FindingEntry";
import { InvestigationHeader } from "@/components/investigation/InvestigationHeader";
import { InvestigationOverview } from "@/components/investigation/InvestigationOverview";
import { computeAaveActivityAggregates } from "@/lib/investigation/aggregates";
import type { InvestigationReportErrorCode } from "@/types/investigation-report";
import type { InvestigationRetrievalResponse } from "@/types/investigation-response";

export interface InvestigationResultProps {
  retrieval: InvestigationRetrievalResponse;
  onRetry: () => void;
  onReturnToDesk: () => void;
}

export function InvestigationResult({ retrieval, onRetry, onReturnToDesk }: InvestigationResultProps) {
  const aggregates = useMemo(
    () => computeAaveActivityAggregates(retrieval.aaveActivity),
    [retrieval.aaveActivity],
  );

  const evidenceIndexById = useMemo(() => {
    const map = new Map<string, number>();
    retrieval.aaveActivity.forEach((activity, index) => map.set(activity.id, index));
    return map;
  }, [retrieval.aaveActivity]);

  const { investigation } = retrieval;

  const findings = useMemo(
    () =>
      investigation.status === "completed"
        ? investigation.report.findings.filter((finding) => finding.evidenceIds.length > 0)
        : [],
    [investigation],
  );

  const citingFindingsById = useMemo(() => {
    const map = new Map<string, number[]>();
    findings.forEach((finding, findingIndex) => {
      finding.evidenceIds.forEach((evidenceId) => {
        const list = map.get(evidenceId) ?? [];
        list.push(findingIndex);
        map.set(evidenceId, list);
      });
    });
    return map;
  }, [findings]);

  // Presentational only: reads each finding's own statement text for
  // language it already uses (see classifyFindingSignal) so matching
  // findings/evidence can be visually distinguished - never a new AI field.
  const findingTones = useMemo(
    () => findings.map((finding) => classifyFindingSignal(finding.statement)),
    [findings],
  );

  const evidenceToneById = useMemo(() => {
    const map = new Map<string, FindingSignalTone>();
    citingFindingsById.forEach((findingIndexes, evidenceId) => {
      let tone: FindingSignalTone = "neutral";
      for (const findingIndex of findingIndexes) {
        const candidate = findingTones[findingIndex];
        if (candidate === "anomaly") {
          tone = "anomaly";
          break;
        }
        if (candidate === "normal") {
          tone = "normal";
        }
      }
      map.set(evidenceId, tone);
    });
    return map;
  }, [citingFindingsById, findingTones]);

  return (
    <div className="space-y-14 sm:space-y-16">
      <InvestigationHeader retrieval={retrieval} />

      <div className="space-y-4">
        {retrieval.evidenceWindow.truncated && <EvidenceWarning recordCount={retrieval.evidenceWindow.recordCount} />}
        <InvestigationOverview retrieval={retrieval} />
      </div>

      {investigation.status === "insufficient_evidence" && (
        <Panel>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Status · Insufficient evidence</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-foreground/90">
            TraceMind could not establish a sufficiently supported conclusion from the retrieved evidence.
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {retrieval.recordCount} record{retrieval.recordCount === 1 ? "" : "s"} were retrieved for this wallet -
            not enough to support a specific finding for this question. Try a different wallet address or a broader
            question.
          </p>
          <button
            type="button"
            onClick={onReturnToDesk}
            className="mt-6 font-mono text-sm uppercase tracking-[0.1em] text-gold transition-colors hover:text-foreground"
          >
            Return to desk →
          </button>
        </Panel>
      )}

      {investigation.status === "failed" && (
        <Panel role="alert">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-negative">Status · Failed</p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground/80">
            {errorCodeLabel(investigation.error.code)} — {investigation.error.message}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <button
              type="button"
              onClick={onRetry}
              className="font-mono text-sm uppercase tracking-[0.1em] text-gold transition-colors hover:text-foreground"
            >
              Retry investigation →
            </button>
            <button
              type="button"
              onClick={onReturnToDesk}
              className="font-mono text-sm uppercase tracking-[0.1em] text-muted transition-colors hover:text-foreground"
            >
              Return to desk
            </button>
          </div>
        </Panel>
      )}

      {investigation.status === "completed" && (
        <>
          <Panel>
            <AssessmentSummary report={investigation.report} aggregates={aggregates} />
          </Panel>

          <Panel>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">Section 04 — The findings</p>
            <h2 className="font-display mt-3 text-4xl leading-tight text-foreground sm:text-5xl">
              Findings / {String(findings.length).padStart(2, "0")}
            </h2>
            {findings.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                The evidence did not support any specific findings for this question.
              </p>
            ) : (
              <div className="mt-6 divide-y divide-border">
                {findings.map((finding, index) => (
                  <FindingEntry
                    key={index}
                    index={index}
                    finding={finding}
                    evidenceIndexById={evidenceIndexById}
                    tone={findingTones[index]}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <AggregateTable aggregates={aggregates} />
          </Panel>
        </>
      )}

      <Panel>
        <EvidenceLedger
          activity={retrieval.aaveActivity}
          citingFindingsById={citingFindingsById}
          evidenceToneById={evidenceToneById}
        />
      </Panel>
    </div>
  );
}

function Panel({ children, role }: { children: ReactNode; role?: string }) {
  return (
    <section role={role} className="border-t border-border pt-10 sm:pt-12">
      {children}
    </section>
  );
}

function errorCodeLabel(code: InvestigationReportErrorCode): string {
  switch (code) {
    case "configuration_error":
      return "AI provider not configured";
    case "rate_limited":
      return "AI provider rate-limited";
    case "network_error":
      return "Network error reaching AI provider";
    case "invalid_output":
      return "AI response failed validation";
    default:
      return "AI provider error";
  }
}
