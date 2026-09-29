"use client";

import Image from "next/image";
import { MARKETING_ASSETS } from "@/design/marketing-assets";
import { useSpotlight } from "./useSpotlight";

/**
 * Atmosphere — brand banner wash + instrument grid (no cards).
 */
export function SpotlightField() {
  const { live, activeGate, reducedMotion } = useSpotlight();

  const spotX =
    activeGate === "preview"
      ? "18%"
      : activeGate === "library"
        ? "42%"
        : activeGate === "forum"
          ? "68%"
          : "88%";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0">
        <Image
          src={MARKETING_ASSETS.banners.smartHomes}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.16] dark:opacity-[0.2]"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 55% 50% at ${spotX} 30%,
              color-mix(in srgb, var(--ln-signal) ${live ? 22 : 12}%, transparent),
              transparent 62%
            ),
            linear-gradient(
              155deg,
              color-mix(in srgb, var(--ln-canvas-elevated) 88%, transparent) 0%,
              color-mix(in srgb, var(--ln-canvas) 92%, transparent) 48%,
              color-mix(in srgb, var(--ln-signal) 5%, var(--ln-canvas-elevated)) 100%
            )
          `,
          transition: reducedMotion ? undefined : "background 480ms ease",
        }}
      />

      <p
        className="absolute -right-[4%] top-[8%] select-none font-display text-[clamp(8rem,28vw,18rem)] leading-none font-semibold tracking-[-0.08em] text-[var(--ln-ink)] opacity-[0.05] dark:opacity-[0.08]"
      >
        ZMB
      </p>

      {/* Ledger grid — masked to the instrument half */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ln-hairline-strong) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-hairline-strong) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
          maskImage:
            "radial-gradient(ellipse 70% 80% at 78% 45%, black 15%, transparent 70%)",
        }}
      />

      {!reducedMotion ? (
        <div className="spotlight-scope absolute inset-x-0 h-px" />
      ) : null}
    </div>
  );
}
