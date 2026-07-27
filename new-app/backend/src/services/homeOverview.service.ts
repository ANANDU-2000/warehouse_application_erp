/**
 * Trade home-overview snapshot service.
 * Formula source: reports_trade.py:_compute_trade_dashboard_snapshot_payload
 */
import type { HomeOverviewRepository } from "../repositories/homeOverview.repository";

export type TradeDashboardSnapshot = {
  from: string;
  to: string;
  summary: {
    deals: number;
    total_purchase: number;
    total_landing: number;
    total_selling: number;
    total_profit: number;
    profit_percent: number | null;
    total_qty: number;
    pending_delivery_count: number;
    supplier_count: number;
    broker_count: number;
    received_delivery_count: number;
    negative_stock_count: number;
  };
  unit_totals: {
    total_kg: number;
    total_bags: number;
    total_boxes: number;
    total_tins: number;
  };
  categories: Array<{
    category_id: string;
    category_name: string;
    total_purchase: number;
    total_qty: number;
    units: { bags: number; boxes: number; tins: number };
    items: Array<{
      name: string;
      qty: number;
      unit: string;
      amount: number;
      catalog_item_id: string | null;
    }>;
    subtitle_supplier: string;
    subtitle_broker: string;
  }>;
  /** Deferred: full trade_mapping / breakdown helpers — empty until Purchases module. */
  subcategories: unknown[];
  item_slices: unknown[];
  suppliers: unknown[];
  recommendations: unknown[];
  consistency: { portfolio_score: number | null };
};

/**
 * Formula source: reports_trade.py L645–651
 * total_landing = total_purchase; total_profit = total_selling - total_landing;
 * profit_percent = (profit/landing)*100 if landing > 1e-12 else null
 */
export function snapshotProfitFields(
  totalPurchase: number,
  totalSelling: number,
): {
  total_landing: number;
  total_profit: number;
  profit_percent: number | null;
} {
  const total_landing = totalPurchase;
  const total_profit = totalSelling - total_landing;
  const profit_percent =
    total_landing > 1e-12
      ? Math.round((total_profit / total_landing) * 10000) / 100
      : null;
  return { total_landing, total_profit, profit_percent };
}

export async function computeTradeDashboardSnapshot(
  repo: HomeOverviewRepository,
  businessId: string,
  dateFrom: string,
  dateTo: string,
): Promise<TradeDashboardSnapshot> {
  const [sums, roll, nest, pending, suppliers, brokers, received, neg] =
    await Promise.all([
      repo.snapshotSums(businessId, dateFrom, dateTo),
      repo.unitRollups(businessId, dateFrom, dateTo),
      repo.categoryNest(businessId, dateFrom, dateTo),
      repo.pendingDeliveryCount(businessId),
      repo.supplierCount(businessId, dateFrom, dateTo),
      repo.brokerCount(businessId, dateFrom, dateTo),
      repo.receivedDeliveryCount(businessId, dateFrom, dateTo),
      repo.negativeStockCount(businessId),
    ]);

  const total_purchase = Number(sums.total_purchase ?? 0);
  const total_selling = Number(sums.total_selling ?? 0);
  const { total_landing, total_profit, profit_percent } = snapshotProfitFields(
    total_purchase,
    total_selling,
  );

  const catMap = new Map<
    string,
    TradeDashboardSnapshot["categories"][number]
  >();

  for (const r of nest) {
    const cid = String(r.category_id || "_uncat");
    const cname = String(r.category_name || "Uncategorised");
    if (!catMap.has(cid)) {
      catMap.set(cid, {
        category_id: cid,
        category_name: cname,
        total_purchase: 0,
        total_qty: 0,
        units: { bags: 0, boxes: 0, tins: 0 },
        items: [],
        subtitle_supplier: "—",
        subtitle_broker: "—",
      });
    }
    const c = catMap.get(cid)!;
    const unit = String(r.unit || "");
    const uu = unit.toUpperCase();
    const ut = String(r.unit_type || "").trim().toLowerCase();
    const qv = Number(r.qty ?? 0);
    const am = Number(r.amount ?? 0);
    c.total_purchase += am;
    c.total_qty += qv;
    if (ut === "bag" || (!ut && (uu.includes("BAG") || uu.includes("SACK")))) {
      c.units.bags += qv;
    }
    if (ut === "box" || (!ut && uu.includes("BOX"))) c.units.boxes += qv;
    if (ut === "tin" || (!ut && uu.includes("TIN"))) c.units.tins += qv;
    c.items.push({
      name: (String(r.item_name || "—").trim() || "—"),
      qty: qv,
      unit,
      amount: am,
      catalog_item_id: r.catalog_item_id ? String(r.catalog_item_id) : null,
    });
  }

  for (const c of catMap.values()) {
    c.items.sort((a, b) => b.amount - a.amount);
  }

  return {
    from: dateFrom,
    to: dateTo,
    summary: {
      deals: Number(sums.deals ?? 0),
      total_purchase,
      total_landing,
      total_selling,
      total_profit,
      profit_percent,
      total_qty: Number(sums.total_qty ?? 0),
      pending_delivery_count: pending,
      supplier_count: suppliers,
      broker_count: brokers,
      received_delivery_count: received,
      negative_stock_count: neg,
    },
    unit_totals: {
      total_kg: Number(roll.total_kg ?? 0),
      total_bags: Number(roll.total_bags ?? 0),
      total_boxes: Number(roll.total_boxes ?? 0),
      total_tins: Number(roll.total_tins ?? 0),
    },
    categories: [...catMap.values()],
    // Unknown until trade_mapping / breakdown helpers ported — see Subagent 1 report
    subcategories: [],
    item_slices: [],
    suppliers: [],
    recommendations: [],
    consistency: { portfolio_score: null },
  };
}

/** Formula source: reports_trade.py:_apply_trade_dashboard_compact */
export function applyTradeDashboardCompact(
  out: Record<string, unknown>,
): void {
  out.item_slices = [];
  out.suppliers = [];
  out.recommendations = [];
  out.subcategories = [];
  const cats = out.categories as TradeDashboardSnapshot["categories"] | undefined;
  if (Array.isArray(cats)) {
    for (const c of cats) {
      c.items = [];
    }
  }
}

export async function buildHomeOverview(
  repo: HomeOverviewRepository,
  businessId: string,
  dateFrom: string,
  dateTo: string,
  opts: { compact: boolean; shellBundle: boolean },
): Promise<Record<string, unknown>> {
  const snap = await computeTradeDashboardSnapshot(
    repo,
    businessId,
    dateFrom,
    dateTo,
  );
  const out: Record<string, unknown> = { ...snap };

  if (opts.shellBundle) {
    out.home_shell = {
      subcategories: snap.subcategories,
      suppliers: snap.suppliers,
      items: snap.item_slices,
    };
    const stock = await repo.inventorySummary(businessId);
    // Formula source: reports_trade.py:_attach_analytics_panel_blocks
    out.stock_in_hand = {
      total_value_inr: stock.total_value_inr,
      bags: stock.bags,
      boxes: stock.boxes,
      tins: stock.tins,
      kg: stock.kg,
      item_count: stock.item_count,
    };
    out.purchased = {
      total_purchase: snap.summary.total_purchase,
      total_qty: snap.summary.total_qty,
      unit_totals: snap.unit_totals,
    };
    // Partial: stock alert chips / delivery pipeline detail deferred to Stock/Purchases
    out.home_operational = {
      stock_status_counts: {
        all: stock.item_count,
        low: 0,
        critical: 0,
        out: 0,
        missing_code: 0,
        missing_barcode: 0,
      },
      warehouse_alerts: [],
      delivery_pipeline: {
        pending_count: snap.summary.pending_delivery_count,
        received_count: snap.summary.received_delivery_count,
      },
      notifications_unread: 0,
      low_stock_top: [],
    };
  }

  if (opts.compact) {
    applyTradeDashboardCompact(out);
  }

  return out;
}
