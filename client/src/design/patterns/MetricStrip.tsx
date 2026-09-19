import * as React from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/design/primitives/Text";
import { NumberTick } from "@/design/motion/NumberTick";
import {
  toneClass,
  type VisualTone,
} from "@/design/map/backend-status";

export type MetricItem = {
  id: string;
  label: string;
  value: number;
  format?: (n: number) => string;
  tone?: VisualTone;
  hint?: string;
};

export type MetricStripProps = {
  items: MetricItem[];
  className?: string;
};

/**
 * Horizontal metric band — asymmetric widths, hairline separators, tabular ticks.
 */
export function MetricStrip({ items, className }: MetricStripProps) {
  return (
    <div
      data-slot="ln-metric-strip"
      className={cn(
        "grid gap-0 border border-[var(--ln-hairline)] bg-[var(--ln-canvas-elevated)] sm:grid-cols-[1.4fr_1fr_1fr]",
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "px-5 py-4",
            index > 0 && "border-t border-[var(--ln-hairline)] sm:border-t-0 sm:border-l"
          )}
        >
          <Text variant="meta" className="uppercase tracking-[var(--ln-tracking-mark)]">
            {item.label}
          </Text>
          <p
            className={cn(
              "mt-2 text-[length:var(--ln-text-2xl)] font-medium",
              toneClass[item.tone ?? "ink"]
            )}
          >
            <NumberTick value={item.value} format={item.format} />
          </p>
          {item.hint ? (
            <Text variant="meta" className="mt-1">
              {item.hint}
            </Text>
          ) : null}
        </div>
      ))}
    </div>
  );
}
