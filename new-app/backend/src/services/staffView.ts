/**
 * Strip financial fields for warehouse staff — staff_view.py
 */
const CATALOG_ITEM_FINANCIAL_KEYS = [
  "default_landing_cost",
  "default_selling_cost",
  "last_purchase_price",
  "last_selling_rate",
] as const;

const PURCHASE_HEADER_FINANCIAL_KEYS = [
  "paid_amount",
  "discount",
  "commission_percent",
  "commission_money",
  "delivered_rate",
  "billty_rate",
  "freight_amount",
  "total_amount",
  "total_landing_subtotal",
  "total_selling_subtotal",
  "total_line_profit",
  "remaining",
] as const;

const LINE_FINANCIAL_KEYS = [
  "landing_cost",
  "purchase_rate",
  "landing_cost_per_kg",
  "selling_cost",
  "selling_rate",
  "freight_value",
  "delivered_rate",
  "billty_rate",
  "line_total",
  "profit",
  "line_landing_gross",
  "line_selling_gross",
  "line_profit",
  "discount",
  "tax_percent",
  "rate_context",
] as const;

export function shouldRedactFinancials(role: string | null | undefined): boolean {
  return (role ?? "").trim().toLowerCase() === "staff";
}

/** Null financial fields — Formula source: staff_view.py:redact_catalog_item_out_model */
export function redactCatalogItemOutFields<T extends Record<string, unknown>>(
  item: T,
): T {
  return {
    ...item,
    default_landing_cost: null,
    default_selling_cost: null,
    last_purchase_price: null,
    last_selling_rate: null,
  };
}

export function redactCatalogItemDict(
  item: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...item };
  for (const k of CATALOG_ITEM_FINANCIAL_KEYS) delete out[k];
  return out;
}

export function redactCatalogItems(
  items: Record<string, unknown>[],
): Record<string, unknown>[] {
  return items.map(redactCatalogItemDict);
}

export function redactTradeLineDict(
  line: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...line };
  for (const k of LINE_FINANCIAL_KEYS) delete out[k];
  return out;
}

export function redactTradePurchaseDict(
  purchase: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...purchase };
  for (const k of PURCHASE_HEADER_FINANCIAL_KEYS) delete out[k];
  const lines = out.lines;
  if (Array.isArray(lines)) {
    out.lines = lines.map((li) =>
      li && typeof li === "object"
        ? redactTradeLineDict(li as Record<string, unknown>)
        : li,
    );
  }
  return out;
}
