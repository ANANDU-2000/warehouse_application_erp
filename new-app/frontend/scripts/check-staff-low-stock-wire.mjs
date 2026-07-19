/**
 * Staff low stock /staff/low-stock WIRE smoke.
 * Run: node scripts/check-staff-low-stock-wire.mjs
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

const apiPath = join(root, "src/features/staff/lowStock/staffLowStockApi.ts");
const logicPath = join(
  root,
  "src/features/staff/lowStock/staffLowStockLogic.ts",
);
const pagePath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.tsx",
);
const repoPath = join(
  root,
  "../backend/src/repositories/staffHome.repository.ts",
);
const routesPath = join(
  root,
  "../backend/src/routes/staffHome.routes.ts",
);
const controllerPath = join(
  root,
  "../backend/src/controllers/staffHome.controller.ts",
);
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "api exists");
assert(existsSync(logicPath), "logic exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(repoPath), "repo exists");
assert(existsSync(routesPath), "routes exist");
assert(existsSync(controllerPath), "controller exists");

const api = readFileSync(apiPath, "utf8");
const logic = readFileSync(logicPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const repo = readFileSync(repoPath, "utf8");
const routes = readFileSync(routesPath, "utf8");
const controller = readFileSync(controllerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("fetchStaffLowStockOperations"), "fetch ops");
assert(api.includes("notifyOwnerStockItem"), "notify fn");
assert(api.includes("/stock/low-stock/operations"), "ops path");
assert(api.includes("/notify-owner"), "notify path");
assert(api.includes("STAFF_LS_OPS_MAX_PER_PAGE = 200"), "max 200");
assert(api.includes('STAFF_LS_DEFAULT_PERIOD: HomePeriod = "month"'), "month");
assert(api.includes("period_start"), "period_start");
assert(api.includes("period_end"), "period_end");

assert(logic.includes("groupLowStockOperationItems"), "group helper");
assert(logic.includes('"Unknown"'), "Unknown cat");
assert(logic.includes('"Other"'), "Other sub");

assert(page.includes("fetchStaffLowStockOperations"), "page fetch");
assert(page.includes("notifyOwnerStockItem"), "page notify");
assert(page.includes("groupLowStockOperationItems"), "page group");
assert(page.includes('data-slot="loading"'), "loading");
assert(page.includes('data-slot="error"'), "error");
assert(page.includes("retryLoad"), "retry");
assert(page.includes("STAFF_LS_LOAD_FAILED") || page.includes("mapStaffLsLoadTitle"), "load title");
assert(!page.includes('data-deferred="notify-owner-api"'), "notify not deferred");

assert(repo.includes("listLowStockOperations"), "repo ops");
assert(repo.includes("notifyOwnerStockItem"), "repo notify");
assert(repo.includes("has_pending_order"), "pending flag");
assert(repo.includes("period_purchased_qty"), "period qty");
assert(repo.includes("last_purchase_human_id"), "last PO");
assert(repo.includes("qty_in_stock_unit"), "stock unit qty");
assert(repo.includes("INSERT INTO notifications"), "notif insert");

assert(routes.includes('/low-stock/operations'), "route ops");
assert(routes.includes("/:itemId/notify-owner"), "route notify");
assert(controller.includes("listLowStockOperations"), "ctrl ops");
assert(controller.includes("notifyOwnerStockItem"), "ctrl notify");

assert(pkg.includes("test:staff-low-stock-wire"), "wire script");

for (const name of [
  "check-staff-low-stock-scaffold.mjs",
  "check-staff-low-stock-layout.mjs",
  "check-staff-low-stock-fields.mjs",
  "check-staff-low-stock-buttons.mjs",
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
  console.error("Staff low-stock WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff low-stock WIRE checks PASS");
