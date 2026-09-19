"use client";

import { useServicesSelection } from "./useServicesSelection";

/**
 * Atmospheric field behind the catalog — vermilion wash tracks active index.
 */
export function ServicesField() {
  const { active, reducedMotion } = useServicesSelection();
  const spotY = 18 + active * 14;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 50% 45% at 92% ${spotY}%,
              color-mix(in srgb, var(--ln-signal) 14%, transparent),
              transparent 65%
            ),
            linear-gradient(
              165deg,
              var(--ln-canvas) 0%,
              var(--ln-canvas-elevated) 55%,
              var(--ln-canvas) 100%
            )
          `,
          transition: reducedMotion ? undefined : "background 420ms ease",
        }}
      />

      {/* Vertical register ticks on the far right */}
      <div className="absolute inset-y-10 right-4 hidden w-px bg-[var(--ln-hairline)] md:block lg:right-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={
              i === active
                ? "absolute right-0 h-px w-3 bg-[var(--ln-signal)]"
                : "absolute right-0 h-px w-2 bg-[var(--ln-hairline-strong)]"
            }
            style={{ top: `${12 + i * 18}%` }}
          />
        ))}
      </div>
    </div>
  );
}
