/**
 * Notifications merged feed — port of mergedNotificationFeedProvider
 * (server + warehouse + welcome seed). Purchase-due alerts deferred until
 * trade-purchases list exposes remaining/due_date (FastAPI TradePurchaseOut).
 * Sources: notifications_provider.dart, staffBellBadge.ts
 */
import {
  notificationKindPrefKey,
  notificationVisibleForStaff,
  readNotificationKindToggles,
  warehouseAlertStableCreatedAt,
  type PendingDeliveryForBell,
} from "../staff/staffBellBadge";
import type { StockAlertsSummaryOut } from "../staff/staffHomeApi";
import type { NotificationCategoryFilter } from "./notificationsFilters";
import { NOTIFICATIONS_APP_NAME } from "./notificationsCopy";

export type NotificationUiItem = {
  id: string;
  type: "server" | "warehouse" | "manual" | "purchase";
  title: string;
  subtitle: string;
  createdAt: Date;
  isRead: boolean;
  actionRoute: string | null;
  serverNotificationId: string | null;
  serverKind: string | null;
  priority: string | null;
  category: string | null;
  targetRoles: string[] | null;
  prefKey: string | null;
};

export function notificationItemFromServerRow(
  row: Record<string, unknown>,
): NotificationUiItem {
  const sid = String(row.id ?? "");
  const kind = String(row.kind ?? "");
  const readAt = row.read_at;
  const isRead = readAt != null && String(readAt).length > 0;
  let createdAt: Date;
  try {
    createdAt = new Date(String(row.created_at ?? ""));
    if (Number.isNaN(createdAt.getTime())) createdAt = new Date();
  } catch {
    createdAt = new Date();
  }
  const title = String(row.title ?? "Notice");
  const body = String(row.body ?? "");
  let route =
    row.action_route != null && String(row.action_route).length > 0
      ? String(row.action_route)
      : null;
  if (!route) {
    if (
      kind === "low_stock" ||
      kind === "stock_variance" ||
      kind === "reorder_request" ||
      kind === "staff_alert"
    ) {
      const payload = row.payload;
      if (payload && typeof payload === "object") {
        const iid = (payload as Record<string, unknown>).item_id;
        if (iid != null && String(iid).length > 0) {
          route = `/catalog/item/${iid}`;
        }
      }
    } else if (
      kind === "delivery_pending" ||
      kind === "delivery_received" ||
      kind === "payment_due"
    ) {
      const pid = row.related_purchase_id;
      if (pid != null && String(pid).length > 0) {
        route = `/purchase/detail/${pid}`;
      }
    }
  }
  const actor = row.triggered_by_name != null ? String(row.triggered_by_name) : "";
  const subtitle =
    actor.trim().length > 0 ? `${body}\nBy: ${actor.trim()}` : body;
  let targetRoles: string[] | null = null;
  const payload = row.payload;
  if (payload && typeof payload === "object") {
    const raw = (payload as Record<string, unknown>).target_roles;
    if (Array.isArray(raw)) {
      targetRoles = raw
        .map((e) => String(e ?? "").trim().toLowerCase())
        .filter((s) => s.length > 0);
    }
  }
  const item: NotificationUiItem = {
    id: `srv_${sid}`,
    type: "server",
    title,
    subtitle: subtitle.trim(),
    createdAt,
    isRead,
    actionRoute: route,
    serverNotificationId: sid.length > 0 ? sid : null,
    serverKind: kind.length > 0 ? kind : null,
    priority: row.priority != null ? String(row.priority) : null,
    category: row.category != null ? String(row.category) : null,
    targetRoles,
    prefKey: null,
  };
  item.prefKey = notificationKindPrefKey({
    id: item.id,
    serverKind: item.serverKind,
    type: "server",
  });
  return item;
}

/** Flutter notificationItemWithRoleRoutes — staff-safe deep links */
export function withRoleRoutes(
  n: NotificationUiItem,
  staff: boolean,
): NotificationUiItem {
  if (!staff || !n.actionRoute) return n;
  let route = n.actionRoute;
  if (route.startsWith("/purchase/") || route === "/purchase") {
    if (
      n.serverKind === "delivery_pending" ||
      n.serverKind === "delivery_received"
    ) {
      route = "/staff/receive";
    } else {
      route = "/staff/home";
    }
  } else if (route.startsWith("/stock/low-stock")) {
    route = "/staff/low-stock";
  } else if (route === "/stock" || route.startsWith("/stock/")) {
    route = "/staff/stock";
  }
  if (route === n.actionRoute) return n;
  return { ...n, actionRoute: route };
}

export function notificationVisibleForRole(
  n: NotificationUiItem,
  staff: boolean,
): boolean {
  if (n.targetRoles != null && n.targetRoles.length > 0) {
    const role = staff ? "staff" : "owner";
    return n.targetRoles.map((r) => r.toLowerCase()).includes(role);
  }
  if (!staff) return true;
  return notificationVisibleForStaff({
    id: n.id,
    serverKind: n.serverKind,
    actionRoute: n.actionRoute,
    targetRoles: n.targetRoles,
  });
}

function categoryFromWire(
  v: string | null,
): NotificationCategoryFilter | null {
  switch (v) {
    case "all":
      return "all";
    case "critical":
      return "critical";
    case "warehouse":
      return "warehouse";
    case "purchases":
      return "purchases";
    case "staff":
      return "staff";
    case "system":
      return "system";
    default:
      return null;
  }
}

/** Flutter notificationCategoryForItem */
export function notificationCategoryForItem(
  n: NotificationUiItem,
): NotificationCategoryFilter {
  const kind = n.serverKind ?? "";
  if (kind === "reorder_request") return "staff";
  const fromWire = categoryFromWire(n.category);
  if (fromWire != null && fromWire !== "all") return fromWire;
  if (n.id.startsWith("wh_")) {
    if (n.priority === "critical" || n.priority === "high") return "critical";
    return "warehouse";
  }
  if (
    kind === "stock_variance" ||
    kind === "stock_mismatch" ||
    kind === "export_failed" ||
    kind === "sync_failed" ||
    kind === "approval_required" ||
    n.type === "purchase"
  ) {
    return "critical";
  }
  if (kind === "damage_report" || kind === "damage_acknowledged") {
    return "purchases";
  }
  if (kind === "delivery_assigned") return "staff";
  if (n.actionRoute?.startsWith("/purchase") ?? false) return "purchases";
  if (kind === "delivery_idle") return "purchases";
  if (kind === "physical_count_reminder") return "warehouse";
  if (
    n.id.startsWith("wh_pending_delivery") ||
    kind === "staff_alert" ||
    kind === "delivery_verified" ||
    kind === "staff_action" ||
    kind === "stock_correction"
  ) {
    return "staff";
  }
  if (
    (kind === "low_stock" || kind === "missing_barcode") &&
    (n.priority === "high" || n.priority === "critical")
  ) {
    return "critical";
  }
  if (
    kind === "low_stock" ||
    kind === "supplier_delayed" ||
    kind === "missing_barcode" ||
    kind === "missing_code" ||
    kind === "opening_stock_pending"
  ) {
    return "warehouse";
  }
  if (
    n.type === "manual" ||
    kind === "delivery_received" ||
    kind === "duplicate_item"
  ) {
    return "system";
  }
  if (n.type === "server") {
    if (kind === "delivery_pending") return "staff";
    if (kind === "payment_due") return "purchases";
    return "system";
  }
  return "system";
}

export function notificationMatchesCategoryFilter(
  n: NotificationUiItem,
  filter: NotificationCategoryFilter,
): boolean {
  if (filter === "all") return true;
  return notificationCategoryForItem(n) === filter;
}

function passesKindToggles(
  n: NotificationUiItem,
  enabledKinds: Set<string>,
): boolean {
  const key = n.prefKey ?? notificationKindPrefKey({
    id: n.id,
    serverKind: n.serverKind,
    type: n.type === "warehouse" ? "warehouse" : n.type === "manual" ? "manual" : "server",
  });
  if (key == null) return true;
  return enabledKinds.has(key);
}

export function buildWarehouseUiItems(args: {
  alerts: StockAlertsSummaryOut;
  openingCount: number;
  pending: PendingDeliveryForBell[];
  staff: boolean;
  readIds: Set<string>;
  now?: Date;
}): NotificationUiItem[] {
  const out: NotificationUiItem[] = [];
  const now = args.now ?? new Date();
  const outN =
    args.alerts.active_out_of_stock > 0
      ? args.alerts.active_out_of_stock
      : args.alerts.out_of_stock;
  const low = args.alerts.low_stock;
  if (low + outN > 0) {
    const id = "wh_low_stock";
    out.push({
      id,
      type: "warehouse",
      title: "Low / out of stock",
      subtitle: `${low} low · ${outN} out — open stock list to update`,
      createdAt: warehouseAlertStableCreatedAt(id, now),
      isRead: args.readIds.has(id),
      actionRoute: args.staff ? "/staff/low-stock" : "/stock/low-stock",
      serverNotificationId: null,
      serverKind: "low_stock",
      priority: outN > 0 ? "high" : null,
      category: null,
      targetRoles: null,
      prefKey: "low_stock",
    });
  }
  if (args.alerts.missing_barcode > 0) {
    const id = "wh_missing_barcode";
    const n = args.alerts.missing_barcode;
    out.push({
      id,
      type: "warehouse",
      title: "Missing barcodes",
      subtitle: `${n} items need labels before bulk print`,
      createdAt: warehouseAlertStableCreatedAt(id, now),
      isRead: args.readIds.has(id),
      actionRoute: "/stock/missing-barcodes",
      serverNotificationId: null,
      serverKind: "missing_barcode",
      priority: null,
      category: null,
      targetRoles: null,
      prefKey: "low_stock",
    });
  }
  if (args.alerts.missing_item_code > 0) {
    const id = "wh_missing_code";
    const n = args.alerts.missing_item_code;
    out.push({
      id,
      type: "warehouse",
      title: "Missing item codes",
      subtitle: `${n} catalog rows without item code`,
      createdAt: warehouseAlertStableCreatedAt(id, now),
      isRead: args.readIds.has(id),
      actionRoute: args.staff ? "/staff/stock" : "/stock",
      serverNotificationId: null,
      serverKind: "missing_code",
      priority: null,
      category: null,
      targetRoles: null,
      prefKey: "low_stock",
    });
  }
  if (args.openingCount > 0) {
    const id = "wh_opening_stock";
    out.push({
      id,
      type: "warehouse",
      title: "Opening stock",
      subtitle: `${args.openingCount} items need initial stock setup`,
      createdAt: warehouseAlertStableCreatedAt(id, now),
      isRead: args.readIds.has(id),
      actionRoute: "/stock/opening-setup",
      serverNotificationId: null,
      serverKind: "opening_stock_pending",
      priority: "high",
      category: null,
      targetRoles: null,
      prefKey: "opening_stock",
    });
  }
  if (args.staff && args.pending.length > 0) {
    const first = args.pending[0]?.supplierName?.trim();
    const sub =
      first != null && first.length > 0
        ? args.pending.length === 1
          ? `From ${first} — receive at warehouse`
          : `From ${first} + ${args.pending.length - 1} more`
        : `${args.pending.length} trucks waiting`;
    const id = "wh_pending_delivery";
    out.push({
      id,
      type: "warehouse",
      title: "Pending deliveries",
      subtitle: sub,
      createdAt: args.pending[0]?.purchaseDate ?? now,
      isRead: args.readIds.has(id),
      actionRoute: "/staff/receive",
      serverNotificationId: null,
      serverKind: null,
      priority: null,
      category: null,
      targetRoles: null,
      prefKey: "delivery",
    });
  }
  return out;
}

export function welcomeSeedItem(now = new Date()): NotificationUiItem {
  return {
    id: "welcome",
    type: "manual",
    title: `Welcome to ${NOTIFICATIONS_APP_NAME}`,
    subtitle:
      "Alerts for price spikes, low margins, and reminders will appear here.",
    createdAt: new Date(now.getTime() - 2 * 60_000),
    isRead: false,
    actionRoute: "/home",
    serverNotificationId: null,
    serverKind: null,
    priority: null,
    category: null,
    targetRoles: null,
    prefKey: null,
  };
}

/** Flutter mergedNotificationFeedProvider merge + sort */
export function mergeNotificationFeed(args: {
  serverRows: Record<string, unknown>[];
  alerts: StockAlertsSummaryOut | null;
  openingCount: number;
  pending: PendingDeliveryForBell[];
  staff: boolean;
  warehouseReadIds: Set<string>;
  manualReadIds: Set<string>;
  enabledKinds?: Set<string>;
  now?: Date;
}): NotificationUiItem[] {
  const enabled =
    args.enabledKinds ?? readNotificationKindToggles(localStorage);
  const now = args.now ?? new Date();

  const serverItems: NotificationUiItem[] = [];
  for (const row of args.serverRows) {
    let n = notificationItemFromServerRow(row);
    n = withRoleRoutes(n, args.staff);
    if (!notificationVisibleForRole(n, args.staff)) continue;
    serverItems.push(n);
  }

  const unreadServerKinds = new Set(
    serverItems
      .filter((e) => !e.isRead && e.serverKind)
      .map((e) => e.serverKind as string),
  );

  const maxLowStockServerRows = 12;
  let lowStockServerShown = 0;
  const cappedServer: NotificationUiItem[] = [];
  for (const n of serverItems) {
    if (n.serverKind === "low_stock") {
      if (lowStockServerShown >= maxLowStockServerRows) continue;
      lowStockServerShown++;
    }
    cappedServer.push(n);
  }

  const warehouse =
    args.alerts == null
      ? []
      : buildWarehouseUiItems({
          alerts: args.alerts,
          openingCount: args.openingCount,
          pending: args.pending,
          staff: args.staff,
          readIds: args.warehouseReadIds,
          now,
        }).filter((w) => {
          if (w.id === "wh_low_stock" && unreadServerKinds.has("low_stock")) {
            return false;
          }
          if (
            w.id === "wh_missing_barcode" &&
            unreadServerKinds.has("missing_barcode")
          ) {
            return false;
          }
          if (
            w.id === "wh_missing_code" &&
            unreadServerKinds.has("missing_code")
          ) {
            return false;
          }
          if (
            w.id === "wh_opening_stock" &&
            unreadServerKinds.has("opening_stock_pending")
          ) {
            return false;
          }
          return true;
        });

  const welcome = welcomeSeedItem(now);
  const manual = args.staff
    ? []
    : [
        {
          ...welcome,
          isRead: args.manualReadIds.has(welcome.id),
        },
      ];

  const byId = new Map<string, NotificationUiItem>();
  for (const n of [...cappedServer, ...warehouse, ...manual]) {
    const prev = byId.get(n.id);
    if (!prev) {
      byId.set(n.id, n);
      continue;
    }
    const pick = n.createdAt.getTime() > prev.createdAt.getTime() ? n : prev;
    if (pick.isRead && (!n.isRead || !prev.isRead)) {
      byId.set(n.id, { ...pick, isRead: false });
    } else {
      byId.set(n.id, pick);
    }
  }

  return [...byId.values()]
    .filter((n) => passesKindToggles(n, enabled))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** NotificationAlertCard.relativeTime */
export function relativeTimeLabel(created: Date, now = new Date()): string {
  const diffMs = now.getTime() - created.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const y = created.getFullYear();
  const m = String(created.getMonth() + 1).padStart(2, "0");
  const d = String(created.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
