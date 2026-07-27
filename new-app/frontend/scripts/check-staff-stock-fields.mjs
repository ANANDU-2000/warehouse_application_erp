/**
 * Staff stock /staff/stock FIELDS smoke.
 * Run: node scripts/check-staff-stock-fields.mjs
 * Source: stock_page.dart debounce 180 · status chips · empty titles
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
const logicPath = join(root, "src/features/staff/stock/staffStockLogic.ts");
const pagePath = join(root, "src/features/staff/stock/StaffStockPage.tsx");
const cssPath = join(root, "src/features/staff/stock/StaffStockPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(logicPath), "logic exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const logic = readFileSync(logicPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes("STAFF_STOCK_DEBOUNCE_MS = 180"), "debounce 180");
assert(
  copy.includes('STAFF_STOCK_EMPTY_FILTERED = "No items match filters"'),
  "empty filtered",
);
assert(copy.includes('STAFF_STOCK_EMPTY = "No stock items yet"'), "empty catalog");

assert(logic.includes("itemMatchesStockStatus"), "status match");
assert(logic.includes("itemMatchesStockSearch"), "search match");
assert(logic.includes("stockNamePrefixRank"), "prefix rank");
assert(logic.includes("filterStaffStockRows"), "filter rows");
assert(logic.includes("staffStockListEmptyTitle"), "empty title");
assert(logic.includes("shortage"), "shortage");
assert(logic.includes("stock_status"), "stock_status");
assert(logic.includes("reorder_level"), "reorder_level");

assert(page.includes("useState"), "local state");
assert(page.includes("setStatus"), "status state");
assert(page.includes("setQuery"), "query state");
assert(page.includes("setTab"), "tab state");
assert(page.includes("debounced"), "debounced");
assert(page.includes("STAFF_STOCK_DEBOUNCE_MS"), "uses debounce");
assert(page.includes("staff-stock-search__input--active"), "search active");
assert(page.includes("staff-stock-status-chips--active"), "chips active");
assert(page.includes("staff-stock-tabs--active"), "tabs active");
assert(page.includes("filterStaffStockRows"), "uses filter");
assert(page.includes("staffStockListEmptyTitle"), "uses empty title");
assert(page.includes("staffStockStatusFromQuery"), "init ?status=");
assert(page.includes("staffStockTabFromQuery"), "init ?tab=");
assert(page.includes("setQuery(\"\")") || page.includes("setQuery('')"), "clear");
assert(!page.includes("fetch("), "no fetch API");

assert(css.includes("staff-stock-search--active"), "css search active");
assert(css.includes("staff-stock-search__input--active"), "css input active");
assert(css.includes("staff-stock-status-chips--active"), "css chips active");
assert(css.includes("staff-stock-tabs--active"), "css tabs active");
assert(css.includes("staff-stock-search__clear"), "clear btn css");

assert(pkg.includes("test:staff-stock-fields"), "fields script");

for (const name of [
  "check-staff-stock-scaffold.mjs",
  "check-staff-stock-layout.mjs",
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
  console.error("Staff stock FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff stock FIELDS checks PASS");
