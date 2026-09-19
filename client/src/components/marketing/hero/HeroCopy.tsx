import Link from "next/link";
import { Button } from "@/design/primitives/Button";

/**
 * Brand-first copy — clear stack under (mobile) / beside (desktop) the field.
 */
export function HeroCopy() {
  return (
    <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-shell flex-col justify-end px-[var(--ln-page-x)] pb-14 pt-[48vh] md:justify-center md:pb-20 md:pt-24">
      <div className="w-full max-w-xl lg:max-w-2xl">
        <p className="hero-enter font-display text-[clamp(2.75rem,11vw,7.25rem)] leading-[0.88] tracking-[-0.05em] text-[var(--ln-ink)] break-words">
          Zeemkolo
        </p>

        <p
          className="hero-enter-delay mt-5 flex items-center gap-3 font-sans text-sm font-medium tracking-[0.3em] text-[var(--ln-signal)] uppercase md:text-base"
          style={{ animationDelay: "80ms" }}
        >
          <span
            className="hero-signal-dot inline-block size-1.5 shrink-0 rounded-full bg-[var(--ln-signal)]"
            aria-hidden
          />
          Technical Solutions
        </p>

        <div
          className="hero-enter-delay mt-8 h-px w-20 bg-[var(--ln-signal)] md:w-28"
          style={{ animationDelay: "140ms" }}
          aria-hidden
        />

        <h1
          className="hero-enter-delay mt-8 max-w-xl text-balance font-display text-[clamp(1.35rem,2.5vw,2.05rem)] leading-[1.25] tracking-[-0.02em] text-[var(--ln-ink)]"
          style={{ animationDelay: "180ms" }}
        >
          Embedded systems, hardware prototypes, and firmware — built with
          engineering rigor for teams that ship.
        </h1>

        <p
          className="hero-enter-delay mt-5 max-w-xl text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg"
          style={{ animationDelay: "240ms" }}
        >
          Zeemkolo Technical Solutions partners with industrial and product teams
          on schematic risk, MCU bring-up, and architecture decisions before the
          next board spin. The Zeemble Program trains engineers the same way —
          lab notes, code, and schematics behind a verified matric.
        </p>

        <p
          className="hero-enter-delay mt-4 max-w-lg text-pretty text-sm leading-relaxed text-[var(--ln-faint)] md:text-base"
          style={{ animationDelay: "280ms" }}
        >
          Book a scoped consultation when you need a clear risk list, or open
          Zeemble when you are ready to learn by building on the bench.
        </p>

        <div
          className="hero-enter-delay mt-10 flex flex-wrap items-center gap-x-5 gap-y-3"
          style={{ animationDelay: "320ms" }}
        >
          <Button asChild size="lg" className="hero-cta-primary min-w-[12rem]">
            <Link href="/consultation">Book a consultation</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="hero-cta-ghost">
            <Link href="/zeemble">Explore Zeemble</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
