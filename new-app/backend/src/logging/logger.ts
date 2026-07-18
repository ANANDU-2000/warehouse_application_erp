/**
 * Structured JSON-line logger — Phase 3.9.
 * No pino/winston; stdout/stderr via console.
 * Never log passwords, tokens, or Authorization headers (security-rules).
 */
import { env } from "../config/env";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export type LogFields = Record<string, unknown>;

export type Logger = {
  debug: (msg: string, fields?: LogFields) => void;
  info: (msg: string, fields?: LogFields) => void;
  warn: (msg: string, fields?: LogFields) => void;
  error: (msg: string, fields?: LogFields) => void;
  child: (bindings: LogFields) => Logger;
};

function parseLevel(raw: string): LogLevel {
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return "info";
}

function shouldLog(min: LogLevel, level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[min];
}

function write(
  minLevel: LogLevel,
  level: LogLevel,
  msg: string,
  base: LogFields,
  fields?: LogFields,
): void {
  if (!shouldLog(minLevel, level)) {
    return;
  }
  const line = JSON.stringify({
    level,
    msg,
    time: new Date().toISOString(),
    ...base,
    ...fields,
  });
  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export function createLogger(
  bindings: LogFields = {},
  minLevel: LogLevel = parseLevel(env.logLevel),
): Logger {
  return {
    debug: (msg, fields) => write(minLevel, "debug", msg, bindings, fields),
    info: (msg, fields) => write(minLevel, "info", msg, bindings, fields),
    warn: (msg, fields) => write(minLevel, "warn", msg, bindings, fields),
    error: (msg, fields) => write(minLevel, "error", msg, bindings, fields),
    child: (childBindings) =>
      createLogger({ ...bindings, ...childBindings }, minLevel),
  };
}

/** Process-wide default logger. */
export const logger = createLogger();
