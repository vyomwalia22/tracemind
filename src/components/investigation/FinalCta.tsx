export function FinalCta() {
  return (
    <section className="border-y border-border bg-surface-2 text-center">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-2">Section 07 — Open a case</p>
        <h2 className="font-display mx-auto mt-5 max-w-2xl text-5xl leading-[1.05] text-foreground sm:text-7xl">
          Have a wallet
          <br />
          worth <span className="italic text-gold">investigating?</span>
        </h2>
        <a
          href="#investigate"
          className="mt-9 inline-block font-mono text-sm uppercase tracking-[0.1em] text-gold transition-colors hover:text-foreground"
        >
          Start an investigation →
        </a>
      </div>
    </section>
  );
}
