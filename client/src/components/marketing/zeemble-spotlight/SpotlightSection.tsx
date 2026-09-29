"use client";

import { SpotlightCopy } from "./SpotlightCopy";
import { SpotlightField } from "./SpotlightField";
import { SpotlightInstrument } from "./SpotlightInstrument";
import { SpotlightProvider } from "./useSpotlight";
import "./spotlight-motion.css";

/**
 * UI-M02 — Zeemble spotlight: interactive matric gate desk.
 * No clip-art orbs, no equal cards.
 */
export function SpotlightSection() {
  return (
    <SpotlightProvider>
      <section className="relative isolate overflow-hidden border-y border-[var(--ln-hairline)] text-[var(--ln-ink)]">
        <SpotlightField />

        <div className="relative z-10 mx-auto grid max-w-shell gap-10 px-[var(--ln-page-x)] py-20 md:gap-12 md:py-28 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch xl:gap-16">
          <SpotlightCopy />
          <SpotlightInstrument />
        </div>
      </section>
    </SpotlightProvider>
  );
}
