/**
 * Owner stock delivery filter — StockDeliveryFilter enum + indicator counts.
 * Source: stock_delivery_filter_chips.dart + stock_delivery_indicator_counts.
 */

export type StockDeliveryFilter = "all" | "pending" | "delivered";

export const STOCK_DELIVERY_FILTER_ORDER: StockDeliveryFilter[] = [
  "all",
  "pending",
  "delivered",
];

export const STOCK_DELIVERY_FILTER_LABELS: Record<
  StockDeliveryFilter,
  string
> = {
  all: "All",
  pending: "Pending truck",
  delivered: "Delivered",
};

export type StockDeliveryCounts = {
  pending: number;
  delivered: number;
};

export const STOCK_DELIVERY_COUNTS_EMPTY: StockDeliveryCounts = {
  pending: 0,
  delivered: 0,
};

/**
 * Count delivery indicators from raw stock list items.
 * Source: StockRowMetrics.countDeliveryIndicators
 */
export function countDeliveryIndicators(
  items: readonly Record<string, unknown>[],
): StockDeliveryCounts {
  let pending = 0;
  let delivered = 0;
  for (const item of items) {
    const indicator = String(item.delivery_indicator ?? "").trim().toLowerCase();
    if (indicator === "pending") pending++;
    else if (indicator === "delivered") delivered++;
  }
  return { pending, delivered };
}

/**
 * Check if item matches delivery filter.
 * Source: StockRowMetrics.matchesDeliveryFilter
 */
export function itemMatchesDeliveryFilter(
  item: Record<string, unknown>,
  filter: StockDeliveryFilter,
): boolean {
  if (filter === "all") return true;
  const indicator = String(item.delivery_indicator ?? "").trim().toLowerCase();
  if (filter === "pending") return indicator === "pending";
  if (filter === "delivered") return indicator === "delivered";
  return true;
}
