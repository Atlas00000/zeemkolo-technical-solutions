"use client";

import { ForumAtmosphere } from "./ForumAtmosphere";
import { useForumDesk } from "./useForumDesk";

/**
 * Interactive forum field — pointer bloom wired to ForumDeskProvider.
 */
export function ForumField() {
  const { pointer, reducedMotion, activeIndex } = useForumDesk();

  const restX = 66 + (activeIndex % 3) * 5;
  const glowX =
    pointer.active && !reducedMotion ? `${pointer.x * 100}%` : `${restX}%`;
  const glowY =
    pointer.active && !reducedMotion ? `${pointer.y * 100}%` : "30%";
  const gridShiftX =
    pointer.active && !reducedMotion ? (pointer.x - 0.5) * 20 : 0;
  const gridShiftY =
    pointer.active && !reducedMotion ? (pointer.y - 0.5) * 12 : 0;

  return (
    <ForumAtmosphere
      glowX={glowX}
      glowY={glowY}
      gridShiftX={gridShiftX}
      gridShiftY={gridShiftY}
      reducedMotion={reducedMotion}
    />
  );
}
