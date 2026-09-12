import { ConsultationStatus, Role } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../../config/db.js";
import {
  batchGenerateMatrics,
  createProduct,
  getAdminOverview,
  listConsultations,
  listCoursesAdmin,
  listForumThreadsAdmin,
  listMatrics,
  revokeMatric,
  setForumThreadLocked,
  updateConsultationStatus,
  updateProduct,
  upsertLesson,
  writeAuditLog,
  listAuditLogs,
} from "./admin.service.js";

describe("admin.service (O1)", () => {
  const generatedCodes: string[] = [];
  let auditActorId: string | null = null;

  afterAll(async () => {
    if (generatedCodes.length) {
      await prisma.matric.deleteMany({
        where: { code: { in: generatedCodes } },
      });
    }
    if (auditActorId) {
      await prisma.adminAuditLog.deleteMany({ where: { actorId: auditActorId } });
    }
    await prisma.$disconnect();
  });

  it("returns overview counts", async () => {
    const overview = await getAdminOverview();
    expect(overview.users).toBeGreaterThanOrEqual(0);
    expect(overview.unclaimedMatrics).toBeGreaterThanOrEqual(0);
    expect(typeof overview.openConsultations).toBe("number");
    expect(typeof overview.pendingOrders).toBe("number");
  });

  it("batch-generates unclaimed matric codes and CSV", async () => {
    const result = await batchGenerateMatrics({ count: 3 });
    expect(result.count).toBe(3);
    expect(result.codes).toHaveLength(3);
    expect(result.csv).toContain("code,claimed");
    expect(result.codes.every((c) => /^ZMB-\d{4}-\d{3}$/.test(c))).toBe(true);
    generatedCodes.push(...result.codes);
  });

  it("filters matrics and revokes an unclaimed code", async () => {
    const listed = await listMatrics({ filter: "unclaimed", limit: 500 });
    expect(listed.some((m) => generatedCodes.includes(m.code))).toBe(true);

    const target = listed.find((m) => generatedCodes.includes(m.code));
    expect(target).toBeTruthy();
    const revoked = await revokeMatric(target!.id);
    expect(revoked.mode).toBe("deleted");
    generatedCodes.splice(generatedCodes.indexOf(target!.code), 1);
  });

  it("updates consultation status and includes attachmentKey in list", async () => {
    const consultation = await prisma.consultation.create({
      data: {
        guestName: "O1 Admin Test",
        guestEmail: "o1-admin@example.com",
        serviceType: "Firmware Review",
        projectBrief: "O1 admin panel status update regression test brief.",
        attachmentKey: "consultations/o1-test.pdf",
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
    const row = listed.consultations.find((c) => c.id === consultation.id);
    expect(row?.attachmentKey).toBe("consultations/o1-test.pdf");

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

  it("locks and unlocks a forum thread when one exists", async () => {
    const listed = await listForumThreadsAdmin({ limit: 5 });
    if (listed.threads.length === 0) {
      expect(listed.threads).toEqual([]);
      return;
    }
    const thread = listed.threads[0]!;
    const locked = await setForumThreadLocked({
      threadId: thread.id,
      locked: true,
    });
    expect(locked.isLocked).toBe(true);
    const unlocked = await setForumThreadLocked({
      threadId: thread.id,
      locked: false,
    });
    expect(unlocked.isLocked).toBe(false);
  });

  it("writes and lists audit log entries", async () => {
    const admin = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });
    expect(admin).toBeTruthy();
    auditActorId = admin!.id;

    await writeAuditLog({
      actorId: admin!.id,
      action: "test.o1_audit",
      targetType: "system",
      targetId: null,
      metadata: { phase: "O1" },
    });

    const events = await listAuditLogs(20);
    expect(events.some((e) => e.action === "test.o1_audit")).toBe(true);
  });

  it("creates a draft product and lists LMS courses for admin", async () => {
    const slug = `o3-test-kit-${Date.now()}`;
    const product = await createProduct({
      slug,
      title: "O3 Test Kit",
      description: "Temporary product for O3 admin CMS test.",
      type: "PHYSICAL",
      priceNgn: 1000,
      priceUsd: 100,
      stock: 1,
      isPublished: false,
    });
    expect(product.slug).toBe(slug);
    expect(product.isPublished).toBe(false);

    const courses = await listCoursesAdmin();
    expect(courses.length).toBeGreaterThan(0);
    const lesson = courses[0]!.modules[0]!.lessons[0]!;
    expect(lesson).toHaveProperty("isPublished");

    const updated = await upsertLesson({
      id: lesson.id,
      moduleId: courses[0]!.modules[0]!.id,
      slug: lesson.slug,
      title: lesson.title,
      markdownBody: lesson.markdownBody,
      schematicKey: lesson.schematicKey,
      videoUrl: lesson.videoUrl,
      isPreview: lesson.isPreview,
      isPublished: lesson.isPublished,
      sortOrder: lesson.sortOrder,
    });
    expect(updated.id).toBe(lesson.id);

    await prisma.product.delete({ where: { id: product.id } });
  });
});
