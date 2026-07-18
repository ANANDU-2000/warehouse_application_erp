/**
 * Exact Flutter StaffHomePage / StaffHomeSectionHeader copy for LAYOUT smoke.
 * Source: source-app/flutter_app/lib/features/staff/presentation/staff_home_page.dart
 */

export const STAFF_HOME_GREETING_NAME_FALLBACK = "Staff";
export const STAFF_HOME_GREETING_AVATAR_FALLBACK = "S";
/** Literal · STAFF · (spaces around middots as Flutter TextSpan). */
export const STAFF_HOME_ROLE_LABEL = " · STAFF · ";

export const STAFF_HOME_SECTION = {
  warehouse: {
    title: "Warehouse & purchases",
    subtitle: "Stock in hand and this month",
  },
  pendingDeliveries: {
    title: "Pending deliveries",
    subtitle: "Verify arrivals on the floor",
  },
  shiftToday: {
    title: "Your shift today",
    subtitle: "Scans, stock updates, purchases",
  },
  tools: {
    title: "Tools",
    subtitle: "Search, stock, labels, and low stock",
  },
  quickActions: {
    title: "Quick actions",
    subtitle: "Fast jump for floor work",
  },
  scanCta: {
    title: "Start here",
    subtitle: "Scan and quick actions",
  },
  needsAttention: {
    title: "Needs attention",
    subtitle: "Other warehouse items",
  },
  recentActivity: {
    title: "Recent activity",
    subtitle: "Latest stock and warehouse updates",
  },
} as const;

/** Scan CTA button label — visual chrome in LAYOUT; navigate in BUTTONS. */
export const STAFF_HOME_SCAN_CTA_LABEL = "Scan barcode";
