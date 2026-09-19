import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { fetchStoreOrder } from "@/lib/api-client";
import { OrderSuccessCard } from "@/components/store/OrderSuccessCard";
import { StoreAtmosphere } from "@/components/store/desk/StoreAtmosphere";
import "@/components/store/desk/store-motion.css";

type OrderPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  let order: Awaited<ReturnType<typeof fetchStoreOrder>> | null = null;
  try {
    order = await fetchStoreOrder(orderId);
  } catch {
    notFound();
  }

  return (
    <AppShell>
      <main
        className="relative isolate overflow-hidden text-[var(--ln-ink)]"
        data-store-desk
      >
        <StoreAtmosphere />
        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-14 md:py-20">
          <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
            Order
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.04em] text-[var(--ln-ink)]">
            Confirmation
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--ln-muted)]">
            Payment reference and digital download grants for this order.
          </p>
          <div
            className="mt-10 max-w-xl border-t border-[var(--ln-signal)] pt-8"
            data-store-stage
          >
            <OrderSuccessCard order={order} />
          </div>
          <Link
            href="/store"
            className="mt-12 inline-block text-sm text-[var(--ln-signal)] underline-offset-2 hover:underline"
          >
            ← Continue shopping
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
