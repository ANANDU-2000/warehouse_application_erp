import type { Request, Response, NextFunction } from "express";
import { getHealthStatus } from "../services/health.service";

export async function getHealth(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = await getHealthStatus();
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
