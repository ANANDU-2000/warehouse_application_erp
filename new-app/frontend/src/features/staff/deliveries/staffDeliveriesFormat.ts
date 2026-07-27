/**
 * Staff deliveries WIRE formatters —
 * staff_pending_deliveries_page.dart _PendingDeliveryTile
 */
import { formatStockQtyNumber } from "../staffPendingDeliveries";
import type { StaffPendingPurchase } from "../staffPendingDeliveries";
import { STAFF_DEL_SUPPLIER_FALLBACK } from "./staffDeliveriesCopy";

/** Flutter DateFormat('d MMM') */
export function staffDelFormatPurchaseDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Flutter: days = now.difference(purchaseDate).inDays */
export function staffDelDaysPending(iso: string, now = new Date()): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  const ms = now.getTime() - d.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Flutter subtitle: humanId · d MMM · N d pending */
export function staffDelRowSubtitle(
  p: StaffPendingPurchase,
  now = new Date(),
): string {
  const datePart = staffDelFormatPurchaseDate(p.purchaseDate);
  const days = staffDelDaysPending(p.purchaseDate, now);
  const base = `${p.humanId}${datePart ? ` · ${datePart}` : ""}`;
  return days > 0 ? `${base} · ${days} d pending` : base;
}

export function staffDelSupplierTitle(p: StaffPendingPurchase): string {
  const n = p.supplierName?.trim() ?? "";
  return n.length > 0 ? n : STAFF_DEL_SUPPLIER_FALLBACK;
}

/** Flutter qty trailing label */
export function staffDelQtyLabel(qty: number): string {
  const n =
    Math.abs(qty - Math.round(qty)) < 0.001
      ? String(Math.round(qty))
      : qty.toFixed(1);
  return `${n} qty`;
}

export function staffDelQtyDisplay(qty: number): string {
  return formatStockQtyNumber(qty);
}
