"use client";

import { useBookingDesk } from "./useBookingDesk";
import { BookingPointerGlow } from "./BookingPointerGlow";

/**
 * Interactive booking field — connect-blue atmosphere and pointer bloom.
 * Not a flat wash.
 */
export function BookingField() {
  const { step, pointer, reducedMotion } = useBookingDesk();

  const stepSpot =
    step === 1 ? "78%" : step === 2 ? "48%" : "62%";
  const glowX =
    pointer.active && !reducedMotion ? `${pointer.x * 100}%` : stepSpot;
  const glowY =
    pointer.active && !reducedMotion ? `${pointer.y * 100}%` : "28%";

  const gridShiftX =
    pointer.active && !reducedMotion ? (pointer.x - 0.5) * 24 : 0;
  const gridShiftY =
    pointer.active && !reducedMotion ? (pointer.y - 0.5) * 16 : 0;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      data-booking-field
    >
      {/* Base wash — strong connect blue, step-aware */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 58% 52% at ${glowX} ${glowY},
              color-mix(in srgb, var(--ln-signal) 28%, transparent),
              transparent 62%
            ),
            radial-gradient(
              ellipse 40% 45% at 12% 85%,
              color-mix(in srgb, var(--ln-mark) 10%, transparent),
              transparent 55%
            ),
            linear-gradient(
              152deg,
              var(--ln-canvas-elevated) 0%,
              var(--ln-canvas) 38%,
              color-mix(in srgb, var(--ln-signal) 12%, var(--ln-canvas)) 100%
            )
          `,
          transition: reducedMotion ? undefined : "background 160ms linear",
        }}
      />

      {/* Parallax ledger grid */}
      <div
        className="absolute -inset-[8%] opacity-[0.38] dark:opacity-[0.26]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ln-hairline-strong) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-hairline-strong) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          transform: `translate3d(${gridShiftX}px, ${gridShiftY}px, 0)`,
          transition: reducedMotion ? undefined : "transform 140ms linear",
          maskImage:
            "radial-gradient(ellipse 75% 70% at 70% 30%, black 15%, transparent 72%)",
        }}
      />

      {/* Diagonal shear plane — breaks boxed layout */}
      <div
        className="absolute -right-[10%] top-[-20%] h-[140%] w-[55%] origin-top-right skew-x-[-12deg] opacity-40"
        style={{
          background: `linear-gradient(
            180deg,
            color-mix(in srgb, var(--ln-signal) 14%, transparent),
            transparent 70%
          )`,
        }}
      />

      <BookingPointerGlow />

      {/* Edge signal bar — left, not a box */}
      <div className="absolute inset-y-0 left-0 w-px bg-[var(--ln-signal)] opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--ln-canvas)] to-transparent" />
    </div>
  );
}
