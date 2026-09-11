import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-brand-ink px-6 py-12 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg text-white">Zeemkolo Technical Solutions</p>
          <p className="mt-1 text-sm">zeemkolo.com · Engineering & Zeemble Program</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/consultation" className="hover:text-white">
            Consultation
          </Link>
          <Link href="/zeemble" className="hover:text-white">
            Zeemble
          </Link>
          <Link href="/store" className="hover:text-white">
            Store
          </Link>
          <Link href="/forum" className="hover:text-white">
            Forum
          </Link>
          <Link href="/sign-in" className="hover:text-white">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
