import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { StockService } from "../services/stock.service";
import type { HomeOverviewRepository } from "../repositories/homeOverview.repository";
import {
  StockPatchInSchema,
  QuickPurchaseInSchema,
  OpeningStockInSchema,
  PhysicalCountInSchema,
  ReorderListPatchInSchema,
} from "../validation/stock.schemas";

export type StockControllerDeps = {
  stockService: StockService;
  homeOverview: HomeOverviewRepository;
};

export function createStockController(deps: StockControllerDeps) {
  return {
    async getStockDetail(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const periodStart =
          typeof req.query.period_start === "string"
            ? req.query.period_start.trim()
            : undefined;
        const periodEnd =
          typeof req.query.period_end === "string"
            ? req.query.period_end.trim()
            : undefined;
        const detail = await deps.stockService.getStockDetail(
          businessId,
          itemId,
          periodStart,
          periodEnd,
        );
        if (!detail) {
          sendDetail(res, 404, "Item not found");
          return;
        }
        res.json(detail);
      } catch (e) {
        next(e);
      }
    },

    async patchStock(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const parsed = StockPatchInSchema.safeParse(req.body);
        if (!parsed.success) {
          sendDetail(res, 400, parsed.error.issues[0]?.message ?? "Invalid input");
          return;
        }
        const result = await deps.stockService.patchStock({
          businessId,
          itemId,
          movementKind: "adjustment",
          deltaQty: parsed.data.new_qty,
          mode: "absolute",
          reason: parsed.data.reason ?? null,
          notes: null,
          idempotencyKey:
            parsed.data.idempotency_key ?? `patch:${itemId}:${Date.now()}`,
          actorId: user.id,
          actorName: user.name ?? user.username ?? user.email ?? "Staff",
          lastSeenStockVersion: parsed.data.last_seen_stock_version,
          adjustmentType: parsed.data.adjustment_type ?? "manual",
        });
        if (result.conflict) {
          sendDetail(res, 409, result.message ?? "Stock version conflict");
          return;
        }
        if (!result.success) {
          sendDetail(res, 404, result.message ?? "Item not found");
          return;
        }
        const updated = await deps.stockService.getStockDetail(
          businessId,
          itemId,
        );
        res.json(updated);
      } catch (e) {
        next(e);
      }
    },

    async listMovements(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50) || 50));
        const offset = Math.max(0, Number(req.query.offset ?? 0) || 0);
        const movements = await deps.stockService.listMovements(
          businessId,
          itemId,
          limit,
          offset,
        );
        res.json(movements);
      } catch (e) {
        next(e);
      }
    },

    async barcodeLookup(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const code =
          typeof req.query.code === "string" ? req.query.code.trim() : "";
        if (!code) {
          sendDetail(res, 400, "code query parameter required");
          return;
        }
        const result = await deps.stockService.barcodeLookup(businessId, code);
        if (!result) {
          sendDetail(res, 404, "Item not found by barcode or item code");
          return;
        }
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getInventorySummary(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const businessId = req.params.businessId as string;
        const result = await deps.homeOverview.inventorySummary(businessId);
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async listReorderEntries(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const status =
          typeof req.query.status === "string" ? req.query.status : "all";
        const result = await deps.stockService.listReorderEntries(
          businessId,
          status,
        );
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async createReorderEntry(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const result = await deps.stockService.createReorderEntry(
          businessId,
          itemId,
          user.id,
          user.name ?? user.username ?? user.email ?? "Staff",
        );
        res.status(201).json(result);
      } catch (e) {
        next(e);
      }
    },

    async patchReorderEntry(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const entryId = req.params.entryId as string;
        const parsed = ReorderListPatchInSchema.safeParse(req.body);
        if (!parsed.success) {
          sendDetail(res, 400, parsed.error.issues[0]?.message ?? "Invalid input");
          return;
        }
        const updated = await deps.stockService.updateReorderEntry(
          entryId,
          businessId,
          parsed.data.status,
        );
        if (!updated) {
          sendDetail(res, 404, "Reorder entry not found");
          return;
        }
        res.json({ ok: true });
      } catch (e) {
        next(e);
      }
    },

    async deleteReorderEntry(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const entryId = req.params.entryId as string;
        const deleted = await deps.stockService.deleteReorderEntry(
          entryId,
          businessId,
        );
        if (!deleted) {
          sendDetail(res, 404, "Reorder entry not found");
          return;
        }
        res.status(204).send();
      } catch (e) {
        next(e);
      }
    },

    async quickPurchase(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const parsed = QuickPurchaseInSchema.safeParse(req.body);
        if (!parsed.success) {
          sendDetail(res, 400, parsed.error.issues[0]?.message ?? "Invalid input");
          return;
        }
        const result = await deps.stockService.quickPurchase({
          businessId,
          itemId,
          qty: parsed.data.qty,
          supplierId: parsed.data.supplier_id,
          brokerId: parsed.data.broker_id,
          notes: parsed.data.notes,
          idempotencyKey: parsed.data.idempotency_key,
          actorId: user.id,
          actorName:
            user.name ?? user.username ?? user.email ?? "Staff",
        });
        if (result.conflict) {
          sendDetail(res, 409, result.message ?? "Conflict");
          return;
        }
        if (!result.success) {
          sendDetail(res, 404, result.message ?? "Item not found");
          return;
        }
        res.status(201).json(result.out);
      } catch (e) {
        next(e);
      }
    },

    async undoLastAdjustment(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const result = await deps.stockService.undoLastAdjustment(
          businessId,
          itemId,
          user.id,
        );
        if (result.conflict) {
          sendDetail(res, 409, result.message ?? "Conflict");
          return;
        }
        if (!result.success) {
          sendDetail(res, 400, result.message ?? "No adjustment to undo");
          return;
        }
        const updated = await deps.stockService.getStockDetail(
          businessId,
          itemId,
        );
        res.json(updated);
      } catch (e) {
        next(e);
      }
    },

    async listStockAuditByItem(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50) || 50));
        const audit = await deps.stockService.listStockAuditByItem(
          businessId,
          itemId,
          limit,
        );
        res.json(audit);
      } catch (e) {
        next(e);
      }
    },

    async createOpeningStock(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const parsed = OpeningStockInSchema.safeParse(req.body);
        if (!parsed.success) {
          sendDetail(res, 400, parsed.error.issues[0]?.message ?? "Invalid input");
          return;
        }
        const result = await deps.stockService.createOpeningStock({
          businessId,
          itemId,
          qty: parsed.data.qty,
          reason: parsed.data.reason ?? null,
          notes: parsed.data.notes ?? null,
          userId: user.id,
          userName:
            user.name ?? user.username ?? user.email ?? "Staff",
          idempotencyKey:
            parsed.data.idempotency_key ?? `os:${itemId}:${Date.now()}`,
        });
        if (!result.success) {
          sendDetail(
            res,
            400,
            result.message ?? "Opening stock already set or item not found",
          );
          return;
        }
        const updated = await deps.stockService.getStockDetail(
          businessId,
          itemId,
        );
        res.status(201).json(updated);
      } catch (e) {
        next(e);
      }
    },

    async createPhysicalCount(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const parsed = PhysicalCountInSchema.safeParse(req.body);
        if (!parsed.success) {
          sendDetail(res, 400, parsed.error.issues[0]?.message ?? "Invalid input");
          return;
        }
        const result = await deps.stockService.createPhysicalCount({
          businessId,
          itemId,
          countedQty: parsed.data.counted_qty,
          periodStart: parsed.data.period_start ?? null,
          periodEnd: parsed.data.period_end ?? null,
          notes: parsed.data.notes ?? null,
          countedBy: user.id,
          countedByName:
            user.name ?? user.username ?? user.email ?? "Staff",
        });
        if (!result.success) {
          sendDetail(res, 404, result.message ?? "Item not found");
          return;
        }
        res.status(201).json({ id: result.id });
      } catch (e) {
        next(e);
      }
    },

    async barcodeLabel(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const item = await deps.stockService.getBarcodeLabel(businessId, itemId);
        if (!item) {
          sendDetail(res, 404, "Item not found");
          return;
        }
        res.json(item);
      } catch (e) {
        next(e);
      }
    },

    async barcodeBatch(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const { item_ids } = req.body as { item_ids: string[] };
        if (!Array.isArray(item_ids) || item_ids.length === 0) {
          sendDetail(res, 400, "item_ids array is required");
          return;
        }
        const labels = await deps.stockService.getBarcodeBatch(businessId, item_ids);
        res.json({ labels });
      } catch (e) {
        next(e);
      }
    },

    async purchaseIntelligence(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const result = await deps.stockService.getPurchaseIntelligence(businessId, itemId);
        res.json(result);
      } catch (e) {
        next(e);
      }
    },
  };
}

export type StockController = ReturnType<typeof createStockController>;
