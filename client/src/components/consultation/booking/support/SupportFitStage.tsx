"use client";

import { SUPPORT_FIT } from "./support-data";
import { useSupport } from "./useSupport";

/**
 * Fit stage — signal, title, detail. No decorative marks.
 */
export function SupportFitStage() {
  const { fitId, reducedMotion } = useSupport();
  const item = SUPPORT_FIT.find((f) => f.id === fitId) ?? SUPPORT_FIT[0]!;

  return (
    <div
      key={item.id}
      data-support-fit-stage
      className={
        reducedMotion
          ? "relative min-w-0 flex-1 border-t border-[var(--ln-signal)] pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0"
          : "support-stage-enter relative min-w-0 flex-1 border-t border-[var(--ln-signal)] pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0"
      }
    >
      <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
        {item.signal}
      </p>
      <h3 className="mt-3 font-display text-2xl tracking-tight text-[var(--ln-ink)] md:text-3xl">
        {item.label}
      </h3>
      <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-[var(--ln-muted)] md:text-base">
        {item.detail}
      </p>
    </div>
  );
}
