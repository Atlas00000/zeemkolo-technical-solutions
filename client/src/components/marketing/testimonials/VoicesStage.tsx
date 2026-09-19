"use client";

import { VoicesProgress } from "./VoicesProgress";
import { useVoices } from "./useVoices";

/**
 * Live quote stage — open field, not a quote card.
 */
export function VoicesStage() {
  const { entry, active, reducedMotion, setPaused } = useVoices();

  return (
    <div
      className="relative flex min-h-[18rem] flex-col justify-between md:min-h-[24rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p
        key={`wm-${active}`}
        className={
          reducedMotion
            ? "pointer-events-none absolute -right-1 -top-4 select-none font-display text-[clamp(5rem,16vw,10rem)] leading-none tracking-[-0.06em] text-[var(--ln-ink)] opacity-[0.06]"
            : "voices-stage-enter pointer-events-none absolute -right-1 -top-4 select-none font-display text-[clamp(5rem,16vw,10rem)] leading-none tracking-[-0.06em] text-[var(--ln-ink)] opacity-[0.06]"
        }
        aria-hidden
      >
        {entry.index}
      </p>

      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
            {entry.tag}
          </p>
          <VoicesProgress />
        </div>

        {/* Signal mark — hairline, not a card */}
        <div
          className="voices-quote-mark mt-8 h-px w-16 bg-[var(--ln-signal)] md:w-24"
          aria-hidden
        />

        <blockquote
          key={`q-${active}`}
          className={
            reducedMotion
              ? "mt-8 max-w-2xl text-pretty font-display text-[clamp(1.25rem,2.8vw,2.1rem)] leading-[1.28] tracking-[-0.02em] text-[var(--ln-ink)]"
              : "voices-stage-enter mt-8 max-w-2xl text-pretty font-display text-[clamp(1.25rem,2.8vw,2.1rem)] leading-[1.28] tracking-[-0.02em] text-[var(--ln-ink)]"
          }
        >
          {entry.quote}
        </blockquote>
      </div>

      <footer
        key={`f-${active}`}
        className={
          reducedMotion
            ? "mt-10 border-t border-[var(--ln-hairline)] pt-5"
            : "voices-stage-enter mt-10 border-t border-[var(--ln-hairline)] pt-5"
        }
        style={reducedMotion ? undefined : { animationDelay: "90ms" }}
      >
        <p className="font-display text-lg text-[var(--ln-mark)]">{entry.name}</p>
        <p className="mt-1 text-sm text-[var(--ln-muted)]">{entry.org}</p>
      </footer>
    </div>
  );
}
