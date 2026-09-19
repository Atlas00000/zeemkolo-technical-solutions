"use client";

import { ServicesField } from "./ServicesField";
import { ServicesHeader } from "./ServicesHeader";
import { ServicesRail } from "./ServicesRail";
import { ServicesStage } from "./ServicesStage";
import { ServicesSelectionProvider } from "./useServicesSelection";
import "./services-motion.css";

/**
 * UI-M02 — Interactive engineering catalog.
 * Rail drives stage; no equal cards, no clip art.
 */
export function ServicesSection() {
  return (
    <ServicesSelectionProvider>
      <section className="relative isolate overflow-hidden border-t border-[var(--ln-hairline)] text-[var(--ln-ink)]">
        <ServicesField />

        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-20 md:py-28">
          <ServicesHeader />

          <div className="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-24">
            <div className="order-2 lg:order-1">
              <ServicesRail />
            </div>
            <div className="order-1 lg:order-2">
              <ServicesStage />
            </div>
          </div>
        </div>
      </section>
    </ServicesSelectionProvider>
  );
}
