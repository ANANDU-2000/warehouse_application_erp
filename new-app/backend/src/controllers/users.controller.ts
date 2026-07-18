/**
 * Users HTTP — list slice.
 * Source: source-app/backend/app/routers/users.py:list_users
 */
import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import {
  listUsersForBusiness,
  parseIncludeInactive,
} from "../services/usersList.service";

export type UsersControllerDeps = {
  businessUsers: BusinessUsersRepository;
  businesses: BusinessesRepository;
};

export function createUsersController(deps: UsersControllerDeps) {
  return {
    async list(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        let includeInactive: boolean;
        try {
          includeInactive = parseIncludeInactive(req.query.include_inactive);
        } catch {
          sendDetail(res, 422, "include_inactive must be a boolean");
          return;
        }
        const out = await listUsersForBusiness(
          deps.businessUsers,
          deps.businesses,
          businessId,
          includeInactive,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },
  };
}
