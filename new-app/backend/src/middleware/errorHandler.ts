import type { NextFunction, Request, Response } from "express";

/**
 * Minimal error handler stub — full middleware in Phase 3.8.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  const status = 500;
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ error: message });
}
