/**
 * Owner Tools CTAs — HomeOwnerQuickActions labels + legacy paths.
 * BUTTONS only: local navigate stubs; no API.
 */

export type HomeToolAction = {
  id: string;
  label: string;
  path: string;
  color: string;
};

export const HOME_OWNER_TOOLS: HomeToolAction[] = [
  {
    id: "purchase",
    label: "Purchase",
    path: "/purchase/new",
    color: "#0E4F46",
  },
  {
    id: "stock",
    label: "Stock",
    path: "/stock",
    color: "#1565C0",
  },
  {
    id: "low-stock",
    label: "Low stock",
    path: "/stock/low-stock",
    color: "#F59E0B",
  },
  {
    id: "deliveries",
    label: "Deliveries",
    path: "/purchase?filter=delivery_commit",
    color: "#E65100",
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    color: "#0D9488",
  },
  {
    id: "users",
    label: "Users",
    path: "/settings/users",
    color: "#5D4037",
  },
  {
    id: "scan",
    label: "Scan",
    path: "/barcode/scan",
    color: "#455A64",
  },
  {
    id: "reorder",
    label: "Reorder",
    path: "/stock/reorder",
    color: "#7C3AED",
  },
  {
    id: "daily-log",
    label: "Daily log",
    path: "/home/activity",
    color: "#0D9488",
  },
];
