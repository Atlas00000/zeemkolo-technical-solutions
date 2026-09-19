"use client";

import type { PointerEvent } from "react";
import {
  SupportField,
  SupportFitRail,
  SupportFitStage,
  SupportProvider,
  SupportScope,
  SupportTimeline,
  useSupport,
} from "./support";
import "./support/support-motion.css";

function SupportSectionInner() {
  const { setPointer, reducedMotion } = useSupport();

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      active: true,
    });
  }

  function onPointerLeave() {
    setPointer({ x: 0.65, y: 0.35, active: false });
  }

  return (
    <section
      className="relative isolate overflow-hidden border-t border-[var(--ln-hairline)] text-[var(--ln-ink)]"
      aria-label="About this consultation"
      data-booking-support
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <SupportField />

      <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-16 md:py-24">
        <SupportScope />

        <div className="mt-14 flex flex-col gap-10 lg:mt-20 lg:flex-row lg:items-start lg:gap-14">
          <div className="min-w-0 flex-1">
            <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
              Fit for
            </p>
            <SupportFitRail />
          </div>
          <SupportFitStage />
        </div>

        <SupportTimeline />
      </div>
    </section>
  );
}

/**
 * Scope + Fit + Before/After — interactive support band below the booking desk.
 * Modular field / rail / stage / timeline. No cards, clip art, or emoji.
 */
export function BookingSupport() {
  return (
    <SupportProvider>
      <SupportSectionInner />
    </SupportProvider>
  );
}
