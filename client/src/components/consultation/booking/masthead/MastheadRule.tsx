"use client";

import { useBookingDesk } from "../useBookingDesk";

/**
 * Animated signal rule under the brand — draws in, soft scan.
 */
export function MastheadRule() {
  const { reducedMotion, pointer } = useBookingDesk();

  const widthBoost =
    pointer.active && !reducedMotion
      ? 1 + pointer.x * 0.35
      : 1;

  return (
    <div
      className="mt-5 md:mt-6"
      style={
        reducedMotion
          ? undefined
          : {
              transform: `scaleX(${widthBoost})`,
              transformOrigin: "left center",
              transition: "transform 160ms linear",
            }
      }
      aria-hidden
    >
      <div
        className={
          reducedMotion
            ? "h-0.5 w-[min(11rem,40vw)] bg-[var(--ln-signal)]"
            : "masthead-rule"
        }
      />
    </div>
  );
}
