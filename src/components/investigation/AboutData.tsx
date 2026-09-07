import { ScrollReveal } from "@/components/investigation/ScrollReveal";

const SAMPLE_RECEIPTS = [
  { id: "E-014", time: "14:02:11", action: "REPAY", asset: "USDC", amount: "-8,100" },
  { id: "E-019", time: "14:03:19", action: "BORROW", asset: "WETH", amount: "+4.20" },
  { id: "E-027", time: "14:04:02", action: "SUPPLY", asset: "USDC", amount: "+12,400" },
];

export function AboutData() {
  return (
    <section id="about-data" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">Section 03 — The signal</p>
        <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <ScrollReveal>
            <h2 className="font-display max-w-md text-4xl leading-tight text-foreground sm:text-5xl">
              Every claim points back to the chain.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-muted">
              TraceMind currently investigates Aave V3 activity on Ethereum, retrieved live through The Graph.
              Amounts are normalized from raw base units using each reserve&apos;s exact decimals, then reduced to
              deterministic per-asset totals before any AI reasoning happens - and every AI finding cites the exact
              evidence records behind it.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="border-y border-border py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">Illustrative receipt</p>
              <div className="mt-3 divide-y divide-border">
                {SAMPLE_RECEIPTS.map((row) => (
                  <div key={row.id} className="flex items-center gap-4 py-2.5 font-mono text-xs">
                    <span className="w-14 shrink-0 text-gold">{row.id}</span>
                    <span className="w-16 shrink-0 text-muted-2">{row.time}</span>
                    <span className="w-16 shrink-0 uppercase tracking-[0.06em] text-foreground/75">{row.action}</span>
                    <span className="w-12 shrink-0 text-muted">{row.asset}</span>
                    <span className="text-cyan/80">{row.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
