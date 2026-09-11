import { Currency, ProductType } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";
import {
  confirmOrderPaid,
  createOrder,
  getProductBySlug,
  listProducts,
} from "./store.service.js";
import {
  issueDownloadToken,
  verifyDownloadToken,
} from "../../utils/r2-signed-url.js";

describe("store.service (Phase 5)", () => {
  let productId: string;
  let startingStock: number;

  beforeAll(async () => {
    const product = await prisma.product.findUnique({
      where: { slug: "firmware-handbook" },
    });
    expect(product).toBeTruthy();
    productId = product!.id;
    startingStock = product!.stock;
  });

  afterAll(async () => {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: startingStock },
    });
    await prisma.$disconnect();
    redis.disconnect();
  });

  it("lists published products with formatted prices", async () => {
    const products = await listProducts(Currency.NGN);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]!.price.formatted).toMatch(/^₦/);
    const usd = await getProductBySlug("firmware-handbook", Currency.USD);
    expect(usd.price.formatted).toMatch(/^\$/);
    expect(usd.type).toBe(ProductType.DIGITAL);
  });

  it("creates pending order and confirms payment with stock decrement", async () => {
    const before = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    const order = await createOrder({
      email: "phase5-buyer@example.com",
      currency: Currency.USD,
      paymentProvider: "paystack",
      items: [{ productId, quantity: 1 }],
    });

    expect(order.status).toBe("PENDING");
    expect(order.paymentRef).toBeTruthy();

    const mid = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(mid.stock).toBe(before.stock);

    const paid = await confirmOrderPaid({
      paymentRef: order.paymentRef!,
      provider: "paystack",
    });

    expect(["PAID", "FULFILLED"]).toContain(paid.status);
    expect(paid.downloadsAvailable.length).toBe(1);

    const after = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(after.stock).toBe(before.stock - 1);
  });

  it("issues and verifies 15-minute download tokens", () => {
    const issued = issueDownloadToken({
      orderId: "ord_test",
      productId: "prod_test",
      digitalKey: "ebooks/firmware-handbook.pdf",
    });
    expect(issued.expiresInSeconds).toBe(15 * 60);
    const verified = verifyDownloadToken(issued.token);
    expect(verified?.orderId).toBe("ord_test");
    expect(verified?.digitalKey).toBe("ebooks/firmware-handbook.pdf");
  });
});
