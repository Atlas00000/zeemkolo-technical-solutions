import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { prisma } from "../../config/db.js";
import {
  assignMatricAtSignup,
  claimMatric,
  isValidMatricFormat,
  normalizeMatricCode,
} from "./matric.service.js";

const SUITE = "phase1-matric";
const MANUAL_CODE = "ZMB-2099-050";

describe("matric helpers", () => {
  it("normalizes pasted codes with spaces and NBSP", () => {
    expect(normalizeMatricCode(" zmb-2026-001 ")).toBe("ZMB-2026-001");
    expect(normalizeMatricCode("ZMB-2026-\u00a0001")).toBe("ZMB-2026-001");
    expect(isValidMatricFormat("ZMB-2026-001")).toBe(true);
    expect(isValidMatricFormat("ZMB 2026 001")).toBe(true);
    expect(normalizeMatricCode("ZMB 2026 001")).toBe("ZMB-2026-001");
  });
});

describe("assignMatricAtSignup (Phase 1)", () => {
  let userId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { clerkUserId: { startsWith: `${SUITE}-auto` } },
    });
    const user = await prisma.user.create({
      data: {
        clerkUserId: `${SUITE}-auto-a`,
        email: `${SUITE}-auto-a@example.com`,
        fullName: "Auto Matric User",
        role: Role.GENERAL_CUSTOMER,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.matric.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({
      where: { clerkUserId: { startsWith: `${SUITE}-auto` } },
    });
    await prisma.$disconnect();
  });

  it("assigns a unique matric and elevates to ZEEMBLE_STUDENT", async () => {
    const result = await assignMatricAtSignup(userId);
    expect(result.created).toBe(true);
    expect(result.matric.code).toMatch(/^ZMB-\d{4}-\d{3}$/);
    expect(result.user.role).toBe(Role.ZEEMBLE_STUDENT);
  });

  it("is idempotent on second call", async () => {
    const first = await assignMatricAtSignup(userId);
    const second = await assignMatricAtSignup(userId);
    expect(second.created).toBe(false);
    expect(second.matric.code).toBe(first.matric.code);
  });
});

describe("claimMatric legacy path", () => {
  let userId: string;

  beforeAll(async () => {
    await prisma.matric.deleteMany({ where: { code: MANUAL_CODE } });
    await prisma.user.deleteMany({ where: { clerkUserId: `${SUITE}-manual` } });
    const user = await prisma.user.create({
      data: {
        clerkUserId: `${SUITE}-manual`,
        email: `${SUITE}-manual@example.com`,
        fullName: "Manual Claim User",
        role: Role.GENERAL_CUSTOMER,
      },
    });
    userId = user.id;
    await prisma.matric.create({ data: { code: MANUAL_CODE } });
  });

  afterAll(async () => {
    await prisma.matric.deleteMany({ where: { code: MANUAL_CODE } });
    await prisma.user.deleteMany({ where: { clerkUserId: `${SUITE}-manual` } });
    await prisma.$disconnect();
  });

  it("still supports manual claim of a pre-issued code", async () => {
    const result = await claimMatric(userId, ` ${MANUAL_CODE} `);
    expect(result.matric.code).toBe(MANUAL_CODE);
    expect(result.user.role).toBe(Role.ZEEMBLE_STUDENT);
  });
});
