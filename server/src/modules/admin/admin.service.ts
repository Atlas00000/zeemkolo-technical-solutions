import { ConsultationStatus, OrderStatus, type Prisma } from "@prisma/client";
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

export async function listMatrics(limit = 100) {
  const matrics = await prisma.matric.findMany({
    orderBy: { code: "asc" },
    take: Math.min(limit, 500),
    include: {
      user: { select: { id: true, email: true, fullName: true } },
    },
  });

  return matrics.map((m) => ({
    id: m.id,
    code: m.code,
    claimedAt: m.claimedAt?.toISOString() ?? null,
    user: m.user,
  }));
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
