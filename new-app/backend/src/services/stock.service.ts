import type { StockRepository } from "../repositories/stock.repository";
import type {
  StockDetailOut,
  StockMovementOut,
  BarcodeLookupOut,
  QuickPurchaseOut,
  ReorderListOut,
  StockAuditItemOut,
} from "../validation/stock.schemas";
import { randomUUID } from "node:crypto";

export type StockServiceDeps = {
  stockRepo: StockRepository;
  onVarianceNotification?: (opts: {
    businessId: string;
    itemId: string;
    itemName: string;
    expectedQty: number;
    foundQty: number;
    delta: number;
    unit: string | null;
  }) => Promise<void>;
};

export function createStockService(deps: StockServiceDeps) {
  const repo = deps.stockRepo;

  async function applyStockMovement(opts: {
    businessId: string;
    itemId: string;
    movementKind: string;
    deltaQty: number;
    mode: "absolute" | "delta";
    reason: string | null;
    notes: string | null;
    sourceType?: string | null;
    sourceId?: string | null;
    idempotencyKey: string;
    actorId: string | null;
    actorName: string | null;
    lastSeenStockVersion?: number;
    adjustmentType: string;
  }): Promise<{
    success: boolean;
    conflict?: boolean;
    message?: string;
    oldQty?: number;
    newQty?: number;
    movementId?: string;
  }> {
    const item = await repo.getCatalogItemForPatch(
      opts.businessId,
      opts.itemId,
    );
    if (!item) {
      return { success: false, message: "Item not found" };
    }

    const currentQty = item.current_stock;
    let newQty: number;

    if (opts.mode === "absolute") {
      newQty = opts.deltaQty;
    } else {
      newQty = currentQty + opts.deltaQty;
    }
    if (newQty < 0) newQty = 0;

    if (opts.lastSeenStockVersion != null) {
      if (opts.lastSeenStockVersion !== item.stock_version) {
        return {
          success: false,
          conflict: true,
          message: `Stock version mismatch: expected ${opts.lastSeenStockVersion}, current ${item.stock_version}`,
        };
      }
    }

    const deltaQty = newQty - currentQty;

    const updated = await repo.patchStockAtomic(
      opts.itemId,
      newQty,
      item.stock_version,
    );
    if (!updated) {
      return {
        success: false,
        conflict: true,
        message: "Concurrent stock modification detected. Please refresh and retry.",
      };
    }

    const movementId = await repo.insertStockMovement({
      businessId: opts.businessId,
      itemId: opts.itemId,
      movementKind: opts.movementKind,
      deltaQty,
      qtyBefore: currentQty,
      qtyAfter: newQty,
      stockUnit: item.stock_unit,
      reason: opts.reason,
      notes: opts.notes,
      sourceType: opts.sourceType ?? null,
      sourceId: opts.sourceId ?? null,
      idempotencyKey: opts.idempotencyKey,
      actorId: opts.actorId,
      actorName: opts.actorName,
      unitMismatchFlag: false,
      metadataJson: null,
    });

    await repo.insertStockAdjustmentLog({
      businessId: opts.businessId,
      itemId: opts.itemId,
      oldQty: currentQty,
      newQty,
      adjustmentType: opts.adjustmentType,
      reason: opts.reason,
      updatedBy: opts.actorId,
      updatedByName: opts.actorName,
    });

    if (deltaQty !== 0 && deps.onVarianceNotification) {
      await deps.onVarianceNotification({
        businessId: opts.businessId,
        itemId: opts.itemId,
        itemName: item.name,
        expectedQty: currentQty,
        foundQty: newQty,
        delta: deltaQty,
        unit: item.stock_unit,
      });
    }

    return { success: true, oldQty: currentQty, newQty, movementId };
  }

  return {
    async getStockDetail(
      businessId: string,
      itemId: string,
      _periodStart?: string,
      _periodEnd?: string,
    ): Promise<StockDetailOut | null> {
      const detail = await repo.getStockDetail(businessId, itemId);
      if (!detail) return null;
      const delivQty = await repo.getMovementDeliveredQty(businessId, itemId);
      const supplierName = await repo.getSupplierNameForItem(businessId, itemId);
      const lastPurHumanId = await repo.getLastPurchaseHumanId(businessId, itemId);
      detail.physical_stock_qty = delivQty > 0 ? delivQty : null;
      detail.physical_stock_difference_qty =
        delivQty > 0 ? detail.current_stock - delivQty : null;
      detail.supplier_name = supplierName;
      detail.last_purchase_human_id = lastPurHumanId;
      return detail;
    },

    async listMovements(
      businessId: string,
      itemId: string,
      limit: number,
      offset: number,
    ): Promise<StockMovementOut[]> {
      return repo.listMovements(businessId, itemId, limit, offset);
    },

    async barcodeLookup(
      businessId: string,
      code: string,
    ): Promise<BarcodeLookupOut | null> {
      return repo.barcodeLookup(businessId, code);
    },

    patchStock: applyStockMovement,

    async quickPurchase(opts: {
      businessId: string;
      itemId: string;
      qty: number;
      supplierId?: string;
      brokerId?: string;
      notes?: string;
      idempotencyKey?: string;
      actorId: string | null;
      actorName: string | null;
    }): Promise<{
      success: boolean;
      conflict?: boolean;
      message?: string;
      out?: QuickPurchaseOut;
    }> {
      const ik = opts.idempotencyKey ?? `qp:${opts.itemId}:${Date.now()}`;
      const existing = await repo.findExistingStaffPurchase(
        opts.businessId,
        ik,
      );
      if (existing) {
        return {
          success: true,
          out: {
            id: existing.id,
            item_id: existing.item_id,
            qty: existing.qty,
            unit: null,
            notes: existing.notes,
            created_at: existing.created_at,
            movement: null,
          },
        };
      }

      const item = await repo.getCatalogItemForPatch(
        opts.businessId,
        opts.itemId,
      );
      if (!item) return { success: false, message: "Item not found" };

      const itemName = item.name;
      const result = await applyStockMovement({
        businessId: opts.businessId,
        itemId: opts.itemId,
        movementKind: "quick_purchase",
        deltaQty: opts.qty,
        mode: "delta",
        reason: "Quick purchase",
        notes: opts.notes ?? null,
        idempotencyKey: ik,
        actorId: opts.actorId,
        actorName: opts.actorName,
        adjustmentType: "quick_purchase",
      });
      if (!result.success) {
        return {
          success: false,
          conflict: result.conflict,
          message: result.message,
        };
      }

      const logId = randomUUID();
      await repo.insertStaffPurchaseLog({
        id: logId,
        businessId: opts.businessId,
        itemId: opts.itemId,
        itemName,
        qty: opts.qty,
        unit: item.stock_unit,
        amount: null,
        supplierId: opts.supplierId ?? null,
        supplierName: null,
        brokerId: opts.brokerId ?? null,
        brokerName: null,
        notes: opts.notes ?? null,
        idempotencyKey: ik,
        stockMovementId: result.movementId ?? null,
        createdBy: opts.actorId,
        createdByName: opts.actorName,
      });

      await repo.updateCatalogItemLastSupplier(
        opts.businessId,
        opts.itemId,
        opts.supplierId ?? null,
        null,
        opts.brokerId ?? null,
        null,
        opts.qty,
        item.stock_unit,
      );

      return {
        success: true,
        out: {
          id: logId,
          item_id: opts.itemId,
          qty: opts.qty,
          unit: item.stock_unit,
          notes: opts.notes ?? null,
          created_at: new Date().toISOString(),
          movement: {
            id: result.movementId!,
            movement_kind: "quick_purchase",
            delta_qty: opts.qty,
            qty_before: result.oldQty!,
            qty_after: result.newQty!,
            stock_unit: item.stock_unit,
            reason: "Quick purchase",
            notes: opts.notes ?? null,
            source_type: null,
            actor_name: opts.actorName,
            created_at: new Date().toISOString(),
          },
        },
      };
    },

    async undoLastAdjustment(
      businessId: string,
      itemId: string,
      userId: string,
    ): Promise<{
      success: boolean;
      message?: string;
      conflict?: boolean;
    }> {
      const last = await repo.getLastAdjustmentByUser(
        businessId,
        itemId,
        userId,
        15,
      );
      if (!last) {
        return {
          success: false,
          message: "No recent adjustment found to undo",
        };
      }
      const result = await applyStockMovement({
        businessId,
        itemId,
        movementKind: "undo_adjustment",
        deltaQty: last.old_qty,
        mode: "absolute",
        reason: `Undo adjustment from ${last.new_qty} to ${last.old_qty}`,
        notes: null,
        idempotencyKey: `undo:${itemId}:${Date.now()}`,
        actorId: userId,
        actorName: null,
        adjustmentType: "undo",
      });
      return {
        success: result.success,
        conflict: result.conflict,
        message: result.message,
      };
    },

    async listReorderEntries(
      businessId: string,
      status?: string,
    ): Promise<ReorderListOut> {
      return repo.listReorderEntries(businessId, status);
    },

    async createReorderEntry(
      businessId: string,
      itemId: string,
      addedBy: string | null,
      addedByName: string | null,
    ): Promise<{ id: string; alreadyExisted: boolean }> {
      const existing = await repo.insertReorderEntry(
        businessId,
        itemId,
        addedBy,
        addedByName,
      );
      if (existing) {
        return { id: existing, alreadyExisted: false };
      }
      const id = randomUUID();
      await repo.insertReorderEntry(businessId, itemId, addedBy, addedByName);
      return { id, alreadyExisted: false };
    },

    async updateReorderEntry(
      entryId: string,
      businessId: string,
      status: string,
    ): Promise<boolean> {
      return repo.updateReorderEntry(entryId, businessId, status);
    },

    async deleteReorderEntry(
      entryId: string,
      businessId: string,
    ): Promise<boolean> {
      return repo.deleteReorderEntry(entryId, businessId);
    },

    async listStockAuditByItem(
      businessId: string,
      itemId: string,
      limit: number,
    ): Promise<StockAuditItemOut[]> {
      return repo.listStockAuditByItem(businessId, itemId, limit);
    },

    async createOpeningStock(opts: {
      businessId: string;
      itemId: string;
      qty: number;
      reason: string | null;
      notes: string | null;
      userId: string | null;
      userName: string | null;
      idempotencyKey: string;
    }): Promise<{ success: boolean; message?: string }> {
      const updated = await repo.setOpeningStock({
        businessId: opts.businessId,
        itemId: opts.itemId,
        qty: opts.qty,
        reason: opts.reason,
        notes: opts.notes,
        userId: opts.userId,
        userName: opts.userName,
        idempotencyKey: opts.idempotencyKey,
      });
      if (!updated) {
        return {
          success: false,
          message: "Opening stock already set or item not found",
        };
      }

      const movementResult = await applyStockMovement({
        businessId: opts.businessId,
        itemId: opts.itemId,
        movementKind: "opening_stock",
        deltaQty: opts.qty,
        mode: "absolute",
        reason: opts.reason ?? "Opening stock setup",
        notes: opts.notes,
        idempotencyKey: opts.idempotencyKey,
        actorId: opts.userId,
        actorName: opts.userName,
        adjustmentType: "opening_stock",
      });

      return { success: movementResult.success };
    },

    async createPhysicalCount(opts: {
      businessId: string;
      itemId: string;
      countedQty: number;
      periodStart: string | null;
      periodEnd: string | null;
      notes: string | null;
      countedBy: string | null;
      countedByName: string | null;
    }): Promise<{ success: boolean; id: string; message?: string }> {
      const item = await repo.getCatalogItemForPatch(
        opts.businessId,
        opts.itemId,
      );
      if (!item) {
        return { success: false, id: "", message: "Item not found" };
      }
      const deliveredQty = await repo.getMovementDeliveredQty(
        opts.businessId,
        opts.itemId,
      );
      const id = await repo.insertPhysicalCount({
        businessId: opts.businessId,
        itemId: opts.itemId,
        systemQty: item.current_stock,
        countedQty: opts.countedQty,
        purchasedQty: deliveredQty > 0 ? deliveredQty : null,
        stockUnit: item.stock_unit,
        periodStart: opts.periodStart,
        periodEnd: opts.periodEnd,
        notes: opts.notes,
        countedBy: opts.countedBy,
        countedByName: opts.countedByName,
      });
      return { success: true, id };
    },

    async getBarcodeLabel(
      businessId: string,
      itemId: string,
    ): Promise<import("../validation/stock.schemas").BarcodeLabelOut | null> {
      const item = await repo.getBarcodeLabelItem(businessId, itemId);
      if (!item) return null;
      const [categoryName, supplierName, recentPurchase] = await Promise.all([
        item.category_id ? repo.getCategoryName(item.category_id) : Promise.resolve(null),
        item.last_supplier_id ? repo.getSupplierName(item.last_supplier_id) : Promise.resolve(null),
        repo.getLatestPurchaseForItem(businessId, itemId),
      ]);
      const barcode = item.barcode ?? item.item_code;
      return {
        id: item.id,
        barcode,
        item_code: item.item_code,
        item_name: item.name,
        category_name: categoryName,
        unit: item.stock_unit ?? item.default_unit,
        current_stock: item.current_stock,
        last_purchase_date: recentPurchase?.purchase_date ?? null,
        last_purchase_qty: recentPurchase?.qty ?? null,
        last_purchase_unit: recentPurchase?.unit ?? null,
        last_purchase_rate: recentPurchase?.rate ?? null,
        supplier_name: supplierName,
      };
    },

    async getBarcodeBatch(
      businessId: string,
      itemIds: string[],
    ): Promise<import("../validation/stock.schemas").BarcodeLabelOut[]> {
      const labels: import("../validation/stock.schemas").BarcodeLabelOut[] = [];
      for (const itemId of itemIds) {
        const label = await this.getBarcodeLabel(businessId, itemId);
        if (label) labels.push(label);
      }
      return labels;
    },

    async getPurchaseIntelligence(
      businessId: string,
      itemId: string,
    ): Promise<{
      suggested_qty: number;
      avg_interval_days: number | null;
      default_supplier: { id: string; name: string } | null;
    }> {
      return repo.getPurchaseIntelligence(businessId, itemId);
    },
  };
}

export type StockService = ReturnType<typeof createStockService>;
