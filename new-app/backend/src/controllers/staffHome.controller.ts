/**
 * Staff home WIRE controllers — Flutter-exact paths.
 * Source: me.py get_my_profile; trade_purchases delivery-pipeline;
 *         stock list / opening/missing / variances/today
 */
import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { UsersRepository } from "../repositories/users.repository";
import type { StaffHomeRepository } from "../repositories/staffHome.repository";

export type StaffHomeControllerDeps = {
  users: UsersRepository;
  staffHome: StaffHomeRepository;
};

export function createStaffHomeController(deps: StaffHomeControllerDeps) {
  return {
    async getProfile(req: Request, res: Response, next: NextFunction) {
      try {
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const row = await deps.users.findById(user.id);
        if (!row) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        res.status(200).json({
          id: row.id,
          email: row.email,
          username: row.username,
          name: row.name,
          is_super_admin: row.is_super_admin,
        });
      } catch (e) {
        next(e);
      }
    },

    async getDeliveryPipeline(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        res.json(await deps.staffHome.deliveryPipeline(businessId));
      } catch (e) {
        next(e);
      }
    },

    async listStock(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const page = Number(req.query.page ?? 1) || 1;
        const perPage = Number(req.query.per_page ?? 50) || 50;
        const status =
          typeof req.query.status === "string" ? req.query.status : "all";
        const sort =
          typeof req.query.sort === "string" ? req.query.sort : "name";
        const missingItemCode =
          req.query.missing_item_code === "true" ||
          req.query.missing_item_code === "1";
        res.json(
          await deps.staffHome.listStock({
            businessId,
            page,
            perPage,
            status,
            sort,
            missingItemCode,
          }),
        );
      } catch (e) {
        next(e);
      }
    },

    async openingMissing(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const limit = Number(req.query.limit ?? 100) || 100;
        res.json(await deps.staffHome.openingMissing(businessId, limit));
      } catch (e) {
        next(e);
      }
    },

    async variancesToday(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        res.json(await deps.staffHome.variancesToday(businessId));
      } catch (e) {
        next(e);
      }
    },
  };
}

export type StaffHomeController = ReturnType<typeof createStaffHomeController>;
