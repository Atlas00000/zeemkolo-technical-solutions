import type { FastifyInstance } from "fastify";
import { Currency } from "@prisma/client";
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
import { createDownloadGrant, verifyDownloadToken } from "../../utils/r2-signed-url.js";
import {
  StorageError,
  isR2Required,
} from "../../utils/object-storage.js";
import {
  handlePaystackEvent,
  handleStripeEvent,
  verifyPaystackSignature,
  verifyStripeSignature,
} from "../payments/payment-webhooks.js";

const currencySchema = z.enum(["NGN", "USD"]);

const createOrderSchema = z.object({
  email: z.string().email(),
  currency: currencySchema,
  paymentProvider: z.enum(["paystack", "stripe"]),
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

function sendStoreError(reply: import("fastify").FastifyReply, error: unknown) {
  if (error instanceof StoreError) {
    return reply.status(error.statusCode).send({
      error: "StoreError",
      message: error.message,
    });
  }
  if (error instanceof StorageError) {
    return reply.status(error.statusCode).send({
      error: "StorageError",
      message: error.message,
    });
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
      return sendStoreError(reply, error);
    }
  });

  app.post(
    "/store/orders",
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const parsed = createOrderSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "ValidationError",
          message: parsed.error.flatten(),
        });
      }

      try {
        const order = await createOrder({
          email: parsed.data.email,
          currency: parsed.data.currency as Currency,
          items: parsed.data.items,
          userId: request.auth?.user.id,
          paymentProvider: parsed.data.paymentProvider,
        });
        return reply.status(201).send({
          ...order,
          checkout: {
            message:
              env.NODE_ENV === "production"
                ? "Complete payment with your selected provider using paymentRef."
                : "In development, POST /store/orders/:id/confirm-test to simulate payment.",
            paymentRef: order.paymentRef,
          },
        });
      } catch (error) {
        return sendStoreError(reply, error);
      }
    },
  );

  app.get("/store/orders/:orderId", async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    try {
      return await getOrderById(orderId);
    } catch (error) {
      return sendStoreError(reply, error);
    }
  });

  app.post("/store/orders/:orderId/confirm-test", async (request, reply) => {
    if (env.NODE_ENV === "production") {
      return reply.status(404).send({ error: "NotFound" });
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
      return sendStoreError(reply, error);
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
        return sendStoreError(reply, error);
      }
    },
  );

  app.get("/store/downloads/file", async (request, reply) => {
    if (isR2Required()) {
      return reply.status(503).send({
        error: "StorageError",
        message: "Local download stub is disabled when R2 is required",
      });
    }

    const q = request.query as { token?: string };
    if (!q.token) {
      return reply.status(400).send({ error: "Missing token" });
    }
    const verified = verifyDownloadToken(q.token);
    if (!verified) {
      return reply.status(403).send({ error: "Invalid or expired download token" });
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

  app.post("/payments/webhooks/paystack", async (request, reply) => {
    const raw =
      typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body ?? {});
    const signature = request.headers["x-paystack-signature"];
    if (!verifyPaystackSignature(raw, Array.isArray(signature) ? signature[0] : signature)) {
      return reply.status(401).send({ error: "Invalid Paystack signature" });
    }

    try {
      const result = await handlePaystackEvent(
        (typeof request.body === "object" && request.body
          ? request.body
          : JSON.parse(raw)) as {
          event?: string;
          data?: { reference?: string; status?: string };
        },
      );
      return { ok: true, ...result };
    } catch (error) {
      return sendStoreError(reply, error);
    }
  });

  app.post("/payments/webhooks/stripe", async (request, reply) => {
    const raw =
      typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body ?? {});
    const signature = request.headers["stripe-signature"];
    if (!verifyStripeSignature(raw, Array.isArray(signature) ? signature[0] : signature)) {
      return reply.status(401).send({ error: "Invalid Stripe signature" });
    }

    try {
      const result = await handleStripeEvent(
        (typeof request.body === "object" && request.body
          ? request.body
          : JSON.parse(raw)) as {
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
      return sendStoreError(reply, error);
    }
  });
}
