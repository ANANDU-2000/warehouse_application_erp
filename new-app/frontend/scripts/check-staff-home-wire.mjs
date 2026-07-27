/**
 * Staff /staff/home WIRE smoke — Flutter-exact paths, no home-overview.
 * Run: node scripts/check-staff-home-wire.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backend = join(root, "..", "backend");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const apiPath = join(root, "src/features/staff/staffHomeApi.ts");
const pagePath = join(root, "src/features/staff/StaffHomePage.tsx");
const appPath = join(backend, "src/app.ts");
const repoPath = join(backend, "src/repositories/staffHome.repository.ts");

assert(existsSync(apiPath), "staffHomeApi.ts");
assert(existsSync(repoPath), "staffHome.repository.ts");

const api = readFileSync(apiPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const app = readFileSync(appPath, "utf8");
const repo = readFileSync(repoPath, "utf8");

assert(api.includes("/v1/me/profile"), "me/profile");
assert(
  api.includes("/trade-purchases/delivery-pipeline"),
  "delivery-pipeline",
);
assert(api.includes("/stock/list"), "stock/list");
assert(api.includes('status: "low"'), "status=low");
assert(api.includes('sort: "stock_asc"'), "sort=stock_asc");
assert(api.includes("/stock/opening/missing"), "opening/missing");
assert(api.includes("/stock/variances/today"), "variances/today");
assert(api.includes("missing_item_code"), "missing_item_code");
assert(api.includes("deliveryPipelinePendingCount"), "pending sum helper");
assert(api.includes("fetchStaffHomeShell"), "shell fetch");
assert(!api.includes("home-overview"), "no home-overview in staff API");

assert(page.includes("fetchStaffHomeShell"), "page wires shell");
assert(page.includes("STAFF_HOME_FLOOR_KPI_LABELS"), "floor labels");
assert(page.includes("STAFF_HOME_ATTENTION"), "attention tiles");
assert(page.includes("staffHomeShowsBarcodeTools"), "barcode gate");
assert(!page.includes("home-overview"), "no home-overview in page");

assert(app.includes('"/v1/me"'), "me mount");
assert(app.includes("createStaffHomeMeRoutes"), "profile routes");
assert(app.includes("trade-purchases"), "trade-purchases mount");
assert(app.includes('"/v1/businesses/:businessId/stock"'), "stock mount");

assert(repo.includes("deliveryPipeline"), "pipeline repo");
assert(repo.includes("opening_stock_set_at"), "opening filter");
assert(repo.includes("stock_variance"), "variance kind");
assert(repo.includes("LOW_STOCK_SQL") || repo.includes("reorder_level"), "low filter");

if (failures.length) {
  console.error("Staff home WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home WIRE checks PASS");
