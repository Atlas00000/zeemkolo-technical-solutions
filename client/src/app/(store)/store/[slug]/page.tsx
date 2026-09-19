import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { fetchStoreProduct } from "@/lib/api-client";
import { ProductPurchaseActions } from "@/components/store/ProductPurchaseActions";
import { StoreAtmosphere } from "@/components/store/desk/StoreAtmosphere";
import { Badge } from "@/design/primitives/Badge";
import { Text } from "@/design/primitives/Text";
import { publishGate, gateTone } from "@/design/map/backend-status";
import "@/components/store/desk/store-motion.css";

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

  const stockGate = product.stock > 0 ? "allow" : "halt";

  return (
    <AppShell>
      <main
        className="relative isolate overflow-hidden text-[var(--ln-ink)]"
        data-store-desk
      >
        <StoreAtmosphere />
        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-14 md:py-20">
          <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
            {product.type === "DIGITAL" ? "Digital" : "Physical"}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.04em] text-[var(--ln-ink)]">
            {product.title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
            {product.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone={gateTone(publishGate(true))}>{product.type}</Badge>
            <Badge tone={gateTone(stockGate)}>
              {product.stock > 0
                ? `${product.stock} in stock`
                : "Out of stock"}
            </Badge>
          </div>

          <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
            <div
              className="min-w-0 flex-1 border-t border-[var(--ln-signal)] pt-6"
              data-store-stage
            >
              <Text variant="metric" className="text-xl">
                {product.priceNgn.formatted}
                <span className="mx-2 text-[var(--ln-faint)]">·</span>
                {product.priceUsd.formatted}
              </Text>
              <div className="mt-6">
                <ProductPurchaseActions product={product} />
              </div>
            </div>
            <aside className="border-t border-[var(--ln-hairline)] pt-6 lg:w-56 lg:shrink-0 lg:border-t-0 lg:border-l lg:border-[var(--ln-hairline)] lg:pl-8 lg:pt-0">
              <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
                Purchase
              </p>
              <p className="mt-3 text-sm text-[var(--ln-muted)]">
                Add to cart or buy now. Digital items unlock timed downloads
                after confirmation.
              </p>
            </aside>
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
