import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden text-white">
      {/* Full-bleed hero visual plane */}
      <div
        className="absolute inset-0 bg-[#0f1720] marketing-hero-pan"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/hero-lab.svg"
          alt=""
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1720]/95 via-[#0f1720]/75 to-[#0f1720]/35" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:pb-24">
        <p className="marketing-fade-up font-display text-4xl leading-none tracking-tight text-white md:text-6xl lg:text-7xl">
          Zeemkolo
          <span className="mt-2 block text-2xl tracking-[0.08em] text-brand-signal md:text-3xl">
            Technical Solutions
          </span>
        </p>
        <h1 className="marketing-fade-up-delay mt-8 max-w-xl font-display text-2xl leading-snug text-white/95 md:text-3xl">
          Embedded systems, hardware prototypes, and firmware — built with engineering rigor.
        </h1>
        <p className="marketing-fade-up-delay-2 mt-4 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
          Product consulting for industrial clients, and the Zeemble Program for engineers who learn by building.
        </p>
        <div className="marketing-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-none">
            <Link href="/consultation">Book a consultation</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-none border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/zeemble">Explore Zeemble</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
