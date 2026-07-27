/**
 * Staff stock /staff/stock WIRE smoke.
 * Run: node scripts/check-staff-stock-wire.mjs
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

const apiPath = join(root, "src/features/staff/stock/staffStockApi.ts");
const metricsPath = join(
  root,
  "src/features/staff/stock/staffStockRowMetrics.ts",
);
const pagePath = join(root, "src/features/staff/stock/StaffStockPage.tsx");
const repoPath = join(
  root,
  "../backend/src/repositories/staffHome.repository.ts",
);
const ctrlPath = join(
  root,
  "../backend/src/controllers/staffHome.controller.ts",
);
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "api exists");
assert(existsSync(metricsPath), "metrics exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(repoPath), "repo exists");

const api = readFileSync(apiPath, "utf8");
const metrics = readFileSync(metricsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const repo = readFileSync(repoPath, "utf8");
const ctrl = readFileSync(ctrlPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("fetchStaffStockListPage"), "fetchStaffStockListPage");
assert(api.includes("/stock/list"), "stock list path");
assert(api.includes("STAFF_STOCK_PER_PAGE = 50"), "per_page 50");
assert(api.includes("missing_barcode"), "missing_barcode qs");
assert(api.includes("reorder_only"), "reorder_only qs");
assert(api.includes('sort: query.sort ?? "recent"'), "default sort recent");

assert(metrics.includes("stockRowSystemLabel"), "SYS label");
assert(metrics.includes("stockRowPhysicalLabel"), "PHYS label");
assert(metrics.includes("stockRowDiffLabel"), "DIFF label");
assert(metrics.includes("physical_stock_qty"), "physical qty");

assert(page.includes("fetchStaffStockListPage"), "page fetches");
assert(page.includes('data-slot="loading"'), "loading");
assert(page.includes('data-slot="error"'), "error");
assert(page.includes('data-slot="itemRow"'), "item row");
assert(page.includes('data-action="load-more"'), "load more");
assert(page.includes("openItem"), "row nav");
assert(page.includes("`/catalog/item/"), "catalog path");
assert(page.includes("STAFF_STOCK_DEFAULT_SORT"), "sort recent");
assert(page.includes('data-deferred="activity-feed"'), "activity deferred");
assert(page.includes('data-deferred="delivery-counts"'), "delivery deferred");

assert(repo.includes("stockStatusWhereSql"), "status SQL helper");
assert(repo.includes("shortage"), "shortage filter");
assert(repo.includes("physical_stock_qty"), "physical in out");
assert(repo.includes("OUTER APPLY"), "physical join");
assert(repo.includes("last_stock_updated_at"), "recent sort col");
assert(repo.includes("@qLike"), "search q");

assert(ctrl.includes("missing_barcode"), "ctrl missing_barcode");
assert(ctrl.includes("reorder_only"), "ctrl reorder_only");
assert(ctrl.includes("req.query.q"), "ctrl q");

assert(pkg.includes("test:staff-stock-wire"), "wire script");

for (const name of [
  "check-staff-stock-scaffold.mjs",
  "check-staff-stock-layout.mjs",
  "check-staff-stock-fields.mjs",
  "check-staff-stock-buttons.mjs",
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
  console.error("Staff stock WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff stock WIRE checks PASS");
