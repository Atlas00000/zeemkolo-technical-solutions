import { ConsultationStatus, OrderStatus, Role, type Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";

export class AdminError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "AdminError";
  }
}

export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.adminAuditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function listAuditLogs(limit = 50) {
  const rows = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
    include: {
      actor: { select: { id: true, email: true, fullName: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    metadata: r.metadata,
    createdAt: r.createdAt.toISOString(),
    actor: r.actor,
  }));
}

export async function getAdminOverview() {
  const [
    userCount,
    openConsultations,
    pendingOrders,
    unclaimedMatrics,
    claimedMatrics,
    lockedThreads,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.consultation.count({
      where: { status: { in: [ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED] } },
    }),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.matric.count({ where: { userId: null } }),
    prisma.matric.count({ where: { userId: { not: null } } }),
    prisma.forumThread.count({ where: { isLocked: true } }),
  ]);

  return {
    users: userCount,
    openConsultations,
    pendingOrders,
    unclaimedMatrics,
    claimedMatrics,
    lockedThreads,
  };
}

async function nextMatricSequence(
  tx: Prisma.TransactionClient,
  year: number,
): Promise<number> {
  const prefix = `ZMB-${year}-`;
  const latest = await tx.matric.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: "desc" },
  });
  if (!latest) return 1;
  const parsed = Number.parseInt(latest.code.slice(prefix.length), 10);
  return Number.isFinite(parsed) ? parsed + 1 : 1;
}

/** Batch-create unclaimed matric codes for staff enrollment packs. */
export async function batchGenerateMatrics(input: {
  count: number;
  year?: number;
}) {
  const count = input.count;
  if (count < 1 || count > 200) {
    throw new AdminError("count must be between 1 and 200", 400);
  }

  const year = input.year ?? new Date().getFullYear();

  const created = await prisma.$transaction(async (tx) => {
    let seq = await nextMatricSequence(tx, year);
    const codes: string[] = [];

    for (let i = 0; i < count; i += 1) {
      if (seq > 999) {
        throw new AdminError(`Matric sequence exhausted for ${year}`, 500);
      }
      const code = `ZMB-${year}-${String(seq).padStart(3, "0")}`;
      await tx.matric.create({ data: { code } });
      codes.push(code);
      seq += 1;
    }

    return codes;
  });

  return {
    year,
    count: created.length,
    codes: created,
    csv: ["code,claimed", ...created.map((c) => `${c},false`)].join("\n"),
  };
}

export async function listMatrics(input?: {
  limit?: number;
  filter?: "all" | "claimed" | "unclaimed";
}) {
  const limit = Math.min(input?.limit ?? 100, 500);
  const filter = input?.filter ?? "all";
  const where =
    filter === "claimed"
      ? { userId: { not: null } }
      : filter === "unclaimed"
        ? { userId: null }
        : undefined;

  const matrics = await prisma.matric.findMany({
    where,
    orderBy: { code: "asc" },
    take: limit,
    include: {
      user: { select: { id: true, email: true, fullName: true } },
    },
  });

  return matrics.map((m) => ({
    id: m.id,
    code: m.code,
    claimedAt: m.claimedAt?.toISOString() ?? null,
    claimed: Boolean(m.userId),
    user: m.user,
  }));
}

/** Delete an unused matric, or release a claimed one (demote student). */
export async function revokeMatric(matricId: string) {
  const matric = await prisma.matric.findUnique({
    where: { id: matricId },
    include: { user: true },
  });
  if (!matric) throw new AdminError("Matric not found", 404);

  if (!matric.userId) {
    await prisma.matric.delete({ where: { id: matricId } });
    return { id: matricId, code: matric.code, mode: "deleted" as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.matric.update({
      where: { id: matricId },
      data: { userId: null, claimedAt: null },
    });
    if (matric.user && matric.user.role === Role.ZEEMBLE_STUDENT) {
      await tx.user.update({
        where: { id: matric.userId! },
        data: { role: Role.GENERAL_CUSTOMER },
      });
    }
  });

  return {
    id: matricId,
    code: matric.code,
    mode: "released" as const,
    previousUserId: matric.userId,
  };
}

export async function listConsultations(input?: { status?: ConsultationStatus }) {
  const rows = await prisma.consultation.findMany({
    where: input?.status ? { status: input.status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return rows.map((c) => ({
    id: c.id,
    guestName: c.guestName,
    guestEmail: c.guestEmail,
    serviceType: c.serviceType,
    projectBrief: c.projectBrief,
    attachmentKey: c.attachmentKey,
    slotStartsAt: c.slotStartsAt.toISOString(),
    timezone: c.timezone,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function updateConsultationStatus(input: {
  consultationId: string;
  status: ConsultationStatus;
}) {
  const existing = await prisma.consultation.findUnique({
    where: { id: input.consultationId },
  });
  if (!existing) throw new AdminError("Consultation not found", 404);

  const updated = await prisma.consultation.update({
    where: { id: input.consultationId },
    data: { status: input.status },
  });

  return {
    id: updated.id,
    status: updated.status,
    guestEmail: updated.guestEmail,
    serviceType: updated.serviceType,
  };
}

export async function listOrders(input?: { status?: OrderStatus }) {
  const orders = await prisma.order.findMany({
    where: input?.status ? { status: input.status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: {
        include: {
          product: { select: { id: true, slug: true, title: true } },
        },
      },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    email: o.email,
    status: o.status,
    currency: o.currency,
    totalAmount: o.totalAmount,
    paymentProvider: o.paymentProvider,
    paymentRef: o.paymentRef,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      product: i.product,
    })),
  }));
}

export async function updateProduct(input: {
  productId: string;
  title?: string;
  description?: string;
  slug?: string;
  stock?: number;
  isPublished?: boolean;
  priceNgn?: number;
  priceUsd?: number;
  imageKey?: string | null;
  digitalKey?: string | null;
}) {
  const existing = await prisma.product.findUnique({
    where: { id: input.productId },
  });
  if (!existing) throw new AdminError("Product not found", 404);

  if (input.slug && input.slug !== existing.slug) {
    const clash = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (clash) throw new AdminError("Product slug already exists", 409);
  }

  const updated = await prisma.product.update({
    where: { id: input.productId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.isPublished !== undefined
        ? { isPublished: input.isPublished }
        : {}),
      ...(input.priceNgn !== undefined ? { priceNgn: input.priceNgn } : {}),
      ...(input.priceUsd !== undefined ? { priceUsd: input.priceUsd } : {}),
      ...(input.imageKey !== undefined ? { imageKey: input.imageKey } : {}),
      ...(input.digitalKey !== undefined ? { digitalKey: input.digitalKey } : {}),
    },
  });

  return mapProduct(updated);
}

export async function createProduct(input: {
  slug: string;
  title: string;
  description: string;
  type: "PHYSICAL" | "DIGITAL";
  priceNgn: number;
  priceUsd: number;
  stock?: number;
  isPublished?: boolean;
  imageKey?: string | null;
  digitalKey?: string | null;
}) {
  const clash = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (clash) throw new AdminError("Product slug already exists", 409);

  const created = await prisma.product.create({
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      type: input.type,
      priceNgn: input.priceNgn,
      priceUsd: input.priceUsd,
      stock: input.stock ?? 0,
      isPublished: input.isPublished ?? false,
      imageKey: input.imageKey ?? null,
      digitalKey: input.digitalKey ?? null,
    },
  });

  return mapProduct(created);
}

function mapProduct(p: {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  stock: number;
  isPublished: boolean;
  priceNgn: number;
  priceUsd: number;
  imageKey: string | null;
  digitalKey: string | null;
}) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    type: p.type,
    stock: p.stock,
    isPublished: p.isPublished,
    priceNgn: p.priceNgn,
    priceUsd: p.priceUsd,
    imageKey: p.imageKey,
    digitalKey: p.digitalKey,
  };
}

export async function listProductsAdmin() {
  const products = await prisma.product.findMany({ orderBy: { title: "asc" } });
  return products.map(mapProduct);
}

export async function listCoursesAdmin() {
  const courses = await prisma.course.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              isPreview: true,
              isPublished: true,
              schematicKey: true,
              videoUrl: true,
              sortOrder: true,
              markdownBody: true,
            },
          },
        },
      },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    isPublished: c.isPublished,
    sortOrder: c.sortOrder,
    modules: c.modules.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      description: m.description,
      sortOrder: m.sortOrder,
      lessons: m.lessons,
    })),
  }));
}

export async function upsertCourse(input: {
  id?: string;
  slug: string;
  title: string;
  description: string;
  isPublished?: boolean;
  sortOrder?: number;
}) {
  if (input.id) {
    const existing = await prisma.course.findUnique({ where: { id: input.id } });
    if (!existing) throw new AdminError("Course not found", 404);
    return prisma.course.update({
      where: { id: input.id },
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description,
        isPublished: input.isPublished ?? existing.isPublished,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
    });
  }

  const clash = await prisma.course.findUnique({ where: { slug: input.slug } });
  if (clash) throw new AdminError("Course slug already exists", 409);

  return prisma.course.create({
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      isPublished: input.isPublished ?? false,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function upsertModule(input: {
  id?: string;
  courseId: string;
  slug: string;
  title: string;
  description?: string | null;
  sortOrder?: number;
}) {
  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course) throw new AdminError("Course not found", 404);

  if (input.id) {
    const existing = await prisma.module.findUnique({ where: { id: input.id } });
    if (!existing) throw new AdminError("Module not found", 404);
    return prisma.module.update({
      where: { id: input.id },
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
    });
  }

  return prisma.module.create({
    data: {
      courseId: input.courseId,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function upsertLesson(input: {
  id?: string;
  moduleId: string;
  slug: string;
  title: string;
  markdownBody: string;
  schematicKey?: string | null;
  videoUrl?: string | null;
  codeBundleKey?: string | null;
  isPreview?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}) {
  const mod = await prisma.module.findUnique({ where: { id: input.moduleId } });
  if (!mod) throw new AdminError("Module not found", 404);

  if (input.id) {
    const existing = await prisma.lesson.findUnique({ where: { id: input.id } });
    if (!existing) throw new AdminError("Lesson not found", 404);
    return prisma.lesson.update({
      where: { id: input.id },
      data: {
        slug: input.slug,
        title: input.title,
        markdownBody: input.markdownBody,
        schematicKey: input.schematicKey ?? null,
        videoUrl: input.videoUrl ?? null,
        codeBundleKey: input.codeBundleKey ?? null,
        isPreview: input.isPreview ?? existing.isPreview,
        isPublished: input.isPublished ?? existing.isPublished,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
    });
  }

  return prisma.lesson.create({
    data: {
      moduleId: input.moduleId,
      slug: input.slug,
      title: input.title,
      markdownBody: input.markdownBody,
      schematicKey: input.schematicKey ?? null,
      videoUrl: input.videoUrl ?? null,
      codeBundleKey: input.codeBundleKey ?? null,
      isPreview: input.isPreview ?? false,
      isPublished: input.isPublished ?? false,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function listForumThreadsAdmin(limit = 50) {
  const threads = await prisma.forumThread.findMany({
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    take: Math.min(limit, 100),
    include: {
      author: { select: { id: true, fullName: true, email: true } },
      category: { select: { slug: true, title: true } },
      _count: { select: { replies: true } },
    },
  });

  return threads.map((t) => ({
    id: t.id,
    title: t.title,
    isLocked: t.isLocked,
    isPinned: t.isPinned,
    replyCount: t._count.replies,
    createdAt: t.createdAt.toISOString(),
    author: t.author,
    category: t.category,
  }));
}

export async function setForumThreadLocked(input: {
  threadId: string;
  locked: boolean;
}) {
  const existing = await prisma.forumThread.findUnique({
    where: { id: input.threadId },
  });
  if (!existing) throw new AdminError("Thread not found", 404);

  const updated = await prisma.forumThread.update({
    where: { id: input.threadId },
    data: { isLocked: input.locked },
  });

  return {
    id: updated.id,
    title: updated.title,
    isLocked: updated.isLocked,
  };
}

export async function promoteUserToAdmin(input: {
  email?: string;
  clerkUserId?: string;
}) {
  if (!input.email && !input.clerkUserId) {
    throw new AdminError("email or clerkUserId required", 400);
  }

  const user = await prisma.user.findFirst({
    where: input.clerkUserId
      ? { clerkUserId: input.clerkUserId }
      : { email: input.email!.toLowerCase() },
  });

  if (!user) {
    throw new AdminError(
      "User not found — they must sign in once so Postgres syncs from Clerk",
      404,
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: Role.ADMIN },
  });

  return {
    id: updated.id,
    email: updated.email,
    clerkUserId: updated.clerkUserId,
    role: updated.role,
  };
}
