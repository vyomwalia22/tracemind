import { ScrollReveal } from "@/components/investigation/ScrollReveal";

export function CasesNotice() {
  return (
    <section id="cases" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-2">Cases</p>
          <h2 className="font-display mt-3 max-w-lg text-3xl leading-tight text-foreground sm:text-4xl">
            Each investigation runs fresh.
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted">
            TraceMind does not yet persist past investigations - there is no case history to browse. Every result on
            this page is generated live from the wallet and question you provide, and exists only for this session.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-2">
            A persistent case archive is a natural next step for the architecture, not a feature this build includes.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
