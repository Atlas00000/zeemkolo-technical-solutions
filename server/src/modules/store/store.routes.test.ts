import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { env } from "../../config/env.js";
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

  it("Flutterwave webhook confirms by paymentRef", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        email: "phase5-webhook@example.com",
        currency: "USD",
        paymentProvider: "flutterwave",
        items: [{ productId, quantity: 1 }],
      },
    });
    const order = created.json();

    const webhook = await app.inject({
      method: "POST",
      url: "/payments/webhooks/flutterwave",
      payload: {
        event: "charge.completed",
        data: { tx_ref: order.paymentRef, status: "successful" },
      },
    });
    expect(webhook.statusCode).toBe(200);
    expect(webhook.json().ignored).toBe(false);
    expect(["PAID", "FULFILLED"]).toContain(webhook.json().order.status);
  });

  it("flutterwave initialize returns dev_placeholder without keys", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        email: "phase5-flw-init@example.com",
        currency: "NGN",
        paymentProvider: "flutterwave",
        items: [{ productId, quantity: 1 }],
      },
    });
    expect(created.statusCode).toBe(201);
    const order = created.json();

    const init = await app.inject({
      method: "POST",
      url: `/store/orders/${order.id}/flutterwave/initialize`,
    });
    expect(init.statusCode).toBe(200);
    expect(init.json().mode).toBe("dev_placeholder");
    expect(init.json().useConfirmTest).toBe(true);
  });

  it("paystack confirm returns 402 when charge not successful", async () => {
    if (!env.PAYSTACK_SECRET_KEY) return;

    const created = await app.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        email: "phase5-paystack-confirm@example.com",
        currency: "NGN",
        paymentProvider: "paystack",
        items: [{ productId, quantity: 1 }],
      },
    });
    expect(created.statusCode).toBe(201);
    const order = created.json();

    const confirm = await app.inject({
      method: "POST",
      url: `/store/orders/${order.id}/paystack/confirm`,
    });
    // Fake zk_ ref will not be successful on Paystack.
    expect(confirm.statusCode).toBe(402);
  });

  it("paystack initialize returns paymentUrl or dev_placeholder", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        email: "phase5-paystack-init@example.com",
        currency: "NGN",
        paymentProvider: "paystack",
        items: [{ productId, quantity: 1 }],
      },
    });
    expect(created.statusCode).toBe(201);
    const order = created.json();

    const init = await app.inject({
      method: "POST",
      url: `/store/orders/${order.id}/paystack/initialize`,
    });
    expect(init.statusCode).toBe(200);
    const body = init.json();
    if (env.PAYSTACK_SECRET_KEY) {
      expect(body.mode).toBe("paystack");
      expect(body.paymentUrl).toMatch(/^https:\/\//);
      expect(body.reference).toBe(order.paymentRef);
    } else {
      expect(body.mode).toBe("dev_placeholder");
      expect(body.useConfirmTest).toBe(true);
    }
  });

  it("Paystack webhook confirms by paymentRef", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        email: "phase5-paystack@example.com",
        currency: "USD",
        paymentProvider: "paystack",
        items: [{ productId, quantity: 1 }],
      },
    });
    const order = created.json();
    const payload = {
      event: "charge.success",
      data: { reference: order.paymentRef, status: "success" },
    };
    const raw = JSON.stringify(payload);
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (env.PAYSTACK_SECRET_KEY) {
      headers["x-paystack-signature"] = createHmac("sha512", env.PAYSTACK_SECRET_KEY)
        .update(raw)
        .digest("hex");
    }

    const webhook = await app.inject({
      method: "POST",
      url: "/payments/webhooks/paystack",
      headers,
      payload: raw,
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
