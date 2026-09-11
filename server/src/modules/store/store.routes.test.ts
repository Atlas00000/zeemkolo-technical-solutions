import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";

describe("store routes (Phase 5)", () => {
  let app: FastifyInstance;
  let productId: string;
  let startingStock: number;

  beforeAll(async () => {
    const { createApp } = await import("../../app.js");
    app = await createApp({ logger: false });
    await app.ready();

    const product = await prisma.product.findUnique({
      where: { slug: "starter-lab-kit" },
    });
    productId = product!.id;
    startingStock = product!.stock;
  });

  afterAll(async () => {
    if (productId) {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: startingStock },
      });
    }
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  });

  it("GET /store/products returns catalog", async () => {
    const res = await app.inject({ method: "GET", url: "/store/products" });
    expect(res.statusCode).toBe(200);
    expect(res.json().products.length).toBeGreaterThan(0);
  });

  it("POST order + confirm-test decrements stock", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        email: "phase5-route@example.com",
        currency: "NGN",
        paymentProvider: "stripe",
        items: [{ productId, quantity: 1 }],
      },
    });
    expect(created.statusCode).toBe(201);
    const order = created.json();
    expect(order.paymentRef).toBeTruthy();

    const confirmed = await app.inject({
      method: "POST",
      url: `/store/orders/${order.id}/confirm-test`,
    });
    expect(confirmed.statusCode).toBe(200);
    expect(["PAID", "FULFILLED"]).toContain(confirmed.json().status);

    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(product.stock).toBe(startingStock - 1);
  });

  it("Paystack webhook confirms by paymentRef", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        email: "phase5-webhook@example.com",
        currency: "USD",
        paymentProvider: "paystack",
        items: [{ productId, quantity: 1 }],
      },
    });
    const order = created.json();

    const webhook = await app.inject({
      method: "POST",
      url: "/payments/webhooks/paystack",
      payload: {
        event: "charge.success",
        data: { reference: order.paymentRef, status: "success" },
      },
    });
    expect(webhook.statusCode).toBe(200);
    expect(webhook.json().ignored).toBe(false);
    expect(["PAID", "FULFILLED"]).toContain(webhook.json().order.status);
  });

  it("download endpoint requires ownership", async () => {
    const handbook = await prisma.product.findUniqueOrThrow({
      where: { slug: "firmware-handbook" },
    });

    const created = await app.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        email: "phase5-dl@example.com",
        currency: "USD",
        paymentProvider: "paystack",
        items: [{ productId: handbook.id, quantity: 1 }],
      },
    });
    const order = created.json();
    await app.inject({
      method: "POST",
      url: `/store/orders/${order.id}/confirm-test`,
    });

    const denied = await app.inject({
      method: "POST",
      url: `/store/orders/${order.id}/downloads/${handbook.id}`,
    });
    expect(denied.statusCode).toBe(403);

    const allowed = await app.inject({
      method: "POST",
      url: `/store/orders/${order.id}/downloads/${handbook.id}?email=phase5-dl@example.com`,
    });
    expect(allowed.statusCode).toBe(200);
    expect(allowed.json().url).toBeTruthy();
    expect(allowed.json().expiresInSeconds).toBe(15 * 60);
  });
});
