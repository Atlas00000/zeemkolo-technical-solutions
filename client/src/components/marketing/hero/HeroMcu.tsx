/** MCU package drawn into the schematic SVG — desktop visual half. */
export function HeroMcu() {
  return (
    <g className="hero-mcu-package">
      <rect
        x="220"
        y="210"
        width="170"
        height="210"
        fill="var(--ln-ink)"
        opacity="0.92"
      />
      <rect
        x="248"
        y="240"
        width="114"
        height="150"
        fill="none"
        stroke="var(--ln-signal)"
        strokeWidth="1.4"
        opacity="0.85"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={`pin-${i}`}>
          <rect
            x={204}
            y={228 + i * 20}
            width={16}
            height={8}
            fill="var(--ln-signal)"
          />
          <rect
            x={390}
            y={228 + i * 20}
            width={16}
            height={8}
            fill="color-mix(in srgb, var(--ln-ink) 45%, var(--ln-canvas))"
          />
        </g>
      ))}
      <text
        x="305"
        y="325"
        textAnchor="middle"
        fill="var(--ln-canvas)"
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "13px",
          letterSpacing: "0.28em",
        }}
      >
        MCU
      </text>
      <text
        x="305"
        y="348"
        textAnchor="middle"
        fill="var(--ln-signal)"
        opacity="0.9"
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "10px",
          letterSpacing: "0.14em",
        }}
      >
        CORE.A
      </text>
    </g>
  );
}
