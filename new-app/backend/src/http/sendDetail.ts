/**
 * FastAPI-style error/success detail JSON helper.
 */
import type { Response } from "express";

export function sendDetail(
  res: Response,
  status: number,
  detail: string | Record<string, unknown>,
): void {
  res.status(status).json({ detail });
}
