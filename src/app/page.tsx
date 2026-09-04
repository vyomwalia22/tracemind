export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-1 flex-col px-6 py-7 sm:px-10 lg:px-14">
      <header className="flex items-center justify-between border-b border-ink/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center bg-coral text-sm font-bold text-ink">T</span>
          <span className="text-sm font-semibold tracking-[0.18em] text-ink">TRACEMIND</span>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink/45">Foundation / 01</span>
      </header>

      <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
        <div className="animate-rise">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-coral">Onchain intelligence, grounded</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-ink sm:text-7xl">
            Ask about a wallet.<br />
            <span className="text-coral">Trace the evidence.</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-7 text-ink/60">
            TraceMind will turn onchain activity into clear, evidence-backed answers. Start with a wallet and a question.
          </p>
        </div>

        <form className="animate-rise-delayed border border-ink/15 bg-white/70 p-6 shadow-[8px_8px_0_var(--color-coral)] sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Begin an investigation</h2>
            <span className="font-mono text-xs text-ink/40">READY</span>
          </div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-ink/50" htmlFor="wallet">
            Wallet address
          </label>
          <input
            id="wallet"
            name="wallet"
            type="text"
            placeholder="0x..."
            className="mb-6 h-12 w-full border border-ink/15 bg-transparent px-4 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral"
          />
          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-ink/50" htmlFor="question">
            Investigation question
          </label>
          <textarea
            id="question"
            name="question"
            rows={4}
            placeholder="What should we look for?"
            className="w-full resize-none border border-ink/15 bg-transparent p-4 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral"
          />
          <button type="submit" disabled className="mt-6 h-12 w-full cursor-not-allowed bg-ink px-5 text-sm font-semibold text-paper/45">
            Investigation engine coming soon
          </button>
        </form>
      </section>

      <footer className="flex flex-col gap-2 border-t border-ink/10 pt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/40 sm:flex-row sm:items-center sm:justify-between">
        <span>Live evidence layer in progress</span>
        <span>TraceMind / 2026</span>
      </footer>
    </main>
  );
}
