"use client";

import { useBookingDesk } from "../useBookingDesk";

/**
 * Wrapped supporting copy — muted, readable, not a card.
 */
export function MastheadCopy() {
  const { reducedMotion } = useBookingDesk();

  return (
    <div
      className={
        reducedMotion
          ? "mt-4 max-w-prose space-y-3"
          : "masthead-enter-delay-3 mt-4 max-w-prose space-y-3"
      }
    >
      <p className="text-pretty text-sm leading-relaxed text-[var(--ln-muted)] md:text-base">
        Choose an open window, share the project brief, and receive a calendar
        hold — time-boxed engineering review for firmware, prototypes, and
        architecture decisions.
      </p>
      <p className="text-pretty text-xs leading-relaxed text-[var(--ln-faint)] md:text-sm">
        Leave with a written risk list you can act on the same week. Slots run
        on Africa/Lagos time.
      </p>
    </div>
  );
}
