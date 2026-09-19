"use client";

import { VoicesField } from "./VoicesField";
import { VoicesHeader } from "./VoicesHeader";
import { VoicesRail } from "./VoicesRail";
import { VoicesStage } from "./VoicesStage";
import { VoicesProvider } from "./useVoices";
import "./voices-motion.css";

/**
 * UI-M02 — Interactive client voices desk.
 * Rail drives stage; auto-advance pauses on hover. No quote cards.
 */
export function VoicesSection() {
  return (
    <VoicesProvider>
      <section className="relative isolate overflow-hidden border-t border-[var(--ln-hairline)] text-[var(--ln-ink)]">
        <VoicesField />

        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-20 md:py-28">
          <VoicesHeader />

          <div className="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 xl:gap-24">
            <div className="order-2 lg:order-1">
              <VoicesRail />
            </div>
            <div className="order-1 lg:order-2">
              <VoicesStage />
            </div>
          </div>
        </div>
      </section>
    </VoicesProvider>
  );
}
