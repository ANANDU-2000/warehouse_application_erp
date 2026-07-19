/**
 * Warehouse row metrics — stock_row_metrics.dart SYS / PHYS / DIFF.
 */
import { formatStockQtyNumber } from "../staffPendingDeliveries";
import type { StaffStockRow } from "./staffStockLogic";

function asNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

export function stockRowUnit(item: StaffStockRow): string {
  return (
    asStr(item.stock_unit) ||
    asStr(item.default_unit) ||
    asStr(item.unit) ||
    ""
  );
}

export function stockRowSystemQty(item: StaffStockRow): number {
  return asNum(item.current_stock) ?? 0;
}

export function stockRowPhysicalQty(item: StaffStockRow): number | null {
  return asNum(item.physical_stock_qty);
}

/** physical − system; NaN when no physical */
export function stockRowDiffQty(item: StaffStockRow): number {
  const phys = stockRowPhysicalQty(item);
  if (phys != null && Number.isFinite(phys)) {
    return phys - stockRowSystemQty(item);
  }
  const pd = asNum(item.physical_stock_difference_qty);
  if (pd != null && Number.isFinite(pd)) return pd;
  return Number.NaN;
}

export function stockRowSystemLabel(item: StaffStockRow): string {
  return formatStockQtyNumber(stockRowSystemQty(item));
}

export function stockRowPhysicalLabel(item: StaffStockRow): string {
  const phys = stockRowPhysicalQty(item);
  if (phys == null || !Number.isFinite(phys)) return "—";
  return formatStockQtyNumber(phys);
}

export function stockRowDiffLabel(item: StaffStockRow): string {
  const diff = stockRowDiffQty(item);
  if (!Number.isFinite(diff)) return "—";
  if (Math.abs(diff) < 0.001) return "0";
  const sign = diff > 0 ? "+" : "";
  return `${sign}${formatStockQtyNumber(diff)}`;
}

export function stockRowIsLowOrCritical(item: StaffStockRow): boolean {
  const st = asStr(item.stock_status).toLowerCase();
  return st === "low" || st === "critical" || st === "out";
}

export function stockRowMetaLine(item: StaffStockRow): string {
  const sub = asStr(item.subcategory_name);
  if (sub) return sub;
  return asStr(item.category_name);
}
