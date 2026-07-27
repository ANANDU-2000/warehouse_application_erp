/**
 * Warehouse activity feed merge — port of _fetchHomeWarehouseActivity.
 * Source: home_owner_dashboard_providers.dart
 */
import {
  listStaffPurchaseLogs,
  listStockAuditRecent,
  listTradePurchases,
  HomeActivityNetworkError,
} from "./homeActivityApi";
import {
  activityUnitsLineQualityScore,
  dedupeActivityUnitsLine,
  purchaseActivityUnitsLine,
  stockAuditActivityUnitsLine,
  warehouseActivityRowScore,
} from "./homeActivityUnits";
import {
  homePeriodApiDates,
  homePeriodRange,
  type HomeCustomRange,
  type HomePeriod,
} from "./homePeriod";

export type HomeActivityItem = {
  kind: string;
  title: string;
  subtitle: string;
  at: Date;
  amountInr?: number | null;
  routeId?: string | null;
  actor?: string | null;
  createdBy?: string | null;
  qtyChange?: string | null;
  humanId?: string | null;
  unitsLine?: string | null;
  verifiedBy?: string | null;
  supplierName?: string | null;
};

const KEEP_KINDS = new Set([
  "purchase",
  "delivery_verified",
  "stock_quick_purchase",
  "physical_count",
  "opening_stock_set",
  "stock_correction",
  "reorder_created",
]);

function coerceToDouble(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function activityUnitsOrNull(line: string | null | undefined): string | null {
  const t = line?.trim();
  return t ? t : null;
}

function activityKindFromAdjustment(adjustmentType: string | null | undefined): string {
  const t = (adjustmentType ?? "").toLowerCase();
  if (t.includes("physical") || t.includes("count")) return "physical_count";
  if (t.includes("opening")) return "opening_stock_set";
  if (t.includes("correct")) return "stock_correction";
  if (t.includes("damage")) return "damage";
  if (t.includes("reorder")) return "reorder_created";
  return "stock";
}

function activityTitleFromAdjustment(
  adjustmentType: string | null | undefined,
  itemName: string,
): string {
  const t = (adjustmentType ?? "").toLowerCase();
  if (t.includes("physical") || t.includes("count")) return "Physical stock updated";
  if (t.includes("opening")) return "Opening stock set";
  if (t.includes("correct")) return "Stock corrected";
  if (t.includes("damage")) return "Damage recorded";
  if (t.includes("reorder")) return "Reorder logged";
  return itemName;
}

function parsePurchaseReceivedReason(audit: Record<string, unknown>): {
  humanId: string;
  purchaseId: string | null;
} | null {
  const reason = audit.reason?.toString().trim() ?? "";
  const match = /^Purchase received \((.+)\)$/.exec(reason);
  if (!match) return null;
  const humanId = match[1]?.trim() ?? "";
  if (!humanId) return null;
  let purchaseId: string | null = null;
  const meta = audit.metadata;
  if (meta && typeof meta === "object") {
    purchaseId = (meta as { purchase_id?: unknown }).purchase_id?.toString() ?? null;
  }
  purchaseId ??=
    audit.source_id?.toString() ?? audit.purchase_id?.toString() ?? null;
  return { humanId, purchaseId };
}

function purchaseCreatedBy(p: Record<string, unknown>): string | null {
  for (const key of ["created_by_name", "user_name", "staff_name"]) {
    const v = p[key]?.toString().trim();
    if (v) return v;
  }
  return null;
}

function purchaseVerifiedBy(p: Record<string, unknown>): string | null {
  const v = p.staff_verified_by_name?.toString().trim();
  if (v) return v;
  const notes = p.delivery_notes?.toString() ?? "";
  const fromNotes = /Verified by ([^|\n]+)/i.exec(notes);
  const name = fromNotes?.[1]?.trim();
  return name || null;
}

function purchaseActivityIndex(
  items: HomeActivityItem[],
  args: { purchaseId?: string | null; humanId?: string | null },
): number {
  if (args.purchaseId) {
    const byId = items.findIndex((i) => i.routeId === args.purchaseId);
    if (byId >= 0) return byId;
  }
  const hid = args.humanId?.trim();
  if (!hid) return -1;
  return items.findIndex(
    (i) =>
      i.humanId === hid &&
      (i.kind === "purchase" || i.kind === "delivery_verified"),
  );
}

function enrichPurchaseActivityFromAudit(
  items: HomeActivityItem[],
  purchaseId: string,
  audit: Record<string, unknown>,
  humanId?: string | null,
): void {
  const idx = purchaseActivityIndex(items, { purchaseId, humanId });
  if (idx < 0) return;
  const existing = items[idx];
  const verified = audit.updated_by_name?.toString().trim();
  const units = stockAuditActivityUnitsLine(audit);
  const mergedUnits = dedupeActivityUnitsLine(
    existing.unitsLine?.trim() ? existing.unitsLine : units,
  );
  items[idx] = {
    ...existing,
    verifiedBy: existing.verifiedBy?.trim()
      ? existing.verifiedBy
      : verified || null,
    unitsLine: mergedUnits || null,
  };
}

function mergeDeliveryActivityGroup(group: HomeActivityItem[]): HomeActivityItem {
  if (group.length === 1) {
    const only = group[0];
    const units = dedupeActivityUnitsLine(only.unitsLine);
    return units ? { ...only, unitsLine: units } : only;
  }
  const sorted = [...group].sort((a, b) => b.at.getTime() - a.at.getTime());
  let best = sorted[0];
  for (const g of sorted) {
    if (
      warehouseActivityRowScore({
        unitsLine: g.unitsLine,
        verifiedBy: g.verifiedBy,
        amountInr: g.amountInr,
        supplierName: g.supplierName,
      }) >
      warehouseActivityRowScore({
        unitsLine: best.unitsLine,
        verifiedBy: best.verifiedBy,
        amountInr: best.amountInr,
        supplierName: best.supplierName,
      })
    ) {
      best = g;
    }
  }
  let bestUnits: string | undefined;
  let unitsScore = -1;
  for (const g of sorted) {
    const u = g.unitsLine?.trim();
    if (!u) continue;
    const score = activityUnitsLineQualityScore(u);
    if (score > unitsScore) {
      unitsScore = score;
      bestUnits = u;
    }
  }
  let verifiedBy = best.verifiedBy?.trim();
  let createdBy = best.createdBy?.trim();
  let supplierName = best.supplierName?.trim();
  let amountInr = best.amountInr;
  for (const g of sorted) {
    const v = g.verifiedBy?.trim();
    if (!verifiedBy && v) verifiedBy = v;
    const c = g.createdBy?.trim() ?? g.actor?.trim();
    if (!createdBy && c) createdBy = c;
    const s = g.supplierName?.trim();
    if (!supplierName && s) supplierName = s;
    const a = g.amountInr;
    if ((amountInr == null || amountInr <= 0) && a != null && a > 0) {
      amountInr = a;
    }
  }
  const units = dedupeActivityUnitsLine(bestUnits ?? best.unitsLine);
  return {
    ...best,
    unitsLine: units || best.unitsLine,
    verifiedBy: verifiedBy || best.verifiedBy,
    createdBy: createdBy || best.createdBy,
    supplierName: supplierName || best.supplierName,
    amountInr: amountInr ?? best.amountInr,
  };
}

function collapseDuplicateDeliveryActivity(
  items: HomeActivityItem[],
): HomeActivityItem[] {
  const out: HomeActivityItem[] = [];
  const deliveryGroups = new Map<string, HomeActivityItem[]>();
  for (const i of items) {
    const hid = i.humanId?.trim();
    if (i.kind === "delivery_verified" && hid) {
      const g = deliveryGroups.get(hid) ?? [];
      g.push(i);
      deliveryGroups.set(hid, g);
    } else {
      out.push(i);
    }
  }
  for (const group of deliveryGroups.values()) {
    out.push(mergeDeliveryActivityGroup(group));
  }
  out.sort((a, b) => b.at.getTime() - a.at.getTime());
  return out;
}

function filterAuditsToPeriod(
  rows: Record<string, unknown>[],
  period: HomePeriod,
  custom: HomeCustomRange | null,
): Record<string, unknown>[] {
  const range = homePeriodRange(period, { custom });
  const out: Record<string, unknown>[] = [];
  for (const raw of rows) {
    const atRaw =
      raw.updated_at?.toString() ??
      raw.created_at?.toString() ??
      raw.at?.toString();
    const at = atRaw ? new Date(atRaw) : null;
    if (!at || Number.isNaN(at.getTime())) continue;
    const local = at;
    if (local < range.start || !(local < range.end)) continue;
    out.push(raw);
  }
  return out;
}

export const HOME_ACTIVITY_TIMEOUT_MSG =
  "Recent changes timed out. Pull to refresh.";

export async function fetchHomeWarehouseActivity(args: {
  businessId: string;
  period: HomePeriod;
  custom: HomeCustomRange | null;
  purchaseLimit?: number;
  maxItems?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<HomeActivityItem[]> {
  const purchaseLimit = args.purchaseLimit ?? 60;
  const maxItems = args.maxItems ?? 200;
  const timeoutMs = args.timeoutMs ?? 30_000;
  const dates = homePeriodApiDates(args.period, { custom: args.custom });
  const range = homePeriodRange(args.period, { custom: args.custom });

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  args.signal?.addEventListener("abort", onAbort);
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const [purchases, auditRows, staffPurchases] = await Promise.all([
      listTradePurchases({
        businessId: args.businessId,
        limit: purchaseLimit,
        status: "all",
        purchaseFrom: dates.from,
        purchaseTo: dates.to,
        signal: controller.signal,
      }),
      listStockAuditRecent({
        businessId: args.businessId,
        limit: 250,
        signal: controller.signal,
      }),
      listStaffPurchaseLogs({
        businessId: args.businessId,
        limit: 30,
        signal: controller.signal,
      }),
    ]);

    const audits = filterAuditsToPeriod(auditRows, args.period, args.custom);
    const items: HomeActivityItem[] = [];
    const seenPurchaseIds = new Set<string>();

    for (const p of purchases) {
      const id = p.id?.toString() ?? "";
      if (id) {
        if (seenPurchaseIds.has(id)) continue;
        seenPurchaseIds.add(id);
      }
      const atRaw =
        p.purchase_date?.toString() ?? p.created_at?.toString() ?? null;
      const at = atRaw ? new Date(atRaw) : null;
      if (!at || Number.isNaN(at.getTime())) continue;
      if (at < range.start || !(at < range.end)) continue;
      const deliveryStatus = (p.delivery_status ?? "").toString().toLowerCase();
      const delivered =
        p.is_delivered === true || deliveryStatus === "stock_committed";
      items.push({
        kind: delivered ? "delivery_verified" : "purchase",
        title: delivered ? "Delivery verified" : "Purchase bill added",
        subtitle:
          p.supplier_name?.toString() ??
          p.human_id?.toString() ??
          p.invoice_number?.toString() ??
          "Purchase",
        actor: purchaseCreatedBy(p),
        createdBy: purchaseCreatedBy(p),
        humanId: p.human_id?.toString() ?? null,
        unitsLine: activityUnitsOrNull(purchaseActivityUnitsLine(p)),
        verifiedBy: delivered ? purchaseVerifiedBy(p) : null,
        supplierName: p.supplier_name?.toString() ?? null,
        at,
        amountInr: coerceToDouble(p.total_amount ?? p.bill_total),
        routeId: id || null,
      });
    }

    for (const a of audits) {
      const atRaw =
        a.created_at?.toString() ??
        a.at?.toString() ??
        a.updated_at?.toString() ??
        null;
      const at = atRaw ? new Date(atRaw) : null;
      if (!at || Number.isNaN(at.getTime())) continue;
      if (at < range.start || !(at < range.end)) continue;
      const itemName = a.item_name?.toString() ?? "Item";
      const adjType = a.adjustment_type?.toString();
      const received = parsePurchaseReceivedReason(a);
      const purchaseId = received?.purchaseId?.trim();
      if (received) {
        const pid = purchaseId?.trim() ?? "";
        const hid = received.humanId.trim();
        const linked =
          (pid !== "" && seenPurchaseIds.has(pid)) ||
          (hid !== "" && purchaseActivityIndex(items, { humanId: hid }) >= 0);
        if (linked) {
          enrichPurchaseActivityFromAudit(items, pid, a, hid || null);
          continue;
        }
      }
      const kind = received
        ? "delivery_verified"
        : activityKindFromAdjustment(adjType);
      items.push({
        kind,
        title: received
          ? `Delivery committed — ${received.humanId}`
          : activityTitleFromAdjustment(adjType, itemName),
        subtitle: itemName,
        humanId: received?.humanId ?? null,
        unitsLine: activityUnitsOrNull(stockAuditActivityUnitsLine(a)),
        verifiedBy:
          a.updated_by_name?.toString() ??
          a.updated_by?.toString() ??
          a.user_name?.toString() ??
          null,
        at,
        routeId:
          received?.purchaseId?.trim()
            ? received.purchaseId
            : (a.item_id?.toString() ?? null),
        actor:
          a.updated_by_name?.toString() ??
          a.updated_by?.toString() ??
          a.user_name?.toString() ??
          null,
        createdBy: a.updated_by_name?.toString() ?? null,
      });
    }

    for (const p of staffPurchases) {
      const atRaw = p.created_at?.toString() ?? null;
      const at = atRaw ? new Date(atRaw) : null;
      if (!at || Number.isNaN(at.getTime())) continue;
      if (at < range.start || !(at < range.end)) continue;
      const qty = coerceToDouble(p.qty);
      const unit = (p.unit?.toString() ?? "").toUpperCase();
      items.push({
        kind: "stock_quick_purchase",
        title: "Purchase quantity added",
        subtitle: p.item_name?.toString() ?? "Item",
        unitsLine: qty > 0 ? `+${qty} ${unit}` : null,
        at,
        routeId: p.item_id?.toString() ?? null,
        actor: p.created_by_name?.toString() ?? null,
        qtyChange: qty > 0 ? `+${qty} ${unit}` : null,
      });
    }

    const filtered = items.filter((i) => KEEP_KINDS.has(i.kind));
    const collapsed = collapseDuplicateDeliveryActivity(filtered);
    return collapsed.slice(0, maxItems);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new HomeActivityNetworkError(HOME_ACTIVITY_TIMEOUT_MSG);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    args.signal?.removeEventListener("abort", onAbort);
  }
}
