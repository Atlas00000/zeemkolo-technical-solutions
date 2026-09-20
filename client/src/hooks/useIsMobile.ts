"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `md` — mobile chrome below this width. */
export const MOBILE_MAX_WIDTH_PX = 767;

/**
 * True when viewport is below the `md` breakpoint.
 * Starts `false` (SSR-safe) and updates after mount.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
