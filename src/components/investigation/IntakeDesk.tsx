import type { InvestigationValidationError } from "@/types/investigation";

const EXAMPLE_PROMPTS = ["Anything unusual recently?", "Most frequent counterparties?", "Sudden changes in activity?"];

export interface IntakeDeskProps {
  wallet: string;
  question: string;
  isReady: boolean;
  isSubmitting: boolean;
  invalidMessage?: string;
  invalidFields?: InvestigationValidationError[];
  onWalletChange: (value: string) => void;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
}

export function IntakeDesk({
  wallet,
  question,
  isReady,
  isSubmitting,
  invalidMessage,
  invalidFields,
  onWalletChange,
  onQuestionChange,
  onSubmit,
}: IntakeDeskProps) {
  return (
    <section id="investigate" className="border-y border-border bg-surface-2">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">New investigation / 001</p>
        <p className="font-display mt-4 max-w-lg text-4xl leading-tight text-foreground sm:text-5xl">
          Ready to trace<span className="text-gold">?</span>
        </p>

        <form
          className="mt-12 max-w-3xl"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div>
          <label className="block text-xs uppercase tracking-[0.12em] text-muted-2" htmlFor="wallet">
            Wallet
          </label>
          <div className="mt-3 flex items-baseline gap-2 rounded-sm border border-border-strong bg-background/40 px-4 py-3 transition-colors hover:border-gold/40 focus-within:border-gold focus-within:bg-background/60">
            <span className="font-mono text-2xl text-muted-2 sm:text-3xl" aria-hidden="true">
              0x
            </span>
            <input
              id="wallet"
              name="wallet"
              type="text"
              value={wallet}
              onChange={(event) => onWalletChange(event.target.value)}
              placeholder="a3f8...91c2"
              autoComplete="off"
              spellCheck="false"
              aria-describedby="wallet-help"
              className="w-full min-w-0 bg-transparent font-mono text-2xl text-foreground outline-none placeholder:text-muted-2 sm:text-3xl"
            />
          </div>
          <p id="wallet-help" className="mt-2 text-xs leading-5 text-muted-2">
            Paste a public EVM wallet address beginning with 0x.
          </p>
        </div>

        <div className="mt-10">
          <label className="block text-xs uppercase tracking-[0.12em] text-muted-2" htmlFor="question">
            Question
          </label>
          <textarea
            id="question"
            name="question"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="What looks unusual about this wallet?"
            aria-describedby="question-help"
            rows={2}
            className="mt-3 w-full resize-none rounded-sm border border-border-strong bg-background/40 px-4 py-3 text-xl leading-8 text-foreground outline-none transition-colors placeholder:text-muted-2 hover:border-gold/40 focus:border-gold focus:bg-background/60 sm:text-2xl"
          />
          <p id="question-help" className="mt-2 text-xs leading-5 text-muted-2">
            Ask about patterns, counterparties, timing, or anything that needs a closer look.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onQuestionChange(prompt)}
                className="text-xs text-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {invalidMessage && (
          <div role="alert" className="mt-6 border-l-2 border-gold py-1 pl-4 text-xs leading-5 text-foreground/90">
            <p>{invalidMessage}</p>
            {invalidFields && invalidFields.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-muted">
                {invalidFields.map((field) => (
                  <li key={field.field}>{field.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-6 border-t border-border pt-8">
          <dl className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.08em]">
            <div>
              <dt className="text-muted-2">Network</dt>
              <dd className="mt-0.5 text-foreground/80">Ethereum</dd>
            </div>
            <div>
              <dt className="text-muted-2">Protocol</dt>
              <dd className="mt-0.5 text-foreground/80">Aave V3</dd>
            </div>
            <div>
              <dt className="text-muted-2">Data source</dt>
              <dd className="mt-0.5 text-foreground/80">The Graph</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={!isReady || isSubmitting}
            aria-disabled={!isReady || isSubmitting}
            className="shrink-0 font-mono text-sm uppercase tracking-[0.1em] text-gold transition-colors hover:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:text-muted-2"
          >
            {isSubmitting ? "Investigating" : "Begin investigation"} →
          </button>
        </div>
        </form>
      </div>
    </section>
  );
}
