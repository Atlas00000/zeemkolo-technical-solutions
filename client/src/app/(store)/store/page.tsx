import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { StoreCatalog } from "@/components/store/StoreCatalog";

export const metadata: Metadata = {
  title: "Store | Zeemkolo",
  description:
    "Lab kits and digital handbooks from Zeemkolo. Prices in NGN or USD.",
};

export default function StorePage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
          Shop
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand-ink">
          Zeemkolo store
        </h1>
        <p className="mt-3 max-w-2xl text-brand-steel/80">
          Lab kits and digital handbooks. Prices in NGN or USD; digital purchases
          unlock timed downloads.
        </p>
        <div className="mt-10">
          <StoreCatalog />
        </div>
      </main>
    </AppShell>
  );
}
