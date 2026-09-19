"use client";

import { LibraryAtmosphere } from "./LibraryAtmosphere";
import { useLibrary } from "./useLibrary";

/**
 * Interactive library field — pointer bloom wired to LibraryProvider.
 */
export function LibraryField() {
  const { pointer, reducedMotion, activeIndex } = useLibrary();

  const restX = 68 + (activeIndex % 3) * 6;
  const glowX =
    pointer.active && !reducedMotion ? `${pointer.x * 100}%` : `${restX}%`;
  const glowY =
    pointer.active && !reducedMotion ? `${pointer.y * 100}%` : "28%";
  const gridShiftX =
    pointer.active && !reducedMotion ? (pointer.x - 0.5) * 22 : 0;
  const gridShiftY =
    pointer.active && !reducedMotion ? (pointer.y - 0.5) * 14 : 0;

  return (
    <LibraryAtmosphere
      glowX={glowX}
      glowY={glowY}
      gridShiftX={gridShiftX}
      gridShiftY={gridShiftY}
      reducedMotion={reducedMotion}
    />
  );
}
