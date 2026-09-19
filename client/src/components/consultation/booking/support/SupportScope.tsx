"use client";

import { SUPPORT_SCOPE } from "./support-data";

/**
 * Scope masthead — display weight, wrapped prose, open plane.
 */
export function SupportScope() {
  return (
    <header className="relative z-10 max-w-2xl" data-support-scope>
      <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
        {SUPPORT_SCOPE.eyebrow}
      </p>
      <h2 className="mt-4 font-display text-[clamp(1.85rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.035em] text-[var(--ln-ink)]">
        {SUPPORT_SCOPE.title}
      </h2>
      <div
        className="mt-6 h-px w-24 bg-[var(--ln-signal)] md:w-40"
        aria-hidden
      />
      <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
        {SUPPORT_SCOPE.body}
      </p>
      <p className="mt-4 max-w-prose text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base">
        {SUPPORT_SCOPE.aside}
      </p>
    </header>
  );
}
