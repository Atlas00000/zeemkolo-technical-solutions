import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { Text } from "@/design/primitives/Text";

export const metadata: Metadata = {
  title: "Terms | Zeemkolo",
  description: "Terms of use stub for Zeemkolo Technical Solutions.",
};

/** UI-M03 / W5 — Trust page with connect-blue atmosphere. */
export default function TermsPage() {
  return (
    <AppShell>
      <main
        className="relative isolate overflow-hidden text-[var(--ln-ink)]"
        data-legal-field
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `
              radial-gradient(
                ellipse 50% 40% at 80% 20%,
                color-mix(in srgb, var(--ln-signal) 12%, transparent),
                transparent 65%
              ),
              linear-gradient(
                160deg,
                var(--ln-canvas) 0%,
                color-mix(in srgb, var(--ln-signal) 3%, var(--ln-canvas-elevated)) 100%
              )
            `,
          }}
        />
        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-14 md:py-20">
          <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
            Legal
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] tracking-[-0.04em] text-[var(--ln-ink)]">
            Terms of use
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--ln-muted)]">
            Pre-launch stub. Binding terms publish before Phase 8 production
            cutover.
          </p>
          <div
            className="mt-8 h-px w-20 bg-[var(--ln-signal)] md:w-28"
            aria-hidden
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
            <div className="border-t border-[var(--ln-signal)] pt-8">
              <Text variant="body">
                Services, Zeemble content, and store purchases are provided
                as-is during development.
              </Text>
              <ul className="mt-8 space-y-4 border-t border-[var(--ln-hairline)] pt-6">
                {[
                  "Do not share matric codes or download tokens.",
                  "Payment providers remain placeholders until selection is final.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-[var(--ln-muted)]"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ln-signal)]"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
                <li className="flex gap-3 text-sm leading-relaxed text-[var(--ln-muted)]">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ln-signal)]"
                    aria-hidden
                  />
                  <span>
                    Questions:{" "}
                    <a
                      className="text-[var(--ln-signal)] underline-offset-2 hover:underline"
                      href="mailto:admin@zeemkolo.com"
                    >
                      admin@zeemkolo.com
                    </a>
                  </span>
                </li>
              </ul>
            </div>

            <aside className="border-t border-[var(--ln-hairline)] pt-6 lg:border-t-0 lg:border-l lg:border-[var(--ln-signal)] lg:pl-8 lg:pt-0">
              <Text
                variant="meta"
                className="uppercase tracking-[var(--ln-tracking-mark)]"
              >
                Status
              </Text>
              <Text variant="title" className="mt-3 text-xl">
                Draft · pre-cutover
              </Text>
              <Text variant="muted" className="mt-3 text-sm">
                Development terms only — not a substitute for production legal
                copy.
              </Text>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
