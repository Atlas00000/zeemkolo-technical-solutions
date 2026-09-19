"use client";

import { useBookingDesk } from "../useBookingDesk";

/**
 * Brand-first wordmark — hero-scale signal, not a quiet eyebrow.
 */
export function MastheadBrand() {
  const { reducedMotion, pointer } = useBookingDesk();

  const skew =
    pointer.active && !reducedMotion
      ? `perspective(600px) rotateY(${(pointer.x - 0.5) * 4}deg)`
      : undefined;

  return (
    <div
      className={
        reducedMotion
          ? "relative"
          : "masthead-enter-delay-1 relative"
      }
      style={
        reducedMotion
          ? undefined
          : { transform: skew, transition: "transform 140ms linear" }
      }
    >
      <p className="font-display text-[clamp(2.5rem,9vw,4.75rem)] leading-[0.86] tracking-[-0.055em] text-[var(--ln-ink)] break-words">
        Zeemkolo
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase md:text-base">
        <span>Technical Solutions</span>
        <span className="hidden h-px w-8 bg-[var(--ln-signal)] sm:inline-block" aria-hidden />
        <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] normal-case md:text-[11px]">
          CONSULT · ENG
        </span>
      </p>
    </div>
  );
}
