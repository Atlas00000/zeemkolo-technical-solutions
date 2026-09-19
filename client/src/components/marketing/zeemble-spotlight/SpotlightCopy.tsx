import Link from "next/link";
import { Button } from "@/design/primitives/Button";
import { SPOTLIGHT_COPY } from "./spotlight-data";

/**
 * Program pitch — brand-adjacent copy + CTAs. No cards.
 */
export function SpotlightCopy() {
  return (
    <div className="relative z-10 flex max-w-2xl flex-col justify-center">
      <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
        {SPOTLIGHT_COPY.eyebrow}
      </p>
      <h2 className="mt-4 text-balance font-display text-[clamp(1.85rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ln-ink)]">
        {SPOTLIGHT_COPY.title}
      </h2>
      <p className="mt-5 text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
        {SPOTLIGHT_COPY.body}
      </p>
      <p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base">
        {SPOTLIGHT_COPY.bodySecondary}
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button asChild size="lg">
          <Link href="/zeemble">Open the course library</Link>
        </Button>
        <Button asChild size="lg" variant="ghost" className="spotlight-cta-ghost">
          <Link href="/sign-up">Enroll / sign up</Link>
        </Button>
      </div>
    </div>
  );
}
