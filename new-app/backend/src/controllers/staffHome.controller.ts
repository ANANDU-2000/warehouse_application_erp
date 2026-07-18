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

    /**
     * GET …/stock/totals — stock_ops.stock_totals
     * No period → on-hand; period_start+period_end → purchased in range.
     */
    async stockTotals(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const periodStart =
          typeof req.query.period_start === "string"
            ? req.query.period_start.trim()
            : "";
        const periodEnd =
          typeof req.query.period_end === "string"
            ? req.query.period_end.trim()
            : "";
        if (periodStart && periodEnd) {
          const iso = /^\d{4}-\d{2}-\d{2}$/;
          if (!iso.test(periodStart.slice(0, 10)) || !iso.test(periodEnd.slice(0, 10))) {
            sendDetail(
              res,
              400,
              "Invalid period_start or period_end (use YYYY-MM-DD)",
            );
            return;
          }
          let dFrom = periodStart.slice(0, 10);
          let dTo = periodEnd.slice(0, 10);
          if (dFrom > dTo) {
            const tmp = dFrom;
            dFrom = dTo;
            dTo = tmp;
          }
          res.json(
            await deps.staffHome.stockTotalsPurchased(businessId, dFrom, dTo),
          );
          return;
        }
        res.json(await deps.staffHome.stockTotalsOnHand(businessId));
      } catch (e) {
        next(e);
      }
    },

    /**
     * GET …/activity-log — users.py list_activity
     */
    async listActivityLog(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const userId =
          typeof req.query.user_id === "string" && req.query.user_id.trim()
            ? req.query.user_id.trim()
            : user.id;
        const period =
          typeof req.query.period === "string" ? req.query.period : "today";
        const daysRaw =
          typeof req.query.days === "string" ? Number(req.query.days) : null;
        const days =
          daysRaw != null && Number.isFinite(daysRaw) && daysRaw > 0
            ? Math.min(90, Math.floor(daysRaw))
            : null;
        const page = Number(req.query.page ?? 1) || 1;
        const perPage = Number(req.query.per_page ?? 50) || 50;
        res.json(await deps.staffHome.listActivityLog({
            businessId,
            userId,
            period,
            days,
            page,
            perPage,
          }),
        );
      } catch (e) {
        next(e);
      }
    },

    /**
     * GET …/notifications — notifications.py list_notifications
     */
    async listNotifications(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const membership = req.membership;
        const userRole = (membership?.role ?? "").trim().toLowerCase();
        const page = Number(req.query.page ?? 1) || 1;
        const perPage = Number(req.query.per_page ?? 30) || 30;
        const unreadOnly =
          req.query.unread_only === "true" || req.query.unread_only === "1";
        res.json(
          await deps.staffHome.listNotifications({
            businessId,
            userId: user.id,
            userRole,
            page,
            perPage,
            kind:
              typeof req.query.kind === "string" ? req.query.kind.trim() : null,
            category:
              typeof req.query.category === "string"
                ? req.query.category.trim()
                : null,
            priority:
              typeof req.query.priority === "string"
                ? req.query.priority.trim()
                : null,
            unreadOnly,
            q: typeof req.query.q === "string" ? req.query.q : null,
          }),
        );
      } catch (e) {
        next(e);
      }
    },

    /** GET …/notifications/unread-count */
    async notificationsUnreadCount(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const unread = await deps.staffHome.notificationsUnreadCount(
          businessId,
          user.id,
        );
        res.json({ unread });
      } catch (e) {
        next(e);
      }
    },

    /** GET …/stock/alerts/summary */
    async stockAlertsSummary(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        res.json(await deps.staffHome.stockAlertsSummary(businessId));
      } catch (e) {
        next(e);
      }
    },
  };
}

export type StaffHomeController = ReturnType<typeof createStaffHomeController>;
