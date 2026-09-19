"use client";

import Link from "next/link";
import { Button } from "@/design/primitives/Button";
import { ServicesMark } from "./ServicesMark";
import { useServicesSelection } from "./useServicesSelection";

/**
 * Live stage for the active service — open field, not a card.
 */
export function ServicesStage() {
  const { entry, active, reducedMotion } = useServicesSelection();

  return (
    <div className="relative flex min-h-[22rem] flex-col justify-between md:min-h-[28rem]">
      {/* Giant index watermark */}
      <p
        key={`wm-${active}`}
        className={
          reducedMotion
            ? "pointer-events-none absolute -right-2 -top-6 select-none font-display text-[clamp(6rem,18vw,11rem)] leading-none tracking-[-0.06em] text-[var(--ln-ink)] opacity-[0.06]"
            : "services-stage-enter pointer-events-none absolute -right-2 -top-6 select-none font-display text-[clamp(6rem,18vw,11rem)] leading-none tracking-[-0.06em] text-[var(--ln-ink)] opacity-[0.06]"
        }
        aria-hidden
      >
        {entry.index}
      </p>

      <div>
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
          {entry.mark}
        </p>

        <div
          key={`mark-${active}`}
          className={
            reducedMotion
              ? "mt-6 h-36 w-full max-w-md md:h-44"
              : "services-stage-enter mt-6 h-36 w-full max-w-md md:h-44"
          }
        >
          <ServicesMark id={entry.id} />
        </div>

        <h3
          key={`title-${active}`}
          className={
            reducedMotion
              ? "mt-8 font-display text-2xl tracking-tight text-[var(--ln-ink)] md:text-3xl lg:text-4xl"
              : "services-stage-enter mt-8 font-display text-2xl tracking-tight text-[var(--ln-ink)] md:text-3xl lg:text-4xl"
          }
          style={reducedMotion ? undefined : { animationDelay: "60ms" }}
        >
          {entry.title}
        </h3>

        <p
          key={`body-${active}`}
          className={
            reducedMotion
              ? "mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg"
              : "services-stage-enter mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg"
          }
          style={reducedMotion ? undefined : { animationDelay: "110ms" }}
        >
          {entry.body}
        </p>

        <p
          key={`detail-${active}`}
          className={
            reducedMotion
              ? "mt-3 max-w-xl text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base"
              : "services-stage-enter mt-3 max-w-xl text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base"
          }
          style={reducedMotion ? undefined : { animationDelay: "140ms" }}
        >
          {entry.detail}
        </p>
      </div>

      <div
        key={`cta-${active}`}
        className={
          reducedMotion
            ? "mt-10 flex flex-wrap items-center gap-4"
            : "services-stage-enter mt-10 flex flex-wrap items-center gap-4"
        }
        style={reducedMotion ? undefined : { animationDelay: "160ms" }}
      >
        <Button asChild size="lg">
          <Link href="/consultation">Book this engagement</Link>
        </Button>
        <span className="font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)]">
          CAT.{entry.index} · CONSULT
        </span>
      </div>
    </div>
  );
}
