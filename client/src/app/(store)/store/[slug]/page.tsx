import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { fetchStoreProduct } from "@/lib/api-client";
import { ProductPurchaseActions } from "@/components/store/ProductPurchaseActions";

export const revalidate = 60;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchStoreProduct(slug);
    return {
      title: `${product.title} | Zeemkolo store`,
      description: product.description.slice(0, 160),
    };
  } catch {
    return { title: "Product | Zeemkolo store" };
  }
}

export default async function StoreProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof fetchStoreProduct>> | null = null;
  try {
    product = await fetchStoreProduct(slug);
  } catch {
    notFound();
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
          {product.type === "DIGITAL" ? "Digital" : "Physical"}
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand-ink">
          {product.title}
        </h1>
        <p className="mt-3 max-w-2xl text-brand-steel/80">{product.description}</p>
        <p className="mt-4 text-sm text-brand-steel">
          {product.priceNgn.formatted} · {product.priceUsd.formatted} ·{" "}
          {product.stock} in stock
        </p>
        <div className="mt-8">
          <ProductPurchaseActions product={product} />
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
