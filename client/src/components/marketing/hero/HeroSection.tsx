"use client";

import { HeroCopy } from "./HeroCopy";
import { HeroField } from "./HeroField";
import { HeroPointerProvider } from "./useHeroPointer";
import "./hero-motion.css";

/**
 * UI-M01 — Full-bleed interactive hero.
 * Composition: live schematic field + brand-first copy. No clip art, no cards.
 */
export function HeroSection() {
  return (
    <HeroPointerProvider>
      <section className="relative text-[var(--ln-ink)]">
        <HeroField />
        <HeroCopy />
      </section>
    </HeroPointerProvider>
  );
}
