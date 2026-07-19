/**
 * Staff stock /staff/stock BUTTONS smoke.
 * Run: node scripts/check-staff-stock-buttons.mjs
 * Source: stock_operational_top_bar · _StockPeriodSheet · filter sheet · Scan
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/staff/stock/staffStockCopy.ts");
const periodPath = join(root, "src/features/staff/stock/staffStockPeriod.ts");
const filtersPath = join(root, "src/features/staff/stock/staffStockFilters.ts");
const pagePath = join(root, "src/features/staff/stock/StaffStockPage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(periodPath), "period exists");
assert(existsSync(filtersPath), "filters exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const period = readFileSync(periodPath, "utf8");
const filters = readFileSync(filtersPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_STOCK_MENU_SCAN = "Scan"'), "Scan");
assert(
  copy.includes('STAFF_STOCK_SCAN_PATH = "/barcode/scan?return=stock"'),
  "scan path",
);
assert(
  copy.includes('STAFF_STOCK_PERIOD_SHEET_TITLE = "Filter by period"'),
  "period title",
);
assert(copy.includes('STAFF_STOCK_FILTER_CLEAR = "Clear advanced"'), "Clear");
assert(copy.includes('STAFF_STOCK_FILTER_REORDER = "Reorder only"'), "Reorder");
assert(
  copy.includes('STAFF_STOCK_FILTER_MISSING_BARCODE = "Missing barcode"'),
  "Missing barcode",
);
assert(
  copy.includes('STAFF_STOCK_FILTER_MISSING_CODE = "Missing item code"'),
  "Missing item code",
);

assert(period.includes("This Week"), "This Week");
assert(period.includes("All Time"), "All Time");
assert(period.includes("Bought today"), "Bought today");
assert(period.includes('STAFF_STOCK_DEFAULT_PERIOD'), "default period");

assert(filters.includes("countWarehouseActiveFilters"), "filter count");
assert(filters.includes("itemMatchesOpFilters"), "op match");
assert(filters.includes("missingBarcodeOnly"), "missingBarcodeOnly");
assert(filters.includes("purchasedInPeriodOnly"), "purchasedInPeriodOnly");

assert(page.includes('data-action="period"'), "period action");
assert(page.includes('data-action="filters"'), "filters action");
assert(page.includes('data-action="search-toggle"'), "search toggle");
assert(page.includes('data-action="more"'), "more action");
assert(page.includes('data-action="scan"'), "scan action");
assert(page.includes('data-slot="periodSheet"'), "period sheet");
assert(page.includes('data-slot="filterSheet"'), "filter sheet");
assert(page.includes('data-slot="moreMenu"'), "more menu");
assert(page.includes("searchExpanded"), "searchExpanded");
assert(page.includes("STAFF_STOCK_SCAN_PATH"), "uses scan path");
assert(page.includes("countWarehouseActiveFilters"), "uses count");
assert(page.includes("pickPeriod"), "pick period");
assert(page.includes("clearAdvancedFilters"), "clear advanced");
assert(page.includes("applyFilters"), "apply filters");
assert(
  page.includes("data-deferred=\"subcategory-supplier-pickers\""),
  "picker deferred",
);
assert(!page.includes("Download stock PDF"), "no staff PDF");
assert(!page.includes("Download stock Excel"), "no staff Excel");
assert(!page.includes("Stock movement"), "no staff movement menu");
assert(!page.includes("Add item"), "no staff add item");
assert(!page.includes("fetch("), "no fetch");

assert(pkg.includes("test:staff-stock-buttons"), "buttons script");

for (const name of [
  "check-staff-stock-scaffold.mjs",
  "check-staff-stock-layout.mjs",
  "check-staff-stock-fields.mjs",
]) {
  const r = spawnSync(process.execPath, [join(root, "scripts", name)], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    failures.push(`${name} FAILED`);
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
  }
}

if (failures.length) {
  console.error("Staff stock BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff stock BUTTONS checks PASS");
