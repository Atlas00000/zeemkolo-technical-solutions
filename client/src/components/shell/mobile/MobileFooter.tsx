import Link from "next/link";
import { LEGAL_NAV_LINKS, PRIMARY_NAV_LINKS } from "@/components/shell/nav-links";

/** Compact mobile footer — brand mark, primary destinations, legal. */
export function MobileFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--ln-hairline)] bg-[var(--ln-canvas-elevated)] px-[var(--ln-page-x)] py-10 text-[var(--ln-muted)] md:hidden">
      <div className="mx-auto flex max-w-shell flex-col gap-8">
        <div>
          <p className="font-display text-base tracking-tight text-[var(--ln-ink)]">
            Zeemkolo
            <span className="text-[var(--ln-signal)]"> · </span>
            Technical Solutions
          </p>
          <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed">
            Product consulting, hardware engagements, and the Zeemble Program.
          </p>
        </div>

        <nav
          className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm"
          aria-label="Footer"
        >
          {PRIMARY_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-transparent pb-0.5 transition-colors hover:border-[var(--ln-signal)] hover:text-[var(--ln-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--ln-hairline)] pt-6 text-xs">
          {LEGAL_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--ln-faint)] transition-colors hover:text-[var(--ln-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
