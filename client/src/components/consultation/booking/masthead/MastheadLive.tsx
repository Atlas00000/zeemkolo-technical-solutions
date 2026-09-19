"use client";

import { useBookingDesk } from "../useBookingDesk";

/**
 * Live channel chip — mono status, not a Bootstrap pill.
 */
export function MastheadLive() {
  const { step, reducedMotion } = useBookingDesk();

  const channel =
    step === 1 ? "CH · SLOT" : step === 2 ? "CH · INTAKE" : "CH · CONFIRM";

  return (
    <div
      className={
        reducedMotion
          ? "flex items-center gap-3"
          : "masthead-enter flex items-center gap-3"
      }
    >
      <span
        className={
          reducedMotion
            ? "inline-block size-2 shrink-0 rounded-full bg-[var(--ln-signal)]"
            : "masthead-pulse-dot inline-block size-2 shrink-0 rounded-full bg-[var(--ln-signal)]"
        }
        aria-hidden
      />
      <span className="font-mono text-[10px] tracking-[0.28em] text-[var(--ln-signal)] uppercase md:text-xs">
        Desk live
      </span>
      <span className="h-3 w-px bg-[var(--ln-hairline-strong)]" aria-hidden />
      <span
        key={channel}
        className={
          reducedMotion
            ? "ln-tabular font-mono text-[10px] tracking-[0.2em] text-[var(--ln-muted)] uppercase md:text-xs"
            : "masthead-meta-swap ln-tabular font-mono text-[10px] tracking-[0.2em] text-[var(--ln-muted)] uppercase md:text-xs"
        }
      >
        {channel}
      </span>
    </div>
  );
}
