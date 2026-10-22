/**
 * Upsert temporary ₦500 digital smoke SKU (paystack-smoke-pass).
 * Local:  pnpm exec tsx scripts/upsert-paystack-smoke-product.ts
 * Prod:   railway run --service zeemkolo-server pnpm exec tsx scripts/upsert-paystack-smoke-product.ts
 */
import { ProductType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.upsert({
    where: { slug: "paystack-smoke-pass" },
    update: {
      title: "Paystack Smoke Pass (temp)",
      description:
        "Temporary ₦500 digital item for live payment smoke tests. Safe to unpublish after cutover.",
      type: ProductType.DIGITAL,
      priceNgn: 50_000,
      priceUsd: 50,
      stock: 9999,
      digitalKey: "ebooks/paystack-smoke-pass.txt",
      isPublished: true,
    },
    create: {
      slug: "paystack-smoke-pass",
      title: "Paystack Smoke Pass (temp)",
      description:
        "Temporary ₦500 digital item for live payment smoke tests. Safe to unpublish after cutover.",
      type: ProductType.DIGITAL,
      priceNgn: 50_000,
      priceUsd: 50,
      stock: 9999,
      digitalKey: "ebooks/paystack-smoke-pass.txt",
      isPublished: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        id: product.id,
        slug: product.slug,
        priceNgnKobo: product.priceNgn,
        published: product.isPublished,
        url: `/store/${product.slug}`,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
