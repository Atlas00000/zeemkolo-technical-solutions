"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type NumberTickProps = {
  value: number;
  className?: string;
  format?: (n: number) => string;
  durationMs?: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animates numeric metrics to the target value. Tabular mono by default.
 */
export function NumberTick({
  value,
  className,
  format = (n) => Math.round(n).toLocaleString(),
  durationMs = 260,
}: NumberTickProps) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);

  React.useEffect(() => {
    if (prefersReducedMotion() || fromRef.current === value) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return (
    <span data-slot="ln-number-tick" className={cn("ln-tabular", className)}>
      {format(display)}
    </span>
  );
}
