import Link from "next/link";
import { FOOTER_NAV_LINKS } from "@/components/shell/nav-links";

/** Shared site footer — Ledger Noir elevated void + hairline. Desktop (`md+`). */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--ln-hairline)] bg-[var(--ln-canvas-elevated)] px-[var(--ln-page-x)] py-12 text-[var(--ln-muted)]">
      <div className="mx-auto flex max-w-shell flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-lg">
          <p className="font-display text-lg tracking-tight text-[var(--ln-ink)]">
            Zeemkolo
            <span className="text-[var(--ln-signal)]"> · </span>
            Technical Solutions
          </p>
          <p className="mt-2 text-pretty text-sm leading-relaxed">
            Executive engineering OS for product consulting, hardware and
            firmware engagements, and the Zeemble Program — lab learning gated
            by matric for verified students.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {FOOTER_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-transparent transition-colors hover:border-[var(--ln-signal)] hover:text-[var(--ln-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

/** @deprecated Prefer SiteFooter — kept for existing marketing imports. */
export function MarketingFooter() {
  return <SiteFooter />;
}
