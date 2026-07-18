/**
 * HTTP access log — after requestId middleware.
 * Logs method, path, statusCode, durationMs, requestId — never Authorization.
 */
import type { NextFunction, Request, Response } from "express";
import { logger } from "../logging/logger";

export function requestLog(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const started = Date.now();
  res.on("finish", () => {
    const log = req.requestId
      ? logger.child({ requestId: req.requestId })
      : logger;
    log.info("http.access", {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: Date.now() - started,
    });
  });
  next();
}
