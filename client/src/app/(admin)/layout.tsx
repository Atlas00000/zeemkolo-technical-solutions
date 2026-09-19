import Link from "next/link";

/**
 * UI-A01 / W5 — Admin chrome: denser Ledger Noir desk (ops, not marketing).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[var(--ln-canvas)] text-[var(--ln-ink)]"
      data-admin-desk
    >
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--ln-signal)] focus:px-3 focus:py-2 focus:text-[var(--ln-signal-foreground)]"
      >
        Skip to admin content
      </a>
      <header className="sticky top-0 z-20 border-b border-[var(--ln-hairline)] bg-[color-mix(in_srgb,var(--ln-canvas)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 border-l-2 border-l-[var(--ln-signal)] px-[var(--ln-page-x)] py-4 pl-[calc(var(--ln-page-x)+2px)]">
          <div>
            <p className="font-display text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
              Zeemkolo
            </p>
            <p className="font-display text-lg text-[var(--ln-ink)]">
              Admin desk
            </p>
          </div>
          <nav
            className="flex flex-wrap items-center gap-4 text-sm text-[var(--ln-muted)]"
            aria-label="Admin chrome"
          >
            <Link
              href="/admin"
              className="border-b border-transparent pb-0.5 hover:border-[var(--ln-signal)] hover:text-[var(--ln-ink)]"
            >
              Dashboard
            </Link>
            <Link
              href="/ui"
              className="border-b border-transparent pb-0.5 hover:border-[var(--ln-signal)] hover:text-[var(--ln-ink)]"
            >
              UI system
            </Link>
            <Link
              href="/"
              className="border-b border-transparent pb-0.5 hover:border-[var(--ln-signal)] hover:text-[var(--ln-ink)]"
            >
              Site
            </Link>
          </nav>
        </div>
      </header>
      <div
        id="admin-main"
        className="mx-auto max-w-shell px-[var(--ln-page-x)] py-10"
      >
        {children}
      </div>
    </div>
  );
}
