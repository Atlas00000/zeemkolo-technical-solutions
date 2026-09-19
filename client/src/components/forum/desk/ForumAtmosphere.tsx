/**
 * Static / driven forum atmosphere — wash, grid, shear.
 * No watermark, no zip sweep.
 */
export function ForumAtmosphere({
  glowX = "70%",
  glowY = "30%",
  gridShiftX = 0,
  gridShiftY = 0,
  reducedMotion = true,
}: {
  glowX?: string;
  glowY?: string;
  gridShiftX?: number;
  gridShiftY?: number;
  reducedMotion?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      data-forum-field
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 56% 50% at ${glowX} ${glowY},
              color-mix(in srgb, var(--ln-signal) 24%, transparent),
              transparent 62%
            ),
            radial-gradient(
              ellipse 36% 40% at 10% 88%,
              color-mix(in srgb, var(--ln-mark) 8%, transparent),
              transparent 55%
            ),
            linear-gradient(
              152deg,
              var(--ln-canvas-elevated) 0%,
              var(--ln-canvas) 40%,
              color-mix(in srgb, var(--ln-signal) 9%, var(--ln-canvas)) 100%
            )
          `,
          transition: reducedMotion ? undefined : "background 160ms linear",
        }}
      />

      <div
        className="absolute -inset-[8%] opacity-[0.34] dark:opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ln-hairline-strong) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-hairline-strong) 1px, transparent 1px)
          `,
          backgroundSize: "46px 46px",
          transform: `translate3d(${gridShiftX}px, ${gridShiftY}px, 0)`,
          transition: reducedMotion ? undefined : "transform 140ms linear",
          maskImage:
            "radial-gradient(ellipse 70% 68% at 70% 34%, black 16%, transparent 72%)",
        }}
      />

      <div
        className="absolute -right-[12%] top-[-18%] h-[140%] w-[50%] origin-top-right skew-x-[-11deg] opacity-40"
        style={{
          background: `linear-gradient(
            180deg,
            color-mix(in srgb, var(--ln-signal) 15%, transparent),
            transparent 72%
          )`,
        }}
      />

      <div className="absolute inset-y-0 left-0 w-px bg-[var(--ln-signal)] opacity-55" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ln-canvas)] to-transparent" />
    </div>
  );
}
