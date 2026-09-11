import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#f3f6f4_0%,_#e8eee9_45%,_#dfe6e1_100%)]">
      <header className="border-b border-brand-steel/15 bg-brand-mist/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="font-display text-xs tracking-[0.22em] text-brand-signal uppercase">
              Zeemkolo
            </p>
            <p className="font-display text-lg text-brand-ink">Admin</p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-brand-steel">
            <Link href="/admin" className="hover:text-brand-ink">
              Dashboard
            </Link>
            <Link href="/" className="hover:text-brand-ink">
              Site
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
