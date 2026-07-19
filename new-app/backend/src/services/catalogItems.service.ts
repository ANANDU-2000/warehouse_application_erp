/**
 * Catalog item Out mapping — Formula source: catalog.py:_catalog_item_out
 */
import type { CatalogItemEnriched } from "../repositories/catalogItems.repository";
import {
  redactCatalogItemOutFields,
  shouldRedactFinancials,
} from "./staffView";
import {
  resolveForCatalogItem,
  unitResolutionAsDict,
} from "./unitResolution.service";

export type CatalogItemOut = Record<string, unknown>;

export function toCatalogItemOut(row: CatalogItemEnriched): CatalogItemOut {
  const ur = resolveForCatalogItem(row, {
    itemName: row.name,
    categoryName: row.category_name,
  });
  return {
    id: row.id,
    category_id: row.category_id,
    type_id: row.type_id,
    type_name: row.type_name,
    name: row.name,
    default_unit: row.default_unit,
    default_kg_per_bag: row.default_kg_per_bag,
    default_items_per_box: row.default_items_per_box,
    default_weight_per_tin: row.default_weight_per_tin,
    default_purchase_unit: row.default_purchase_unit,
    default_sale_unit: row.default_sale_unit,
    hsn_code: row.hsn_code,
    item_code: row.item_code,
    barcode: row.barcode,
    public_token: row.public_token,
    tax_percent: row.tax_percent,
    default_landing_cost: row.default_landing_cost,
    default_selling_cost: row.default_selling_cost,
    last_purchase_price: row.last_purchase_price,
    last_selling_rate: row.last_selling_rate,
    last_supplier_id: row.last_supplier_id,
    last_broker_id: row.last_broker_id,
    last_trade_purchase_id: row.last_trade_purchase_id,
    last_line_qty: row.last_line_qty,
    last_line_unit: row.last_line_unit,
    last_line_weight_kg: row.last_line_weight_kg,
    last_supplier_name: row.last_supplier_name,
    last_broker_name: row.last_broker_name,
    default_supplier_ids: row.default_supplier_ids,
    default_broker_ids: row.default_broker_ids,
    last_purchase_date: row.last_purchase_date,
    last_purchase_delivered: row.last_purchase_delivered,
    unit_resolution: unitResolutionAsDict(ur),
  };
}

export function maybeRedactCatalogOut(
  out: CatalogItemOut,
  role: string | null | undefined,
): CatalogItemOut {
  if (shouldRedactFinancials(role)) {
    return redactCatalogItemOutFields(out);
  }
  return out;
}

export function mapCatalogItemsForRole(
  rows: CatalogItemEnriched[],
  role: string | null | undefined,
): CatalogItemOut[] {
  return rows.map((r) => maybeRedactCatalogOut(toCatalogItemOut(r), role));
}
