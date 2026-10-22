import type { FastifyInstance } from "fastify";
import { Currency, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { optionalAuth } from "../../middleware/optional-auth.middleware.js";
import { env } from "../../config/env.js";
import {
  StoreError,
  confirmOrderPaid,
  createOrder,
  getOrderById,
  getProductBySlug,
  listProducts,
} from "./store.service.js";
import { prisma } from "../../config/db.js";
import { sendApiError } from "../../utils/api-error.js";
import {
  beginIdempotency,
  getIdempotentResponse,
  readIdempotencyKey,
  saveIdempotentResponse,
} from "../../utils/idempotency.js";
import { createDownloadGrant, verifyDownloadToken } from "../../utils/r2-signed-url.js";
import {
  StorageError,
  isR2Required,
} from "../../utils/object-storage.js";
import {
  handleFlutterwaveEvent,
  handlePaystackEvent,
  handleStripeEvent,
  verifyFlutterwaveSignature,
  verifyPaystackSignature,
  verifyStripeSignature,
} from "../payments/payment-webhooks.js";
import {
  flutterwaveConfigured,
  initializeFlutterwavePayment,
} from "../payments/flutterwave.js";
import {
  initializePaystackPayment,
  paystackConfigured,
  verifyPaystackByReference,
} from "../payments/paystack.js";

const currencySchema = z.enum(["NGN", "USD"]);

const createOrderSchema = z.object({
  email: z.string().email(),
  currency: currencySchema,
  paymentProvider: z.enum(["paystack", "stripe", "flutterwave"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1)
    .max(20),
});

function paymentCallbackBaseUrl() {
  const configured = env.PAYMENT_CALLBACK_BASE_URL.trim().replace(/\/$/, "");
  if (configured) return configured;
  const firstCors = env.CORS_ORIGIN.split(",")[0]?.trim().replace(/\/$/, "");
  return firstCors || "http://localhost:3000";
}
function sendStoreError(
  request: import("fastify").FastifyRequest,
  reply: import("fastify").FastifyReply,
  error: unknown,
) {
  if (error instanceof StoreError) {
    return sendApiError(
      request,
      reply,
      error.statusCode,
      "StoreError",
      error.message,
    );
  }
  if (error instanceof StorageError) {
    return sendApiError(
      request,
      reply,
      error.statusCode,
      "StorageError",
      error.message,
    );
  }
  throw error;
}

export async function storeRoutes(app: FastifyInstance) {
  app.get("/store/products", async (request) => {
    const q = request.query as { currency?: string };
    const currency =
      q.currency === "USD" ? Currency.USD : Currency.NGN;
    const products = await listProducts(currency);
    return { products, currency };
  });

  app.get("/store/products/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const q = request.query as { currency?: string };
    const currency =
      q.currency === "USD" ? Currency.USD : Currency.NGN;
    try {
      const product = await getProductBySlug(slug, currency);
      return product;
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });

  app.post(
    "/store/orders",
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const parsed = createOrderSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendApiError(
          request,
          reply,
          400,
          "ValidationError",
          JSON.stringify(parsed.error.flatten()),
          "validation_failed",
        );
      }

      const idemKey = readIdempotencyKey(request.headers["idempotency-key"]);
      if (idemKey) {
        const phase = await beginIdempotency("store-orders", idemKey);
        if (phase === "replay") {
          const cached = await getIdempotentResponse("store-orders", idemKey);
          return reply.status(cached!.statusCode).send(cached!.body);
        }
        if (phase === "inflight") {
          return sendApiError(
            request,
            reply,
            409,
            "IdempotencyConflict",
            "Idempotency key is already in progress",
            "idempotency_inflight",
          );
        }
      }

      try {
        const order = await createOrder({
          email: parsed.data.email,
          currency: parsed.data.currency as Currency,
          items: parsed.data.items,
          userId: request.auth?.user.id,
          paymentProvider: parsed.data.paymentProvider,
        });
        const body = {
          ...order,
          checkout: {
            message: paystackConfigured()
              ? "Complete payment via Paystack using POST /store/orders/:id/paystack/initialize."
              : flutterwaveConfigured()
                ? "Complete payment via Flutterwave using POST /store/orders/:id/flutterwave/initialize."
                : env.NODE_ENV === "production"
                  ? "Payment provider is not configured."
                  : "In development, POST /store/orders/:id/confirm-test to simulate payment, or configure Paystack.",
            paymentRef: order.paymentRef,
            provider: order.paymentProvider,
          },
        };
        if (idemKey) {
          await saveIdempotentResponse("store-orders", idemKey, {
            statusCode: 201,
            body,
          });
        }
        return reply.status(201).send(body);
      } catch (error) {
        return sendStoreError(request, reply, error);
      }
    },
  );

  app.get("/store/orders/:orderId", async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    try {
      return await getOrderById(orderId);
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });

  app.post("/store/orders/:orderId/confirm-test", async (request, reply) => {
    if (env.NODE_ENV === "production") {
      return sendApiError(request, reply, 404, "NotFound", "Not found");
    }
    const { orderId } = request.params as { orderId: string };
    try {
      const current = await getOrderById(orderId);
      if (!current.paymentRef) {
        throw new StoreError("Order missing paymentRef", 400);
      }
      const order = await confirmOrderPaid({
        paymentRef: current.paymentRef,
        provider: current.paymentProvider ?? "test",
      });
      return order;
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });

  app.post("/store/orders/:orderId/paystack/initialize", async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new StoreError("Order not found", 404);
      if (order.status !== OrderStatus.PENDING) {
        throw new StoreError(`Order cannot be paid from status ${order.status}`, 409);
      }
      if (!order.paymentRef) {
        throw new StoreError("Order missing paymentRef", 400);
      }
      if (order.paymentProvider && order.paymentProvider !== "paystack") {
        throw new StoreError("Order is not a Paystack checkout", 400);
      }

      if (!paystackConfigured()) {
        if (env.NODE_ENV === "production") {
          throw new StoreError("Paystack is not configured", 503);
        }
        return {
          mode: "dev_placeholder" as const,
          paymentUrl: null,
          reference: order.paymentRef,
          useConfirmTest: true,
        };
      }

      const callbackUrl = `${paymentCallbackBaseUrl()}/store/orders/${order.id}`;
      const init = await initializePaystackPayment({
        email: order.email,
        amountMinor: order.totalAmount,
        currency: order.currency as "NGN" | "USD",
        reference: order.paymentRef,
        callbackUrl,
        orderId: order.id,
      });

      if (!order.paymentProvider) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentProvider: "paystack" },
        });
      }

      return init;
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });

  /**
   * Return-path confirm: after Paystack redirects the buyer back, the order page
   * calls this to verify the charge and mark PAID without waiting for a webhook
   * (needed for local E2E; also useful if webhooks are delayed).
   */
  app.post("/store/orders/:orderId/paystack/confirm", async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new StoreError("Order not found", 404);
      if (!order.paymentRef) {
        throw new StoreError("Order missing paymentRef", 400);
      }
      if (order.paymentProvider && order.paymentProvider !== "paystack") {
        throw new StoreError("Order is not a Paystack checkout", 400);
      }

      if (
        order.status === OrderStatus.PAID ||
        order.status === OrderStatus.FULFILLED
      ) {
        return getOrderById(orderId);
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new StoreError(
          `Order cannot be confirmed from status ${order.status}`,
          409,
        );
      }

      if (!paystackConfigured()) {
        throw new StoreError("Paystack is not configured", 503);
      }

      const ok = await verifyPaystackByReference(order.paymentRef);
      if (!ok) {
        throw new StoreError("Payment not yet confirmed by Paystack", 402);
      }

      return confirmOrderPaid({
        paymentRef: order.paymentRef,
        provider: "paystack",
      });
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });

  app.post("/store/orders/:orderId/flutterwave/initialize", async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new StoreError("Order not found", 404);
      if (order.status !== OrderStatus.PENDING) {
        throw new StoreError(`Order cannot be paid from status ${order.status}`, 409);
      }
      if (!order.paymentRef) {
        throw new StoreError("Order missing paymentRef", 400);
      }
      if (order.paymentProvider && order.paymentProvider !== "flutterwave") {
        throw new StoreError("Order is not a Flutterwave checkout", 400);
      }

      if (!flutterwaveConfigured()) {
        if (env.NODE_ENV === "production") {
          throw new StoreError("Flutterwave is not configured", 503);
        }
        return {
          mode: "dev_placeholder" as const,
          paymentUrl: null,
          reference: order.paymentRef,
          useConfirmTest: true,
        };
      }

      const callbackUrl = `${paymentCallbackBaseUrl()}/store/orders/${order.id}`;
      const init = await initializeFlutterwavePayment({
        email: order.email,
        amountMinor: order.totalAmount,
        currency: order.currency as "NGN" | "USD",
        reference: order.paymentRef,
        callbackUrl,
        orderId: order.id,
      });

      if (!order.paymentProvider) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentProvider: "flutterwave" },
        });
      }

      return init;
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });

  app.post(
    "/store/orders/:orderId/downloads/:productId",
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { orderId, productId } = request.params as {
        orderId: string;
        productId: string;
      };
      const q = request.query as { email?: string };

      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: { include: { product: true } },
          },
        });
        if (!order) throw new StoreError("Order not found", 404);
        if (order.status !== "PAID" && order.status !== "FULFILLED") {
          throw new StoreError("Order is not paid", 403);
        }

        const email = q.email?.toLowerCase();
        const owns =
          (request.auth?.user.id && order.userId === request.auth.user.id) ||
          (email && order.email === email) ||
          (request.auth?.user.email &&
            order.email === request.auth.user.email.toLowerCase());
        if (!owns) {
          throw new StoreError("Forbidden — provide purchase email or sign in", 403);
        }

        const item = order.items.find((i) => i.productId === productId);
        if (!item?.product.digitalKey) {
          throw new StoreError("Digital asset not found", 404);
        }

        const grant = await createDownloadGrant({
          orderId: order.id,
          productId: item.product.id,
          digitalKey: item.product.digitalKey,
        });

        return {
          productId: item.product.id,
          title: item.product.title,
          ...grant,
        };
      } catch (error) {
        return sendStoreError(request, reply, error);
      }
    },
  );

  app.get("/store/downloads/file", async (request, reply) => {
    if (isR2Required()) {
      return sendApiError(
        request,
        reply,
        503,
        "StorageError",
        "Local download stub is disabled when R2 is required",
        "r2_required",
      );
    }

    const q = request.query as { token?: string };
    if (!q.token) {
      return sendApiError(
        request,
        reply,
        400,
        "ValidationError",
        "Missing token",
        "missing_token",
      );
    }
    const verified = verifyDownloadToken(q.token);
    if (!verified) {
      return sendApiError(
        request,
        reply,
        403,
        "Forbidden",
        "Invalid or expired download token",
        "download_token_invalid",
      );
    }

    // Local/dev fallback: return a small text stand-in for the ebook.
    const body = [
      `Zeemkolo digital download`,
      `order=${verified.orderId}`,
      `product=${verified.productId}`,
      `key=${verified.digitalKey}`,
      `expires=${verified.exp}`,
      ``,
      `Replace this stub with R2 object bytes when the bucket is configured.`,
    ].join("\n");

    return reply
      .header("Content-Type", "text/plain; charset=utf-8")
      .header(
        "Content-Disposition",
        `attachment; filename="zeemkolo-${verified.productId}.txt"`,
      )
      .send(body);
  });

  app.post("/payments/webhooks/flutterwave", async (request, reply) => {
    const verifHash = request.headers["verif-hash"];
    if (
      !verifyFlutterwaveSignature(
        Array.isArray(verifHash) ? verifHash[0] : verifHash,
      )
    ) {
      return sendApiError(
        request,
        reply,
        401,
        "Unauthorized",
        "Invalid Flutterwave signature",
        "webhook_signature_invalid",
      );
    }

    try {
      const result = await handleFlutterwaveEvent(
        (request.body ?? {}) as {
          event?: string;
          data?: {
            tx_ref?: string;
            status?: string;
            id?: number | string;
          };
        },
      );
      return { ok: true, ...result };
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });

  app.post("/payments/webhooks/paystack", async (request, reply) => {
    const raw = request.rawBody ?? "";
    const signature = request.headers["x-paystack-signature"];
    if (
      !verifyPaystackSignature(
        raw,
        Array.isArray(signature) ? signature[0] : signature,
      )
    ) {
      return sendApiError(
        request,
        reply,
        401,
        "Unauthorized",
        "Invalid Paystack signature",
        "webhook_signature_invalid",
      );
    }

    try {
      const result = await handlePaystackEvent(
        (request.body ?? {}) as {
          event?: string;
          data?: { reference?: string; status?: string };
        },
      );
      return { ok: true, ...result };
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });

  app.post("/payments/webhooks/stripe", async (request, reply) => {
    const raw = request.rawBody ?? "";
    const signature = request.headers["stripe-signature"];
    if (
      !verifyStripeSignature(
        raw,
        Array.isArray(signature) ? signature[0] : signature,
      )
    ) {
      return sendApiError(
        request,
        reply,
        401,
        "Unauthorized",
        "Invalid Stripe signature",
        "webhook_signature_invalid",
      );
    }

    try {
      const result = await handleStripeEvent(
        (request.body ?? {}) as {
          type?: string;
          data?: {
            object?: {
              metadata?: { paymentRef?: string };
              payment_status?: string;
            };
          };
        },
      );
      return { ok: true, ...result };
    } catch (error) {
      return sendStoreError(request, reply, error);
    }
  });
}
