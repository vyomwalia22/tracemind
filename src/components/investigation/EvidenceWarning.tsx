export function EvidenceWarning({ recordCount }: { recordCount: number }) {
  return (
    <div role="alert" className="border-l-2 border-gold py-1 pl-4">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-gold">Evidence window · Truncated</p>
      <p className="mt-1 text-sm leading-6 text-muted">
        {recordCount.toLocaleString()} most recent record{recordCount === 1 ? "" : "s"} retrieved. This investigation
        describes the retrieved evidence window only - older activity may exist beyond the available range.
      </p>
    </div>
  );
}
