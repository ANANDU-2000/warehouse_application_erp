/**
 * Users HTTP — list + create slices.
 * Source: source-app/backend/app/routers/users.py
 */
import type { Request, Response, NextFunction } from "express";
import type { ConnectionPool } from "mssql";
import { sendDetail } from "../http/sendDetail";
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import {
  listUsersForBusiness,
  parseIncludeInactive,
} from "../services/usersList.service";
import {
  actorFromUser,
  createUserForBusiness,
  type CreateUserDeps,
} from "../services/usersCreate.service";
import {
  userCreateInSchema,
} from "../validation/users.schemas";
import {
  SchemaValidationError,
  validateWithSchema,
} from "../validation/validate";

export type UsersControllerDeps = {
  businessUsers: BusinessUsersRepository;
  businesses: BusinessesRepository;
  pool?: ConnectionPool;
  /** Test seam for create. */
  runInTransaction?: CreateUserDeps["runInTransaction"];
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

    async create(
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
        const user = req.user;
        const membership = req.membership;
        if (!user || !membership) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }

        let body;
        try {
          body = validateWithSchema(userCreateInSchema, req.body);
        } catch (e) {
          if (e instanceof SchemaValidationError) {
            sendDetail(res, 422, e.detail);
            return;
          }
          throw e;
        }

        const out = await createUserForBusiness(
          {
            pool: deps.pool,
            businesses: deps.businesses,
            businessUsers: deps.businessUsers,
            runInTransaction: deps.runInTransaction,
          },
          {
            businessId,
            body,
            actorMembershipRole: membership.role,
            actor: actorFromUser(user),
          },
        );
        res.status(201).json(out);
      } catch (e) {
        next(e);
      }
    },
  };
}
