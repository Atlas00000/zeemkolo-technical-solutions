"use client";

import { useRef, useState } from "react";

type SchematicViewerProps = {
  src: string;
  title?: string;
};

export function SchematicViewer({ src, title = "Schematic" }: SchematicViewerProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-brand-steel">{title}</p>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            className="border border-brand-steel/20 px-2 py-1"
            onClick={() => setScale((s) => Math.min(3, Number((s + 0.2).toFixed(2))))}
          >
            Zoom +
          </button>
          <button
            type="button"
            className="border border-brand-steel/20 px-2 py-1"
            onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.2).toFixed(2))))}
          >
            Zoom −
          </button>
          <button
            type="button"
            className="border border-brand-steel/20 px-2 py-1"
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div
        className="h-64 cursor-grab overflow-hidden border border-brand-steel/20 bg-brand-mist active:cursor-grabbing"
        onPointerDown={(event) => {
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            ox: offset.x,
            oy: offset.y,
          };
          (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
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
    </div>
  );
}
