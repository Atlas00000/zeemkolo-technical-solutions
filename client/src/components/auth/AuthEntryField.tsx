/**
 * Shared branded entry field for Clerk auth pages.
 */
export function AuthEntryField({ word = "ENTER" }: { word?: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      data-auth-field
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 55% 45% at 50% 30%,
              color-mix(in srgb, var(--ln-signal) 16%, transparent),
              transparent 65%
            ),
            linear-gradient(
              165deg,
              var(--ln-canvas) 0%,
              color-mix(in srgb, var(--ln-signal) 5%, var(--ln-canvas-elevated)) 100%
            )
          `,
        }}
      />
      <p className="absolute left-1/2 top-[8%] -translate-x-1/2 select-none font-display text-[clamp(4rem,16vw,9rem)] leading-none font-semibold tracking-[-0.08em] text-[var(--ln-ink)] opacity-[0.04] dark:opacity-[0.07]">
        {word}
      </p>
      <div
        className="absolute inset-0 opacity-[0.22] dark:opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ln-hairline-strong) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-hairline-strong) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 50% 40%, black 20%, transparent 70%)",
        }}
      />
      <div className="absolute inset-x-0 top-[42%] h-px bg-[color-mix(in_srgb,var(--ln-signal)_30%,transparent)]" />
    </div>
  );
}
