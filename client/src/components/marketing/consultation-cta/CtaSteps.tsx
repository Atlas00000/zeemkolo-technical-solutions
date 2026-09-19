"use client";

import type { KeyboardEvent } from "react";
import { CTA_STEPS } from "./cta-data";
import { CtaSignal } from "./CtaSignal";
import { useCta } from "./useCta";

/**
 * Interactive booking steps — hairline rail, not a Bootstrap stepper.
 */
export function CtaSteps() {
  const { activeStep, setActiveStep } = useCta();
  const activeIndex = CTA_STEPS.findIndex((s) => s.id === activeStep);

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = CTA_STEPS[(activeIndex + 1) % CTA_STEPS.length]!;
      setActiveStep(next.id);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev =
        CTA_STEPS[(activeIndex - 1 + CTA_STEPS.length) % CTA_STEPS.length]!;
      setActiveStep(prev.id);
    }
  }

  const active = CTA_STEPS[activeIndex]!;

  return (
    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
      <ul
        className="flex min-w-0 flex-1 flex-col"
        role="listbox"
        tabIndex={0}
        aria-label="Booking steps"
        aria-activedescendant={`cta-step-${activeStep}`}
        onKeyDown={onKeyDown}
      >
        {CTA_STEPS.map((step) => {
          const isActive = step.id === activeStep;
          return (
            <li key={step.id} role="none">
              <button
                type="button"
                role="option"
                id={`cta-step-${step.id}`}
                aria-selected={isActive}
                tabIndex={-1}
                onMouseEnter={() => setActiveStep(step.id)}
                onFocus={() => setActiveStep(step.id)}
                onClick={() => setActiveStep(step.id)}
                className={
                  isActive
                    ? "cta-step-active group relative flex w-full items-baseline gap-4 border-t border-[var(--ln-signal)] py-4 text-left outline-none md:py-5"
                    : "group relative flex w-full items-baseline gap-4 border-t border-[var(--ln-hairline)] py-4 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)] md:py-5"
                }
              >
                <span
                  className={
                    isActive
                      ? "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]"
                      : "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)]"
                  }
                >
                  {step.index}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={
                      isActive
                        ? "block font-display text-lg text-[var(--ln-ink)] md:text-xl"
                        : "block font-display text-lg text-[var(--ln-muted)] group-hover:text-[var(--ln-ink)] md:text-xl"
                    }
                  >
                    {step.label}
                  </span>
                  {isActive ? (
                    <span className="cta-step-detail mt-1 block text-sm text-[var(--ln-muted)]">
                      {step.detail}
                    </span>
                  ) : null}
                </span>
                {isActive ? (
                  <span
                    className="cta-step-scan absolute inset-x-0 bottom-0 h-px bg-[var(--ln-signal)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div
        key={active.id}
        className="cta-signal-enter h-28 w-full max-w-[16rem] shrink-0 self-start lg:self-end"
      >
        <CtaSignal step={active.id} />
      </div>
    </div>
  );
}
