"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { Button } from "@/design/primitives/Button";
import { CTA_COPY } from "./cta-data";
import { useCta } from "./useCta";

/**
 * Magnetic primary CTA — slight pull toward pointer, not a boxed banner button.
 */
export function CtaActions() {
  const { reducedMotion } = useCta();
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    el.style.transform = `translate3d(${dx * 10}px, ${dy * 8}px, 0)`;
  }

  function onLeave() {
    if (!ref.current) return;
    ref.current.style.transform = "translate3d(0, 0, 0)";
  }

  return (
    <div
      className="relative z-10 flex flex-wrap items-center gap-x-6 gap-y-4"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div
        ref={ref}
        className="cta-magnetic transition-transform duration-150 ease-out will-change-transform"
      >
        <Button asChild size="lg" className="cta-primary min-w-[12.5rem]">
          <Link href={CTA_COPY.primaryHref}>{CTA_COPY.primary}</Link>
        </Button>
      </div>
      <span className="font-mono text-xs tracking-[0.18em] text-[var(--ln-faint)] uppercase">
        {CTA_COPY.mono}
      </span>
    </div>
  );
}
