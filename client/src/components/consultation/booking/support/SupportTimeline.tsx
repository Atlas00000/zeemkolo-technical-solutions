"use client";

import { SUPPORT_AFTER, SUPPORT_BEFORE } from "./support-data";
import { useSupport } from "./useSupport";

/**
 * Before / After instrument — tab strip + staged timeline. Not two boxed columns.
 */
export function SupportTimeline() {
  const { timeline, setTimeline, reducedMotion } = useSupport();
  const items = timeline === "before" ? SUPPORT_BEFORE : SUPPORT_AFTER;

  return (
    <div data-support-timeline className="relative z-10 mt-16 md:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
            Engagement timeline
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--ln-muted)]">
            {timeline === "before"
              ? "What to have ready before you pick a slot."
              : "What happens once the desk confirms your hold."}
          </p>
        </div>
        <div
          className="flex gap-1"
          role="tablist"
          aria-label="Before or after booking"
        >
          {(
            [
              { id: "before" as const, label: "Before you book" },
              { id: "after" as const, label: "After you confirm" },
            ] as const
          ).map((tab) => {
            const active = timeline === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTimeline(tab.id)}
                className={
                  active
                    ? "support-tab-active relative border-b-2 px-4 py-3 font-display text-sm text-[var(--ln-ink)] md:text-base"
                    : "relative border-b-2 border-transparent px-4 py-3 font-display text-sm text-[var(--ln-muted)] transition-colors hover:text-[var(--ln-ink)] md:text-base"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mt-3 h-px w-full bg-[var(--ln-hairline)]"
        aria-hidden
      />

      <div
        key={timeline}
        role="tabpanel"
        className={
          reducedMotion
            ? "mt-10 grid gap-8 md:grid-cols-3 md:gap-0"
            : "support-stage-enter mt-10 grid gap-8 md:grid-cols-3 md:gap-0"
        }
      >
        {items.map((item, i) => (
          <article
            key={item.index}
            className={
              i === 0
                ? "md:pr-8"
                : "border-t border-[var(--ln-hairline)] pt-8 md:border-t-0 md:border-l md:border-[var(--ln-hairline)] md:pt-0 md:pl-8 md:pr-8"
            }
          >
            <p className="ln-tabular font-mono text-xs tracking-[0.16em] text-[var(--ln-signal)]">
              {item.index}
            </p>
            <h3 className="mt-3 font-display text-xl tracking-tight text-[var(--ln-ink)] md:text-2xl">
              {item.title}
            </h3>
            <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-[var(--ln-muted)]">
              {item.body}
            </p>
            <div
              className="mt-6 h-px w-12 bg-[var(--ln-signal)] opacity-80"
              aria-hidden
            />
          </article>
        ))}
      </div>
    </div>
  );
}
