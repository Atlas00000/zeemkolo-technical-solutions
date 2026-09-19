"use client";

import type { KeyboardEvent } from "react";
import { SUPPORT_FIT } from "./support-data";
import { useSupport } from "./useSupport";

/**
 * Fit-for rail — drives the stage. Hairlines only.
 */
export function SupportFitRail() {
  const { fitId, setFitId } = useSupport();
  const activeIndex = SUPPORT_FIT.findIndex((f) => f.id === fitId);

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = SUPPORT_FIT[(activeIndex + 1) % SUPPORT_FIT.length]!;
      setFitId(next.id);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev =
        SUPPORT_FIT[
          (activeIndex - 1 + SUPPORT_FIT.length) % SUPPORT_FIT.length
        ]!;
      setFitId(prev.id);
    }
  }

  return (
    <ul
      className="flex min-w-0 flex-1 flex-col"
      role="listbox"
      tabIndex={0}
      aria-label="Consultation fit"
      aria-activedescendant={`support-fit-${fitId}`}
      data-support-fit-rail
      onKeyDown={onKeyDown}
    >
      {SUPPORT_FIT.map((item) => {
        const isActive = item.id === fitId;
        return (
          <li key={item.id} role="none">
            <button
              type="button"
              role="option"
              id={`support-fit-${item.id}`}
              aria-selected={isActive}
              tabIndex={-1}
              onMouseEnter={() => setFitId(item.id)}
              onFocus={() => setFitId(item.id)}
              onClick={() => setFitId(item.id)}
              className={
                isActive
                  ? "support-rail-active group relative flex w-full items-baseline gap-4 border-t border-[var(--ln-signal)] py-5 text-left outline-none md:py-6"
                  : "group relative flex w-full items-baseline gap-4 border-t border-[var(--ln-hairline)] py-5 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)] md:py-6"
              }
            >
              <span
                className={
                  isActive
                    ? "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]"
                    : "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)]"
                }
              >
                {item.index}
              </span>
              <span
                className={
                  isActive
                    ? "font-display text-lg text-[var(--ln-ink)] md:text-xl"
                    : "font-display text-lg text-[var(--ln-muted)] group-hover:text-[var(--ln-ink)] md:text-xl"
                }
              >
                {item.label}
              </span>
              {isActive ? (
                <span
                  className="support-rail-scan absolute inset-x-0 bottom-0 h-px bg-[var(--ln-signal)]"
                  aria-hidden
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
