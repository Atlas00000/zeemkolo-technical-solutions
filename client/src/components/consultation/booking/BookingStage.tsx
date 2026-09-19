"use client";

import type { ReactNode } from "react";

/**
 * Stage plane for the active booking step.
 * Content can scroll internally so the desk stays near the fold.
 */
export function BookingStage({
  children,
  reducedMotion = false,
  title,
}: {
  children: ReactNode;
  reducedMotion?: boolean;
  title: string;
}) {
  return (
    <div
      data-booking-stage
      className={
        reducedMotion
          ? "relative min-w-0 min-h-0 flex-1"
          : "booking-stage-enter relative min-w-0 min-h-0 flex-1"
      }
    >
      <h2 className="font-display text-lg tracking-tight text-[var(--ln-ink)] md:text-xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
