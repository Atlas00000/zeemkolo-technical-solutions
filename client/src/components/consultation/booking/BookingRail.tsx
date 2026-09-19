"use client";

const STEPS = [
  { id: 1 as const, index: "01", label: "1 · Slot", short: "Slot" },
  { id: 2 as const, index: "02", label: "2 · Details", short: "Details" },
  { id: 3 as const, index: "03", label: "3 · Confirm", short: "Confirm" },
];

type Step = 1 | 2 | 3;

/**
 * Compact horizontal step strip — keeps the desk above the fold.
 */
export function BookingRail({
  step,
  onStep,
  unlocked,
}: {
  step: Step;
  onStep: (s: Step) => void;
  unlocked: Step;
}) {
  return (
    <nav aria-label="Booking steps" data-booking-rail>
      <ol className="flex flex-wrap items-stretch gap-0 border-b border-[var(--ln-hairline)]">
        {STEPS.map((s) => {
          const isActive = s.id === step;
          const canSelect = s.id <= unlocked;
          return (
            <li key={s.id} className="min-w-0 flex-1 sm:flex-none">
              <button
                type="button"
                aria-current={isActive ? "step" : undefined}
                disabled={!canSelect}
                onClick={() => canSelect && onStep(s.id)}
                className={
                  isActive
                    ? "booking-step-active relative flex w-full items-baseline gap-2 border-b-2 border-[var(--ln-signal)] px-3 py-3 text-left outline-none sm:min-w-[8.5rem] sm:px-4"
                    : "relative flex w-full items-baseline gap-2 border-b-2 border-transparent px-3 py-3 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)] disabled:opacity-40 sm:min-w-[8.5rem] sm:px-4"
                }
              >
                <span
                  className={
                    isActive
                      ? "ln-tabular font-mono text-[10px] tracking-[0.14em] text-[var(--ln-signal)] sm:text-xs"
                      : "ln-tabular font-mono text-[10px] tracking-[0.14em] text-[var(--ln-faint)] sm:text-xs"
                  }
                >
                  {s.index}
                </span>
                <span
                  className={
                    isActive
                      ? "font-display text-sm text-[var(--ln-ink)] sm:text-base"
                      : "font-display text-sm text-[var(--ln-muted)] sm:text-base"
                  }
                >
                  <span className="sm:hidden">{s.short}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
