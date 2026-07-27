/**
 * purchase_history_grouping.dart — date headers + purchase rows.
 */
import type { StaffPhPurchaseRow } from "./staffPurchaseHistoryLogic";

export type StaffPhGroupEntry =
  | { kind: "header"; label: string }
  | { kind: "purchase"; purchase: StaffPhPurchaseRow };

function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

/** TradePurchase.purchaseDate / purchase_date */
export function purchaseDateOf(p: StaffPhPurchaseRow): Date {
  const raw = p.purchaseDate ?? p.purchase_date;
  if (raw instanceof Date) return raw;
  if (typeof raw === "string" || typeof raw === "number") {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date(0);
}

/** purchaseHistoryDateGroupLabel */
export function purchaseHistoryDateGroupLabel(
  date: Date,
  now: Date = new Date(),
): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const msDay = 24 * 60 * 60 * 1000;
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === today.getTime() - msDay) return "Yesterday";
  if (d.getTime() >= today.getTime() - 7 * msDay) return "This week";
  if (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function groupSortKey(label: string): number {
  switch (label) {
    case "Today":
      return 0;
    case "Yesterday":
      return 1;
    case "This week":
      return 2;
    default:
      return 3;
  }
}

/** buildGroupedPurchaseHistory */
export function buildGroupedPurchaseHistory(
  purchases: StaffPhPurchaseRow[],
  now: Date = new Date(),
): StaffPhGroupEntry[] {
  if (purchases.length === 0) return [];

  const buckets = new Map<string, StaffPhPurchaseRow[]>();
  for (const p of purchases) {
    const key = purchaseHistoryDateGroupLabel(purchaseDateOf(p), now);
    const list = buckets.get(key) ?? [];
    list.push(p);
    buckets.set(key, list);
  }

  const keys = [...buckets.keys()].sort((a, b) => {
    const c = groupSortKey(a) - groupSortKey(b);
    if (c !== 0) return c;
    return a.localeCompare(b);
  });

  const out: StaffPhGroupEntry[] = [];
  for (const key of keys) {
    out.push({ kind: "header", label: key });
    const rows = (buckets.get(key) ?? []).slice().sort((a, b) => {
      return purchaseDateOf(b).getTime() - purchaseDateOf(a).getTime();
    });
    for (const purchase of rows) {
      out.push({ kind: "purchase", purchase });
    }
  }
  return out;
}

/** purchaseHistoryItemHeadline — line_display.dart */
export function purchaseHistoryItemHeadline(p: StaffPhPurchaseRow): string {
  const lines = Array.isArray(p.lines) ? p.lines : [];
  if (lines.length === 1) {
    const ln = lines[0];
    if (ln && typeof ln === "object") {
      const o = ln as Record<string, unknown>;
      return asStr(o.itemName) || asStr(o.item_name);
    }
  }
  if (lines.length > 1) return `${lines.length} items`;
  const count = Number(p.itemsCount ?? p.items_count ?? 0);
  if (count === 1) return "1 item";
  if (count > 1) return `${count} items`;
  return "";
}

export function purchaseSupplierLabel(p: StaffPhPurchaseRow): string {
  const s =
    asStr(p.supplierName) || asStr(p.supplier_name) || "Supplier";
  return s.toUpperCase();
}

export function purchaseHumanId(p: StaffPhPurchaseRow): string {
  return asStr(p.humanId) || asStr(p.human_id);
}

export function purchaseBrokerName(p: StaffPhPurchaseRow): string {
  return asStr(p.brokerName) || asStr(p.broker_name);
}

export function purchaseIdOf(p: StaffPhPurchaseRow): string {
  return asStr(p.id);
}

/** Status wire → display label (PurchaseStatus.label) */
export function purchaseStatusLabel(p: StaffPhPurchaseRow): string {
  const raw = asStr(p.status).toLowerCase();
  switch (raw) {
    case "draft":
      return "Draft";
    case "saved":
      return "Saved";
    case "confirmed":
      return "Pending";
    case "partially_paid":
      return "Partial";
    case "paid":
      return "Paid";
    case "overdue":
      return "Overdue";
    case "due_soon":
      return "Due soon";
    case "cancelled":
      return "Cancelled";
    case "deleted":
      return "Deleted";
    default:
      return raw ? raw : "—";
  }
}

export function purchaseStatusChipMod(p: StaffPhPurchaseRow): string {
  const raw = asStr(p.status).toLowerCase();
  switch (raw) {
    case "paid":
      return "staff-ph-status-chip--paid";
    case "confirmed":
      return "staff-ph-status-chip--confirmed";
    case "overdue":
    case "cancelled":
      return "staff-ph-status-chip--overdue";
    case "due_soon":
    case "partially_paid":
      return "staff-ph-status-chip--amber";
    default:
      return "staff-ph-status-chip--neutral";
  }
}
