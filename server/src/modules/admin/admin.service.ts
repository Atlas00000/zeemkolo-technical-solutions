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
  stock?: number;
  isPublished?: boolean;
  priceNgn?: number;
  priceUsd?: number;
}) {
  const existing = await prisma.product.findUnique({
    where: { id: input.productId },
  });
  if (!existing) throw new AdminError("Product not found", 404);

  const updated = await prisma.product.update({
    where: { id: input.productId },
    data: {
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.isPublished !== undefined
        ? { isPublished: input.isPublished }
        : {}),
      ...(input.priceNgn !== undefined ? { priceNgn: input.priceNgn } : {}),
      ...(input.priceUsd !== undefined ? { priceUsd: input.priceUsd } : {}),
    },
  });

  return {
    id: updated.id,
    slug: updated.slug,
    title: updated.title,
    stock: updated.stock,
    isPublished: updated.isPublished,
    priceNgn: updated.priceNgn,
    priceUsd: updated.priceUsd,
  };
}

export async function listProductsAdmin() {
  const products = await prisma.product.findMany({ orderBy: { title: "asc" } });
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    type: p.type,
    stock: p.stock,
    isPublished: p.isPublished,
    priceNgn: p.priceNgn,
    priceUsd: p.priceUsd,
  }));
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
