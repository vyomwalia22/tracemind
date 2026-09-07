const SAMPLE_ROWS = [
  { time: "14:02:11", action: "SUPPLY", asset: "USDC", amount: "+12,400" },
  { time: "14:02:17", action: "BORROW", asset: "WETH", amount: "+4.20" },
  { time: "14:03:04", action: "REPAY", asset: "USDC", amount: "-8,100" },
  { time: "14:03:19", action: "SIGNAL", asset: "PATTERN", amount: "" },
  { time: "14:04:02", action: "EVIDENCE", asset: "E-017", amount: "" },
];

/**
 * A purely illustrative, looping ticker shown on the landing page before any
 * real investigation has run. Explicitly labeled as sample visualization -
 * this is never fed by a real API response.
 */
export function DataTape() {
  const rows = [...SAMPLE_ROWS, ...SAMPLE_ROWS];

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border py-2.5">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">
          <span className="animate-pulse-dot size-1.5 rounded-full bg-cyan" aria-hidden="true" />
          Live trace
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">Ethereum</p>
      </div>

      <div className="relative h-[168px] overflow-hidden py-1">
        <p className="absolute right-0 top-1 z-10 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-2">
          Sample visualization
        </p>
        <div aria-hidden="true" className="animate-tape-scroll font-mono text-xs text-muted-2">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-4 py-1.5">
              <span className="w-16 shrink-0 tabular-nums text-muted-2">{row.time}</span>
              <span className="w-20 shrink-0 text-foreground/70">{row.action}</span>
              <span className="w-20 shrink-0 text-muted">{row.asset}</span>
              <span className="text-cyan/80">{row.amount}</span>
            </div>
          ))}
        </div>
        <span className="sr-only">Illustrative sample of the kind of onchain activity TraceMind investigates.</span>
      </div>
    </div>
  );
}
