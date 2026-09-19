"use client";

import { useVoices } from "./useVoices";

/**
 * Atmosphere for the voice desk — wash tracks active index.
 */
export function VoicesField() {
  const { active, reducedMotion } = useVoices();
  const spotY = 22 + active * 22;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 48% 42% at 8% ${spotY}%,
              color-mix(in srgb, var(--ln-signal) 14%, transparent),
              transparent 65%
            ),
            linear-gradient(
              168deg,
              var(--ln-canvas) 0%,
              var(--ln-canvas-elevated) 52%,
              var(--ln-canvas) 100%
            )
          `,
          transition: reducedMotion ? undefined : "background 480ms ease",
        }}
      />

      <p className="absolute -left-[2%] top-[12%] select-none font-display text-[clamp(7rem,22vw,14rem)] leading-none font-semibold tracking-[-0.08em] text-[var(--ln-ink)] opacity-[0.04] dark:opacity-[0.07]">
        VOX
      </p>

      {!reducedMotion ? <div className="voices-scope absolute inset-x-0 h-px" /> : null}
    </div>
  );
}
