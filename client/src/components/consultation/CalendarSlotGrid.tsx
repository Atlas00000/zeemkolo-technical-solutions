"use client";

import { EmptyState } from "@/design/patterns/EmptyState";
import { SkeletonLine } from "@/design/patterns/Skeleton";
import { Text } from "@/design/primitives/Text";
import { cn } from "@/lib/utils";

export type SlotOption = {
  startsAt: string;
  timezone: string;
  durationMinutes: number;
};

type CalendarSlotGridProps = {
  slots: SlotOption[];
  selected: string | null;
  onSelect: (startsAt: string) => void;
  loading?: boolean;
};

function formatSlot(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function CalendarSlotGrid({
  slots,
  selected,
  onSelect,
  loading,
}: CalendarSlotGridProps) {
  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        <SkeletonLine className="w-40" />
        <SkeletonLine className="w-64" />
        <Text variant="meta">Loading available slots…</Text>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <EmptyState
        title="No open slots"
        description="No open slots in the next two weeks. Email admin@zeemkolo.com to arrange a time."
      />
    );
  }

  const byDay = slots.reduce<Record<string, SlotOption[]>>((acc, slot) => {
    const dayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(slot.startsAt));
    acc[dayKey] = acc[dayKey] ?? [];
    acc[dayKey].push(slot);
    return acc;
  }, {});

  return (
    <div
      className="max-h-[min(16rem,42svh)] space-y-4 overflow-y-auto overscroll-contain pr-1"
      data-slot-scroll
      role="listbox"
      aria-label="Available time slots"
    >
      {Object.entries(byDay).map(([day, daySlots]) => (
        <div key={day}>
          <Text variant="meta" className="mb-2 uppercase tracking-[var(--ln-tracking-mark)]">
            {day} · Africa/Lagos
          </Text>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => {
              const active = selected === slot.startsAt;
              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onSelect(slot.startsAt)}
                  className={cn(
                    "border px-3 py-2 text-sm transition-colors",
                    active
                      ? "border-[var(--ln-signal)] bg-[var(--ln-signal)] text-[var(--ln-signal-foreground)]"
                      : "border-[var(--ln-hairline-strong)] text-[var(--ln-ink)] hover:border-[var(--ln-signal)]",
                  )}
                >
                  <span className="ln-tabular">{formatSlot(slot.startsAt)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
