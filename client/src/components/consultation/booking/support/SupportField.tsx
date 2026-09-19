"use client";

import { useSupport } from "./useSupport";

/**
 * Atmosphere for the support band — connect blue, not a flat divider.
 */
export function SupportField() {
  const { pointer, reducedMotion, fitId, timeline } = useSupport();

  const restX = fitId === "firmware" ? 72 : fitId === "prototype" ? 55 : 68;
  const glowX =
    pointer.active && !reducedMotion ? `${pointer.x * 100}%` : `${restX}%`;
  const glowY =
    pointer.active && !reducedMotion
      ? `${pointer.y * 100}%`
      : timeline === "before"
        ? "30%"
        : "55%";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      data-support-field
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 55% 50% at ${glowX} ${glowY},
              color-mix(in srgb, var(--ln-signal) 22%, transparent),
              transparent 62%
            ),
            radial-gradient(
              ellipse 35% 40% at 8% 90%,
              color-mix(in srgb, var(--ln-mark) 8%, transparent),
              transparent 55%
            ),
            linear-gradient(
              158deg,
              var(--ln-canvas) 0%,
              color-mix(in srgb, var(--ln-signal) 6%, var(--ln-canvas-elevated)) 100%
            )
          `,
          transition: reducedMotion ? undefined : "background 160ms linear",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.3] dark:opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ln-hairline-strong) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-hairline-strong) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
          maskImage:
            "radial-gradient(ellipse 70% 65% at 75% 40%, black 18%, transparent 72%)",
        }}
      />
      <div className="absolute -left-[5%] top-0 h-full w-[40%] skew-x-[-8deg] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--ln-signal)_10%,transparent),transparent_70%)] opacity-50" />
      {!reducedMotion ? (
        <div className="support-scope absolute inset-x-0 h-px" />
      ) : null}
      <div className="absolute inset-y-0 left-0 w-px bg-[var(--ln-signal)] opacity-50" />
    </div>
  );
}
