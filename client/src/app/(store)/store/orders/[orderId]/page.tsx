import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchStoreOrder } from "@/lib/api-client";
import { OrderSuccessCard } from "@/components/store/OrderSuccessCard";

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
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
      <OrderSuccessCard order={order} />
      <Link
        href="/store"
        className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
      >
        ← Continue shopping
      </Link>
    </main>
  );
}
