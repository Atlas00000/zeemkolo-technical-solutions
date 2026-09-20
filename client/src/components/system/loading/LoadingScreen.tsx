"use client";

import { useEffect, useState } from "react";
import { SignalOrb } from "@/components/system/field/SignalOrb";
import { TraceGrid } from "@/components/system/field/TraceGrid";

const STATUS_LINES = [
  "Locking signal",
  "Tracing routes",
  "Syncing ledger",
  "Warming stage",
] as const;

type LoadingScreenProps = {
  label?: string;
};

/** Full-viewport loading theatre — field, magnetic orb, cycling status. */
export function LoadingScreen({ label }: LoadingScreenProps) {
  const [tick, setTick] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setTick((n) => (n + 1) % STATUS_LINES.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [reduced]);

  const status = label ?? STATUS_LINES[tick]!;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="relative isolate flex min-h-[70vh] flex-1 flex-col items-center justify-center overflow-hidden px-[var(--ln-page-x)] py-20 text-[var(--ln-ink)]"
    >
      <TraceGrid glyph="SYNC" accent="signal" />

      <div className="relative z-10 flex flex-col items-center gap-10">
        <p className="font-sans text-sm font-medium tracking-[0.32em] text-[var(--ln-signal)] uppercase">
          Zeemkolo
        </p>

        <SignalOrb mode="loading" />

        <div className="flex flex-col items-center gap-3 text-center">
          <p
            key={status}
            className="sys-status font-display text-[clamp(1.75rem,5vw,3rem)] leading-none tracking-[-0.04em] text-[var(--ln-ink)]"
          >
            {status}
            <span className="text-[var(--ln-mark)]">…</span>
          </p>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-[var(--ln-muted)]">
            Engineering surface coming online — keep the pointer near the core
            to feel the signal pull.
          </p>
          <div
            className="mt-2 h-px w-24 overflow-hidden bg-[var(--ln-hairline-strong)]"
            aria-hidden
          >
            <div
              className="h-px w-full origin-left bg-[var(--ln-signal)]"
              style={{
                animation: reduced
                  ? undefined
                  : "sys-status-flash 1.2s ease-in-out infinite",
                transformOrigin: "left center",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
