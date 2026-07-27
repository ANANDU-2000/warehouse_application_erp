/**
 * Staff Tools CTAs — StaffHomeToolsGrid labels + paths.
 * Source: staff_home_dashboard_widgets.dart StaffHomeToolsGrid
 * BUTTONS only: navigate stubs; badge counts deferred WIRE.
 */

import {
  staffHomeShowsBarcodeTools,
  type StaffHomeFocus,
} from "./staffHomeFocus";

export type StaffHomeTool = {
  id: string;
  label: string;
  path: string;
  color: string;
  /** When true, include only if staffHomeShowsBarcodeTools(focus). */
  barcodeOnly?: boolean;
  /** Show low-stock badge when count > 0 (WIRE). */
  badgeKey?: "lowStock";
};

export const STAFF_HOME_TOOLS: StaffHomeTool[] = [
  {
    id: "search",
    label: "Search",
    path: "/staff/search",
    color: "#0E4F46",
  },
  {
    id: "gallery",
    label: "Gallery",
    path: "/staff/items",
    color: "#7C3AED",
  },
  {
    id: "categories",
    label: "Categories",
    path: "/catalog/taxonomy",
    color: "#6A1B9A",
  },
  {
    id: "stock",
    label: "Stock",
    path: "/staff/stock",
    color: "#1565C0",
  },
  {
    id: "labels",
    label: "Labels",
    path: "/barcode/bulk-print",
    color: "#455A64",
    barcodeOnly: true,
  },
  {
    id: "purchases",
    label: "Purchases",
    path: "/staff/purchase-history",
    color: "#0D9488",
  },
  {
    id: "low-stock",
    label: "Low stock",
    path: "/staff/low-stock",
    color: "#455A64",
    badgeKey: "lowStock",
  },
  {
    id: "daily-log",
    label: "Daily log",
    path: "/staff/activity",
    color: "#0D9488",
  },
];

export function staffHomeToolsForFocus(focus: StaffHomeFocus): StaffHomeTool[] {
  return STAFF_HOME_TOOLS.filter(
    (t) => !t.barcodeOnly || staffHomeShowsBarcodeTools(focus),
  );
}

export const STAFF_HOME_QUICK_ACTIONS = [
  {
    id: "deliveries",
    label: "Deliveries",
    path: "/staff/deliveries",
  },
  {
    id: "low-stock",
    label: "Low stock",
    path: "/stock",
  },
  {
    id: "scan",
    label: "Scan",
    path: "/staff/scan",
  },
] as const;

export const STAFF_HOME_SCAN_CTA_LABEL = "Scan barcode";
export const STAFF_HOME_SCAN_CTA_PATH = "/staff/scan";

export const STAFF_HOME_SETTINGS_PATH = "/staff/settings";
export const STAFF_HOME_SETTINGS_LABEL = "Settings";
export const STAFF_HOME_LOGOUT_LABEL = "Logout";
export const STAFF_HOME_CLOSE_LABEL = "Close";
export const STAFF_HOME_LOGOUT_CANCEL = "Cancel";

/** HexaColors.appName */
export const STAFF_HOME_APP_NAME = "Harisree Warehouse";
export const STAFF_HOME_LOGOUT_TITLE = `Log out of ${STAFF_HOME_APP_NAME}?`;
export const STAFF_HOME_LOGOUT_BODY =
  "You will need to sign in again to continue.";
