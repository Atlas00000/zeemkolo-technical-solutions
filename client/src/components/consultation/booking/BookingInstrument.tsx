"use client";

import { useBookingDesk } from "./useBookingDesk";

/**
 * Large schematic instrument — morphs with Slot / Details / Confirm.
 * Hairline geometry only; no clip art or emoji.
 */
export function BookingInstrument() {
  const { step, reducedMotion } = useBookingDesk();
  const animate = !reducedMotion;

  return (
    <div
      className="booking-instrument relative aspect-[5/4] w-full max-w-md self-end lg:max-w-none"
      data-booking-instrument
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--ln-signal)_6%,transparent),transparent_55%)]" />
      <svg
        key={step}
        className={
          animate
            ? "booking-instrument-enter relative h-full w-full"
            : "relative h-full w-full"
        }
        viewBox="0 0 320 256"
        fill="none"
      >
        {/* Frame — open plane, not a Bootstrap card */}
        <path
          d="M24 32 H296 V224 H24 Z"
          stroke="var(--ln-hairline-strong)"
          strokeWidth="1.25"
        />
        <path
          d="M24 56 H296"
          stroke="var(--ln-hairline)"
          strokeWidth="1"
          opacity="0.7"
        />
        <circle cx="40" cy="44" r="3" fill="var(--ln-signal)" />
        <circle cx="54" cy="44" r="3" fill="var(--ln-ink)" opacity="0.25" />
        <circle cx="68" cy="44" r="3" fill="var(--ln-ink)" opacity="0.25" />

        {step === 1 ? <InstrumentSlot animate={animate} /> : null}
        {step === 2 ? <InstrumentBrief animate={animate} /> : null}
        {step === 3 ? <InstrumentConfirm animate={animate} /> : null}
      </svg>
    </div>
  );
}

function InstrumentSlot({ animate }: { animate: boolean }) {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      {/* Calendar matrix */}
      {[80, 112, 144, 176, 208].map((y) => (
        <path
          key={y}
          d={`M48 ${y} H272`}
          stroke="var(--ln-hairline-strong)"
          opacity="0.35"
        />
      ))}
      {[48, 92, 136, 180, 224, 272].map((x) => (
        <path
          key={x}
          d={`M${x} 80 V208`}
          stroke="var(--ln-hairline-strong)"
          opacity="0.35"
        />
      ))}
      {/* Selected cell */}
      <rect
        x="136"
        y="112"
        width="44"
        height="32"
        fill="var(--ln-signal)"
        stroke="var(--ln-signal)"
        className={animate ? "booking-mark-pulse" : undefined}
      />
      {/* Sweep cursor */}
      <path
        d="M48 160 H272"
        stroke="var(--ln-signal)"
        strokeWidth="1.5"
        opacity="0.7"
        className={animate ? "booking-mark-draw" : undefined}
      />
    </g>
  );
}

function InstrumentBrief({ animate }: { animate: boolean }) {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <path
        d="M56 76 H264 V208 H56 Z"
        stroke="var(--ln-hairline-strong)"
      />
      <path
        d="M72 100 H248 M72 124 H220 M72 148 H236 M72 172 H190 M72 196 H210"
        stroke="var(--ln-signal)"
        strokeWidth="2"
        className={animate ? "booking-mark-draw" : undefined}
      />
      <path
        d="M248 76 L264 92 V208"
        stroke="var(--ln-hairline)"
        opacity="0.5"
      />
      <text
        x="56"
        y="68"
        fill="var(--ln-signal)"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.16em"
      >
        INTAKE · BRIEF
      </text>
    </g>
  );
}

function InstrumentConfirm({ animate }: { animate: boolean }) {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <path
        d="M60 88 H260 V200 H60 Z"
        stroke="var(--ln-hairline-strong)"
      />
      <path
        d="M60 88 L160 148 L260 88"
        stroke="var(--ln-signal)"
        strokeWidth="1.75"
        className={animate ? "booking-mark-draw" : undefined}
      />
      <circle
        cx="160"
        cy="148"
        r="7"
        fill="var(--ln-signal)"
        className={animate ? "booking-mark-pulse" : undefined}
      />
      <path
        d="M100 176 H220"
        stroke="var(--ln-mark)"
        strokeWidth="2"
        opacity="0.85"
      />
      <text
        x="60"
        y="76"
        fill="var(--ln-signal)"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.16em"
      >
        CONFIRM · HOLD
      </text>
    </g>
  );
}
