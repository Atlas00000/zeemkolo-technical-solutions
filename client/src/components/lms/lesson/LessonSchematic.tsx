"use client";

import { useRef, useState } from "react";
import { Button } from "@/design/primitives/Button";

/**
 * Schematic plane — pan/zoom without Bootstrap box chrome.
 */
export function LessonSchematic({
  src,
  title = "Circuit schematic",
}: {
  src: string;
  title?: string;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );

  return (
    <section className="mt-12" data-lesson-schematic aria-label={title}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--ln-hairline)] pb-3">
        <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
          {title}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setScale((s) => Math.min(3, Number((s + 0.2).toFixed(2))))
            }
          >
            Zoom +
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setScale((s) => Math.max(0.5, Number((s - 0.2).toFixed(2))))
            }
          >
            Zoom −
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <div
        className="mt-4 h-72 cursor-grab overflow-hidden bg-[color-mix(in_srgb,var(--ln-signal)_4%,var(--ln-canvas-elevated))] active:cursor-grabbing"
        onPointerDown={(event) => {
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            ox: offset.x,
            oy: offset.y,
          };
          (event.currentTarget as HTMLDivElement).setPointerCapture(
            event.pointerId,
          );
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          setOffset({
            x: drag.current.ox + (event.clientX - drag.current.x),
            y: drag.current.oy + (event.clientY - drag.current.y),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </div>
    </section>
  );
}
