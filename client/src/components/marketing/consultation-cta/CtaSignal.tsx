"use client";

import { useCta } from "./useCta";

type CtaSignalProps = {
  step: "slot" | "brief" | "invite";
};

/**
 * Code-drawn booking signal — morphs with active step. No clip art.
 */
export function CtaSignal({ step }: CtaSignalProps) {
  const { reducedMotion } = useCta();
  const animate = !reducedMotion;

  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 280 160"
      fill="none"
      aria-hidden
    >
      {step === "slot" ? <MarkSlot animate={animate} /> : null}
      {step === "brief" ? <MarkBrief animate={animate} /> : null}
      {step === "invite" ? <MarkInvite animate={animate} /> : null}
    </svg>
  );
}

function MarkSlot({ animate }: { animate: boolean }) {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <rect x="40" y="28" width="200" height="110" stroke="var(--ln-hairline-strong)" />
      <path d="M40 52 H240" opacity="0.4" />
      {[70, 110, 150, 190].map((x) => (
        <path key={x} d={`M${x} 52 V138`} opacity="0.25" />
      ))}
      {[72, 96, 120].map((y) => (
        <path key={y} d={`M40 ${y} H240`} opacity="0.25" />
      ))}
      <rect
        x="150"
        y="72"
        width="40"
        height="24"
        fill="var(--ln-signal)"
        stroke="var(--ln-signal)"
        className={animate ? "cta-mark-pulse" : undefined}
      />
      <circle cx="70" cy="40" r="3" fill="var(--ln-signal)" />
    </g>
  );
}

function MarkBrief({ animate }: { animate: boolean }) {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <path d="M56 36 H224 V132 H56 Z" stroke="var(--ln-hairline-strong)" />
      <path
        d="M76 58 H204 M76 78 H180 M76 98 H196 M76 118 H150"
        stroke="var(--ln-signal)"
        strokeWidth="2"
        className={animate ? "cta-mark-draw" : undefined}
      />
    </g>
  );
}

function MarkInvite({ animate }: { animate: boolean }) {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <path d="M48 48 H232 V120 H48 Z" stroke="var(--ln-hairline-strong)" />
      <path
        d="M48 48 L140 92 L232 48"
        stroke="var(--ln-signal)"
        strokeWidth="1.75"
        className={animate ? "cta-mark-draw" : undefined}
      />
      <circle
        cx="140"
        cy="92"
        r="5"
        fill="var(--ln-signal)"
        className={animate ? "cta-mark-pulse" : undefined}
      />
    </g>
  );
}
