"use client";

import { VOICES_CATALOG } from "./voices-data";
import { useVoices } from "./useVoices";

/**
 * Auto-advance progress — instrument tick, not a Bootstrap progress bar chrome.
 */
export function VoicesProgress() {
  const { progress, paused, reducedMotion, active, setActive } = useVoices();

  if (reducedMotion) {
    return (
      <div className="flex gap-2" role="tablist" aria-label="Voice index">
        {VOICES_CATALOG.map((v, i) => (
          <button
            key={v.id}
            type="button"
            aria-label={`Show voice ${v.index}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => setActive(i)}
            className={
              i === active
                ? "h-px w-8 bg-[var(--ln-signal)]"
                : "h-px w-8 bg-[var(--ln-hairline-strong)]"
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className="h-px max-w-[8rem] flex-1 bg-[var(--ln-hairline)]">
        <div
          className="h-px bg-[var(--ln-signal)]"
          style={{
            width: `${progress * 100}%`,
            opacity: paused ? 0.35 : 1,
          }}
        />
      </div>
      <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
        {paused ? "hold" : "auto"}
      </span>
    </div>
  );
}
