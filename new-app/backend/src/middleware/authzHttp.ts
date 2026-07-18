/**
 * Shared authz HTTP response helper — FastAPI-style { detail }.
 */
import type { Response } from "express";

export function sendAuthzDetail(
  res: Response,
  status: number,
  detail: string,
): void {
  res.status(status).json({ detail });
}
