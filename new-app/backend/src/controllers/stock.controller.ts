import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { StockService } from "../services/stock.service";
import type { HomeOverviewRepository } from "../repositories/homeOverview.repository";
import {
  StockPatchInSchema,
  QuickPurchaseInSchema,
  OpeningStockInSchema,
  PhysicalCountInSchema,
  PhysicalUpdateInSchema,
  VerifyCountInSchema,
  ReorderListPatchInSchema,
  StaffPurchaseLogInSchema,
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

    async listStock(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const page = Math.max(1, Number(req.query.page ?? 1) || 1);
        const perPage = Math.min(2000, Math.max(1, Number(req.query.per_page ?? 50) || 50));
        const result = await deps.stockService.listStock({
          businessId,
          page,
          perPage,
          q: typeof req.query.q === "string" ? req.query.q : "",
          category: typeof req.query.category === "string" ? req.query.category : "",
          subcategory: typeof req.query.subcategory === "string" ? req.query.subcategory : "",
          status: typeof req.query.status === "string" ? req.query.status : "all",
          sort: typeof req.query.sort === "string" ? req.query.sort : "name",
          missingBarcode: req.query.missing_barcode === "true",
          missingItemCode: req.query.missing_item_code === "true",
          reorderOnly: req.query.reorder_only === "true",
          unit: typeof req.query.unit === "string" ? req.query.unit : "",
        });
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async listStockCompact(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const page = Math.max(1, Number(req.query.page ?? 1) || 1);
        const perPage = Math.min(2000, Math.max(1, Number(req.query.per_page ?? 50) || 50));
        const result = await deps.stockService.listStock({
          businessId,
          page,
          perPage,
          q: typeof req.query.q === "string" ? req.query.q : "",
          category: typeof req.query.category === "string" ? req.query.category : "",
          subcategory: typeof req.query.subcategory === "string" ? req.query.subcategory : "",
          status: typeof req.query.status === "string" ? req.query.status : "all",
          sort: typeof req.query.sort === "string" ? req.query.sort : "name",
        });
        const minimal = result.items.map((i: any) => ({
          id: i.id,
          name: i.name,
          item_code: i.item_code,
          barcode: i.barcode,
          current_stock: i.current_stock,
          stock_unit: i.stock_unit,
          stock_status: i.stock_status,
          supplier_name: i.supplier_name,
          reorder_level: i.reorder_level,
          rack_location: i.rack_location,
          is_perishable: i.is_perishable,
          missing_barcode: i.missing_barcode,
          opening_stock_qty: i.opening_stock_qty,
          last_stock_updated_at: i.last_stock_updated_at,
        }));
        res.json({ items: minimal, total: result.total, page: result.page, per_page: result.per_page });
      } catch (e) {
        next(e);
      }
    },

    async searchStock(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const page = Math.max(1, Number(req.query.page ?? 1) || 1);
        const perPage = Math.min(2000, Math.max(1, Number(req.query.per_page ?? 50) || 50));
        const result = await deps.stockService.listStock({
          businessId,
          page,
          perPage,
          q: typeof req.query.q === "string" ? req.query.q : "",
          category: typeof req.query.category === "string" ? req.query.category : "",
          subcategory: typeof req.query.subcategory === "string" ? req.query.subcategory : "",
          status: typeof req.query.status === "string" ? req.query.status : "all",
          sort: typeof req.query.sort === "string" ? req.query.sort : "name",
        });
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getLowStock(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const page = Math.max(1, Number(req.query.page ?? 1) || 1);
        const perPage = Math.min(2000, Math.max(1, Number(req.query.per_page ?? 50) || 50));
        const result = await deps.stockService.listStock({
          businessId,
          page,
          perPage,
          status: "low",
          sort: "stock_asc",
        });
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getCriticalStock(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const page = Math.max(1, Number(req.query.page ?? 1) || 1);
        const perPage = Math.min(2000, Math.max(1, Number(req.query.per_page ?? 50) || 50));
        const result = await deps.stockService.listStock({
          businessId,
          page,
          perPage,
          status: "critical",
        });
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getStockAlertsSummary(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const result = await deps.stockService.getStockAlertsSummary(businessId);
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getWarehouseAlertsSummary(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const result = await deps.stockService.getWarehouseAlertsSummary(businessId);
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getLowStockSummary(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const result = await deps.stockService.getLowStockSummary(businessId);
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getLowStockOperations(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const result = await deps.stockService.getLowStockSummary(businessId);
        res.json({ summary_slice: result, items: [], total: result.total_attention, page: 1, per_page: 50 });
      } catch (e) {
        next(e);
      }
    },

    async getShellBundle(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const page = Math.max(1, Number(req.query.page ?? 1) || 1);
        const perPage = Math.min(200, Math.max(1, Number(req.query.per_page ?? 50) || 50));
        const [list, statusCounts, deliveryCounts] = await Promise.all([
          deps.stockService.listStock({
            businessId,
            page,
            perPage,
            q: typeof req.query.q === "string" ? req.query.q : "",
            category: typeof req.query.category === "string" ? req.query.category : "",
            subcategory: typeof req.query.subcategory === "string" ? req.query.subcategory : "",
            status: typeof req.query.status === "string" ? req.query.status : "all",
            sort: typeof req.query.sort === "string" ? req.query.sort : "name",
          }),
          deps.stockService.getStockAlertsSummary(businessId),
          Promise.resolve({ pending: 0, delivered: 0 }),
        ]);
        res.json({ list, status_counts: statusCounts, delivery_counts: deliveryCounts, audit_recent: [] });
      } catch (e) {
        next(e);
      }
    },

    async getDeliveryIndicatorCounts(_req: Request, res: Response, next: NextFunction) {
      try {
        res.json({ pending: 0, delivered: 0 });
      } catch (e) {
        next(e);
      }
    },

    async listOpeningStockSetup(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const result = await deps.stockService.listOpeningStockSetup(businessId);
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getItemIntelligence(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const result = await deps.stockService.getItemIntelligence(businessId, itemId);
        if (!result) {
          sendDetail(res, 404, "Item not found");
          return;
        }
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getItemSummary(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const result = await deps.stockService.getItemSummary(businessId, itemId);
        if (!result) {
          sendDetail(res, 404, "Item not found");
          return;
        }
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async getItemBundle(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const result = await deps.stockService.getItemBundle(businessId, itemId);
        if (!result) {
          sendDetail(res, 404, "Item not found");
          return;
        }
        res.json(result);
      } catch (e) {
        next(e);
      }
    },

    async updatePhysicalStock(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const parsed = PhysicalUpdateInSchema.safeParse(req.body);
        if (!parsed.success) {
          sendDetail(res, 400, parsed.error.issues[0]?.message ?? "Invalid input");
          return;
        }
        const result = await deps.stockService.updatePhysicalStock({
          businessId,
          itemId,
          newQty: parsed.data.new_qty,
          adjustmentType: parsed.data.adjustment_type,
          reason: parsed.data.reason,
          lastSeenStockVersion: parsed.data.last_seen_stock_version,
          actorId: user.id,
          actorName: user.name ?? user.username ?? user.email ?? "Staff",
        });
        if (result.conflict) {
          sendDetail(res, 409, result.message ?? "Stock version conflict");
          return;
        }
        if (!result.success) {
          sendDetail(res, 400, result.message ?? "Update failed");
          return;
        }
        const updated = await deps.stockService.getStockDetail(businessId, itemId);
        res.json(updated);
      } catch (e) {
        next(e);
      }
    },

    async verifyStockCount(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const parsed = VerifyCountInSchema.safeParse(req.body);
        if (!parsed.success) {
          sendDetail(res, 400, parsed.error.issues[0]?.message ?? "Invalid input");
          return;
        }
        const result = await deps.stockService.verifyStockCount({
          businessId,
          itemId,
          countedQty: parsed.data.counted_qty,
          reason: parsed.data.reason,
          actorId: user.id,
          actorName: user.name ?? user.username ?? user.email ?? "Staff",
        });
        if (!result.success) {
          sendDetail(res, 400, result.message ?? "Verify failed");
          return;
        }
        const updated = await deps.stockService.getStockDetail(businessId, itemId);
        res.json(updated);
      } catch (e) {
        next(e);
      }
    },

    async listStaffPurchaseLogs(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = typeof req.query.item_id === "string" ? req.query.item_id : undefined;
        const logs = await deps.stockService.listStaffPurchaseLogs(businessId, itemId);
        res.json(logs);
      } catch (e) {
        next(e);
      }
    },

    async createStaffPurchase(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const user = req.user;
        if (!user) {
          sendDetail(res, 401, "Not authenticated");
          return;
        }
        const parsed = StaffPurchaseLogInSchema.safeParse(req.body);
        if (!parsed.success) {
          sendDetail(res, 400, parsed.error.issues[0]?.message ?? "Invalid input");
          return;
        }
        const result = await deps.stockService.createStaffPurchase({
          businessId,
          itemId: parsed.data.item_id,
          qty: parsed.data.qty,
          supplierId: parsed.data.supplier_id,
          brokerId: parsed.data.broker_id,
          notes: parsed.data.notes,
          idempotencyKey: parsed.data.idempotency_key,
          actorId: user.id,
          actorName: user.name ?? user.username ?? user.email ?? "Staff",
        });
        if (!result.success) {
          sendDetail(res, 400, result.message ?? "Create failed");
          return;
        }
        res.status(201).json(result.out);
      } catch (e) {
        next(e);
      }
    },

    async getActiveAuditSession(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const result = await deps.stockService.getActiveAuditSession(businessId);
        res.json(result);
      } catch (e) {
        next(e);
      }
    },
  };
}

export type StockController = ReturnType<typeof createStockController>;
