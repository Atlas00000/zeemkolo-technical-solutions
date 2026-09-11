import type { FastifyInstance } from "fastify";
import { ConsultationStatus, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../../middleware/clerk-auth.middleware.js";
import { requireAdmin } from "../../middleware/rbac.middleware.js";
import {
  AdminError,
  batchGenerateMatrics,
  listConsultations,
  listMatrics,
  listOrders,
  listProductsAdmin,
  updateConsultationStatus,
  updateProduct,
} from "./admin.service.js";

const batchMatricSchema = z.object({
  count: z.number().int().min(1).max(200),
  year: z.number().int().min(2020).max(2100).optional(),
});

const consultationStatusSchema = z.object({
  status: z.nativeEnum(ConsultationStatus),
});

const productUpdateSchema = z.object({
  stock: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  priceNgn: z.number().int().min(0).optional(),
  priceUsd: z.number().int().min(0).optional(),
});

function sendAdminError(reply: import("fastify").FastifyReply, error: unknown) {
  if (error instanceof AdminError) {
    return reply.status(error.statusCode).send({
      error: "AdminError",
      message: error.message,
    });
  }
  throw error;
}

export async function adminRoutes(app: FastifyInstance) {
  const guard = { preHandler: [requireAuth, requireAdmin] };

  app.get("/admin/matrics", guard, async (request) => {
    const q = request.query as { limit?: string };
    const limit = q.limit ? Number(q.limit) : 100;
    const matrics = await listMatrics(limit);
    return { matrics };
  });

  app.post("/admin/matrics/batch", guard, async (request, reply) => {
    const parsed = batchMatricSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        message: parsed.error.flatten(),
      });
    }

    try {
      const result = await batchGenerateMatrics(parsed.data);
      return reply.status(201).send(result);
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });

  app.get("/admin/consultations", guard, async (request) => {
    const q = request.query as { status?: string };
    const status =
      q.status && Object.values(ConsultationStatus).includes(q.status as ConsultationStatus)
        ? (q.status as ConsultationStatus)
        : undefined;
    const consultations = await listConsultations({ status });
    return { consultations };
  });

  app.patch("/admin/consultations/:id/status", guard, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = consultationStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        message: parsed.error.flatten(),
      });
    }

    try {
      const updated = await updateConsultationStatus({
        consultationId: id,
        status: parsed.data.status,
      });
      return updated;
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });

  app.get("/admin/orders", guard, async (request) => {
    const q = request.query as { status?: string };
    const status =
      q.status && Object.values(OrderStatus).includes(q.status as OrderStatus)
        ? (q.status as OrderStatus)
        : undefined;
    const orders = await listOrders({ status });
    return { orders };
  });

  app.get("/admin/products", guard, async () => {
    const products = await listProductsAdmin();
    return { products };
  });

  app.patch("/admin/products/:id", guard, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = productUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        message: parsed.error.flatten(),
      });
    }

    try {
      const product = await updateProduct({
        productId: id,
        ...parsed.data,
      });
      return product;
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });
}
