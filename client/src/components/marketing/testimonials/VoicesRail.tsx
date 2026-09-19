"use client";

import type { KeyboardEvent } from "react";
import { VOICES_CATALOG } from "./voices-data";
import { useVoices } from "./useVoices";

/**
 * Interactive attribution rail — drives the stage.
 */
export function VoicesRail() {
  const { active, setActive, setPaused } = useVoices();

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
      setActive(VOICES_CATALOG.length - 1);
    }
  }

  return (
    <ul
      className="flex flex-col"
      role="listbox"
      tabIndex={0}
      aria-label="Client voices"
      aria-activedescendant={`voice-option-${active}`}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {VOICES_CATALOG.map((voice, index) => {
        const isActive = index === active;
        return (
          <li key={voice.id} role="none">
            <button
              type="button"
              role="option"
              id={`voice-option-${index}`}
              aria-selected={isActive}
              tabIndex={-1}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className={
                isActive
                  ? "voices-rail-active group relative flex w-full flex-col gap-1 border-t border-[var(--ln-signal)] py-5 text-left outline-none md:py-6"
                  : "group relative flex w-full flex-col gap-1 border-t border-[var(--ln-hairline)] py-5 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)] md:py-6"
              }
            >
              <span className="flex items-baseline gap-3">
                <span
                  className={
                    isActive
                      ? "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]"
                      : "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)]"
                  }
                >
                  {voice.index}
                </span>
                <span
                  className={
                    isActive
                      ? "font-display text-base text-[var(--ln-mark)] md:text-lg"
                      : "font-display text-base text-[var(--ln-muted)] group-hover:text-[var(--ln-mark)] md:text-lg"
                  }
                >
                  {voice.name}
                </span>
              </span>
              <span
                className={
                  isActive
                    ? "pl-8 text-sm text-[var(--ln-muted)]"
                    : "pl-8 text-sm text-[var(--ln-faint)]"
                }
              >
                {voice.org}
              </span>
              {isActive ? (
                <span
                  className="voices-rail-scan absolute inset-x-0 bottom-0 h-px bg-[var(--ln-signal)]"
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
