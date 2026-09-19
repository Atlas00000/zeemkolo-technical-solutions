"use client";

import { useCta } from "./useCta";

/**
 * Full-bleed close field — vermilion wash tracks pointer + active step.
 */
export function CtaField() {
  const { activeStep, pointer, reducedMotion } = useCta();

  const stepSpot =
    activeStep === "slot" ? "22%" : activeStep === "brief" ? "50%" : "78%";

  const glowX =
    pointer.active && !reducedMotion ? `${pointer.x * 100}%` : stepSpot;
  const glowY =
    pointer.active && !reducedMotion ? `${pointer.y * 100}%` : "40%";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 55% 55% at ${glowX} ${glowY},
              color-mix(in srgb, var(--ln-signal) 24%, transparent),
              transparent 62%
            ),
            linear-gradient(
              155deg,
              var(--ln-canvas-elevated) 0%,
              var(--ln-canvas) 45%,
              color-mix(in srgb, var(--ln-signal) 8%, var(--ln-canvas-elevated)) 100%
            )
          `,
          transition: reducedMotion ? undefined : "background 160ms linear",
        }}
      />

      <p className="absolute -right-[3%] bottom-[-8%] select-none font-display text-[clamp(7rem,26vw,16rem)] leading-none font-semibold tracking-[-0.08em] text-[var(--ln-ink)] opacity-[0.05] dark:opacity-[0.08]">
        BOOK
      </p>

      <div
        className="absolute inset-0 opacity-[0.3] dark:opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ln-hairline-strong) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-hairline-strong) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 75% 50%, black 20%, transparent 72%)",
        }}
      />

      {!reducedMotion ? <div className="cta-scope absolute inset-x-0 h-px" /> : null}
    </div>
  );
}
