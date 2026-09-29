"use client";

import type { PointerEvent } from "react";
import { CtaActions } from "./CtaActions";
import { CtaCopy } from "./CtaCopy";
import { CtaField } from "./CtaField";
import { CtaSteps } from "./CtaSteps";
import { CtaProvider, useCta } from "./useCta";
import "./cta-motion.css";

function CtaSectionInner() {
  const { setPointer, reducedMotion } = useCta();

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
    setPointer({ x: 0.7, y: 0.4, active: false });
  }

  return (
    <section
      className="relative isolate overflow-hidden border-t border-[var(--ln-hairline)] text-[var(--ln-ink)]"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <CtaField />

      <div className="relative z-10 mx-auto flex max-w-shell flex-col gap-10 px-[var(--ln-page-x)] py-20 md:gap-12 md:py-28 xl:gap-14">
        <div className="flex flex-col gap-8 md:gap-10 xl:flex-row xl:items-end xl:justify-between xl:gap-16">
          <CtaCopy />
          <CtaActions />
        </div>
        <CtaSteps />
      </div>
    </section>
  );
}

/**
 * UI-M02 — Closing consultation CTA: interactive booking desk.
 * No boxed banner, no clip art.
 */
export function CtaSection() {
  return (
    <CtaProvider>
      <CtaSectionInner />
    </CtaProvider>
  );
}
