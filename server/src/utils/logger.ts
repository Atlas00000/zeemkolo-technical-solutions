import { createRequire } from "node:module";
import type { FastifyServerOptions } from "fastify";
import { env } from "../config/env.js";

const require = createRequire(import.meta.url);

export type LoggerOptions = NonNullable<FastifyServerOptions["logger"]>;

/**
 * Structured Pino config for Fastify.
 * Pretty transport only in development; JSON elsewhere.
 */
export function buildLoggerOptions(
  overrides?: Partial<{
    nodeEnv: typeof env.NODE_ENV;
    logLevel: typeof env.LOG_LEVEL;
  }>,
): LoggerOptions {
  const nodeEnv = overrides?.nodeEnv ?? env.NODE_ENV;
  const level = overrides?.logLevel ?? env.LOG_LEVEL;

  const base: Extract<LoggerOptions, object> = {
    level,
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie"],
      remove: true,
    },
  };

  if (nodeEnv === "development") {
    return {
      ...base,
      transport: {
        // Absolute path so worker threads resolve under pnpm
        target: require.resolve("pino-pretty"),
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    };
  }

  return base;
}
