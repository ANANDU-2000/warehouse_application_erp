/**
 * Catalog item create/update Zod schemas — catalog.py CatalogItemCreate/Update
 */
import { z } from "zod";

const UNIT = z.enum(["kg", "box", "piece", "bag", "tin"]);

function collapseName(v: string): string {
  return v.trim().split(/\s+/).join(" ");
}

/** Formula source: catalog.py:_parse_kg_from_item_name */
export function parseKgFromItemName(name: string): number | null {
  const m = /(\d+(?:\.\d+)?)\s*kg\b/i.exec(name || "");
  if (!m) return null;
  const v = Number(m[1]);
  return Number.isFinite(v) && v > 0 ? v : null;
}

export const catalogItemCreateSchema = z
  .object({
    category_id: z.string().uuid(),
    type_id: z.string().uuid().nullable().optional(),
    name: z.string().min(1).max(512).transform(collapseName),
    default_unit: UNIT,
    default_kg_per_bag: z.number().gt(0).nullable().optional(),
    default_items_per_box: z.number().gt(0).nullable().optional(),
    default_weight_per_tin: z.number().gt(0).nullable().optional(),
    default_purchase_unit: UNIT.nullable().optional(),
    default_sale_unit: UNIT.nullable().optional(),
    hsn_code: z.string().max(32).nullable().optional(),
    item_code: z.string().max(64).nullable().optional(),
    barcode: z.string().max(64).nullable().optional(),
    tax_percent: z.number().min(0).max(100).nullable().optional(),
    default_landing_cost: z.number().min(0).nullable().optional(),
    default_selling_cost: z.number().min(0).nullable().optional(),
    default_supplier_ids: z.array(z.string().uuid()).default([]),
    default_broker_ids: z.array(z.string().uuid()).nullable().optional(),
    package_type: z.string().max(32).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.name) {
      ctx.addIssue({
        code: "custom",
        message: "name must not be empty or whitespace",
        path: ["name"],
      });
    }
    if (data.default_unit === "bag") {
      let kg = data.default_kg_per_bag ?? null;
      if (kg == null) kg = parseKgFromItemName(data.name);
      if (kg == null) {
        ctx.addIssue({
          code: "custom",
          message:
            "default_kg_per_bag is required when default_unit is bag (include weight in name e.g. SUGAR 50KG)",
          path: ["default_kg_per_bag"],
        });
      } else {
        data.default_kg_per_bag = kg;
      }
    } else if (
      data.default_unit === "piece" &&
      data.default_kg_per_bag != null &&
      data.default_kg_per_bag <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "weight per packet must be positive",
        path: ["default_kg_per_bag"],
      });
    } else if (
      data.default_unit === "box" &&
      data.default_items_per_box == null
    ) {
      data.default_items_per_box = 1;
    }
  });

export type CatalogItemCreateIn = z.infer<typeof catalogItemCreateSchema>;

export const catalogItemUpdateSchema = z.object({
  category_id: z.string().uuid().optional(),
  type_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(512).transform(collapseName).optional(),
  default_unit: UNIT.optional(),
  default_kg_per_bag: z.number().gt(0).nullable().optional(),
  default_items_per_box: z.number().gt(0).nullable().optional(),
  default_weight_per_tin: z.number().gt(0).nullable().optional(),
  default_purchase_unit: UNIT.nullable().optional(),
  default_sale_unit: UNIT.nullable().optional(),
  hsn_code: z.string().max(32).nullable().optional(),
  item_code: z.string().max(64).nullable().optional(),
  tax_percent: z.number().min(0).max(100).nullable().optional(),
  default_landing_cost: z.number().min(0).nullable().optional(),
  default_selling_cost: z.number().min(0).nullable().optional(),
  default_supplier_ids: z.array(z.string().uuid()).optional(),
  default_broker_ids: z.array(z.string().uuid()).optional(),
  reorder_level: z.number().nullable().optional(),
});

export type CatalogItemUpdateIn = z.infer<typeof catalogItemUpdateSchema>;

/** Formula source: catalog.py:_normalize_package_type */
export function normalizePackageType(v: string | null | undefined): string | null {
  if (!v) return null;
  const m = v.trim().toUpperCase();
  const alias: Record<string, string> = {
    RETAIL_PACKET: "PIECE",
    WHOLESALE_BAG: "SACK",
    SACK: "SACK",
    BAG: "SACK",
    LOOSE_KG: "LOOSE",
    LOOSE: "LOOSE",
    BOX: "BOX",
    CARTON: "BOX",
    CASE: "BOX",
    TIN: "TIN",
    CAN: "TIN",
    PIECE: "PIECE",
    PCS: "PIECE",
  };
  return alias[m] ?? m;
}

/** Formula source: catalog.py:_dedupe_preserve_order */
export function dedupePreserveOrder(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of ids) {
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

/** Formula source: catalog.py:_norm_name */
export function normName(s: string): string {
  return s.toLowerCase().trim().split(/\s+/).join(" ");
}

/** Formula source: catalog.py:_coerce_box_items_per_box */
export function coerceBoxItemsPerBox(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v) || v <= 0) return 1;
  return v;
}

/** Formula source: catalog.py:_normalize_item_code */
export function normalizeItemCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Formula source: catalog.py:_normalize_barcode */
export function normalizeBarcode(raw: string): string {
  return raw.trim();
}

const ITEM_CODE_SLUG_RE = /^[A-Z0-9_-]+$/;

/** Formula source: catalog.py CatalogBatchItemIn */
export const catalogBatchItemSchema = z
  .object({
    name: z.string().min(1).max(512).transform(collapseName),
    type_id: z.string().uuid(),
    default_unit: UNIT,
    default_kg_per_bag: z.number().gt(0).nullable().optional(),
    default_items_per_box: z.number().gt(0).nullable().optional(),
    default_weight_per_tin: z.number().gt(0).nullable().optional(),
    default_supplier_ids: z.array(z.string().uuid()).min(1),
    package_type: z.string().max(32).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.name) {
      ctx.addIssue({
        code: "custom",
        message: "name must not be empty or whitespace",
        path: ["name"],
      });
    }
    if (data.default_unit === "bag" && data.default_kg_per_bag == null) {
      ctx.addIssue({
        code: "custom",
        message: "default_kg_per_bag is required when default_unit is bag",
        path: ["default_kg_per_bag"],
      });
    } else if (
      data.default_unit === "box" &&
      data.default_items_per_box == null
    ) {
      data.default_items_per_box = 1;
    }
  });

export const catalogBatchCreateSchema = z.object({
  items: z.array(catalogBatchItemSchema).min(1).max(80),
});

export type CatalogBatchCreateIn = z.infer<typeof catalogBatchCreateSchema>;

/** Formula source: catalog.py CatalogItemFromScanIn */
export const catalogItemFromScanSchema = z
  .object({
    barcode: z.string().min(1).max(64),
    item_code: z.string().min(1).max(64),
    name: z.string().min(1).max(512).transform(collapseName),
    type_id: z.string().uuid(),
    default_unit: UNIT,
    default_kg_per_bag: z.number().gt(0).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const code = normalizeItemCode(data.item_code);
    if (!ITEM_CODE_SLUG_RE.test(code)) {
      ctx.addIssue({
        code: "custom",
        message: "Item code: use A-Z, 0-9, hyphen, underscore only",
        path: ["item_code"],
      });
    } else {
      data.item_code = code;
    }
    const bc = normalizeBarcode(data.barcode);
    if (!bc) {
      ctx.addIssue({
        code: "custom",
        message: "Barcode is required",
        path: ["barcode"],
      });
    } else {
      data.barcode = bc;
    }
    if (data.default_unit === "bag" && data.default_kg_per_bag == null) {
      ctx.addIssue({
        code: "custom",
        message: "default_kg_per_bag is required when default_unit is bag",
        path: ["default_kg_per_bag"],
      });
    }
  });

export type CatalogItemFromScanIn = z.infer<typeof catalogItemFromScanSchema>;

