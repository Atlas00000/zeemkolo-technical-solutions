"use client";

import { SpotlightGates } from "./SpotlightGates";
import { SpotlightMatric } from "./SpotlightMatric";

/**
 * Right instrument column — open field, not a bordered Bootstrap card.
 */
export function SpotlightInstrument() {
  return (
    <aside className="relative z-10 flex flex-col justify-between md:pl-6 lg:pl-10">
      {/* Soft left hairline instead of a box */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-[var(--ln-hairline)] md:block"
        aria-hidden
      />
      <SpotlightMatric />
      <SpotlightGates />
    </aside>
  );
}
