/**
 * Staff purchase history /staff/purchase-history FIELDS smoke.
 * Run: node scripts/check-staff-purchase-history-fields.mjs
 * Source: staff_purchase_history_page.dart debounce 250 · filters · empty titles
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
  "src/features/staff/purchaseHistory/staffPurchaseHistoryCopy.ts",
);
const logicPath = join(
  root,
  "src/features/staff/purchaseHistory/staffPurchaseHistoryLogic.ts",
);
const pagePath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.css",
);
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

assert(copy.includes("STAFF_PH_DEBOUNCE_MS = 250"), "debounce 250");
assert(
  copy.includes('STAFF_PH_EMPTY_SEARCH = "No orders match your search"'),
  "empty search",
);
assert(
  copy.includes('STAFF_PH_EMPTY_PERIOD = "No purchase orders in this period"'),
  "empty period",
);
assert(
  copy.includes('STAFF_PH_EMPTY_LOW_SEARCH = "No items match your search"'),
  "empty low search",
);

assert(logic.includes("filterStaffPhPurchases"), "filter purchases");
assert(logic.includes("filterStaffPhLowStock"), "filter low");
assert(logic.includes("purchaseMatchesStatus"), "status match");
assert(logic.includes("purchaseIsDelivered"), "isDelivered");
assert(logic.includes("lowStockIsCritical"), "critical");
assert(logic.includes("reorder_level"), "reorder_level");
assert(logic.includes("0.5"), "critical half reorder");
assert(logic.includes("staffPhPurchasesEmptyTitle"), "purchases empty title");
assert(logic.includes("staffPhLowEmptyTitle"), "low empty title");
assert(logic.includes("humanId") || logic.includes("human_id"), "humanId");

assert(page.includes("useState"), "local state");
assert(page.includes("setStatus"), "status state");
assert(page.includes("setLowFilter"), "low filter state");
assert(page.includes("setQuery"), "query state");
assert(page.includes("setTab"), "tab state");
assert(page.includes("debounced"), "debounced");
assert(page.includes("STAFF_PH_DEBOUNCE_MS"), "uses debounce");
assert(page.includes("staff-ph-search__input--active"), "search active");
assert(page.includes("staff-ph-chips--active"), "chips active");
assert(page.includes("staff-ph-tabs--active"), "tabs active");
assert(page.includes("filterStaffPhPurchases"), "uses filter purchases");
assert(page.includes("filterStaffPhLowStock"), "uses filter low");
assert(page.includes("staffPhPurchasesEmptyTitle"), "uses empty title");
assert(page.includes("staffPhTabFromQuery"), "init ?tab=");
assert(page.includes('setQuery("")') || page.includes("setQuery('')"), "clear");
assert(!page.includes("fetch("), "no fetch API");

assert(css.includes("staff-ph-search--active"), "css search active");
assert(css.includes("staff-ph-search__input--active"), "css input active");
assert(css.includes("staff-ph-chips--active"), "css chips active");
assert(css.includes("staff-ph-tabs--active"), "css tabs active");
assert(css.includes("staff-ph-search__clear"), "clear btn css");

assert(pkg.includes("test:staff-purchase-history-fields"), "fields script");

for (const name of [
  "check-staff-purchase-history-scaffold.mjs",
  "check-staff-purchase-history-layout.mjs",
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
  console.error("Staff purchase-history FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff purchase-history FIELDS checks PASS");
