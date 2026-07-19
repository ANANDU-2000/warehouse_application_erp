/**
 * Staff stock /staff/stock SCAFFOLD smoke.
 * Run: node scripts/check-staff-stock-scaffold.mjs
 * Source: stock_page.dart · stock_operational_top_bar.dart
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/staff/stock/staffStockCopy.ts");
const tabsPath = join(root, "src/features/staff/stock/staffStockTabs.ts");
const statusPath = join(root, "src/features/staff/stock/staffStockStatus.ts");
const pagePath = join(root, "src/features/staff/stock/StaffStockPage.tsx");
const cssPath = join(root, "src/features/staff/stock/StaffStockPage.css");
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(tabsPath), "tabs exists");
assert(existsSync(statusPath), "status exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const tabs = readFileSync(tabsPath, "utf8");
const status = readFileSync(statusPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_STOCK_TITLE = "Stock"'), "title Stock");
assert(
  copy.includes('STAFF_STOCK_BACK_HOME = "/staff/home"'),
  "back /staff/home",
);
assert(copy.includes('STAFF_STOCK_TAB_STOCK = "Stock"'), "tab Stock");
assert(copy.includes('STAFF_STOCK_TAB_ACTIVITY = "Activity"'), "tab Activity");
assert(copy.includes('STAFF_STOCK_STATUS_ALL = "All"'), "All");
assert(copy.includes('STAFF_STOCK_STATUS_LOW = "Low"'), "Low");
assert(copy.includes('STAFF_STOCK_STATUS_OUT = "Out"'), "Out");
assert(
  copy.includes('STAFF_STOCK_SEARCH_HINT = "Search item, code, barcode…"'),
  "search hint",
);
assert(copy.includes('STAFF_STOCK_HDR_ITEM = "ITEM"'), "ITEM");
assert(copy.includes('STAFF_STOCK_HDR_SYS = "SYS"'), "SYS");
assert(copy.includes('STAFF_STOCK_HDR_PHYS = "PHYS"'), "PHYS");
assert(copy.includes('STAFF_STOCK_HDR_DIFF = "DIFF"'), "DIFF");
assert(copy.includes('STAFF_STOCK_EMPTY = "No stock items yet"'), "empty");

assert(tabs.includes("staffStockTabFromQuery"), "tab fromQuery");
assert(tabs.includes("changes"), "alias changes");
assert(tabs.includes("movement"), "alias movement");
assert(tabs.includes("activity"), "alias activity");
assert(tabs.includes('"stock"'), "default stock");

assert(status.includes("staffStockStatusFromQuery"), "status fromQuery");
assert(status.includes('"shortage"'), "shortage");
assert(status.includes("case \"low\""), "alias low");
assert(status.includes('STAFF_STOCK_DEFAULT_STATUS'), "default status");

assert(page.includes('data-slot="appBar"'), "appBar slot");
assert(page.includes('data-slot="tabs"'), "tabs slot");
assert(page.includes('data-slot="actions"'), "actions slot");
assert(page.includes('data-slot="statusChips"'), "statusChips");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="deliveryChips"'), "deliveryChips");
assert(page.includes('data-slot="tableHeader"'), "tableHeader");
assert(page.includes('data-slot="results"'), "results");
assert(page.includes('data-slot="activity"'), "activity slot");
assert(page.includes("staffStockTabFromQuery"), "reads ?tab=");
assert(page.includes("staffStockStatusFromQuery"), "reads ?status=");
assert(page.includes("readOnly"), "search inert");
assert(page.includes("STAFF_STOCK_EMPTY"), "empty copy");
assert(page.includes("STAFF_STOCK_BACK_HOME"), "home back");
assert(!page.includes("listStock"), "no listStock API");
assert(!page.includes("fetch("), "no fetch");

assert(router.includes("StaffStockPage"), "router imports page");
assert(router.includes('path="/staff/stock"'), "staff stock route");
assert(
  router.includes('path="/staff/stock/changes"') ||
    router.includes('to="/staff/stock?tab=changes"'),
  "changes redirect",
);
assert(!router.includes('title="Staff stock"'), "no stub title route");

assert(
  pkg.includes("test:staff-stock-scaffold"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Staff stock SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff stock SCAFFOLD checks PASS");
