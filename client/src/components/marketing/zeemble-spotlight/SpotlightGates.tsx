"use client";

import { SPOTLIGHT_GATES } from "./spotlight-data";
import { useSpotlight } from "./useSpotlight";

/**
 * Interactive gate rail — shows what matric unlocks.
 * Open hairlines, not boxed cards.
 */
export function SpotlightGates() {
  const { activeGate, setActiveGate, live } = useSpotlight();

  return (
    <ul
      className="mt-10 flex flex-col border-t border-[var(--ln-hairline)]"
      role="listbox"
      aria-label="Zeemble access gates"
    >
      {SPOTLIGHT_GATES.map((gate) => {
        const isActive = gate.id === activeGate;
        const unlocked = !gate.locked || live;
        return (
          <li key={gate.id} role="none">
            <button
              type="button"
              role="option"
              aria-selected={isActive}
              onMouseEnter={() => setActiveGate(gate.id)}
              onFocus={() => setActiveGate(gate.id)}
              onClick={() => setActiveGate(gate.id)}
              className={
                isActive
                  ? "spotlight-gate-active relative flex w-full items-start gap-4 border-b border-[var(--ln-signal)] py-4 text-left outline-none"
                  : "relative flex w-full items-start gap-4 border-b border-[var(--ln-hairline)] py-4 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)]"
              }
            >
              <span
                className={
                  isActive
                    ? "ln-tabular shrink-0 font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]"
                    : "ln-tabular shrink-0 font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)]"
                }
              >
                {gate.index}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={
                    isActive
                      ? "block font-display text-base text-[var(--ln-ink)] md:text-lg"
                      : "block font-display text-base text-[var(--ln-muted)] md:text-lg"
                  }
                >
                  {gate.label}
                </span>
                {isActive ? (
                  <span className="spotlight-gate-detail mt-1 block text-sm text-[var(--ln-muted)]">
                    {gate.detail}
                  </span>
                ) : null}
              </span>
              <span
                className={
                  unlocked
                    ? "shrink-0 font-mono text-[10px] tracking-[0.16em] text-[var(--ln-signal)] uppercase"
                    : "shrink-0 font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase"
                }
              >
                {unlocked ? "allow" : "halt"}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
