/**
 * GET /dashboard month composite — port of dashboard.py.
 * Formula source citations inline.
 */
import type { DashboardRepository } from "../repositories/dashboard.repository";

export type DashboardCategorySlice = {
  name: string;
  amount: number;
  profit: number;
  total_qty: number;
};

export type DashboardItemSlice = {
  name: string;
  amount: number;
  profit: number;
  total_qty: number;
};

export type DashboardOut = {
  month: string;
  total_purchase: number;
  total_paid: number;
  pending: number;
  total_profit: number;
  purchase_count: number;
  categories: DashboardCategorySlice[];
  items: DashboardItemSlice[];
  degraded: boolean;
  degraded_reason: string | null;
};

const _DASH_MONTH_TTL_S = 22_000;
const cache = new Map<string, { at: number; out: DashboardOut }>();
const lastGood = new Map<string, DashboardOut>();

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/**
 * Category name heuristic from top items.
 * Formula source: dashboard.py:_compute_month_dashboard_payload (cat_map loop)
 */
export function categoryKeyFromItemName(name: string): string {
  let key = "General";
  for (const sep of [" ", "—", "-", "("]) {
    if (name.includes(sep)) {
      key = name.split(sep)[0]?.trim() || "General";
      break;
    }
  }
  return key;
}

export function buildCategoriesFromItems(
  items: DashboardItemSlice[],
): DashboardCategorySlice[] {
  const catMap = new Map<string, [number, number, number]>();
  for (const it of items) {
    const key = categoryKeyFromItemName(it.name);
    const acc = catMap.get(key) ?? [0, 0, 0];
    acc[0] += it.amount;
    acc[1] += it.profit;
    acc[2] += it.total_qty;
    catMap.set(key, acc);
  }
  return [...catMap.entries()]
    .map(([name, v]) => ({
      name,
      amount: v[0],
      profit: v[1],
      total_qty: v[2],
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 12);
}

/** Formula source: dashboard.py pending = max(0, tot - paid) */
export function pendingAmount(totalPurchase: number, totalPaid: number): number {
  return Math.max(0, totalPurchase - totalPaid);
}

export async function computeMonthDashboard(
  repo: DashboardRepository,
  businessId: string,
  month: string,
): Promise<DashboardOut> {
  const parts = month.trim().split("-");
  if (parts.length !== 2) {
    const err = new Error("month must be YYYY-MM") as Error & { status: number };
    err.status = 422;
    throw err;
  }
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
    const err = new Error("month must be YYYY-MM") as Error & { status: number };
    err.status = 422;
    throw err;
  }

  const monthKey = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}`;
  const cacheKey = `${businessId}|${monthKey}`;
  const hit = cache.get(cacheKey);
  const now = Date.now();
  if (hit && now - hit.at <= _DASH_MONTH_TTL_S) {
    return hit.out;
  }

  const start = `${monthKey}-01`;
  const end = `${monthKey}-${daysInMonth(y, m).toString().padStart(2, "0")}`;

  try {
    const [agg, paid, profit, itemRows] = await Promise.all([
      repo.monthLineAgg(businessId, start, end),
      repo.monthPaidTotal(businessId, start, end),
      repo.monthLineProfit(businessId, start, end),
      repo.topItemSpend(businessId, start, end, 20),
    ]);

    const totF = Number(agg.line_total ?? 0);
    const paidF = Number(paid);
    const items: DashboardItemSlice[] = itemRows.map((r) => ({
      name: String(r.item_name),
      amount: Number(r.spend ?? 0),
      profit: Number(r.pf ?? 0),
      total_qty: Number(r.tq ?? 0),
    }));

    const out: DashboardOut = {
      month: monthKey,
      total_purchase: totF,
      total_paid: paidF,
      pending: pendingAmount(totF, paidF),
      total_profit: Number(profit),
      purchase_count: Number(agg.purchase_count ?? 0),
      categories: buildCategoriesFromItems(items),
      items,
      degraded: false,
      degraded_reason: null,
    };

    const clean = { ...out };
    lastGood.set(cacheKey, clean);
    cache.set(cacheKey, { at: Date.now(), out });
    if (cache.size > 128) cache.clear();
    return out;
  } catch {
    const lg = lastGood.get(cacheKey);
    const out: DashboardOut = lg
      ? { ...lg, degraded: true, degraded_reason: "read_budget_exceeded" }
      : {
          month: monthKey,
          total_purchase: 0,
          total_paid: 0,
          pending: 0,
          total_profit: 0,
          purchase_count: 0,
          categories: [],
          items: [],
          degraded: true,
          degraded_reason: "read_budget_exceeded",
        };
    cache.set(cacheKey, { at: Date.now(), out });
    return out;
  }
}
