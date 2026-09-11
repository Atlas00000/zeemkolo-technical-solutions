import { ConsultationStatus } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../../config/db.js";
import {
  batchGenerateMatrics,
  listConsultations,
  updateConsultationStatus,
  updateProduct,
} from "./admin.service.js";

describe("admin.service (Phase 7)", () => {
  const generatedCodes: string[] = [];

  afterAll(async () => {
    if (generatedCodes.length) {
      await prisma.matric.deleteMany({
        where: { code: { in: generatedCodes } },
      });
    }
    await prisma.$disconnect();
  });

  it("batch-generates unclaimed matric codes and CSV", async () => {
    const result = await batchGenerateMatrics({ count: 3 });
    expect(result.count).toBe(3);
    expect(result.codes).toHaveLength(3);
    expect(result.csv).toContain("code,claimed");
    expect(result.codes.every((c) => /^ZMB-\d{4}-\d{3}$/.test(c))).toBe(true);
    generatedCodes.push(...result.codes);
  });

  it("updates consultation status", async () => {
    const consultation = await prisma.consultation.create({
      data: {
        guestName: "Phase 7 Admin Test",
        guestEmail: "phase7-admin@example.com",
        serviceType: "Firmware Review",
        projectBrief: "Admin panel status update regression test brief.",
        slotStartsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        timezone: "Africa/Lagos",
        status: ConsultationStatus.PENDING,
      },
    });

    const updated = await updateConsultationStatus({
      consultationId: consultation.id,
      status: ConsultationStatus.CONFIRMED,
    });
    expect(updated.status).toBe("CONFIRMED");

    const listed = await listConsultations({ status: ConsultationStatus.CONFIRMED });
    expect(listed.some((c) => c.id === consultation.id)).toBe(true);

    await prisma.consultation.delete({ where: { id: consultation.id } });
  });

  it("updates product stock", async () => {
    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: "starter-lab-kit" },
    });
    const original = product.stock;
    const next = original + 1;
    const updated = await updateProduct({
      productId: product.id,
      stock: next,
    });
    expect(updated.stock).toBe(next);
    await updateProduct({ productId: product.id, stock: original });
  });
});
