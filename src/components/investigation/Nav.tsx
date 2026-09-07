"use client";

import { useState } from "react";

const LINKS = [
  { href: "#investigate", label: "Investigate" },
  { href: "#about-data", label: "Evidence" },
  { href: "#methodology", label: "Methodology" },
  { href: "#cases", label: "Cases" },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="text-sm font-semibold tracking-[0.08em] text-foreground">
          TRACE MIND
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2 lg:flex">
          <span>Ethereum</span>
          <span className="text-muted-2">·</span>
          <span>Aave V3</span>
          <span className="ml-1 flex items-center gap-1.5 text-cyan">
            <span className="animate-pulse-dot size-1.5 rounded-full bg-cyan" aria-hidden="true" />
            Live
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          className="text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:text-gold md:hidden"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-border px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.08em] text-muted transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2">
            <span>Ethereum · Aave V3</span>
            <span className="flex items-center gap-1.5 text-gold">
              <span className="animate-pulse-dot size-1.5 rounded-full bg-gold" aria-hidden="true" />
              Live
            </span>
          </div>
        </nav>
      )}
    </header>
  );
}
