import { SERVICES_HEADER } from "./services-catalog";

/**
 * Section intro — one job: name the catalog.
 */
export function ServicesHeader() {
  return (
    <header className="max-w-3xl">
      <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
        {SERVICES_HEADER.eyebrow}
      </p>
      <h2 className="mt-4 text-balance font-display text-[clamp(1.85rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ln-ink)]">
        {SERVICES_HEADER.title}
      </h2>
      <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
        {SERVICES_HEADER.body}
      </p>
      <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base">
        {SERVICES_HEADER.note}
      </p>
    </header>
  );
}
