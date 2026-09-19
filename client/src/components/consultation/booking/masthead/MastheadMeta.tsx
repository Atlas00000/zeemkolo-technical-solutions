"use client";

import { useBookingDesk } from "../useBookingDesk";

const STEP_META: Record<1 | 2 | 3, { index: string; line: string }> = {
  1: {
    index: "01",
    line: "Select a Lagos-time window on the engineering calendar",
  },
  2: {
    index: "02",
    line: "Capture scope, constraints, and the decision to unblock",
  },
  3: {
    index: "03",
    line: "Review the hold and confirm — invite follows when mail is live",
  },
};

/**
 * Step-reactive meta strip — hairline instruments, not badges.
 */
export function MastheadMeta() {
  const { step, reducedMotion } = useBookingDesk();
  const meta = STEP_META[step];

  return (
    <div
      className={
        reducedMotion
          ? "mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-[var(--ln-hairline)] pt-4"
          : "masthead-enter-delay-4 mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-[var(--ln-hairline)] pt-4"
      }
    >
      <span
        key={meta.index}
        className={
          reducedMotion
            ? "ln-tabular font-mono text-xs tracking-[0.18em] text-[var(--ln-signal)]"
            : "masthead-meta-swap ln-tabular font-mono text-xs tracking-[0.18em] text-[var(--ln-signal)]"
        }
      >
        {meta.index}
      </span>
      <p
        key={meta.line}
        className={
          reducedMotion
            ? "max-w-md text-pretty text-sm text-[var(--ln-muted)]"
            : "masthead-meta-swap max-w-md text-pretty text-sm text-[var(--ln-muted)]"
        }
      >
        {meta.line}
      </p>
    </div>
  );
}
