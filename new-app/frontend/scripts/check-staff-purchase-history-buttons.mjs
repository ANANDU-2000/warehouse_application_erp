/**
 * Staff purchase history /staff/purchase-history BUTTONS smoke.
 * Run: node scripts/check-staff-purchase-history-buttons.mjs
 * Source: StaffPurchaseHistoryRow onTap · _StaffLowStockRow Inform owner
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
const groupPath = join(
  root,
  "src/features/staff/purchaseHistory/staffPurchaseHistoryGrouping.ts",
);
const logicPath = join(
  root,
  "src/features/staff/purchaseHistory/staffPurchaseHistoryLogic.ts",
);
const pagePath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.tsx",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(groupPath), "grouping exists");
assert(existsSync(logicPath), "logic exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const group = readFileSync(groupPath, "utf8");
const logic = readFileSync(logicPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_PH_INFORM_OWNER = "Inform owner"'), "Inform owner");
assert(
  copy.includes('STAFF_PH_LOW_STOCK_PATH = "/staff/low-stock"'),
  "low-stock path",
);
assert(copy.includes("staffPhDetailPath"), "detail path helper");

assert(group.includes("buildGroupedPurchaseHistory"), "grouping");
assert(group.includes("purchaseHistoryDateGroupLabel"), "date label");
assert(group.includes('"Today"'), "Today");
assert(group.includes('"Yesterday"'), "Yesterday");
assert(group.includes('"This week"'), "This week");
assert(group.includes("purchaseHistoryItemHeadline"), "headline");
assert(group.includes("purchaseSupplierLabel"), "supplier");

assert(logic.includes("formatStaffPhQtyNumber"), "qty format");
assert(logic.includes("lowStockMetaLine"), "low meta");

assert(page.includes("openPurchase"), "openPurchase");
assert(page.includes("openLowStock"), "openLowStock");
assert(page.includes("staffPhDetailPath"), "uses detail path");
assert(page.includes("STAFF_PH_LOW_STOCK_PATH"), "uses low path");
assert(page.includes('data-action="open-purchase"'), "open-purchase action");
assert(page.includes('data-action="inform-owner"'), "inform-owner action");
assert(page.includes('data-slot="purchaseRow"'), "purchaseRow");
assert(page.includes('data-slot="lowStockRow"'), "lowStockRow");
assert(page.includes('data-slot="dateHeader"'), "dateHeader");
assert(page.includes("buildGroupedPurchaseHistory"), "uses grouping");
assert(page.includes('data-deferred="pack-summary"'), "pack deferred");
assert(page.includes('data-deferred="delivery-badge"'), "delivery deferred");
assert(page.includes("fetchStaffPhPurchases") || !page.includes("fetch("), "no raw fetch in page");

assert(pkg.includes("test:staff-purchase-history-buttons"), "buttons script");

for (const name of [
  "check-staff-purchase-history-scaffold.mjs",
  "check-staff-purchase-history-layout.mjs",
  "check-staff-purchase-history-fields.mjs",
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
  console.error("Staff purchase-history BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff purchase-history BUTTONS checks PASS");
