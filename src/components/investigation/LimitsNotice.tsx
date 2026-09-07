import { ScrollReveal } from "@/components/investigation/ScrollReveal";

export function LimitsNotice() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <ScrollReveal>
          <div className="border-l-2 border-gold/40 pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">Capability note</p>
            <p className="font-display mt-3 max-w-2xl text-2xl leading-snug text-foreground/90 sm:text-3xl">
              TraceMind currently investigates Aave V3 activity on Ethereum.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              The architecture is designed to expand across additional indexed protocols and data sources. It does
              not currently cover a wallet&apos;s complete cross-protocol or cross-chain history.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
