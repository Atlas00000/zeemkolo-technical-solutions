import { VOICES_COPY } from "./voices-data";

export function VoicesHeader() {
  return (
    <header className="max-w-3xl">
      <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
        {VOICES_COPY.eyebrow}
      </p>
      <h2 className="mt-4 text-balance font-display text-[clamp(1.85rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ln-ink)]">
        {VOICES_COPY.title}
      </h2>
      <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
        {VOICES_COPY.body}
      </p>
      <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base">
        {VOICES_COPY.note}
      </p>
    </header>
  );
}
