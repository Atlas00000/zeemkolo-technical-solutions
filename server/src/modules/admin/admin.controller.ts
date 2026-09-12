import type { FastifyInstance } from "fastify";
import { ConsultationStatus, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../../middleware/clerk-auth.middleware.js";
import { requireAdmin } from "../../middleware/rbac.middleware.js";
import {
  AdminError,
  batchGenerateMatrics,
  createProduct,
  getAdminOverview,
  listAuditLogs,
  listConsultations,
  listCoursesAdmin,
  listForumThreadsAdmin,
  listMatrics,
  listOrders,
  listProductsAdmin,
  revokeMatric,
  setForumThreadLocked,
  updateConsultationStatus,
  updateProduct,
  upsertCourse,
  upsertLesson,
  upsertModule,
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
  title: z.string().min(2).max(200).optional(),
  description: z.string().min(1).max(20_000).optional(),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  stock: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  priceNgn: z.number().int().min(0).optional(),
  priceUsd: z.number().int().min(0).optional(),
  imageKey: z.string().max(512).nullable().optional(),
  digitalKey: z.string().max(512).nullable().optional(),
});

const productCreateSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(200),
  description: z.string().min(1).max(20_000),
  type: z.enum(["PHYSICAL", "DIGITAL"]),
  priceNgn: z.number().int().min(0),
  priceUsd: z.number().int().min(0),
  stock: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  imageKey: z.string().max(512).nullable().optional(),
  digitalKey: z.string().max(512).nullable().optional(),
});

const courseUpsertSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(200),
  description: z.string().min(1).max(20_000),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const moduleUpsertSchema = z.object({
  id: z.string().min(1).optional(),
  courseId: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(200),
  description: z.string().max(10_000).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const lessonUpsertSchema = z.object({
  id: z.string().min(1).optional(),
  moduleId: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(200),
  markdownBody: z.string().min(1).max(200_000),
  schematicKey: z.string().max(512).nullable().optional(),
  videoUrl: z.string().max(1024).nullable().optional(),
  codeBundleKey: z.string().max(512).nullable().optional(),
  isPreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
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

  app.post("/admin/products", guard, async (request, reply) => {
    const parsed = productCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        message: parsed.error.flatten(),
      });
    }

    try {
      const product = await createProduct(parsed.data);
      await writeAuditLog({
        actorId: actorId(request),
        action: "products.create",
        targetType: "product",
        targetId: product.id,
        metadata: { slug: product.slug, type: product.type },
      });
      return reply.status(201).send(product);
    } catch (error) {
      return sendAdminError(reply, error);
    }
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

  app.get("/admin/lms/courses", guard, async () => {
    const courses = await listCoursesAdmin();
    return { courses };
  });

  app.post("/admin/lms/courses", guard, async (request, reply) => {
    const parsed = courseUpsertSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        message: parsed.error.flatten(),
      });
    }
    try {
      const course = await upsertCourse(parsed.data);
      await writeAuditLog({
        actorId: actorId(request),
        action: parsed.data.id ? "lms.course.update" : "lms.course.create",
        targetType: "course",
        targetId: course.id,
        metadata: { slug: course.slug, isPublished: course.isPublished },
      });
      return reply.status(parsed.data.id ? 200 : 201).send(course);
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });

  app.post("/admin/lms/modules", guard, async (request, reply) => {
    const parsed = moduleUpsertSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        message: parsed.error.flatten(),
      });
    }
    try {
      const mod = await upsertModule(parsed.data);
      await writeAuditLog({
        actorId: actorId(request),
        action: parsed.data.id ? "lms.module.update" : "lms.module.create",
        targetType: "module",
        targetId: mod.id,
        metadata: { slug: mod.slug, courseId: mod.courseId },
      });
      return reply.status(parsed.data.id ? 200 : 201).send(mod);
    } catch (error) {
      return sendAdminError(reply, error);
    }
  });

  app.post("/admin/lms/lessons", guard, async (request, reply) => {
    const parsed = lessonUpsertSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        message: parsed.error.flatten(),
      });
    }
    try {
      const lesson = await upsertLesson(parsed.data);
      await writeAuditLog({
        actorId: actorId(request),
        action: parsed.data.id ? "lms.lesson.update" : "lms.lesson.create",
        targetType: "lesson",
        targetId: lesson.id,
        metadata: {
          slug: lesson.slug,
          isPublished: lesson.isPublished,
          schematicKey: lesson.schematicKey,
        },
      });
      return reply.status(parsed.data.id ? 200 : 201).send(lesson);
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
