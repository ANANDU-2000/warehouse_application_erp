/**
 * Staff gallery filter/search/group helpers.
 * Source: staff_item_gallery_page.dart — `_itemMatchesGalleryFilter`,
 * `_itemLowOrOut`, `_itemMatchesSearch`, `_groupGalleryItems`, `_gallerySuggestions`.
 */
import type { StaffGalleryFilter } from "./staffItemGalleryFilters";

export type StaffGalleryItem = Record<string, unknown>;

export function coerceToDouble(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Flutter `_itemLowOrOut` */
export function itemLowOrOut(item: StaffGalleryItem): boolean {
  const stock = coerceToDouble(item.current_stock);
  const reorder = coerceToDouble(item.reorder_level);
  const status = String(item.stock_status ?? "").toLowerCase();
  return (
    stock <= 0 ||
    status === "out" ||
    status === "low" ||
    status === "critical" ||
    (reorder > 0 && stock <= reorder)
  );
}

/** Flutter `_itemMatchesGalleryFilter` */
export function itemMatchesGalleryFilter(
  item: StaffGalleryItem,
  filter: StaffGalleryFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "missingCode":
      return String(item.item_code ?? "").trim() === "";
    case "missingBarcode":
      return item.missing_barcode === true;
    case "lowStock":
      return itemLowOrOut(item);
    case "openingMissing":
      // Flutter checks opening_stock_set / needs_opening_stock; API emits opening_stock_set_at.
      if (item.needs_opening_stock === true) return true;
      if (item.opening_stock_set === false) return true;
      if ("opening_stock_set_at" in item) {
        const at = item.opening_stock_set_at;
        return at == null || String(at).trim() === "";
      }
      return false;
    default:
      return true;
  }
}

/** Flutter `_itemMatchesSearch` — `q` already trimmed + lowercased */
export function itemMatchesSearch(item: StaffGalleryItem, q: string): boolean {
  if (!q) return true;
  const hay = [
    item.name,
    item.item_code,
    item.category_name,
    item.subcategory_name,
    item.type_name,
  ]
    .filter((v): v is string => typeof v === "string")
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export const STAFF_GALLERY_UNCATEGORIZED = "Uncategorized";
export const STAFF_GALLERY_SUB_DASH = "—";

/** Flutter `_groupGalleryItems` */
export function groupGalleryItems(
  items: Iterable<StaffGalleryItem>,
): Map<string, Map<string, StaffGalleryItem[]>> {
  const grouped = new Map<string, Map<string, StaffGalleryItem[]>>();
  for (const raw of items) {
    const catRaw = String(raw.category_name ?? "").trim();
    const cat = catRaw.length > 0 ? catRaw : STAFF_GALLERY_UNCATEGORIZED;
    const subRaw = String(raw.subcategory_name ?? "").trim();
    const typeRaw = String(raw.type_name ?? "").trim();
    const sub =
      subRaw.length > 0
        ? subRaw
        : typeRaw.length > 0
          ? typeRaw
          : STAFF_GALLERY_SUB_DASH;
    let subMap = grouped.get(cat);
    if (!subMap) {
      subMap = new Map();
      grouped.set(cat, subMap);
    }
    let list = subMap.get(sub);
    if (!list) {
      list = [];
      subMap.set(sub, list);
    }
    list.push(raw);
  }
  for (const subMap of grouped.values()) {
    for (const list of subMap.values()) {
      list.sort((a, b) =>
        String(a.name ?? "")
          .toLowerCase()
          .localeCompare(String(b.name ?? "").toLowerCase()),
      );
    }
  }
  return grouped;
}

/** Flutter `_gallerySuggestions` — take max 12 at optionsBuilder */
export function gallerySuggestions(items: StaffGalleryItem[]): string[] {
  const out = new Set<string>();
  for (const it of items) {
    const name = String(it.name ?? "").trim();
    if (name) out.add(name);
    const code = String(it.item_code ?? "").trim();
    if (code) out.add(code);
    const sub = String(it.subcategory_name ?? "").trim();
    if (sub) out.add(sub);
    const cat = String(it.category_name ?? "").trim();
    if (cat) out.add(cat);
  }
  return [...out].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

export function filterGalleryItems(
  allItems: StaffGalleryItem[],
  filter: StaffGalleryFilter,
  searchLower: string,
): StaffGalleryItem[] {
  return allItems.filter((it) => {
    if (!itemMatchesGalleryFilter(it, filter)) return false;
    return itemMatchesSearch(it, searchLower);
  });
}

export function formatGallerySummary(
  itemCount: number,
  categoryCount: number,
): string {
  return `${itemCount} items · ${categoryCount} categories`;
}

/**
 * Stock subtitle line — Flutter `_StaffGalleryItemRow`:
 * `Stock: ${qty} $unit · $code|No code · No barcode?`
 */
export function formatGalleryStockLine(
  stockFormatted: string,
  unit: string,
  code: string,
  missingBarcode: boolean,
  noCodeLabel: string,
  noBarcodeLabel: string,
): string {
  const codePart = code.length > 0 ? code : noCodeLabel;
  return (
    `Stock: ${stockFormatted} ${unit} · ${codePart}` +
    (missingBarcode ? ` · ${noBarcodeLabel}` : "")
  );
}

/** Canonical `?filter=` value for a chip (deep-link write; Flutter chip select is local-only). */
export function staffGalleryFilterToQuery(
  filter: StaffGalleryFilter,
): string | null {
  switch (filter) {
    case "missingCode":
      return "missing_code";
    case "missingBarcode":
      return "missing_barcode";
    case "lowStock":
      return "low";
    case "openingMissing":
      return "opening";
    default:
      return null;
  }
}
