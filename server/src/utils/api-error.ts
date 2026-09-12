import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { captureException } from "./sentry.js";

export type ErrorEnvelope = {
  error: string;
  message: string;
  code?: string;
  requestId: string;
};

export function getRequestId(request: FastifyRequest): string {
  return String(request.id);
}

export function errorEnvelope(input: {
  request: FastifyRequest;
  error: string;
  message: string;
  code?: string;
}): ErrorEnvelope {
  return {
    error: input.error,
    message: input.message,
    ...(input.code ? { code: input.code } : {}),
    requestId: getRequestId(input.request),
  };
}

/** Send a uniform API error and set X-Request-Id. */
export function sendApiError(
  request: FastifyRequest,
  reply: FastifyReply,
  statusCode: number,
  error: string,
  message: string,
  code?: string,
) {
  reply.header("X-Request-Id", getRequestId(request));
  return reply.status(statusCode).send(
    errorEnvelope({ request, error, message, code }),
  );
}

type StatusError = Error & {
  statusCode?: number;
  code?: string;
};

export function registerErrorHandler(app: {
  setErrorHandler: (
    handler: (
      error: FastifyError,
      request: FastifyRequest,
      reply: FastifyReply,
    ) => unknown,
  ) => void;
}) {
  app.setErrorHandler((error, request, reply) => {
    const requestId = getRequestId(request);
    reply.header("X-Request-Id", requestId);

    if (error.validation) {
      return reply.status(400).send(
        errorEnvelope({
          request,
          error: "ValidationError",
          message: error.message,
          code: "validation_failed",
        }),
      );
    }

    const statusError = error as StatusError;
    const statusCode =
      typeof statusError.statusCode === "number" &&
      statusError.statusCode >= 400 &&
      statusError.statusCode < 600
        ? statusError.statusCode
        : 500;

    if (statusCode >= 500) {
      request.log.error({ err: error, requestId }, "unhandled error");
      captureException(error, { requestId, path: request.url });
    }

    return reply.status(statusCode).send(
      errorEnvelope({
        request,
        error: error.name || "Error",
        message:
          statusCode >= 500 && process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : error.message || "Unexpected error",
        code: typeof statusError.code === "string" ? statusError.code : undefined,
      }),
    );
  });
}
