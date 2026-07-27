import type { Request, Response, NextFunction } from "express";
import type { DamageReportsRepository } from "../repositories/damageReports.repository";
import { sendDetail } from "../http/sendDetail";

export function createDamageReportsController(repo: DamageReportsRepository) {
  return {
    async getPendingCount(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const count = await repo.countPending(businessId);
        res.json({ count });
      } catch (e) {
        next(e);
      }
    },

    async patchReport(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const reportId = req.params.reportId as string;
        const { status, notes } = req.body as { status?: string; notes?: string };
        if (!status) {
          sendDetail(res, 400, "status is required");
          return;
        }
        const validStatuses = ["pending", "approved", "rejected", "resolved"];
        if (!validStatuses.includes(status)) {
          sendDetail(res, 400, `status must be one of: ${validStatuses.join(", ")}`);
          return;
        }
        const result = await repo.updateStatus(businessId, reportId, status, notes ?? null);
        if (!result) {
          sendDetail(res, 404, "Damage report not found");
          return;
        }
        res.json(result);
      } catch (e) {
        next(e);
      }
    },
  };
}

export type DamageReportsController = ReturnType<typeof createDamageReportsController>;
