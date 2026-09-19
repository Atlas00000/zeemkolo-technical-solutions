"use client";

import { StoreAtmosphere } from "./StoreAtmosphere";
import { useStoreDesk } from "./useStoreDesk";

/**
 * Interactive store field — pointer bloom wired to StoreDeskProvider.
 */
export function StoreField() {
  const { pointer, reducedMotion, activeIndex } = useStoreDesk();

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
    <StoreAtmosphere
      glowX={glowX}
      glowY={glowY}
      gridShiftX={gridShiftX}
      gridShiftY={gridShiftY}
      reducedMotion={reducedMotion}
    />
  );
}
