/**
 * Staff purchase history /staff/purchase-history SCAFFOLD smoke.
 * Run: node scripts/check-staff-purchase-history-scaffold.mjs
 * Source: staff_purchase_history_page.dart
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
  "src/features/staff/purchaseHistory/staffPurchaseHistoryCopy.ts",
);
const tabsPath = join(
  root,
  "src/features/staff/purchaseHistory/staffPurchaseHistoryTabs.ts",
);
const filtersPath = join(
  root,
  "src/features/staff/purchaseHistory/staffPurchaseHistoryFilters.ts",
);
const pagePath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.css",
);
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(tabsPath), "tabs exists");
assert(existsSync(filtersPath), "filters exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const tabs = readFileSync(tabsPath, "utf8");
const filters = readFileSync(filtersPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_PH_TITLE = "Purchase orders"'), "title");
assert(
  copy.includes('STAFF_PH_BACK_FALLBACK = "/staff/home"'),
  "back fallback",
);
assert(copy.includes('STAFF_PH_TAB_TODAY = "Today"'), "Today");
assert(copy.includes('STAFF_PH_TAB_WEEK = "Week"'), "Week");
assert(copy.includes('STAFF_PH_TAB_ALL = "All time"'), "All time");
assert(copy.includes('STAFF_PH_TAB_LOW = "Low stock"'), "Low stock");
assert(
  copy.includes('STAFF_PH_SEARCH_HINT = "Search supplier, ID, items…"'),
  "search hint",
);
assert(
  copy.includes('STAFF_PH_SEARCH_HINT_LOW = "Search low stock items…"'),
  "low search hint",
);
assert(copy.includes('STAFF_PH_STATUS_ALL = "All"'), "All chip");
assert(
  copy.includes('STAFF_PH_STATUS_UNDELIVERED = "Undelivered"'),
  "Undelivered",
);
assert(copy.includes('STAFF_PH_STATUS_DELIVERED = "Delivered"'), "Delivered");
assert(copy.includes('STAFF_PH_LOW_ALL = "All low"'), "All low");
assert(copy.includes('STAFF_PH_LOW_CRITICAL = "Critical"'), "Critical");
assert(
  copy.includes(
    'STAFF_PH_EMPTY_PERIOD = "No purchase orders in this period"',
  ),
  "empty period",
);
assert(copy.includes('STAFF_PH_EMPTY_LOW = "No low stock items"'), "empty low");

assert(tabs.includes("staffPhTabFromQuery"), "tab fromQuery");
assert(tabs.includes('"today"'), "default today");
assert(tabs.includes("lowStock"), "lowStock tab");
assert(tabs.includes("allTime"), "allTime");

assert(filters.includes('"pending"'), "pending status");
assert(filters.includes('"delivered"'), "delivered status");
assert(filters.includes('"critical"'), "critical low");

assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="tabs"'), "tabs");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="statusChips"'), "statusChips");
assert(page.includes('data-slot="lowStockChips"'), "lowStockChips");
assert(page.includes('data-slot="results"'), "results");
assert(page.includes('data-slot="empty"'), "empty");
assert(page.includes("readOnly"), "search inert");
assert(page.includes("disabled"), "tabs/search disabled");
assert(page.includes("staffPhTabFromQuery"), "reads ?tab=");
assert(page.includes("STAFF_PH_EMPTY_PERIOD"), "empty copy");
assert(page.includes("STAFF_PH_BACK_FALLBACK"), "back");
assert(page.includes('data-deferred="purchase-rows"'), "rows deferred");
assert(!page.includes("fetch("), "no fetch");

assert(router.includes("StaffPurchaseHistoryPage"), "router import");
assert(
  router.includes('path="/staff/purchase-history"'),
  "list route",
);
assert(
  !router.includes('title="Purchase history"'),
  "no stub list title",
);
assert(
  router.includes('path="/staff/purchase-history/:purchaseId"'),
  "detail still routed",
);

assert(
  pkg.includes("test:staff-purchase-history-scaffold"),
  "package script",
);

if (failures.length) {
  console.error("Staff purchase-history SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff purchase-history SCAFFOLD checks PASS");
