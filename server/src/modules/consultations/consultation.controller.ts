import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { optionalAuth } from "../../middleware/optional-auth.middleware.js";
import { rateLimitConsultationBook } from "../../middleware/rate-limiter.js";
import { sendApiError } from "../../utils/api-error.js";
import {
  beginIdempotency,
  getIdempotentResponse,
  readIdempotencyKey,
  saveIdempotentResponse,
} from "../../utils/idempotency.js";
import { saveConsultationUpload } from "../../utils/local-upload.js";
import { StorageError } from "../../utils/object-storage.js";
import {
  ConsultationError,
  SERVICE_TYPES,
  createConsultation,
  listAvailableSlots,
} from "./consultation.service.js";

const bookBodySchema = z.object({
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email(),
  serviceType: z.enum([
    "Hardware Prototyping",
    "Firmware Review",
    "Product Design",
    "Embedded Systems Consulting",
    "General Engineering Inquiry",
  ]),
  projectBrief: z.string().min(20).max(10_000),
  slotStartsAt: z.string().datetime(),
  timezone: z.string().min(3).max(64).default("Africa/Lagos"),
  attachmentKey: z.string().min(3).max(512).optional(),
});

export async function consultationRoutes(app: FastifyInstance) {
  app.get("/consultations/services", async () => {
    return { services: SERVICE_TYPES };
  });

  app.get("/consultations/slots", async (request) => {
    const query = request.query as { days?: string };
    const days = Math.min(Math.max(Number(query.days ?? 14) || 14, 1), 30);
    const slots = await listAvailableSlots(days);
    return { timezone: "Africa/Lagos", slots };
  });

  app.post(
    "/consultations",
    { preHandler: [optionalAuth, rateLimitConsultationBook] },
    async (request, reply) => {
      const parsed = bookBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return sendApiError(
          request,
          reply,
          400,
          "ValidationError",
          JSON.stringify(parsed.error.flatten()),
          "validation_failed",
        );
      }

      const idemKey = readIdempotencyKey(request.headers["idempotency-key"]);
      if (idemKey) {
        const phase = await beginIdempotency("consultations", idemKey);
        if (phase === "replay") {
          const cached = await getIdempotentResponse("consultations", idemKey);
          return reply.status(cached!.statusCode).send(cached!.body);
        }
        if (phase === "inflight") {
          return sendApiError(
            request,
            reply,
            409,
            "IdempotencyConflict",
            "Idempotency key is already in progress",
            "idempotency_inflight",
          );
        }
      }

      try {
        const result = await createConsultation({
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail,
          serviceType: parsed.data.serviceType,
          projectBrief: parsed.data.projectBrief,
          slotStartsAt: new Date(parsed.data.slotStartsAt),
          timezone: parsed.data.timezone,
          attachmentKey: parsed.data.attachmentKey,
          userId: request.auth?.user.id,
        });

        const body = {
          id: result.consultation.id,
          status: result.consultation.status,
          serviceType: result.consultation.serviceType,
          slotStartsAt: result.consultation.slotStartsAt.toISOString(),
          timezone: result.consultation.timezone,
          email: result.email,
        };
        if (idemKey) {
          await saveIdempotentResponse("consultations", idemKey, {
            statusCode: 201,
            body,
          });
        }
        return reply.status(201).send(body);
      } catch (error) {
        if (error instanceof ConsultationError) {
          return sendApiError(
            request,
            reply,
            error.statusCode,
            "ConsultationError",
            error.message,
          );
        }
        throw error;
      }
    },
  );

  app.post(
    "/consultations/upload",
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const body = request.body as {
        filename?: string;
        contentBase64?: string;
      };

      if (!body?.filename || !body?.contentBase64) {
        return sendApiError(
          request,
          reply,
          400,
          "ValidationError",
          "filename and contentBase64 are required",
          "validation_failed",
        );
      }

      const buffer = Buffer.from(body.contentBase64, "base64");
      if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) {
        return sendApiError(
          request,
          reply,
          400,
          "ValidationError",
          "Attachment must be between 1 byte and 5MB",
          "validation_failed",
        );
      }

      try {
        const saved = await saveConsultationUpload({
          filename: body.filename,
          buffer,
        });

        return {
          attachmentKey: saved.key,
          provider: saved.provider,
        };
      } catch (error) {
        if (error instanceof StorageError) {
          return sendApiError(
            request,
            reply,
            error.statusCode,
            "StorageError",
            error.message,
          );
        }
        throw error;
      }
    },
  );
}
