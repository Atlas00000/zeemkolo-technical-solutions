type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function resolveLevel(): LogLevel {
  const raw = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
}

const activeLevel = resolveLevel();

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[activeLevel];
}

/**
 * Thin browser/server logger. Never pass tokens or response bodies.
 */
export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (!shouldLog("debug")) return;
    if (meta) console.debug(message, meta);
    else console.debug(message);
  },
  info(message: string, meta?: Record<string, unknown>) {
    if (!shouldLog("info")) return;
    if (meta) console.info(message, meta);
    else console.info(message);
  },
  warn(message: string, meta?: Record<string, unknown>) {
    if (!shouldLog("warn")) return;
    if (meta) console.warn(message, meta);
    else console.warn(message);
  },
  error(message: string, meta?: Record<string, unknown>) {
    if (!shouldLog("error")) return;
    if (meta) console.error(message, meta);
    else console.error(message);
  },
};
