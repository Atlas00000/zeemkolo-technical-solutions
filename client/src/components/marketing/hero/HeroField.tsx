"use client";

import Image from "next/image";
import { MARKETING_ASSETS } from "@/design/marketing-assets";
import { HeroPointerGlow } from "./HeroPointerGlow";
import { HeroSchematic } from "./HeroSchematic";
import { HeroScopeSweep } from "./HeroScopeSweep";
import { useHeroPointer } from "./useHeroPointer";

/**
 * Full-bleed visual plane — brand banner atmosphere + live schematic.
 * Mobile: field dominates the upper viewport. Desktop: right half.
 */
export function HeroField() {
  const { x, y, reducedMotion } = useHeroPointer();

  const gridShift = reducedMotion
    ? { bgX: 0, bgY: 0 }
    : { bgX: (x - 0.5) * 28, bgY: (y - 0.5) * 18 };

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[var(--ln-canvas)]" />

      {/* C2 — Zeemble banner as masked brand plane (not a card) */}
      <div className="absolute inset-0">
        <Image
          src={MARKETING_ASSETS.banners.zeemble}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_35%] opacity-[0.22] dark:opacity-[0.28]"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                105deg,
                var(--ln-canvas) 0%,
                color-mix(in srgb, var(--ln-canvas) 82%, transparent) 38%,
                transparent 62%
              ),
              radial-gradient(
                ellipse 70% 55% at 85% 12%,
                color-mix(in srgb, var(--ln-signal) 18%, transparent),
                transparent 58%
              )
            `,
          }}
        />
      </div>

      <div
        className="absolute inset-[-12%] opacity-[0.5] dark:opacity-[0.32]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ln-hairline-strong) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-hairline-strong) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          transform: `translate3d(${gridShift.bgX}px, ${gridShift.bgY}px, 0)`,
          transition: reducedMotion ? undefined : "transform 140ms linear",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 70% 28%, black 20%, transparent 72%)",
        }}
      />

      <p
        className="pointer-events-none absolute right-[-6%] top-[-4%] select-none font-display text-[clamp(7rem,30vw,20rem)] leading-none font-semibold tracking-[-0.07em] text-[var(--ln-ink)] opacity-[0.06] dark:opacity-[0.09]"
        style={{
          transform: reducedMotion
            ? undefined
            : `translate3d(${(x - 0.5) * -36}px, ${(y - 0.5) * -22}px, 0)`,
          transition: reducedMotion ? undefined : "transform 160ms linear",
        }}
      >
        ZM
      </p>

      <HeroPointerGlow />

      {/* Mobile: upper field. Desktop: right column. */}
      <div className="absolute inset-x-0 top-0 h-[52%] md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[62%]">
        <HeroSchematic />
      </div>

      <HeroScopeSweep />

      {/* Desktop readability veil only */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[44%] md:block"
        style={{
          background: `
            linear-gradient(
              90deg,
              var(--ln-canvas) 0%,
              color-mix(in srgb, var(--ln-canvas) 88%, transparent) 55%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Mobile: fade schematic into copy */}
      <div className="absolute inset-x-0 top-[40%] h-[18%] bg-gradient-to-b from-transparent to-[var(--ln-canvas)] md:hidden" />

      <div className="absolute inset-y-0 left-0 w-px bg-[var(--ln-signal)] opacity-50" />

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ln-canvas)] to-transparent" />
    </div>
  );
}
