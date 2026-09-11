import type { FastifyInstance } from "fastify";
import { ConsultationStatus, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../../middleware/clerk-auth.middleware.js";
import { requireAdmin } from "../../middleware/rbac.middleware.js";
import {
  AdminError,
  batchGenerateMatrics,
  getAdminOverview,
  listAuditLogs,
  listConsultations,
  listForumThreadsAdmin,
  listMatrics,
  listOrders,
  listProductsAdmin,
  revokeMatric,
  setForumThreadLocked,
  updateConsultationStatus,
  updateProduct,
  writeAuditLog,
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

const forumLockSchema = z.object({
  locked: z.boolean(),
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

function actorId(request: import("fastify").FastifyRequest): string {
  return request.auth!.user.id;
}

export async function adminRoutes(app: FastifyInstance) {
  const guard = { preHandler: [requireAuth, requireAdmin] };

  app.get("/admin/overview", guard, async () => {
    const overview = await getAdminOverview();
    return { overview };
  });

  app.get("/admin/audit", guard, async (request) => {
    const q = request.query as { limit?: string };
    const limit = q.limit ? Number(q.limit) : 50;
    const events = await listAuditLogs(Number.isFinite(limit) ? limit : 50);
    return { events };
  });

  app.get("/admin/matrics", guard, async (request) => {
    const q = request.query as { limit?: string; filter?: string };
    const limit = q.limit ? Number(q.limit) : 100;
    const filter =
      q.filter === "claimed" || q.filter === "unclaimed" || q.filter === "all"
        ? q.filter
        : "all";
    const matrics = await listMatrics({
      limit: Number.isFinite(limit) ? limit : 100,
      filter,
    });
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
      await writeAuditLog({
        actorId: actorId(request),
        action: "matrics.batch_generate",
        targetType: "matric",
        metadata: {
          year: result.year,
          count: result.count,
          first: result.codes[0] ?? null,
          last: result.codes[result.codes.length - 1] ?? null,
        },
      });
      return reply.status(201).send(result);
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });

  app.post("/admin/matrics/:id/revoke", guard, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await revokeMatric(id);
      await writeAuditLog({
        actorId: actorId(request),
        action: "matrics.revoke",
        targetType: "matric",
        targetId: result.id,
        metadata: {
          code: result.code,
          mode: result.mode,
          previousUserId:
            result.mode === "released" ? result.previousUserId : null,
        },
      });
      return result;
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });

  app.get("/admin/consultations", guard, async (request) => {
    const q = request.query as { status?: string };
    const status =
      q.status &&
      Object.values(ConsultationStatus).includes(q.status as ConsultationStatus)
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
      await writeAuditLog({
        actorId: actorId(request),
        action: "consultations.update_status",
        targetType: "consultation",
        targetId: updated.id,
        metadata: { status: updated.status, guestEmail: updated.guestEmail },
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
      await writeAuditLog({
        actorId: actorId(request),
        action: "products.update",
        targetType: "product",
        targetId: product.id,
        metadata: {
          slug: product.slug,
          stock: product.stock,
          isPublished: product.isPublished,
        },
      });
      return product;
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });

  app.get("/admin/forum/threads", guard, async (request) => {
    const q = request.query as { limit?: string };
    const limit = q.limit ? Number(q.limit) : 50;
    const threads = await listForumThreadsAdmin(
      Number.isFinite(limit) ? limit : 50,
    );
    return { threads };
  });

  app.patch("/admin/forum/threads/:id/lock", guard, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = forumLockSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        message: parsed.error.flatten(),
      });
    }

    try {
      const thread = await setForumThreadLocked({
        threadId: id,
        locked: parsed.data.locked,
      });
      await writeAuditLog({
        actorId: actorId(request),
        action: parsed.data.locked ? "forum.lock" : "forum.unlock",
        targetType: "forum_thread",
        targetId: thread.id,
        metadata: { title: thread.title, isLocked: thread.isLocked },
      });
      return thread;
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });
}
