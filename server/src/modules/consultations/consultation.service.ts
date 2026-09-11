import { ConsultationStatus, type Consultation } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { pingRedis, redis } from "../../config/redis.js";
import { sendConsultationConfirmation } from "../../utils/mailer.js";

export const SERVICE_TYPES = [
  "Hardware Prototyping",
  "Firmware Review",
  "Product Design",
  "Embedded Systems Consulting",
  "General Engineering Inquiry",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export class ConsultationError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "ConsultationError";
  }
}

const SLOT_LOCK_TTL_SECONDS = 120;
const WORKDAY_START_HOUR = 9;
const WORKDAY_END_HOUR = 17;

function slotLockKey(slotIso: string): string {
  return `consultation:slot:${slotIso}`;
}

/** Generate bookable hourly slots for upcoming weekdays (Africa/Lagos ≈ UTC+1). */
export function generateCandidateSlots(days = 14, now = new Date()): Date[] {
  const slots: Date[] = [];
  const lagosOffsetMs = 60 * 60 * 1000;

  for (let dayOffset = 0; dayOffset < days + 10 && slots.length < days * 8; dayOffset += 1) {
    const cursor = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const lagos = new Date(cursor.getTime() + lagosOffsetMs);
    const weekday = lagos.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;

    const y = lagos.getUTCFullYear();
    const m = lagos.getUTCMonth();
    const d = lagos.getUTCDate();

    for (let hour = WORKDAY_START_HOUR; hour < WORKDAY_END_HOUR; hour += 1) {
      const asUtcGuess = Date.UTC(y, m, d, hour, 0, 0);
      const utcInstant = new Date(asUtcGuess - lagosOffsetMs);
      if (utcInstant.getTime() <= now.getTime() + 60 * 60 * 1000) continue;
      slots.push(utcInstant);
    }
  }

  return slots;
}

export async function listAvailableSlots(days = 14) {
  const candidates = generateCandidateSlots(days);
  if (candidates.length === 0) return [];

  const booked = await prisma.consultation.findMany({
    where: {
      slotStartsAt: { in: candidates },
      status: { in: [ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED] },
    },
    select: { slotStartsAt: true },
  });

  const bookedSet = new Set(booked.map((b) => b.slotStartsAt.toISOString()));
  return candidates
    .filter((slot) => !bookedSet.has(slot.toISOString()))
    .map((slot) => ({
      startsAt: slot.toISOString(),
      timezone: "Africa/Lagos",
      durationMinutes: 60,
    }));
}

export async function createConsultation(input: {
  guestName: string;
  guestEmail: string;
  serviceType: string;
  projectBrief: string;
  slotStartsAt: Date;
  timezone?: string;
  attachmentKey?: string;
  userId?: string;
}): Promise<{
  consultation: Consultation;
  email: Awaited<ReturnType<typeof sendConsultationConfirmation>>;
}> {
  if (!SERVICE_TYPES.includes(input.serviceType as ServiceType)) {
    throw new ConsultationError("Invalid service type", 400);
  }

  if (input.slotStartsAt.getTime() <= Date.now()) {
    throw new ConsultationError("Slot must be in the future", 400);
  }

  const slotIso = input.slotStartsAt.toISOString();
  await pingRedis();

  const locked = await redis.set(
    slotLockKey(slotIso),
    "locking",
    "EX",
    SLOT_LOCK_TTL_SECONDS,
    "NX",
  );
  if (locked !== "OK") {
    throw new ConsultationError(
      "Slot is being booked by someone else — try another time",
      409,
    );
  }

  try {
    const existing = await prisma.consultation.findFirst({
      where: {
        slotStartsAt: input.slotStartsAt,
        status: { in: [ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED] },
      },
    });
    if (existing) {
      throw new ConsultationError("Slot already booked", 409);
    }

    const consultation = await prisma.consultation.create({
      data: {
        guestName: input.guestName.trim(),
        guestEmail: input.guestEmail.trim().toLowerCase(),
        serviceType: input.serviceType,
        projectBrief: input.projectBrief.trim(),
        slotStartsAt: input.slotStartsAt,
        timezone: input.timezone ?? "Africa/Lagos",
        attachmentKey: input.attachmentKey,
        userId: input.userId,
        status: ConsultationStatus.CONFIRMED,
      },
    });

    await redis.set(slotLockKey(slotIso), consultation.id, "EX", 60 * 60 * 24 * 30);

    let email: Awaited<ReturnType<typeof sendConsultationConfirmation>>;
    try {
      email = await sendConsultationConfirmation({
        consultationId: consultation.id,
        guestName: consultation.guestName,
        guestEmail: consultation.guestEmail,
        serviceType: consultation.serviceType,
        projectBrief: consultation.projectBrief,
        slotStartsAt: consultation.slotStartsAt,
        timezone: consultation.timezone,
      });
    } catch (error) {
      email = {
        sent: false,
        skippedReason: error instanceof Error ? error.message : "Email dispatch failed",
      };
    }

    return { consultation, email };
  } catch (error) {
    const current = await redis.get(slotLockKey(slotIso));
    if (current === "locking") {
      await redis.del(slotLockKey(slotIso));
    }
    throw error;
  }
}
