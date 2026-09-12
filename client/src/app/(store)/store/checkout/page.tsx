import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Zeemkolo store",
  description: "Complete your Zeemkolo store order.",
};

export default function CheckoutPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-xl px-6 py-16">
        <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
          Checkout
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand-ink">
          Complete your order
        </h1>
        <div className="mt-8">
          <CheckoutForm />
        </div>
        <Link
          href="/store"
          className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
        >
          ← Back to store
        </Link>
      </main>
    </AppShell>
  );
}
