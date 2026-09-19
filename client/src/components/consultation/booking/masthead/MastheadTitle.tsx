"use client";

import { useBookingDesk } from "../useBookingDesk";

/**
 * Page title — display weight with connect-blue sheen on the verb.
 */
export function MastheadTitle() {
  const { reducedMotion, step } = useBookingDesk();

  const verb =
    step === 1 ? "Book" : step === 2 ? "Brief" : "Confirm";

  return (
    <h1
      className={
        reducedMotion
          ? "mt-6 max-w-xl text-balance font-display text-[clamp(1.45rem,3.2vw,2.15rem)] leading-[1.18] tracking-[-0.03em] text-[var(--ln-ink)] md:mt-7"
          : "masthead-enter-delay-2 mt-6 max-w-xl text-balance font-display text-[clamp(1.45rem,3.2vw,2.15rem)] leading-[1.18] tracking-[-0.03em] md:mt-7"
      }
    >
      {reducedMotion ? (
        <>
          <span className="text-[var(--ln-signal)]">{verb}</span>
          <span className="text-[var(--ln-ink)]"> a consultation</span>
        </>
      ) : (
        <>
          <span className="masthead-title-accent">{verb}</span>
          <span className="text-[var(--ln-ink)]"> a consultation</span>
        </>
      )}
    </h1>
  );
}
