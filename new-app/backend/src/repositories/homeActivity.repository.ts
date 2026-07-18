/**
 * Home activity WIRE APIs — trade list + audit/recent + staff-purchases.
 * Source: trade_purchases.list_trade_purchases; stock_audit.fetch_recent_adjustments /
 *         list_staff_purchase_logs
 */
import { sql } from "../config/database";
import { queryMany, type SqlClient } from "./sql";

export type TradePurchaseListRow = {
  id: string;
  human_id: string;
  invoice_number: string | null;
  purchase_date: string;
  created_at: string;
  delivery_status: string;
  is_delivered: boolean;
  total_amount: number;
  total_qty: number | null;
  supplier_name: string | null;
  created_by_name: string | null;
  staff_verified_by_name: string | null;
  delivery_notes: string | null;
};

export type StockAdjustmentOut = {
  id: string;
  item_id: string;
  item_name: string | null;
  item_code: string | null;
  unit: string | null;
  old_qty: number;
  new_qty: number;
  adjustment_type: string;
  reason: string | null;
  updated_by_name: string | null;
  updated_at: string;
  variance_expected_qty: number | null;
  variance_delta: number | null;
};

export type StaffPurchaseLogOut = {
  id: string;
  item_id: string;
  item_name: string;
  qty: number;
  unit: string | null;
  amount: number | null;
  supplier_id: string | null;
  supplier_name: string | null;
  broker_id: string | null;
  broker_name: string | null;
  notes: string | null;
  idempotency_key: string | null;
  stock_movement_id: string | null;
  created_by_name: string | null;
  created_at: string;
};

type TpRow = {
  id: string;
  human_id: string;
  invoice_number: string | null;
  purchase_date: Date;
  created_at: Date;
  delivery_status: string;
  is_delivered: boolean | number;
  total_amount: number;
  total_qty: number | null;
  supplier_name: string | null;
  created_by_name: string | null;
  staff_verified_by_name: string | null;
  delivery_notes: string | null;
};

type AdjRow = {
  id: string;
  item_id: string;
  item_name: string | null;
  item_code: string | null;
  unit: string | null;
  old_qty: number;
  new_qty: number;
  adjustment_type: string;
  reason: string | null;
  updated_by_name: string | null;
  updated_at: Date;
};

type StaffRow = {
  id: string;
  item_id: string;
  item_name: string;
  qty: number;
  unit: string | null;
  amount: number | null;
  supplier_id: string | null;
  supplier_name: string | null;
  broker_id: string | null;
  broker_name: string | null;
  notes: string | null;
  idempotency_key: string | null;
  stock_movement_id: string | null;
  created_by_name: string | null;
  created_at: Date;
};

function isoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoDateTime(d: Date): string {
  return d.toISOString();
}

export type HomeActivityRepository = {
  listTradePurchases(args: {
    businessId: string;
    limit: number;
    offset: number;
    status: string | null;
    purchaseFrom: string | null;
    purchaseTo: string | null;
  }): Promise<TradePurchaseListRow[]>;
  auditRecent(args: {
    businessId: string;
    limit: number;
    on: string | null;
  }): Promise<StockAdjustmentOut[]>;
  listStaffPurchases(args: {
    businessId: string;
    limit: number;
    itemId: string | null;
  }): Promise<StaffPurchaseLogOut[]>;
};

export function createHomeActivityRepository(
  db: SqlClient,
): HomeActivityRepository {
  return {
    async listTradePurchases(args) {
      const limit = Math.max(1, Math.min(args.limit, 50));
      const offset = Math.max(0, Math.min(args.offset, 10_000));
      const statusNorm =
        args.status == null ||
        args.status.trim() === "" ||
        args.status.trim().toLowerCase() === "all"
          ? null
          : args.status.trim().toLowerCase();

      const rows2 = await queryMany<TpRow>(
        db,
        `SELECT
            tp.[id], tp.[human_id], tp.[invoice_number], tp.[purchase_date],
            tp.[created_at], tp.[delivery_status], tp.[is_delivered],
            CAST(tp.[total_amount] AS FLOAT) AS total_amount,
            CAST(tp.[total_qty] AS FLOAT) AS total_qty,
            s.[name] AS supplier_name,
            u.[name] AS created_by_name,
            tp.[staff_verified_by_name], tp.[delivery_notes]
         FROM trade_purchases tp
         LEFT JOIN suppliers s ON s.[id] = tp.[supplier_id]
         LEFT JOIN users u ON u.[id] = tp.[user_id]
         WHERE tp.[business_id] = @businessId
           AND tp.[status] <> N'deleted'
           AND (@status IS NULL OR LOWER(tp.[status]) = @status)
           AND (@purchaseFrom IS NULL OR tp.[purchase_date] >= CAST(@purchaseFrom AS DATE))
           AND (@purchaseTo IS NULL OR tp.[purchase_date] <= CAST(@purchaseTo AS DATE))
         ORDER BY tp.[purchase_date] DESC, tp.[created_at] DESC
         OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [
          {
            name: "businessId",
            type: sql.UniqueIdentifier,
            value: args.businessId,
          },
          { name: "status", type: sql.NVarChar(24), value: statusNorm },
          {
            name: "purchaseFrom",
            type: sql.NVarChar(10),
            value: args.purchaseFrom,
          },
          {
            name: "purchaseTo",
            type: sql.NVarChar(10),
            value: args.purchaseTo,
          },
          { name: "offset", type: sql.Int, value: offset },
          { name: "limit", type: sql.Int, value: limit },
        ],
      );

      return rows2.map((r) => ({
        id: r.id,
        human_id: r.human_id,
        invoice_number: r.invoice_number,
        purchase_date: isoDate(new Date(r.purchase_date)),
        created_at: isoDateTime(new Date(r.created_at)),
        delivery_status: r.delivery_status,
        is_delivered: Boolean(r.is_delivered),
        total_amount: Number(r.total_amount ?? 0),
        total_qty: r.total_qty == null ? null : Number(r.total_qty),
        supplier_name: r.supplier_name,
        created_by_name: r.created_by_name,
        staff_verified_by_name: r.staff_verified_by_name,
        delivery_notes: r.delivery_notes,
      }));
    },

    async auditRecent(args) {
      const limit = Math.max(1, Math.min(args.limit, 250));
      const rows = await queryMany<AdjRow>(
        db,
        `SELECT TOP (${limit})
            a.[id], a.[item_id],
            ci.[name] AS item_name, ci.[item_code],
            COALESCE(ci.[stock_unit], ci.[default_unit]) AS unit,
            CAST(a.[old_qty] AS FLOAT) AS old_qty,
            CAST(a.[new_qty] AS FLOAT) AS new_qty,
            a.[adjustment_type], a.[reason], a.[updated_by_name], a.[updated_at]
         FROM stock_adjustment_log a
         LEFT JOIN catalog_items ci ON ci.[id] = a.[item_id]
         WHERE a.[business_id] = @businessId
           AND (
             @onDay IS NULL
             OR (
               a.[updated_at] >= @onStart AND a.[updated_at] <= @onEnd
             )
           )
         ORDER BY a.[updated_at] DESC`,
        [
          {
            name: "businessId",
            type: sql.UniqueIdentifier,
            value: args.businessId,
          },
          { name: "onDay", type: sql.NVarChar(10), value: args.on },
          {
            name: "onStart",
            type: sql.NVarChar(40),
            value: args.on ? `${args.on}T00:00:00.000Z` : null,
          },
          {
            name: "onEnd",
            type: sql.NVarChar(40),
            value: args.on ? `${args.on}T23:59:59.999Z` : null,
          },
        ],
      );

      return rows.map((r) => ({
        id: r.id,
        item_id: r.item_id,
        item_name: r.item_name,
        item_code: r.item_code,
        unit: r.unit,
        old_qty: Number(r.old_qty ?? 0),
        new_qty: Number(r.new_qty ?? 0),
        adjustment_type: r.adjustment_type,
        reason: r.reason,
        updated_by_name: r.updated_by_name,
        updated_at: isoDateTime(new Date(r.updated_at)),
        variance_expected_qty: null,
        variance_delta: null,
      }));
    },

    async listStaffPurchases(args) {
      const limit = Math.max(1, Math.min(args.limit, 500));
      const rows = await queryMany<StaffRow>(
        db,
        `SELECT TOP (${limit})
            l.[id], l.[item_id], l.[item_name],
            CAST(l.[qty] AS FLOAT) AS qty, l.[unit],
            CAST(l.[amount] AS FLOAT) AS amount,
            l.[supplier_id], l.[supplier_name],
            l.[broker_id], l.[broker_name],
            l.[notes], l.[idempotency_key], l.[stock_movement_id],
            l.[created_by_name], l.[created_at]
         FROM staff_purchase_logs l
         WHERE l.[business_id] = @businessId
           AND (@itemId IS NULL OR l.[item_id] = @itemId)
         ORDER BY l.[created_at] DESC`,
        [
          {
            name: "businessId",
            type: sql.UniqueIdentifier,
            value: args.businessId,
          },
          {
            name: "itemId",
            type: sql.UniqueIdentifier,
            value: args.itemId,
          },
        ],
      );

      return rows.map((r) => ({
        id: r.id,
        item_id: r.item_id,
        item_name: r.item_name,
        qty: Number(r.qty ?? 0),
        unit: r.unit,
        amount: r.amount == null ? null : Number(r.amount),
        supplier_id: r.supplier_id,
        supplier_name: r.supplier_name,
        broker_id: r.broker_id,
        broker_name: r.broker_name,
        notes: r.notes,
        idempotency_key: r.idempotency_key,
        stock_movement_id: r.stock_movement_id,
        created_by_name: r.created_by_name,
        created_at: isoDateTime(new Date(r.created_at)),
      }));
    },
  };
}
