"use client";

import { useMemo } from "react";
import { HeroMcu } from "./HeroMcu";
import { useHeroPointer } from "./useHeroPointer";

type Trace = {
  d: string;
  cx: number;
  cy: number;
};

const TRACES: Trace[] = [
  { d: "M 80 60 H 280 V 140 H 420", cx: 250, cy: 100 },
  { d: "M 120 200 H 340 V 280 H 520", cx: 320, cy: 240 },
  { d: "M 40 320 H 260 V 400 H 480", cx: 260, cy: 360 },
  { d: "M 200 100 V 20 H 560", cx: 380, cy: 60 },
  { d: "M 240 360 V 520 H 580", cx: 410, cy: 440 },
  { d: "M 20 160 H -40 V 260 H -100", cx: -20, cy: 210 },
  { d: "M 400 180 H 620 V 340", cx: 510, cy: 260 },
  { d: "M 140 460 H 40 V 560 H -40", cx: 70, cy: 510 },
  { d: "M 320 420 H 480 V 500 H 600", cx: 460, cy: 460 },
  { d: "M 60 480 H 200 V 600", cx: 130, cy: 540 },
  { d: "M 440 80 H 600 V 160 H 680", cx: 560, cy: 120 },
  { d: "M 500 300 H 660 V 420", cx: 580, cy: 360 },
];

const VIAS = [
  [80, 60],
  [280, 140],
  [420, 140],
  [340, 280],
  [520, 280],
  [260, 400],
  [480, 400],
  [560, 20],
  [580, 520],
  [620, 340],
  [480, 500],
  [600, 500],
  [200, 600],
  [600, 160],
  [660, 420],
] as const;

/**
 * Routing field for the right visual half — denser, open, pointer-reactive.
 */
export function HeroSchematic() {
  const { x, y, active, reducedMotion } = useHeroPointer();

  const pointerVb = useMemo(
    () => ({
      px: x * 700,
      py: y * 640,
    }),
    [x, y],
  );

  const parallax = reducedMotion
    ? { tx: 0, ty: 0 }
    : {
        tx: (x - 0.5) * -26,
        ty: (y - 0.5) * -16,
      };

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 700 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{
        transform: `translate3d(${parallax.tx}px, ${parallax.ty}px, 0)`,
        transition: reducedMotion ? undefined : "transform 120ms linear",
      }}
    >
      <defs>
        <filter id="hero-trace-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Register ticks */}
      <g stroke="var(--ln-ink)" strokeWidth="1.2" opacity="0.3">
        <path d="M 24 24 H 56 M 24 24 V 56" />
        <path d="M 644 24 H 676 M 676 24 V 56" />
        <path d="M 24 584 V 616 H 56" />
        <path d="M 676 584 V 616 H 644" />
      </g>

      <HeroMcu />

      {/* Animated signal rail through the field */}
      <path
        d="M -20 300 H 180 V 250 H 390 V 300 H 720"
        fill="none"
        stroke="var(--ln-signal)"
        strokeWidth="1.6"
        opacity="0.55"
        className="hero-signal-rail"
      />

      {TRACES.map((trace, i) => {
        const dist = Math.hypot(
          pointerVb.px - trace.cx,
          pointerVb.py - trace.cy,
        );
        const proximity = reducedMotion
          ? 0.55
          : Math.max(0, 1 - dist / 260) * (active ? 1 : 0.8);
        const opacity = 0.35 + proximity * 0.65;
        const isHot = proximity > 0.5;

        return (
          <path
            key={`t-${i}`}
            d={trace.d}
            fill="none"
            stroke={isHot ? "var(--ln-signal)" : "var(--ln-ink)"}
            strokeWidth={isHot ? 2.5 : 1.35}
            strokeLinejoin="miter"
            strokeLinecap="square"
            opacity={opacity}
            filter={isHot ? "url(#hero-trace-glow)" : undefined}
            className={reducedMotion ? undefined : "hero-trace-pulse"}
            style={reducedMotion ? undefined : { animationDelay: `${i * 140}ms` }}
          />
        );
      })}

      {VIAS.map(([vx, vy], i) => {
        const dist = Math.hypot(pointerVb.px - vx, pointerVb.py - vy);
        const hot = !reducedMotion && dist < 88 && active;
        return (
          <circle
            key={`via-${i}`}
            cx={vx}
            cy={vy}
            r={hot ? 5.5 : 3.4}
            fill={hot ? "var(--ln-signal)" : "var(--ln-canvas)"}
            stroke={hot ? "var(--ln-signal)" : "var(--ln-ink)"}
            strokeWidth="1.2"
            opacity={hot ? 1 : 0.8}
          />
        );
      })}
    </svg>
  );
}
