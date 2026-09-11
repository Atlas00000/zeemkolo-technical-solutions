"use client";

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
    return <p className="text-sm text-brand-steel">Loading available slots…</p>;
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-brand-signal">
        No open slots in the next two weeks. Email admin@zeemkolo.com to arrange a time.
      </p>
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
    <div className="space-y-6">
      {Object.entries(byDay).map(([day, daySlots]) => (
        <div key={day}>
          <p className="mb-2 text-sm font-medium text-brand-steel">{day} (Africa/Lagos)</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => {
              const active = selected === slot.startsAt;
              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => onSelect(slot.startsAt)}
                  className={`px-3 py-2 text-sm ${
                    active
                      ? "bg-brand-ink text-white"
                      : "border border-brand-steel/20 text-brand-ink hover:border-brand-signal"
                  }`}
                >
                  {formatSlot(slot.startsAt)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
