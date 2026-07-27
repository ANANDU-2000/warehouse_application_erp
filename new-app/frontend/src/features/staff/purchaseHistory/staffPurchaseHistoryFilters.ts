/**
 * Staff purchase history status / low-stock filter chips —
 * _PurchaseStatusFilter / _LowStockFilter (staff_purchase_history_page.dart).
 */

export type StaffPhStatusFilter = "all" | "pending" | "delivered";

export const STAFF_PH_STATUS_ORDER: StaffPhStatusFilter[] = [
  "all",
  "pending",
  "delivered",
];

export const STAFF_PH_DEFAULT_STATUS: StaffPhStatusFilter = "all";

export type StaffPhLowFilter = "all" | "critical";

export const STAFF_PH_LOW_ORDER: StaffPhLowFilter[] = ["all", "critical"];

export const STAFF_PH_DEFAULT_LOW: StaffPhLowFilter = "all";
