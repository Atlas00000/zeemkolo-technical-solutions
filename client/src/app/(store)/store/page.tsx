import Link from "next/link";
import { StoreCatalog } from "@/components/store/StoreCatalog";

export default function StorePage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Shop
      </p>
      <h1 className="mt-3 font-display text-4xl text-brand-ink">Zeemkolo store</h1>
      <p className="mt-3 max-w-2xl text-brand-steel/80">
        Lab kits and digital handbooks. Prices in NGN or USD; digital purchases unlock
        timed downloads.
      </p>
      <div className="mt-10">
        <StoreCatalog />
      </div>
      <Link
        href="/"
        className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
      >
        ← Back home
      </Link>
    </main>
  );
}
