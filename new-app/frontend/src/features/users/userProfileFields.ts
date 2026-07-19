/**
 * Profile field catalogs — user_overview_kpi_grid / user_activity_tab / user_permission_groups.
 */

export const USER_PROFILE_KPI_ORDER = [
  "purchases",
  "stock",
  "items",
  "scans",
] as const;

export type UserProfileKpiKey = (typeof USER_PROFILE_KPI_ORDER)[number];

/** Exact Flutter _Metric labels. */
export const USER_PROFILE_KPI_LABELS: Record<UserProfileKpiKey, string> = {
  purchases: "Purchases",
  stock: "Stock updates",
  items: "Items created",
  scans: "Scans",
};

export type UserActivitySection =
  | "feed"
  | "stock"
  | "purchases"
  | "items"
  | "ledger";

export const USER_ACTIVITY_SECTION_ORDER: readonly UserActivitySection[] = [
  "feed",
  "stock",
  "purchases",
  "items",
  "ledger",
] as const;

/** Exact Flutter _sectionLabel. */
export const USER_ACTIVITY_SECTION_LABELS: Record<UserActivitySection, string> =
  {
    feed: "All activity",
    stock: "Stock",
    purchases: "Purchases",
    items: "Items",
    ledger: "Ledger",
  };

export type UserPermissionEntry = {
  key: string;
  label: string;
  subtitle?: string;
};

export type UserPermissionGroup = {
  title: string;
  permissions: UserPermissionEntry[];
};

/** Exact Flutter userPermissionGroups. */
export const USER_PERMISSION_GROUPS: readonly UserPermissionGroup[] = [
  {
    title: "Inventory",
    permissions: [
      {
        key: "stock_edit",
        label: "Edit stock",
        subtitle: "Adjust quantities and warehouse counts",
      },
      {
        key: "delete_access",
        label: "Delete items",
        subtitle: "Remove catalog items and records",
      },
    ],
  },
  {
    title: "Purchases",
    permissions: [
      { key: "purchase_create", label: "Create purchase" },
      { key: "purchase_edit", label: "Edit purchase" },
    ],
  },
  {
    title: "Reports",
    permissions: [
      { key: "reports_access", label: "View reports" },
      { key: "export_access", label: "Export reports" },
      { key: "analytics_access", label: "Analytics dashboard" },
    ],
  },
  {
    title: "Printing",
    permissions: [{ key: "barcode_print", label: "Barcode print" }],
  },
  {
    title: "Administration",
    permissions: [{ key: "user_manage", label: "Manage users" }],
  },
];

export type UserProfileTab = "overview" | "activity" | "permissions";
