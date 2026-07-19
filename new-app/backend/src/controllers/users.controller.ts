/**
 * Users HTTP — list + create + profile + patch + delete + reset + credentials + permissions.
 * Source: source-app/backend/app/routers/users.py
 */
import type { Request, Response, NextFunction } from "express";
import type { ConnectionPool } from "mssql";
import { sendDetail } from "../http/sendDetail";
import { HttpError } from "../errors/httpError";
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import type { MembershipsRepository } from "../repositories/memberships.repository";
import {
  listUsersForBusiness,
  parseIncludeInactive,
} from "../services/usersList.service";
import {
  actorFromUser,
  createUserForBusiness,
  type CreateUserDeps,
} from "../services/usersCreate.service";
import { getUserProfileForBusiness } from "../services/usersProfile.service";
import {
  patchActorFromUser,
  patchUserForBusiness,
  type PatchUserDeps,
} from "../services/usersPatch.service";
import {
  deleteActorFromUser,
  deleteUserForBusiness,
  type DeleteUserDeps,
} from "../services/usersDelete.service";
import {
  resetActorFromUser,
  resetPasswordForBusiness,
  type ResetPasswordDeps,
} from "../services/usersResetPassword.service";
import { getUserCredentialsForBusiness } from "../services/usersCredentials.service";
import {
  getPermissionsForBusiness,
  patchPermissionsForBusiness,
} from "../services/usersPermissions.service";
import {
  listCreatedItemsForBusiness,
  parseCreatedItemsLimit,
} from "../services/usersCreatedItems.service";
import {
  listStockAdjustmentsForBusiness,
  parseStockAdjustmentsLimit,
} from "../services/usersStockAdjustments.service";
import {
  listPurchasesForBusiness,
  parsePurchasesLimit,
} from "../services/usersPurchases.service";
import {
  getLedgerForBusiness,
  parseGroupedQuery,
  parseLedgerLimit,
} from "../services/usersLedger.service";
import { listActiveSessionsForBusiness } from "../services/usersActiveSessions.service";
import {
  userCreateInSchema,
  userPatchInSchema,
  permissionsPatchInSchema,
} from "../validation/users.schemas";
import {
  SchemaValidationError,
  validateWithSchema,
} from "../validation/validate";

export type UsersControllerDeps = {
  businessUsers: BusinessUsersRepository;
  businesses: BusinessesRepository;
  memberships: MembershipsRepository;
  pool?: ConnectionPool;
  /** Test seam for create. */
  runInTransaction?: CreateUserDeps["runInTransaction"];
  /** Test seam for patch (shares pool txn pattern). */
  runPatchInTransaction?: PatchUserDeps["runInTransaction"];
  /** Test seam for delete. */
  runDeleteInTransaction?: DeleteUserDeps["runInTransaction"];
  /** Test seam for reset-password. */
  runResetInTransaction?: ResetPasswordDeps["runInTransaction"];
  /** Test seam for ledger grouped buckets (UTC now). */
  ledgerNow?: Date;
  /** Test seam for active-sessions cutoff (UTC now). */
  activeSessionsNow?: Date;
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

    async activeSessions(
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
        const out = await listActiveSessionsForBusiness(
          deps.businessUsers,
          deps.businesses,
          businessId,
          deps.activeSessionsNow ?? new Date(),
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

    async get(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        const out = await getUserProfileForBusiness(
          deps.businessUsers,
          deps.businesses,
          businessId,
          userId,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async patch(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
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
          body = validateWithSchema(userPatchInSchema, req.body ?? {});
        } catch (e) {
          if (e instanceof SchemaValidationError) {
            sendDetail(res, 422, e.detail);
            return;
          }
          throw e;
        }

        const out = await patchUserForBusiness(
          {
            pool: deps.pool,
            businesses: deps.businesses,
            businessUsers: deps.businessUsers,
            runInTransaction: deps.runPatchInTransaction,
          },
          {
            businessId,
            userId,
            body,
            actorMembershipRole: membership.role,
            actor: patchActorFromUser(user),
          },
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async remove(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        const user = req.user;
        const membership = req.membership;
        if (!user || !membership) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }

        await deleteUserForBusiness(
          {
            pool: deps.pool,
            businessUsers: deps.businessUsers,
            runInTransaction: deps.runDeleteInTransaction,
          },
          {
            businessId,
            userId,
            actorMembershipRole: membership.role,
            actor: deleteActorFromUser(user),
          },
        );
        res.status(204).send();
      } catch (e) {
        next(e);
      }
    },

    async resetPassword(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        const user = req.user;
        const membership = req.membership;
        if (!user || !membership) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }

        const out = await resetPasswordForBusiness(
          {
            pool: deps.pool,
            businessUsers: deps.businessUsers,
            runInTransaction: deps.runResetInTransaction,
          },
          {
            businessId,
            userId,
            actorMembershipRole: membership.role,
            actor: resetActorFromUser(user),
          },
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async credentials(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        const out = await getUserCredentialsForBusiness(
          deps.businessUsers,
          businessId,
          userId,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async getPermissions(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        const out = await getPermissionsForBusiness(
          deps.businessUsers,
          businessId,
          userId,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async patchPermissions(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }

        let body;
        try {
          body = validateWithSchema(permissionsPatchInSchema, req.body ?? {});
        } catch (e) {
          if (e instanceof SchemaValidationError) {
            sendDetail(res, 422, e.detail);
            return;
          }
          throw e;
        }

        const out = await patchPermissionsForBusiness(
          deps.businessUsers,
          deps.memberships,
          businessId,
          userId,
          body,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async createdItems(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        let limit: number;
        try {
          limit = parseCreatedItemsLimit(req.query.limit);
        } catch (e) {
          if (e instanceof HttpError) {
            sendDetail(res, e.status, e.detail);
            return;
          }
          throw e;
        }
        const out = await listCreatedItemsForBusiness(
          deps.businessUsers,
          businessId,
          userId,
          limit,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async stockAdjustments(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        let limit: number;
        try {
          limit = parseStockAdjustmentsLimit(req.query.limit);
        } catch (e) {
          if (e instanceof HttpError) {
            sendDetail(res, e.status, e.detail);
            return;
          }
          throw e;
        }
        const out = await listStockAdjustmentsForBusiness(
          deps.businessUsers,
          businessId,
          userId,
          limit,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async purchases(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        let limit: number;
        try {
          limit = parsePurchasesLimit(req.query.limit);
        } catch (e) {
          if (e instanceof HttpError) {
            sendDetail(res, e.status, e.detail);
            return;
          }
          throw e;
        }
        const out = await listPurchasesForBusiness(
          deps.businessUsers,
          businessId,
          userId,
          limit,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async ledger(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        const userId = req.params.userId;
        if (typeof businessId !== "string" || !businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        if (typeof userId !== "string" || !userId) {
          sendDetail(res, 400, "userId required");
          return;
        }
        let limit: number;
        let grouped: boolean;
        try {
          limit = parseLedgerLimit(req.query.limit);
          grouped = parseGroupedQuery(req.query.grouped);
        } catch (e) {
          if (e instanceof HttpError) {
            sendDetail(res, e.status, e.detail);
            return;
          }
          throw e;
        }
        const out = await getLedgerForBusiness(
          deps.businessUsers,
          businessId,
          userId,
          {
            limit,
            grouped,
            now: deps.ledgerNow,
          },
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },
  };
}
