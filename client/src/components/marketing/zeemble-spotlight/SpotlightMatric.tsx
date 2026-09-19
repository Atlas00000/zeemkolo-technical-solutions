"use client";

import { useEffect, useState } from "react";
import { SPOTLIGHT_COPY, SPOTLIGHT_MATRIC_DEMO } from "./spotlight-data";
import { useSpotlight } from "./useSpotlight";

const SCRAMBLE = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function scrambleToward(target: string, tick: number): string {
  return target
    .split("")
    .map((ch, i) => {
      if (ch === "-") return "-";
      if (tick > i + 4) return ch;
      return SCRAMBLE[(tick * 7 + i * 3) % SCRAMBLE.length]!;
    })
    .join("");
}

/**
 * Interactive matric instrument — demo readout, not a real claim.
 * Hover previews issue; click locks / clears the demo claim.
 */
export function SpotlightMatric() {
  const {
    claimed,
    setClaimed,
    live,
    setPreviewing,
    reducedMotion,
  } = useSpotlight();
  const [display, setDisplay] = useState("ZMB-····-···");
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    if (!live) {
      setDisplay("ZMB-····-···");
      setIssuing(false);
      return;
    }
    if (reducedMotion) {
      setDisplay(SPOTLIGHT_MATRIC_DEMO);
      setIssuing(false);
      return;
    }

    setIssuing(true);
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      setDisplay(scrambleToward(SPOTLIGHT_MATRIC_DEMO, tick));
      if (tick > SPOTLIGHT_MATRIC_DEMO.length + 6) {
        window.clearInterval(id);
        setDisplay(SPOTLIGHT_MATRIC_DEMO);
        setIssuing(false);
      }
    }, 42);
    return () => window.clearInterval(id);
  }, [live, reducedMotion]);

  return (
    <div className="relative">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
          Access gate
        </p>
        <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
          {live ? (issuing ? "gate.issue" : "gate.allow") : "gate.skip"}
        </p>
      </div>

      <button
        type="button"
        className="spotlight-matric group mt-5 w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ln-signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ln-canvas)]"
        aria-pressed={claimed}
        aria-label={
          claimed
            ? `Demo matric ${SPOTLIGHT_MATRIC_DEMO}. Activate to clear.`
            : "Activate to lock a sample matric readout"
        }
        onMouseEnter={() => setPreviewing(true)}
        onMouseLeave={() => setPreviewing(false)}
        onFocus={() => setPreviewing(true)}
        onBlur={() => setPreviewing(false)}
        onClick={() => setClaimed(!claimed)}
      >
        <p
          className={
            live
              ? "font-display text-[clamp(2rem,6vw,3.75rem)] leading-none tracking-[-0.04em] text-[var(--ln-signal)]"
              : "font-display text-[clamp(2rem,6vw,3.75rem)] leading-none tracking-[-0.04em] text-[var(--ln-muted)] transition-colors group-hover:text-[var(--ln-ink)]"
          }
        >
          <span className="ln-tabular font-mono tracking-[0.06em]">{display}</span>
        </p>
        <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-[var(--ln-faint)] uppercase">
          {claimed
            ? "demo readout · click to clear"
            : live
              ? "demo readout · click to lock"
              : "hover or press to issue"}
        </p>
      </button>

      <p className="mt-8 max-w-md text-pretty text-sm leading-relaxed text-[var(--ln-muted)] md:max-w-sm md:text-base">
        {SPOTLIGHT_COPY.matricNote}
      </p>

      <div className="mt-6 flex items-center gap-2">
        <span
          className={
            live
              ? "spotlight-pulse inline-block size-1.5 rounded-full bg-[var(--ln-signal)]"
              : "inline-block size-1.5 rounded-full bg-[var(--ln-faint)]"
          }
          aria-hidden
        />
        <span
          className={
            live
              ? "font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]"
              : "font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)]"
          }
        >
          {live ? "gate.allow · matric claimed" : "gate.skip · guest preview"}
        </span>
      </div>
    </div>
  );
}
