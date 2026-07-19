/**
 * Notification category filters + empty catalogs — notifications_provider.dart /
 * notifications_page.dart _emptyTitleForFilter / _emptySubtitleForFilter
 */
import {
  NOTIFICATIONS_EMPTY_SUB_ALL,
  NOTIFICATIONS_EMPTY_SUB_CRITICAL,
  NOTIFICATIONS_EMPTY_SUB_PURCHASES,
  NOTIFICATIONS_EMPTY_SUB_STAFF,
  NOTIFICATIONS_EMPTY_SUB_SYSTEM,
  NOTIFICATIONS_EMPTY_SUB_WAREHOUSE,
  NOTIFICATIONS_EMPTY_TITLE_ALL,
  NOTIFICATIONS_EMPTY_TITLE_CRITICAL,
  NOTIFICATIONS_EMPTY_TITLE_PURCHASES,
  NOTIFICATIONS_EMPTY_TITLE_STAFF,
  NOTIFICATIONS_EMPTY_TITLE_SYSTEM,
  NOTIFICATIONS_EMPTY_TITLE_WAREHOUSE,
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

export const NOTIFICATIONS_EMPTY_TITLE: Record<
  NotificationCategoryFilter,
  string
> = {
  all: NOTIFICATIONS_EMPTY_TITLE_ALL,
  critical: NOTIFICATIONS_EMPTY_TITLE_CRITICAL,
  warehouse: NOTIFICATIONS_EMPTY_TITLE_WAREHOUSE,
  purchases: NOTIFICATIONS_EMPTY_TITLE_PURCHASES,
  staff: NOTIFICATIONS_EMPTY_TITLE_STAFF,
  system: NOTIFICATIONS_EMPTY_TITLE_SYSTEM,
};

export const NOTIFICATIONS_EMPTY_SUBTITLE: Record<
  NotificationCategoryFilter,
  string
> = {
  all: NOTIFICATIONS_EMPTY_SUB_ALL,
  critical: NOTIFICATIONS_EMPTY_SUB_CRITICAL,
  warehouse: NOTIFICATIONS_EMPTY_SUB_WAREHOUSE,
  purchases: NOTIFICATIONS_EMPTY_SUB_PURCHASES,
  staff: NOTIFICATIONS_EMPTY_SUB_STAFF,
  system: NOTIFICATIONS_EMPTY_SUB_SYSTEM,
};
