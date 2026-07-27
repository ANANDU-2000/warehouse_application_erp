import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import type { ExportsService } from "../services/exports.service";

export type SettingsControllerDeps = {
  businesses: BusinessesRepository;
  exports: ExportsService;
};

export function createSettingsController(deps: SettingsControllerDeps) {
  return {
    async patchBranding(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const allowedFields = [
          "name",
          "branding_title",
          "branding_logo_url",
          "gst_number",
          "address",
          "phone",
          "contact_email",
        ];
        const updates: Record<string, unknown> = {};
        for (const key of allowedFields) {
          if (req.body[key] !== undefined) {
            let val = req.body[key];
            if (val === "" || val === null) {
              updates[key] = null;
            } else if (key === "name" && typeof val === "string") {
              if (!val.trim()) {
                sendDetail(res, 400, "Business name cannot be empty");
                return;
              }
              updates[key] = val.trim();
            } else if (key === "contact_email" && typeof val === "string") {
              updates[key] = val.trim().toLowerCase();
            } else if (key === "gst_number" && typeof val === "string") {
              updates[key] = val.trim().toUpperCase();
            } else {
              updates[key] = val;
            }
          }
        }
        if (Object.keys(updates).length === 0) {
          sendDetail(res, 400, "No valid fields to update");
          return;
        }
        await deps.businesses.updateBranding(businessId, updates);
        const updated = await deps.businesses.findById(businessId);
        res.json(updated);
      } catch (e) {
        next(e);
      }
    },

    async exportJson(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const rangeDays =
          typeof req.query.range_days === "string"
            ? Math.min(365, Math.max(1, Number(req.query.range_days) || 90))
            : 90;
        const { filename, data } = await deps.exports.exportJson(
          businessId,
          rangeDays,
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        res.setHeader("Content-Type", "application/json");
        res.json(data);
      } catch (e) {
        next(e);
      }
    },

    async exportStockXlsx(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const { buffer, filename } = await deps.exports.exportStockXlsx(
          businessId,
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.end(buffer);
      } catch (e) {
        const err = e as Error & { status?: number };
        if (err.status === 404) {
          sendDetail(res, 404, err.message);
          return;
        }
        next(e);
      }
    },

    async exportPurchasesPdf(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const businessId = req.params.businessId as string;
        const { buffer, filename } = await deps.exports.exportPurchasesPdf(
          businessId,
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        res.setHeader("Content-Type", "application/pdf");
        res.end(buffer);
      } catch (e) {
        next(e);
      }
    },

    async exportZip(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const rangePreset =
          typeof req.body.range_preset === "string"
            ? req.body.range_preset
            : "month";
        const { stream, filename } = await deps.exports.exportZip(
          businessId,
          rangePreset,
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        res.setHeader("Content-Type", "application/zip");
        stream.pipe(res);
      } catch (e) {
        const err = e as Error & { status?: number };
        if (err.status === 404) {
          sendDetail(res, 404, err.message);
          return;
        }
        next(e);
      }
    },
  };
}

export type SettingsController = ReturnType<typeof createSettingsController>;
