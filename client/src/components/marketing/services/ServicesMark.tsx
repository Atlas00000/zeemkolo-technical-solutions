import type { ServiceType } from "@/components/consultation/types";

type ServicesMarkProps = {
  id: ServiceType;
  active?: boolean;
};

/**
 * Code-drawn instrument marks — unique per service, no clip art.
 */
export function ServicesMark({ id, active = true }: ServicesMarkProps) {
  const opacity = active ? 1 : 0.35;

  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 320 200"
      fill="none"
      aria-hidden
      style={{ opacity }}
    >
      {id === "Hardware Prototyping" ? <MarkHardware /> : null}
      {id === "Firmware Review" ? <MarkFirmware /> : null}
      {id === "Product Design" ? <MarkProduct /> : null}
      {id === "Embedded Systems Consulting" ? <MarkEmbedded /> : null}
      {id === "General Engineering Inquiry" ? <MarkInquiry /> : null}
    </svg>
  );
}

function MarkHardware() {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <rect x="48" y="36" width="224" height="128" stroke="var(--ln-hairline-strong)" />
      <path d="M48 72 H272 M48 128 H272 M96 36 V164 M224 36 V164" opacity="0.35" />
      <path
        d="M72 100 H120 V68 H168 V132 H216 V100 H248"
        stroke="var(--ln-signal)"
        strokeWidth="2"
        className="services-mark-draw"
      />
      <circle cx="120" cy="68" r="3.5" fill="var(--ln-signal)" />
      <circle cx="168" cy="132" r="3.5" fill="var(--ln-signal)" />
      <circle cx="216" cy="100" r="3.5" fill="var(--ln-canvas)" stroke="var(--ln-signal)" />
    </g>
  );
}

function MarkFirmware() {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <path d="M40 100 H280" opacity="0.25" />
      <path
        d="M40 100 H70 V60 H110 V140 H150 V80 H190 V120 H230 V70 H280"
        stroke="var(--ln-signal)"
        strokeWidth="2"
        className="services-mark-draw"
      />
      {[70, 110, 150, 190, 230].map((x) => (
        <circle key={x} cx={x} cy={100} r="2.5" fill="var(--ln-ink)" opacity="0.4" />
      ))}
      <text
        x="40"
        y="176"
        fill="var(--ln-muted)"
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "10px",
          letterSpacing: "0.16em",
        }}
      >
        CLK · GPIO · IRQ
      </text>
    </g>
  );
}

function MarkProduct() {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <rect x="56" y="48" width="140" height="100" opacity="0.35" />
      <rect
        x="100"
        y="72"
        width="140"
        height="100"
        stroke="var(--ln-signal)"
        strokeWidth="1.75"
        className="services-mark-draw"
      />
      <path d="M56 48 L100 72 M196 48 L240 72 M56 148 L100 172 M196 148 L240 172" opacity="0.35" />
      <circle cx="170" cy="122" r="4" fill="var(--ln-signal)" />
    </g>
  );
}

function MarkEmbedded() {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <circle cx="160" cy="100" r="22" stroke="var(--ln-signal)" strokeWidth="1.75" />
      <circle cx="70" cy="58" r="12" />
      <circle cx="250" cy="58" r="12" />
      <circle cx="70" cy="142" r="12" />
      <circle cx="250" cy="142" r="12" />
      <path
        d="M82 58 H138 M182 58 H238 M82 142 H138 M182 142 H238 M160 78 V58 M160 122 V142"
        stroke="var(--ln-signal)"
        className="services-mark-draw"
      />
      <circle cx="160" cy="100" r="5" fill="var(--ln-signal)" />
    </g>
  );
}

function MarkInquiry() {
  return (
    <g stroke="var(--ln-ink)" strokeWidth="1.25">
      <path d="M40 140 H280" opacity="0.25" />
      <path
        d="M60 140 C90 140 100 60 140 60 C180 60 180 140 220 140 C250 140 260 100 280 90"
        stroke="var(--ln-signal)"
        strokeWidth="2"
        className="services-mark-draw"
      />
      <circle cx="140" cy="60" r="4" fill="var(--ln-signal)" />
      <circle cx="220" cy="140" r="4" fill="var(--ln-canvas)" stroke="var(--ln-signal)" />
    </g>
  );
}
