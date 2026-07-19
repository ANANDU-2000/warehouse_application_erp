/**
 * Staff deliveries `/staff/deliveries` copy —
 * staff_pending_deliveries_page.dart (StaffPendingDeliveriesPage).
 */

export const STAFF_DEL_TITLE = "Pending deliveries";
export const STAFF_DEL_TITLE_COUNTED = (n: number) =>
  `Pending deliveries (${n})`;

/** AppBar leading — Flutter uses default back; fallback staff home. */
export const STAFF_DEL_BACK_FALLBACK = "/staff/home";

/** AppBar scan tooltip — Flutter → `/barcode/scan` (stub until barcode module). */
export const STAFF_DEL_SCAN_TOOLTIP = "Scan purchase";
export const STAFF_DEL_SCAN_PATH = "/barcode/scan";

/** Row tap — Flutter → `/staff/receive/${id}` (stub until goods-receipt body). */
export function staffDelReceivePath(purchaseId: string): string {
  return `/staff/receive/${encodeURIComponent(purchaseId)}`;
}

/** Section titles — _DeliverySection */
export const STAFF_DEL_SECTION_DISPATCHED = "Dispatched";
export const STAFF_DEL_SECTION_ARRIVED = "Arrived";
export const STAFF_DEL_SECTION_PENDING_VERIFY = "Pending verification";

export const STAFF_DEL_EMPTY_DISPATCHED = "No dispatches in transit.";
export const STAFF_DEL_EMPTY_ARRIVED = "Nothing waiting at the warehouse.";
export const STAFF_DEL_EMPTY_PENDING_VERIFY =
  "No purchases awaiting owner commit.";

/** Global empty when total == 0 */
export const STAFF_DEL_EMPTY_ALL = "No pending deliveries right now.";

/** Tile fallback supplier */
export const STAFF_DEL_SUPPLIER_FALLBACK = "Supplier";

/** Error — FriendlyLoadError (STATES) */
export const STAFF_DEL_LOAD_FAILED = "Could not load pending deliveries";
