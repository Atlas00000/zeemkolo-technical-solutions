import Link from "next/link";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
      <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Checkout
      </p>
      <h1 className="mt-3 font-display text-4xl text-brand-ink">Complete your order</h1>
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
  );
}
