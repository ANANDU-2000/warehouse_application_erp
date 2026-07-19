/**
 * Staff search /staff/search LAYOUT smoke.
 * Run: node scripts/check-staff-search-layout.mjs
 * Source: search_page.dart staffShellEmbedded; app_theme chipTheme; HexaColors
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/staff/search/staffSearchCopy.ts");
const qfPath = join(root, "src/features/staff/search/staffSearchQuickFilters.ts");
const pagePath = join(root, "src/features/staff/search/StaffSearchPage.tsx");
const cssPath = join(root, "src/features/staff/search/StaffSearchPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(qfPath), "quick filters exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const qf = readFileSync(qfPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_SEARCH_QUICK_FILTERS_TITLE = "Quick filters"'), "QF title");
assert(copy.includes('STAFF_SEARCH_QF_ITEM_GALLERY = "Item gallery"'), "Item gallery");
assert(copy.includes('STAFF_SEARCH_QF_MISSING_BARCODE = "Missing barcode"'), "Missing barcode");
assert(copy.includes('STAFF_SEARCH_QF_MISSING_CODE = "Missing item code"'), "Missing code");
assert(copy.includes('STAFF_SEARCH_QF_OPENING_STOCK = "Opening stock"'), "Opening stock");
assert(copy.includes('STAFF_SEARCH_QF_LOW_STOCK = "Low stock"'), "Low stock");
assert(copy.includes('STAFF_SEARCH_QF_SCAN = "Scan barcode"'), "Scan barcode");
assert(
  copy.includes(
    "Search items by name, item code, category, or subcategory. Use quick filters for missing labels and opening stock.",
  ),
  "empty helper",
);

assert(qf.includes('path: "/staff/items"'), "gallery path");
assert(qf.includes("missing_barcode"), "missing barcode path");
assert(qf.includes("/staff/low-stock"), "low stock path");
assert(qf.includes("/staff/scan"), "scan path");
assert(qf.includes("/stock/opening-setup"), "opening path");

assert(page.includes('data-slot="search"'), "search slot");
assert(page.includes('data-slot="filters"'), "filters slot");
assert(page.includes('data-slot="results"'), "results slot");
assert(page.includes('data-slot="empty"'), "empty slot");
assert(page.includes("STAFF_SEARCH_QUICK_FILTERS"), "uses QF list");
assert(page.includes("STAFF_SEARCH_EMPTY_HELPER"), "uses helper");
assert(!page.includes('data-slot="appBar"'), "no AppBar");
assert(
  page.includes("search-input--active") || page.includes("readOnly"),
  "search field present (FIELDS may activate)",
);
/* FIELDS owns editable input; BUTTONS owns QF nav; WIRE owns GET /search */

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "brand background");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand primary");
assert(css.includes("#d8ece8") || css.includes("#D8ECE8"), "primaryContainer chip");
assert(css.includes("#d7e7e3") || css.includes("#D7E7E3"), "outlineVariant");
assert(css.includes("#9ca3af") || css.includes("#9CA3AF"), "input hint");
assert(css.includes("#64748b") || css.includes("#64748B"), "onSurfaceVariant");
assert(css.includes("border-radius: 14px"), "search radius 14");
assert(css.includes("border-radius: 12px"), "chip radius 12");
assert(css.includes("pointer-events: none"), "inert chrome");
assert(css.includes("min-height: 52px"), "chip row height 52");
assert(css.includes("padding: 4px 16px 96px"), "staff list padding");

assert(pkg.includes("test:staff-search-layout"), "package.json script registered");
assert(pkg.includes("test:staff-search-scaffold"), "scaffold script still registered");

if (failures.length) {
  console.error("Staff search LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff search LAYOUT checks PASS");
