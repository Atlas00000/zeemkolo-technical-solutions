"use client";

import Link from "next/link";
import { SignalOrb } from "@/components/system/field/SignalOrb";
import { TraceGrid } from "@/components/system/field/TraceGrid";
import { Button } from "@/design/primitives/Button";
import { PRIMARY_NAV_LINKS } from "@/components/shell/nav-links";

/** Full-viewport 404 theatre — lost signal, interactive core, escape routes. */
export function NotFoundScreen() {
  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden text-[var(--ln-ink)]">
      <TraceGrid glyph="404" accent="mark" />

      <div className="relative z-10 mx-auto flex w-full max-w-shell flex-1 flex-col justify-center gap-12 px-[var(--ln-page-x)] py-24 md:flex-row md:items-center md:justify-between md:gap-16">
        <div className="max-w-xl">
          <p className="font-sans text-sm font-medium tracking-[0.32em] text-[var(--ln-mark)] uppercase">
            Signal lost
          </p>
          <h1 className="mt-5 font-display text-[clamp(3.5rem,14vw,8rem)] leading-[0.88] tracking-[-0.06em] text-[var(--ln-ink)]">
            This route
            <span className="block text-[var(--ln-signal)]">went dark.</span>
          </h1>
          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
            The page you asked for isn&apos;t on the ledger. Probe the core —
            sparks fire on contact — then jump back onto a live path.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/">Return home</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/consultation">Book consultation</Link>
            </Button>
          </div>

          <nav
            className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--ln-hairline)] pt-8 text-sm"
            aria-label="Alive destinations"
          >
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-transparent pb-0.5 text-[var(--ln-muted)] transition-colors hover:border-[var(--ln-signal)] hover:text-[var(--ln-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-4 md:items-end">
          <SignalOrb mode="lost" className="md:scale-110" />
          <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--ln-faint)] uppercase">
            Tap the core · chase the mark
          </p>
        </div>
      </div>
    </div>
  );
}
