"use client";

import { useEffect, useState } from "react";
import "./system-field.css";

type TraceGridProps = {
  /** Giant atmospheric watermark */
  glyph?: string;
  /** Accent: signal blue vs mark red */
  accent?: "signal" | "mark";
  interactive?: boolean;
};

/**
 * Full-bleed trace lattice + wash + scan beam.
 * Pointer shifts the grid; no cards/boxes.
 */
export function TraceGrid({
  glyph = "ZEEM",
  accent = "signal",
  interactive = true,
}: TraceGridProps) {
  const [shift, setShift] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 68, y: 32 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!interactive || reduced) return;

    function onMove(event: PointerEvent) {
      const nx = event.clientX / window.innerWidth;
      const ny = event.clientY / window.innerHeight;
      setShift({
        x: (nx - 0.5) * 48,
        y: (ny - 0.5) * 36,
      });
      setGlow({ x: nx * 100, y: ny * 100 });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive, reduced]);

  const signalMix = accent === "signal" ? 28 : 10;
  const markMix = accent === "mark" ? 22 : 10;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="sys-wash absolute inset-[-12%]"
        style={{
          background: `
            radial-gradient(
              ellipse 55% 48% at ${glow.x}% ${glow.y}%,
              color-mix(in srgb, var(--ln-signal) ${signalMix}%, transparent),
              transparent 62%
            ),
            radial-gradient(
              ellipse 40% 36% at ${100 - glow.x * 0.6}% ${100 - glow.y * 0.45}%,
              color-mix(in srgb, var(--ln-mark) ${markMix}%, transparent),
              transparent 58%
            ),
            linear-gradient(
              148deg,
              var(--ln-canvas-elevated) 0%,
              var(--ln-canvas) 42%,
              color-mix(in srgb, var(--ln-signal) 12%, var(--ln-canvas)) 100%
            )
          `,
        }}
      />

      <div
        className="absolute -inset-[10%] opacity-[0.38] dark:opacity-[0.26]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ln-hairline-strong) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-hairline-strong) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
          transform: `translate3d(${shift.x}px, ${shift.y}px, 0)`,
          transition: reduced ? undefined : "transform 120ms linear",
          maskImage:
            "radial-gradient(ellipse 72% 70% at 50% 42%, black 12%, transparent 74%)",
        }}
      />

      <div
        className="sys-scan-beam absolute inset-x-0 h-[18%] opacity-40"
        style={{
          background: `linear-gradient(
            180deg,
            transparent,
            color-mix(in srgb, var(--ln-signal) 35%, transparent),
            transparent
          )`,
        }}
      />

      <div
        className="absolute -right-[18%] top-[-22%] h-[150%] w-[55%] origin-top-right skew-x-[-12deg] opacity-50"
        style={{
          background:
            accent === "mark"
              ? `linear-gradient(
            180deg,
            color-mix(in srgb, var(--ln-mark) 18%, transparent),
            transparent 74%
          )`
              : `linear-gradient(
            180deg,
            color-mix(in srgb, var(--ln-signal) 18%, transparent),
            transparent 74%
          )`,
        }}
      />

      <p
        className="sys-glyph absolute inset-x-0 top-[18%] select-none text-center font-display text-[clamp(6rem,28vw,18rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ln-ink)]"
      >
        {glyph}
      </p>

      <div className="absolute inset-y-0 left-0 w-px bg-[var(--ln-signal)] opacity-60" />
      <div className="absolute inset-y-0 right-0 w-px bg-[var(--ln-mark)] opacity-35" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--ln-canvas)] to-transparent" />
    </div>
  );
}
