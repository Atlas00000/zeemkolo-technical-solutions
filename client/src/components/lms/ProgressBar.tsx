"use client";

import { Text } from "@/design/primitives/Text";

type ProgressBarProps = {
  percent: number;
};

export function ProgressBar({ percent }: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Text variant="meta" className="uppercase tracking-[var(--ln-tracking-mark)]">
          Course progress
        </Text>
        <span className="ln-tabular text-xs text-[var(--ln-muted)]">{value}%</span>
      </div>
      <div className="h-1.5 bg-[var(--ln-plane-hover)]">
        <div
          className="h-full bg-[var(--ln-signal)] transition-[width] duration-[var(--ln-duration-tick)] ease-[var(--ln-ease-out)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
