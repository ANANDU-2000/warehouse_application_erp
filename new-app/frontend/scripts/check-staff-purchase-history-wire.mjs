/**
 * Staff purchase history /staff/purchase-history WIRE smoke.
 * Run: node scripts/check-staff-purchase-history-wire.mjs
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

const apiPath = join(
  root,
  "src/features/staff/purchaseHistory/staffPurchaseHistoryApi.ts",
);
const periodPath = join(
  root,
  "src/features/staff/purchaseHistory/staffPurchaseHistoryPeriod.ts",
);
const pagePath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.tsx",
);
const repoPath = join(
  root,
  "../backend/src/repositories/homeActivity.repository.ts",
);
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "api exists");
assert(existsSync(periodPath), "period exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(repoPath), "repo exists");

const api = readFileSync(apiPath, "utf8");
const period = readFileSync(periodPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const repo = readFileSync(repoPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("fetchStaffPhPurchases"), "fetch purchases");
assert(api.includes("fetchStaffPhLowStock"), "fetch low");
assert(api.includes("/trade-purchases"), "trade-purchases path");
assert(api.includes("STAFF_PH_PAGE_SIZE = 50"), "page 50");
assert(api.includes("STAFF_PH_MAX_ROWS = 500"), "max 500");
assert(api.includes("STAFF_PH_LOW_STOCK_PER_PAGE = 8"), "low perPage 8");
assert(api.includes('status: "low"'), "status low");
assert(api.includes('sort: "stock_asc"'), "stock_asc");
assert(api.includes("purchase_from"), "purchase_from");
assert(api.includes("purchase_to"), "purchase_to");

assert(period.includes("staffPhPeriodRange"), "period range");
assert(period.includes("staffPhApiDate"), "api date");

assert(page.includes("fetchStaffPhPurchases"), "page purchases");
assert(page.includes("fetchStaffPhLowStock"), "page low");
assert(page.includes('data-slot="loading"'), "loading");
assert(page.includes('data-slot="error"'), "error");
assert(page.includes("retryLoad"), "retry");
assert(
  page.includes("STAFF_PH_LOAD_FAILED") ||
    page.includes("mapStaffPhLoadTitle"),
  "load failed copy",
);
assert(page.includes("lowRows.length"), "low tab count");

assert(repo.includes("items_count"), "items_count");
assert(repo.includes("broker_name"), "broker_name");
assert(repo.includes("tp.[status]"), "status col");
assert(repo.includes("LEFT JOIN brokers"), "brokers join");

assert(pkg.includes("test:staff-purchase-history-wire"), "wire script");

for (const name of [
  "check-staff-purchase-history-scaffold.mjs",
  "check-staff-purchase-history-layout.mjs",
  "check-staff-purchase-history-fields.mjs",
  "check-staff-purchase-history-buttons.mjs",
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
  console.error("Staff purchase-history WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff purchase-history WIRE checks PASS");
