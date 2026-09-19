"use client";

import { useHeroPointer } from "./useHeroPointer";

/**
 * Horizontal scope sweep — instrument presence, not a card chrome.
 */
export function HeroScopeSweep() {
  const { reducedMotion } = useHeroPointer();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={
          reducedMotion
            ? "absolute inset-x-0 top-[38%] h-px bg-[color-mix(in_srgb,var(--ln-signal)_35%,transparent)]"
            : "hero-scope-sweep absolute inset-x-0 h-px"
        }
      />
      {!reducedMotion ? (
        <div className="hero-scope-sweep-soft absolute inset-x-0 h-16" />
      ) : null}
    </div>
  );
}
