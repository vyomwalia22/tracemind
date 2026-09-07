"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades/lifts children into place the first time they scroll into view.
 * Pure presentation - no data, no backend dependency. Falls back to visible
 * immediately if IntersectionObserver is unavailable (older browsers, some
 * test environments) so content is never hidden.
 *
 * Initial state is always `false` on both server and client - checking
 * `typeof IntersectionObserver` during the initial render would diverge
 * between SSR (no such global) and the browser (has it), causing a
 * hydration mismatch. The check only happens inside the effect instead.
 */
export function ScrollReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      // Defer so this doesn't set state synchronously within the effect body.
      const timeout = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
