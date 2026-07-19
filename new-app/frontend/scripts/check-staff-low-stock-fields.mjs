/**
 * Staff low stock /staff/low-stock FIELDS smoke.
 * Run: node scripts/check-staff-low-stock-fields.mjs
 * Source: debounce 200 · filterLowStockGrouped · filter sheet scopes
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

const copyPath = join(
  root,
  "src/features/staff/lowStock/staffLowStockCopy.ts",
);
const logicPath = join(
  root,
  "src/features/staff/lowStock/staffLowStockLogic.ts",
);
const filtersPath = join(
  root,
  "src/features/staff/lowStock/staffLowStockFilters.ts",
);
const pagePath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(logicPath), "logic exists");
assert(existsSync(filtersPath), "filters exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const logic = readFileSync(logicPath, "utf8");
const filters = readFileSync(filtersPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes("STAFF_LS_DEBOUNCE_MS = 200"), "debounce 200");
assert(copy.includes('STAFF_LS_FILTER_APPLY = "Apply filters"'), "apply");
assert(copy.includes('STAFF_LS_FILTER_CLEAR = "Clear filters"'), "clear");
assert(copy.includes('STAFF_LS_SCOPE_ALL = "All fields"'), "scope all");
assert(copy.includes('STAFF_LS_EMPTY_SUB = "No items in this subcategory."'), "empty sub");

assert(filters.includes('"supplier"'), "supplier scope");
assert(filters.includes("STAFF_LS_DEFAULT_SCOPE"), "default scope");

assert(logic.includes("filterLowStockGrouped"), "filter grouped");
assert(logic.includes("lowStockMatchesTab"), "matches tab");
assert(logic.includes("lowStockItemNeedsAttention"), "needs attention");
assert(logic.includes("lowStockItemPendingDelivery"), "pending delivery");
assert(logic.includes("itemSearchHay"), "search hay");
assert(logic.includes("staffLsEmptyTitle"), "empty title");
assert(logic.includes("period_purchased_qty"), "period purchased");
assert(logic.includes("pending_delivery_qty"), "pending delivery qty");
assert(logic.includes("has_pending_order"), "has_pending_order");

assert(page.includes("useState"), "local state");
assert(page.includes("setTab"), "tab state");
assert(page.includes("setQuery"), "query state");
assert(page.includes("debounced"), "debounced");
assert(page.includes("STAFF_LS_DEBOUNCE_MS"), "uses debounce");
assert(page.includes("staff-ls-search__input--active"), "search active");
assert(page.includes("staff-ls-tabs--active"), "tabs active");
assert(page.includes("filterLowStockGrouped"), "uses filter");
assert(page.includes("staffLsEmptyTitle"), "uses empty title");
assert(page.includes("staffLsTabFromFilter"), "init ?filter=");
assert(page.includes('setQuery("")') || page.includes("setQuery('')"), "clear");
assert(page.includes("openFilters"), "open filters");
assert(page.includes("applyFilters"), "apply filters");
assert(page.includes("clearFilters"), "clear filters");
assert(page.includes('data-slot="filterSheet"'), "filter sheet");
assert(page.includes('data-slot="searchScopes"'), "scopes");
assert(
  (page.includes('data-deferred="pdf-export"') ||
    page.includes('data-action="export-pdf"')) &&
    (page.includes('data-deferred="inform-owner"') ||
      page.includes('data-action="inform-owner"') ||
      page.includes("notifyOwnerStockItem")),
  "export/inform CTAs present",
);
assert(
  page.includes("fetchStaffLowStockOperations") || !page.includes("fetch("),
  "no raw fetch in page",
);

assert(css.includes("staff-ls-search--active"), "css search active");
assert(css.includes("staff-ls-search__input--active"), "css input active");
assert(css.includes("staff-ls-tabs--active"), "css tabs active");
assert(css.includes("staff-ls-search__clear"), "clear btn css");
assert(css.includes("staff-ls-sheet"), "sheet css");
assert(css.includes("staff-ls-scope--selected"), "scope selected");

assert(pkg.includes("test:staff-low-stock-fields"), "fields script");

for (const name of [
  "check-staff-low-stock-scaffold.mjs",
  "check-staff-low-stock-layout.mjs",
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
  console.error("Staff low-stock FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff low-stock FIELDS checks PASS");
