import { CTA_COPY } from "./cta-data";

export function CtaCopy() {
  return (
    <div className="relative z-10 max-w-2xl">
      <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
        {CTA_COPY.eyebrow}
      </p>
      <h2 className="mt-4 text-balance font-display text-[clamp(1.85rem,4.2vw,3.5rem)] leading-[1.02] tracking-[-0.03em] text-[var(--ln-ink)]">
        {CTA_COPY.title}
      </h2>
      <p className="mt-5 text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
        {CTA_COPY.body}
      </p>
      <p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base">
        {CTA_COPY.bodySecondary}
      </p>
    </div>
  );
}
