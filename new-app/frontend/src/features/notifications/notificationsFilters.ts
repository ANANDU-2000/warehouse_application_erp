/**
 * Notification category filters — notifications_provider.dart NotificationCategoryFilter
 */
import {
  NOTIFICATIONS_FILTER_ALL,
  NOTIFICATIONS_FILTER_CRITICAL,
  NOTIFICATIONS_FILTER_PURCHASES,
  NOTIFICATIONS_FILTER_STAFF,
  NOTIFICATIONS_FILTER_SYSTEM,
  NOTIFICATIONS_FILTER_WAREHOUSE,
} from "./notificationsCopy";

export type NotificationCategoryFilter =
  | "all"
  | "critical"
  | "warehouse"
  | "purchases"
  | "staff"
  | "system";

/** Owner/manager visible filters — NotificationCategoryFilter.values */
export const NOTIFICATIONS_FILTER_ORDER_OWNER: readonly NotificationCategoryFilter[] =
  ["all", "critical", "warehouse", "purchases", "staff", "system"] as const;

/** Staff visible filters — notifications_page.dart _visibleFilters */
export const NOTIFICATIONS_FILTER_ORDER_STAFF: readonly NotificationCategoryFilter[] =
  ["all", "critical", "warehouse", "staff", "system"] as const;

export const NOTIFICATIONS_FILTER_LABELS: Record<
  NotificationCategoryFilter,
  string
> = {
  all: NOTIFICATIONS_FILTER_ALL,
  critical: NOTIFICATIONS_FILTER_CRITICAL,
  warehouse: NOTIFICATIONS_FILTER_WAREHOUSE,
  purchases: NOTIFICATIONS_FILTER_PURCHASES,
  staff: NOTIFICATIONS_FILTER_STAFF,
  system: NOTIFICATIONS_FILTER_SYSTEM,
};
