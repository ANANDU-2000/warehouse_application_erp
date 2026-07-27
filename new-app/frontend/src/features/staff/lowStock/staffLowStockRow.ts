/**
 * Staff low stock row display helpers —
 * low_stock_compact_item_row.dart status / qty.
 */
import {
  STAFF_LS_DEFAULT_NAME,
  STAFF_LS_DEFAULT_UNIT,
} from "./staffLowStockCopy";
import {
  lowStockItemPendingDelivery,
  type StaffLsItem,
} from "./staffLowStockLogic";

function asNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

export function staffLsItemId(item: StaffLsItem): string {
  return asStr(item.id);
}

export function staffLsItemName(item: StaffLsItem): string {
  return asStr(item.name) || STAFF_LS_DEFAULT_NAME;
}

export function staffLsItemUnit(item: StaffLsItem): string {
  return (
    asStr(item.stock_unit) || asStr(item.unit) || STAFF_LS_DEFAULT_UNIT
  );
}

export function staffLsSystemQty(item: StaffLsItem): number {
  return asNum(item.current_stock);
}

export function staffLsReorderQty(item: StaffLsItem): number {
  return asNum(item.reorder_level);
}

/** formatStockQtyDisplay — compact qty line */
export function formatStaffLsQtyDisplay(unit: string, qty: number): string {
  const q =
    Number.isInteger(qty) || Math.abs(qty - Math.round(qty)) < 1e-9
      ? String(Math.round(qty))
      : String(qty);
  return `${q} ${unit}`;
}

export type StaffLsStatusKind = "out" | "pending" | "low" | "attn";

export function staffLsStatusKind(item: StaffLsItem): StaffLsStatusKind {
  const system = staffLsSystemQty(item);
  const reorder = staffLsReorderQty(item);
  const out = system <= 0;
  const pendingDelivery = lowStockItemPendingDelivery(item);
  const low = !out && reorder > 0 && system <= reorder;
  if (out) return "out";
  if (pendingDelivery) return "pending";
  if (low) return "low";
  return "attn";
}

export function staffLsStatusLabel(kind: StaffLsStatusKind): string {
  switch (kind) {
    case "out":
      return "OUT";
    case "pending":
      return "PENDING";
    case "low":
      return "LOW";
    default:
      return "ATTN";
  }
}

export function staffLsHumanId(item: StaffLsItem): string | null {
  const hid = asStr(item.last_purchase_human_id);
  return hid || null;
}

export function staffLsSubcategory(item: StaffLsItem): string {
  return asStr(item.subcategory_name);
}
