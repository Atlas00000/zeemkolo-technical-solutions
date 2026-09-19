import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { StoreAtmosphere } from "@/components/store/desk/StoreAtmosphere";
import "@/components/store/desk/store-motion.css";

export const metadata: Metadata = {
  title: "Checkout | Zeemkolo store",
  description: "Complete your Zeemkolo store order.",
};

export default function CheckoutPage() {
  return (
    <AppShell>
      <main
        className="relative isolate overflow-hidden text-[var(--ln-ink)]"
        data-store-desk
      >
        <StoreAtmosphere />
        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-14 md:py-20">
          <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
            Checkout
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.04em] text-[var(--ln-ink)]">
            Complete your order
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--ln-muted)]">
            Review cart totals, choose currency, and confirm payment.
          </p>
          <div
            className="mt-10 max-w-xl border-t border-[var(--ln-signal)] pt-8"
            data-store-stage
          >
            <CheckoutForm />
          </div>
          <Link
            href="/store"
            className="mt-12 inline-block text-sm text-[var(--ln-signal)] underline-offset-2 hover:underline"
          >
            ← Back to store
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
