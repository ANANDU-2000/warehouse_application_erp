/**
 * /v1/me HTTP adapters — Login post-auth (Slice L1).
 * Source: source-app/backend/app/routers/me.py
 */
import type { Request, Response, NextFunction } from "express";
import type { MembershipsRepository } from "../repositories/memberships.repository";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import { listMyBusinesses } from "../services/meBusinesses.service";
import { sendDetail } from "../http/sendDetail";

export type MeControllerDeps = {
  memberships: MembershipsRepository;
  businesses: BusinessesRepository;
};

export function createMeController(deps: MeControllerDeps) {
  async function listBusinesses(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendDetail(res, 401, "Not authenticated");
        return;
      }
      const briefs = await listMyBusinesses(
        { memberships: deps.memberships, businesses: deps.businesses },
        user.id,
      );
      res.status(200).json(briefs);
    } catch (err) {
      next(err);
    }
  }

  return { listBusinesses };
}

export type MeController = ReturnType<typeof createMeController>;
