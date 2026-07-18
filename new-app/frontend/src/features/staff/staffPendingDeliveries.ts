/**
 * Staff pending deliveries — port of staff_home_providers.dart
 * groupStaffDeliverySections / staffDeliveryNeedsAction + DeliveryStatus labels.
 * Source: trade_purchase_models.dart DeliveryStatusX
 */

export type DeliveryStatusWire =
  | "pending"
  | "dispatched"
  | "in_transit"
  | "arrived"
  | "staff_verifying"
  | "staff_verified"
  | "stock_committed"
  | "partial"
  | "cancelled";

export type StaffPendingPurchase = {
  id: string;
  humanId: string;
  purchaseDate: string;
  deliveryStatus: DeliveryStatusWire;
  purchaseStatus: string;
  isDelivered: boolean;
  itemsSummary: string;
  qty: number;
  unit: string;
};

const DELIVERY_LABELS: Record<DeliveryStatusWire, string> = {
  pending: "Pending delivery",
  dispatched: "Dispatched",
  in_transit: "In transit",
  arrived: "Arrived — verify",
  staff_verifying: "Being verified",
  staff_verified: "Verified — commit",
  stock_committed: "Stock added",
  partial: "Partial delivery",
  cancelled: "Cancelled",
};

export function parseDeliveryStatus(raw: unknown): DeliveryStatusWire {
  const s = String(raw ?? "")
    .toLowerCase()
    .trim();
  switch (s) {
    case "pending":
    case "dispatched":
    case "in_transit":
    case "arrived":
    case "staff_verifying":
    case "staff_verified":
    case "stock_committed":
    case "partial":
    case "cancelled":
      return s;
    default:
      return "pending";
  }
}

export function deliveryStatusLabel(ds: DeliveryStatusWire): string {
  return DELIVERY_LABELS[ds];
}

export function deliveryNeedsStaffAction(ds: DeliveryStatusWire): boolean {
  return ds === "arrived" || ds === "staff_verifying";
}

function parsePurchaseStatus(raw: unknown): string {
  return String(raw ?? "")
    .toLowerCase()
    .trim();
}

/** Flutter formatStockQtyNumber — whole ints with commas; else trim trailing 0. */
export function formatStockQtyNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) < 0.001) {
    return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const s = n.toFixed(2);
  return s.endsWith("0") ? s.slice(0, -1) : s;
}

type LineLike = {
  id?: string;
  item_name?: string;
  itemName?: string;
  qty?: number;
  unit?: string;
};

export type TradePurchaseListRow = {
  id?: string;
  human_id?: string;
  purchase_date?: string;
  delivery_status?: string;
  status?: string;
  is_delivered?: boolean;
  total_qty?: number | null;
  lines?: LineLike[];
};

function itemsSummaryFromLines(lines: LineLike[]): string {
  if (lines.length === 0) return "";
  const names = lines
    .slice(0, 3)
    .map((e) => String(e.item_name ?? e.itemName ?? "").trim())
    .filter(Boolean);
  const joined = names.join(", ");
  return lines.length > 3 ? `${joined}…` : joined;
}

function coercePurchase(row: TradePurchaseListRow): StaffPendingPurchase | null {
  const id = String(row.id ?? "").trim();
  if (!id) return null;
  const lines = Array.isArray(row.lines) ? row.lines : [];
  const qty = lines.reduce((a, l) => a + Number(l.qty ?? 0), 0);
  const unit =
    lines.length > 0 ? String(lines[0]?.unit ?? "").trim() : "";
  const humanId = String(row.human_id ?? "").trim() || id;
  const summary = itemsSummaryFromLines(lines);
  return {
    id,
    humanId,
    purchaseDate: String(row.purchase_date ?? ""),
    deliveryStatus: parseDeliveryStatus(row.delivery_status),
    purchaseStatus: parsePurchaseStatus(row.status),
    isDelivered: Boolean(row.is_delivered),
    itemsSummary: summary,
    qty,
    unit,
  };
}

function staffDeliveryNeedsAction(p: StaffPendingPurchase): boolean {
  if (p.purchaseStatus === "deleted" || p.purchaseStatus === "cancelled") {
    return false;
  }
  if (p.deliveryStatus === "stock_committed") return false;
  const ds = p.deliveryStatus;
  if (
    ds === "pending" ||
    ds === "dispatched" ||
    ds === "in_transit" ||
    ds === "arrived" ||
    ds === "staff_verifying"
  ) {
    return true;
  }
  if (p.isDelivered) return true;
  return false;
}

export type StaffDeliverySections = {
  dispatched: StaffPendingPurchase[];
  arrived: StaffPendingPurchase[];
  pendingVerification: StaffPendingPurchase[];
};

/** Flutter groupStaffDeliverySections */
export function groupStaffDeliverySections(
  purchases: StaffPendingPurchase[],
): StaffDeliverySections {
  const dispatched: StaffPendingPurchase[] = [];
  const arrived: StaffPendingPurchase[] = [];
  const pendingVerification: StaffPendingPurchase[] = [];
  for (const p of purchases) {
    if (
      p.purchaseStatus === "deleted" ||
      p.purchaseStatus === "cancelled" ||
      p.deliveryStatus === "stock_committed"
    ) {
      continue;
    }
    const ds = p.deliveryStatus;
    if (ds === "pending" || ds === "dispatched" || ds === "in_transit") {
      dispatched.push(p);
    } else if (ds === "staff_verified" || ds === "partial") {
      pendingVerification.push(p);
    } else if (
      ds === "arrived" ||
      ds === "staff_verifying" ||
      p.isDelivered ||
      staffDeliveryNeedsAction(p)
    ) {
      arrived.push(p);
    }
  }
  const cmp = (a: StaffPendingPurchase, b: StaffPendingPurchase) =>
    a.purchaseDate.localeCompare(b.purchaseDate);
  dispatched.sort(cmp);
  arrived.sort(cmp);
  pendingVerification.sort(cmp);
  return { dispatched, arrived, pendingVerification };
}

/** Flutter staffPendingDeliveriesProvider — oldest first. */
export function staffPendingDeliveriesFromRows(
  rows: TradePurchaseListRow[],
): StaffPendingPurchase[] {
  const parsed = rows
    .map(coercePurchase)
    .filter((p): p is StaffPendingPurchase => p != null);
  const sections = groupStaffDeliverySections(parsed);
  const pending = [
    ...sections.dispatched,
    ...sections.arrived,
    ...sections.pendingVerification,
  ];
  pending.sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
  return pending;
}

export function showMarkArrived(ds: DeliveryStatusWire): boolean {
  return ds === "dispatched" || ds === "in_transit" || ds === "pending";
}

export function cardSubtitle(p: StaffPendingPurchase): string {
  const qtyPart = `${formatStockQtyNumber(p.qty)}${
    p.unit ? ` ${p.unit}` : ""
  }`;
  return `${qtyPart} · ${deliveryStatusLabel(p.deliveryStatus)}`;
}

export function cardTitle(p: StaffPendingPurchase): string {
  return p.itemsSummary.trim() !== "" ? p.itemsSummary : p.humanId;
}
