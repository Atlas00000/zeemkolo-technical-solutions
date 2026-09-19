"use client";

import { STORE_MASTHEAD } from "./store-data";

/**
 * Brand-first store masthead — display weight, open plane.
 */
export function StoreMasthead() {
  return (
    <header className="relative z-10 max-w-3xl" data-store-masthead>
      <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
        {STORE_MASTHEAD.eyebrow}
      </p>
      <p className="mt-5 font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.92] tracking-[-0.05em] text-[var(--ln-ink)]">
        {STORE_MASTHEAD.brand}
      </p>
      <h1 className="mt-4 font-display text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.1] tracking-[-0.03em] text-[var(--ln-muted)]">
        {STORE_MASTHEAD.title}
      </h1>
      <div
        className="mt-7 h-px w-28 bg-[var(--ln-signal)] md:w-40"
        aria-hidden
      />
      <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
        {STORE_MASTHEAD.body}
      </p>
      <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base">
        {STORE_MASTHEAD.aside}
      </p>
    </header>
  );
}
