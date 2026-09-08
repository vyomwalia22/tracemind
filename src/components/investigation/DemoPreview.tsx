import { ScrollReveal } from "@/components/investigation/ScrollReveal";

/**
 * A production-ready placeholder for the demo video - the real recording is
 * made only after the site itself is approved and tested. No playback state,
 * no progress, no fake interactivity: just a clearly labeled slot that can be
 * swapped for a real <video>/embed later without touching this section's
 * layout or copy.
 */
export function DemoPreview() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">Section 02 — See it in action</p>
          <h2 className="font-display mt-4 max-w-xl text-4xl leading-tight text-foreground sm:text-5xl">
            One investigation, <span className="italic text-gold">start to finish.</span>
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted">
            The demo walks through a real TraceMind investigation — from a wallet question, through the retrieved
            evidence, to a cited finding.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-10">
          <figure className="relative aspect-video w-full overflow-hidden border border-border-strong bg-background/60">
            <div className="absolute inset-4 border border-border sm:inset-6" aria-hidden="true" />

            <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2 sm:left-6 sm:top-6">
              Preview / 000
            </span>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-full border border-gold/50 sm:size-16"
                aria-hidden="true"
              >
                <svg viewBox="0 0 16 16" className="ml-0.5 size-5 fill-gold">
                  <path d="M4 2.2v11.6a.6.6 0 0 0 .92.5l9.2-5.8a.6.6 0 0 0 0-1L4.92 1.7a.6.6 0 0 0-.92.5Z" />
                </svg>
              </div>

              <figcaption>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">Demo video</p>
                <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">Coming soon</p>
              </figcaption>
            </div>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
