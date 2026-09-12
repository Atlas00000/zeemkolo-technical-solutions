import Link from "next/link";

const links = [
  { href: "/consultation", label: "Consultation" },
  { href: "/zeemble", label: "Zeemble" },
  { href: "/store", label: "Store" },
  { href: "/forum", label: "Forum" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/sign-in", label: "Sign in" },
];

/** Shared site footer (O6.1 / O6.6). */
export function SiteFooter() {
  return (
    <footer className="bg-brand-ink px-6 py-12 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg text-white">
            Zeemkolo Technical Solutions
          </p>
          <p className="mt-1 text-sm">
            zeemkolo.com · Engineering & Zeemble Program
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
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
