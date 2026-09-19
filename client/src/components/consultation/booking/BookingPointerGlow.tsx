"use client";

import { useBookingDesk } from "./useBookingDesk";

/**
 * Pointer-follow connect-blue bloom — interactive, not decorative noise.
 */
export function BookingPointerGlow() {
  const { pointer, reducedMotion, step } = useBookingDesk();

  const restX = step === 1 ? 78 : step === 2 ? 55 : 68;
  const restY = step === 1 ? 32 : step === 2 ? 38 : 28;

  const x = pointer.active && !reducedMotion ? pointer.x * 100 : restX;
  const y = pointer.active && !reducedMotion ? pointer.y * 100 : restY;
  const intensity = pointer.active && !reducedMotion ? 32 : 18;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 transition-[background] duration-150 ease-linear"
        style={{
          background: `radial-gradient(ellipse 42% 38% at ${x}% ${y}%, color-mix(in srgb, var(--ln-signal) ${intensity}%, transparent), transparent 68%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(ellipse 28% 22% at ${x}% ${y}%, color-mix(in srgb, var(--ln-mark) 8%, transparent), transparent 70%)`,
        }}
      />
    </div>
  );
}
