import { Role, type Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";

export class MatricClaimError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "MatricClaimError";
  }
}

const MATRIC_PATTERN = /^ZMB-\d{4}-\d{3}$/;

/** Strip paste junk and normalize to ZMB-YYYY-NNN when possible. */
export function normalizeMatricCode(raw: string): string {
  const cleaned = raw
    .replace(/[\u200B-\u200D\uFEFF\u00a0]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

  const compact = cleaned.replace(/-/g, "");
  const matched = compact.match(/^ZMB(\d{4})(\d{3})$/);
  if (matched) {
    return `ZMB-${matched[1]}-${matched[2]}`;
  }

  return cleaned;
}

export function isValidMatricFormat(code: string): boolean {
  return MATRIC_PATTERN.test(normalizeMatricCode(code));
}

async function nextMatricCode(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ZMB-${year}-`;

  const latest = await tx.matric.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: "desc" },
  });

  let seq = 1;
  if (latest) {
    const parsed = Number.parseInt(latest.code.slice(prefix.length), 10);
    if (Number.isFinite(parsed)) {
      seq = parsed + 1;
    }
  }

  if (seq > 999) {
    throw new MatricClaimError("Matric sequence exhausted for this year", 500);
  }

  return `${prefix}${String(seq).padStart(3, "0")}`;
}

/**
 * Assign a unique matric at signup and elevate to ZEEMBLE_STUDENT.
 * Idempotent: returns existing matric if already assigned.
 */
export async function assignMatricAtSignup(userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { matric: true },
    });
    if (!user) {
      throw new MatricClaimError("User not found", 404);
    }

    if (user.matric) {
      return { user, matric: user.matric, created: false as const };
    }

    const nextRole = user.role === Role.ADMIN ? Role.ADMIN : Role.ZEEMBLE_STUDENT;

    let code = await nextMatricCode(tx);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const matric = await tx.matric.create({
          data: {
            code,
            userId: user.id,
            claimedAt: new Date(),
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { role: nextRole },
          include: { matric: true },
        });

        return { user: updatedUser, matric, created: true as const };
      } catch {
        code = await nextMatricCode(tx);
      }
    }

    throw new MatricClaimError("Could not allocate a unique matric number", 500);
  });
}

/** Legacy manual claim — kept for admin tooling / rare overrides. */
export async function claimMatric(userId: string, rawCode: string) {
  const code = normalizeMatricCode(rawCode);

  if (!MATRIC_PATTERN.test(code)) {
    throw new MatricClaimError("Invalid matric format. Expected e.g. ZMB-2026-001", 400);
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new MatricClaimError("User not found", 404);
    }

    if (user.role === Role.ZEEMBLE_STUDENT || user.role === Role.ADMIN) {
      const existing = await tx.matric.findUnique({ where: { userId: user.id } });
      if (existing) {
        throw new MatricClaimError("Account already has a claimed matric number", 400);
      }
    }

    const matric = await tx.matric.findUnique({ where: { code } });
    if (!matric) {
      throw new MatricClaimError("Matric number not found", 404);
    }
    if (matric.userId) {
      throw new MatricClaimError("Matric number already activated", 400);
    }

    const claimed = await tx.matric.update({
      where: { id: matric.id },
      data: {
        userId: user.id,
        claimedAt: new Date(),
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { role: Role.ZEEMBLE_STUDENT },
      include: { matric: true },
    });

    return { user: updatedUser, matric: claimed };
  });
}
