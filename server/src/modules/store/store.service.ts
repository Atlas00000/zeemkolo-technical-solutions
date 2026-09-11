import { Currency, OrderStatus, ProductType, type Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";

export class StoreError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "StoreError";
  }
}

const RESERVE_TTL_SECONDS = 15 * 60;

export function formatMoney(amountMinor: number, currency: Currency) {
  if (currency === Currency.NGN) {
    return {
      amountMinor,
      currency,
      formatted: `₦${(amountMinor / 100).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    };
  }
  return {
    amountMinor,
    currency,
    formatted: `$${(amountMinor / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  };
}

function productDto(
  product: {
    id: string;
    slug: string;
    title: string;
    description: string;
    type: ProductType;
    priceNgn: number;
    priceUsd: number;
    stock: number;
    imageKey: string | null;
    digitalKey: string | null;
    isPublished: boolean;
  },
  currency: Currency = Currency.NGN,
) {
  const price =
    currency === Currency.USD
      ? formatMoney(product.priceUsd, Currency.USD)
      : formatMoney(product.priceNgn, Currency.NGN);

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    type: product.type,
    stock: product.stock,
    imageKey: product.imageKey,
    hasDigitalAsset: Boolean(product.digitalKey),
    isPublished: product.isPublished,
    priceNgn: formatMoney(product.priceNgn, Currency.NGN),
    priceUsd: formatMoney(product.priceUsd, Currency.USD),
    price,
  };
}

export async function listProducts(currency: Currency = Currency.NGN) {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { title: "asc" },
  });
  return products.map((p) => productDto(p, currency));
}

export async function getProductBySlug(
  slug: string,
  currency: Currency = Currency.NGN,
) {
  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
  });
  if (!product) throw new StoreError("Product not found", 404);
  return productDto(product, currency);
}

type CartLine = { productId: string; quantity: number };

export async function createOrder(input: {
  email: string;
  currency: Currency;
  items: CartLine[];
  userId?: string;
  paymentProvider: "paystack" | "stripe";
}) {
  if (!input.items.length) {
    throw new StoreError("Cart is empty", 400);
  }

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true },
  });
  if (products.length !== productIds.length) {
    throw new StoreError("One or more products are unavailable", 400);
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  let total = 0;
  const lineData: Prisma.OrderItemCreateManyOrderInput[] = [];

  for (const line of input.items) {
    const product = byId.get(line.productId)!;
    if (line.quantity < 1) {
      throw new StoreError("Invalid quantity", 400);
    }
    if (product.stock < line.quantity) {
      throw new StoreError(`Insufficient stock for ${product.title}`, 409);
    }
    const unitPrice =
      input.currency === Currency.USD ? product.priceUsd : product.priceNgn;
    total += unitPrice * line.quantity;
    lineData.push({
      productId: product.id,
      quantity: line.quantity,
      unitPrice,
    });
  }

  const paymentRef = `zk_${randomBytes(12).toString("hex")}`;

  const order = await prisma.order.create({
    data: {
      email: input.email.toLowerCase().trim(),
      userId: input.userId,
      currency: input.currency,
      totalAmount: total,
      status: OrderStatus.PENDING,
      paymentProvider: input.paymentProvider,
      paymentRef,
      items: { create: lineData },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              title: true,
              type: true,
              digitalKey: true,
            },
          },
        },
      },
    },
  });

  await redis.setex(
    `store:reserve:${order.id}`,
    RESERVE_TTL_SECONDS,
    JSON.stringify({
      paymentRef,
      items: input.items,
    }),
  );

  return serializeOrder(order);
}

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              title: true,
              type: true,
              digitalKey: true,
            },
          },
        },
      },
    },
  });
  if (!order) throw new StoreError("Order not found", 404);
  return serializeOrder(order);
}

export async function getOrderByPaymentRef(paymentRef: string) {
  const order = await prisma.order.findUnique({
    where: { paymentRef },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              title: true,
              type: true,
              digitalKey: true,
            },
          },
        },
      },
    },
  });
  if (!order) throw new StoreError("Order not found", 404);
  return order;
}

function serializeOrder(
  order: Awaited<ReturnType<typeof getOrderByPaymentRef>>,
) {
  const digitalItems = order.items.filter(
    (i) => i.product.type === ProductType.DIGITAL && i.product.digitalKey,
  );

  return {
    id: order.id,
    email: order.email,
    status: order.status,
    currency: order.currency,
    total: formatMoney(order.totalAmount, order.currency),
    paymentProvider: order.paymentProvider,
    paymentRef: order.paymentRef,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: formatMoney(item.unitPrice, order.currency),
      product: {
        id: item.product.id,
        slug: item.product.slug,
        title: item.product.title,
        type: item.product.type,
        downloadable: Boolean(item.product.digitalKey),
      },
    })),
    downloadsAvailable:
      order.status === OrderStatus.PAID || order.status === OrderStatus.FULFILLED
        ? digitalItems.map((i) => ({
            productId: i.product.id,
            slug: i.product.slug,
            title: i.product.title,
          }))
        : [],
  };
}

/**
 * Confirm payment: mark PAID (stock already reserved at checkout).
 * Restores stock if called on cancelled/refunded paths separately.
 */
export async function confirmOrderPaid(input: {
  paymentRef: string;
  provider: string;
}) {
  const existing = await getOrderByPaymentRef(input.paymentRef);

  if (
    existing.status === OrderStatus.PAID ||
    existing.status === OrderStatus.FULFILLED
  ) {
    return serializeOrder(existing);
  }

  if (existing.status !== OrderStatus.PENDING) {
    throw new StoreError(`Order cannot be paid from status ${existing.status}`, 409);
  }

  const allDigital = existing.items.every(
    (i) => i.product.type === ProductType.DIGITAL,
  );

  const updated = await prisma.$transaction(async (tx) => {
    for (const item of existing.items) {
      const result = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count !== 1) {
        throw new StoreError(
          `Insufficient stock to fulfill ${item.product.title}`,
          409,
        );
      }
    }

    return tx.order.update({
      where: { id: existing.id },
      data: {
        status: allDigital ? OrderStatus.FULFILLED : OrderStatus.PAID,
        paymentProvider: input.provider,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                title: true,
                type: true,
                digitalKey: true,
              },
            },
          },
        },
      },
    });
  });

  await redis.del(`store:reserve:${existing.id}`);
  return serializeOrder(updated);
}

export async function releaseExpiredReservation(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order || order.status !== OrderStatus.PENDING) return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.CANCELLED },
  });

  await redis.del(`store:reserve:${orderId}`);
}
