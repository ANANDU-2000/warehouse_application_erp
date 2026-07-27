/**
 * Staff home bell badge — port of notificationsUnreadCountProvider /
 * mergedNotificationFeedProvider (staff branch only).
 * Sources: notifications_provider.dart, prefs_provider.dart
 */

export type StaffBellNotifItem = {
  id: string;
  isRead: boolean;
  createdAt: Date;
  serverKind: string | null;
  type: "server" | "warehouse" | "manual";
  /** For kind toggles */
  prefKey: string | null;
};

export type PendingDeliveryForBell = {
  supplierName: string | null;
  purchaseDate: Date;
};

export const NOTIF_KIND_PREF_PREFIX = "pref_notif_kind_";
export const NOTIF_KIND_ALL = [
  "low_stock",
  "delivery",
  "stock_variance",
  "staff_alert",
  "opening_stock",
  "physical_reminder",
] as const;

/** Flutter NotificationKindTogglesNotifier — defaults all enabled */
export function readNotificationKindToggles(
  storage: Pick<Storage, "getItem"> = localStorage,
): Set<string> {
  const enabled = new Set<string>();
  for (const k of NOTIF_KIND_ALL) {
    const raw = storage.getItem(`${NOTIF_KIND_PREF_PREFIX}${k}`);
    if (raw === null || raw === "true") enabled.add(k);
  }
  return enabled;
}

export function notificationKindPrefKey(n: {
  id: string;
  serverKind: string | null;
  type: StaffBellNotifItem["type"];
}): string | null {
  const kind = n.serverKind ?? "";
  if (
    kind === "low_stock" ||
    kind === "missing_barcode" ||
    kind === "missing_code" ||
    kind === "opening_stock_pending"
  ) {
    return "low_stock";
  }
  if (kind === "reorder_request" || kind === "staff_alert") {
    return "staff_alert";
  }
  if (kind === "damage_report" || kind === "damage_acknowledged") {
    return "delivery";
  }
  if (kind === "delivery_assigned") return "delivery";
  if (
    kind === "delivery_idle" ||
    kind === "delivery_pending" ||
    kind === "delivery_received" ||
    kind === "delivery_verified" ||
    kind.startsWith("delivery")
  ) {
    return "delivery";
  }
  if (kind === "stock_variance" || kind === "stock_mismatch") {
    return "stock_variance";
  }
  if (kind === "physical_count_reminder") return "physical_reminder";
  if (
    n.id === "wh_low_stock" ||
    n.id === "wh_missing_barcode" ||
    n.id === "wh_missing_code"
  ) {
    return "low_stock";
  }
  if (n.id === "wh_opening_stock") return "opening_stock";
  if (n.id.startsWith("wh_pending_delivery")) return "delivery";
  return null;
}

/**
 * Flutter notificationVisibleForRole — staff branch.
 * Session role assumed staff for staff home.
 */
export function notificationVisibleForStaff(n: {
  id: string;
  serverKind: string | null;
  actionRoute: string | null;
  targetRoles: string[] | null;
}): boolean {
  if (n.targetRoles != null && n.targetRoles.length > 0) {
    return n.targetRoles.map((r) => r.toLowerCase()).includes("staff");
  }
  if (n.id.startsWith("pur_")) return false;
  const kind = n.serverKind ?? "";
  if (kind === "damage_report") return false;
  if (
    kind.includes("profit") ||
    kind.includes("spend") ||
    kind === "rate_alert" ||
    kind === "financial"
  ) {
    return false;
  }
  if (kind === "stock_variance" || kind === "stock_mismatch") return false;
  if (
    kind === "payment_due" ||
    kind === "purchase_overdue" ||
    kind === "approval_required"
  ) {
    return false;
  }
  if (
    n.actionRoute?.startsWith("/purchase") === true &&
    kind !== "delivery_pending" &&
    kind !== "delivery_received"
  ) {
    return false;
  }
  return true;
}

export function notificationItemFromServerRow(
  row: Record<string, unknown>,
): {
  id: string;
  isRead: boolean;
  createdAt: Date;
  serverKind: string | null;
  actionRoute: string | null;
  targetRoles: string[] | null;
  type: "server";
  prefKey: string | null;
} {
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
    }
  }
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
  const item = {
    id: `srv_${sid}`,
    isRead,
    createdAt,
    serverKind: kind.length > 0 ? kind : null,
    actionRoute: route,
    targetRoles,
    type: "server" as const,
    prefKey: null as string | null,
  };
  item.prefKey = notificationKindPrefKey(item);
  return item;
}

/** Flutter warehouseAlertStableCreatedAt */
export function warehouseAlertStableCreatedAt(
  alertId: string,
  now = new Date(),
): Date {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let hash = 0;
  for (let i = 0; i < alertId.length; i++) {
    hash = (hash * 31 + alertId.charCodeAt(i)) | 0;
  }
  const minutes = Math.abs(hash) % 720;
  return new Date(base.getTime() + minutes * 60_000);
}

export function buildWarehouseAlertItems(args: {
  low: number;
  out: number;
  missingBarcode: number;
  missingCode: number;
  openingCount: number;
  pending: PendingDeliveryForBell[];
  readIds?: Set<string>;
  now?: Date;
}): StaffBellNotifItem[] {
  const readIds = args.readIds ?? new Set<string>();
  const out: StaffBellNotifItem[] = [];
  if (args.low + args.out > 0) {
    const id = "wh_low_stock";
    out.push({
      id,
      isRead: readIds.has(id),
      createdAt: warehouseAlertStableCreatedAt(id, args.now),
      serverKind: "low_stock",
      type: "warehouse",
      prefKey: "low_stock",
    });
  }
  if (args.missingBarcode > 0) {
    const id = "wh_missing_barcode";
    out.push({
      id,
      isRead: readIds.has(id),
      createdAt: warehouseAlertStableCreatedAt(id, args.now),
      serverKind: "missing_barcode",
      type: "warehouse",
      prefKey: "low_stock",
    });
  }
  if (args.missingCode > 0) {
    const id = "wh_missing_code";
    out.push({
      id,
      isRead: readIds.has(id),
      createdAt: warehouseAlertStableCreatedAt(id, args.now),
      serverKind: "missing_code",
      type: "warehouse",
      prefKey: "low_stock",
    });
  }
  if (args.openingCount > 0) {
    const id = "wh_opening_stock";
    out.push({
      id,
      isRead: readIds.has(id),
      createdAt: warehouseAlertStableCreatedAt(id, args.now),
      serverKind: "opening_stock_pending",
      type: "warehouse",
      prefKey: "opening_stock",
    });
  }
  if (args.pending.length > 0) {
    const id = "wh_pending_delivery";
    out.push({
      id,
      isRead: readIds.has(id),
      createdAt: args.pending[0]!.purchaseDate,
      serverKind: null,
      type: "warehouse",
      prefKey: "delivery",
    });
  }
  return out;
}

/**
 * Staff merged feed unread count — mirrors notificationsUnreadCountProvider
 * for staff (no purchase-due alerts; no manual welcome filter needed when empty).
 */
export function countStaffBellUnread(args: {
  serverRows: Record<string, unknown>[];
  alerts: {
    low_stock: number;
    active_out_of_stock: number;
    out_of_stock: number;
    missing_barcode: number;
    missing_item_code: number;
  };
  openingCount: number;
  pending: PendingDeliveryForBell[];
  enabledKinds?: Set<string>;
  readIds?: Set<string>;
}): number {
  const enabled =
    args.enabledKinds ??
    new Set<string>(NOTIF_KIND_ALL);

  const serverItems = [];
  for (const row of args.serverRows) {
    const n = notificationItemFromServerRow(row);
    if (
      !notificationVisibleForStaff({
        id: n.id,
        serverKind: n.serverKind,
        actionRoute: n.actionRoute,
        targetRoles: n.targetRoles,
      })
    ) {
      continue;
    }
    serverItems.push(n);
  }

  const unreadServerKinds = new Set(
    serverItems
      .filter((e) => !e.isRead && e.serverKind)
      .map((e) => e.serverKind as string),
  );

  const maxLowStockServerRows = 12;
  let lowStockServerShown = 0;
  const cappedServer: StaffBellNotifItem[] = [];
  for (const n of serverItems) {
    if (n.serverKind === "low_stock") {
      if (lowStockServerShown >= maxLowStockServerRows) continue;
      lowStockServerShown++;
    }
    cappedServer.push({
      id: n.id,
      isRead: n.isRead,
      createdAt: n.createdAt,
      serverKind: n.serverKind,
      type: "server",
      prefKey: n.prefKey,
    });
  }

  const outCount =
    args.alerts.active_out_of_stock > 0
      ? args.alerts.active_out_of_stock
      : args.alerts.out_of_stock;

  const warehouse = buildWarehouseAlertItems({
    low: args.alerts.low_stock,
    out: outCount,
    missingBarcode: args.alerts.missing_barcode,
    missingCode: args.alerts.missing_item_code,
    openingCount: args.openingCount,
    pending: args.pending,
    readIds: args.readIds,
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
    if (w.id === "wh_missing_code" && unreadServerKinds.has("missing_code")) {
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

  const byId = new Map<string, StaffBellNotifItem>();
  for (const n of [...cappedServer, ...warehouse]) {
    const prev = byId.get(n.id);
    if (!prev) {
      byId.set(n.id, n);
      continue;
    }
    const pick =
      n.createdAt.getTime() > prev.createdAt.getTime() ? n : prev;
    if (pick.isRead && (!n.isRead || !prev.isRead)) {
      byId.set(n.id, { ...pick, isRead: false });
    } else {
      byId.set(n.id, pick);
    }
  }

  const feed = [...byId.values()].filter((n) => {
    const key = n.prefKey ?? notificationKindPrefKey(n);
    if (key == null) return true;
    return enabled.has(key);
  });

  const seen = new Set<string>();
  let unread = 0;
  for (const e of feed) {
    if (e.isRead || !seen.add(e.id)) continue;
    unread++;
  }
  return unread;
}

/** Flutter Badge label */
export function staffBellBadgeLabel(count: number): string {
  if (count <= 0) return "";
  return count > 99 ? "99+" : String(count);
}
