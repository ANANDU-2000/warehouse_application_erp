/**
 * Staff low stock /staff/low-stock SCAFFOLD smoke.
 * Run: node scripts/check-staff-low-stock-scaffold.mjs
 * Source: low_stock_dashboard_page.dart (staffMode: true)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(
  root,
  "src/features/staff/lowStock/staffLowStockCopy.ts",
);
const tabsPath = join(
  root,
  "src/features/staff/lowStock/staffLowStockTabs.ts",
);
const pagePath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.css",
);
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(tabsPath), "tabs exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const tabs = readFileSync(tabsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_LS_TITLE = "Low stock"'), "title");
assert(
  copy.includes('STAFF_LS_BACK_FALLBACK = "/staff/home"'),
  "back fallback",
);
assert(
  copy.includes(
    'STAFF_LS_SEARCH_HINT = "Search item, subcategory, supplier…"',
  ),
  "search hint",
);
assert(copy.includes('STAFF_LS_TAB_ALL = "All"'), "All");
assert(copy.includes('STAFF_LS_TAB_OUT = "Out"'), "Out");
assert(copy.includes('STAFF_LS_TAB_BOUGHT = "Bought"'), "Bought");
assert(copy.includes('STAFF_LS_TAB_PENDING = "Pending"'), "Pending");
assert(copy.includes('STAFF_LS_TAB_DELIVERY = "Delivery"'), "Delivery");
assert(
  copy.includes('STAFF_LS_EMPTY = "No low-stock items here"'),
  "empty",
);
assert(
  copy.includes("need attention · Period follows Home"),
  "attention suffix",
);
assert(copy.includes('STAFF_LS_PDF_TOOLTIP = "Download PDF"'), "pdf");
assert(copy.includes('STAFF_LS_CSV_TOOLTIP = "Copy CSV"'), "csv");
assert(copy.includes('STAFF_LS_INFORM_OWNER = "Inform owner"'), "inform");

assert(tabs.includes("staffLsTabFromFilter"), "filter fromQuery");
assert(tabs.includes("allLow"), "allLow");
assert(tabs.includes("outOfStock"), "out");
assert(tabs.includes("purchasedInPeriod"), "bought");
assert(tabs.includes("pendingOrder"), "pending");
assert(tabs.includes("pendingDelivery"), "delivery");
assert(tabs.includes('"pending-delivery"'), "pending-delivery alias");

assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="tabs"'), "tabs");
assert(page.includes('data-slot="attention"'), "attention");
assert(page.includes('data-slot="empty"'), "empty");
assert(
  page.includes("readOnly") ||
    page.includes("staff-ls-search__input--active"),
  "search field present (FIELDS may activate)",
);
assert(page.includes("staffLsTabFromFilter"), "reads ?filter=");
assert(
  page.includes("STAFF_LS_EMPTY") || page.includes("staffLsEmptyTitle"),
  "empty copy",
);
assert(page.includes("STAFF_LS_BACK_FALLBACK"), "back");
assert(page.includes('data-deferred="category-tree"') || page.includes('data-slot="tree"'), "tree deferred");
assert(page.includes('data-deferred="inform-owner"') || page.includes('data-action="inform-owner"'), "inform deferred");
assert(page.includes('data-deferred="pdf-export"') || page.includes('data-action="export-pdf"'), "pdf deferred");
assert(page.includes('data-deferred="csv-export"') || page.includes('data-action="export-csv"'), "csv deferred");
assert(
  page.includes('data-deferred="filter-sheet"') ||
    page.includes('data-slot="filterSheet"') ||
    page.includes("openFilters"),
  "filter control present (FIELDS may activate sheet)",
);
assert(!page.includes("fetch("), "no fetch");

assert(router.includes("StaffLowStockPage"), "router import");
assert(router.includes('path="/staff/low-stock"'), "route");
assert(!router.includes('title="Staff low stock"'), "no stub title");

assert(pkg.includes("test:staff-low-stock-scaffold"), "package script");

if (failures.length) {
  console.error("Staff low-stock SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff low-stock SCAFFOLD checks PASS");
