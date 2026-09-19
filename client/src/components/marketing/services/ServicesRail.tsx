"use client";

import type { KeyboardEvent } from "react";
import { SERVICES_CATALOG } from "./services-catalog";
import { useServicesSelection } from "./useServicesSelection";

/**
 * Interactive index rail — hover / focus / click / arrows drive the stage.
 * Hairlines only — not a Bootstrap card list.
 */
export function ServicesRail() {
  const { active, setActive } = useServicesSelection();

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActive(active + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(SERVICES_CATALOG.length - 1);
    }
  }

  return (
    <ul
      className="flex flex-col"
      role="listbox"
      tabIndex={0}
      aria-label="Engineering services"
      aria-activedescendant={`service-option-${active}`}
      onKeyDown={onKeyDown}
    >
      {SERVICES_CATALOG.map((service, index) => {
        const isActive = index === active;
        return (
          <li key={service.id} role="none">
            <button
              type="button"
              role="option"
              id={`service-option-${index}`}
              aria-selected={isActive}
              tabIndex={-1}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className={
                isActive
                  ? "services-rail-item services-rail-item-active group relative flex w-full items-baseline gap-4 border-t border-[var(--ln-signal)] py-5 text-left outline-none first:border-t md:py-6"
                  : "services-rail-item group relative flex w-full items-baseline gap-4 border-t border-[var(--ln-hairline)] py-5 text-left outline-none transition-colors first:border-t hover:border-[var(--ln-hairline-strong)] md:py-6"
              }
            >
              <span
                className={
                  isActive
                    ? "ln-tabular shrink-0 font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]"
                    : "ln-tabular shrink-0 font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)] group-hover:text-[var(--ln-muted)]"
                }
              >
                {service.index}
              </span>
              <span
                className={
                  isActive
                    ? "font-display text-lg tracking-tight text-[var(--ln-ink)] md:text-xl lg:text-2xl"
                    : "font-display text-lg tracking-tight text-[var(--ln-muted)] transition-colors group-hover:text-[var(--ln-ink)] md:text-xl lg:text-2xl"
                }
              >
                {service.title}
              </span>
              {isActive ? (
                <span
                  className="services-rail-scan absolute inset-x-0 bottom-0 h-px bg-[var(--ln-signal)]"
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
