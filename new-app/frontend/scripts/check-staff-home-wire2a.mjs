/**
 * Staff /staff/home WIRE-2a — Warehouse & Purchases stats via stock/totals.
 * Run: node scripts/check-staff-home-wire2a.mjs
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

const api = readFileSync(join(root, "src/features/staff/staffHomeApi.ts"), "utf8");
const page = readFileSync(
  join(root, "src/features/staff/StaffHomePage.tsx"),
  "utf8",
);
const copy = readFileSync(
  join(root, "src/features/staff/staffHomeLoadCopy.ts"),
  "utf8",
);
const routes = readFileSync(
  join(backend, "src/routes/staffHome.routes.ts"),
  "utf8",
);
const repo = readFileSync(
  join(backend, "src/repositories/staffHome.repository.ts"),
  "utf8",
);
const ctrl = readFileSync(
  join(backend, "src/controllers/staffHome.controller.ts"),
  "utf8",
);

assert(api.includes("/stock/totals"), "API stock/totals path");
assert(api.includes("fetchStockTotals"), "fetchStockTotals");
assert(api.includes("staffAppPeriodMonthDates"), "calendar month helper");
assert(api.includes("period_start"), "period_start query");
assert(api.includes("period_end"), "period_end query");
assert(!api.includes("home-overview"), "no home-overview");

assert(page.includes("fetchStockTotals"), "page fetches totals");
assert(page.includes("WarehousePurchaseStats"), "warehouse stats component");
assert(page.includes('navigate("/staff/stock")'), "warehouse tap");
assert(page.includes('navigate("/staff/deliveries")'), "purchases tap");
assert(!page.includes("home-overview"), "no home-overview on page");

assert(copy.includes("Warehouse stats unavailable"), "warehouse error copy");
assert(copy.includes("Purchase stats unavailable"), "purchase error copy");
assert(copy.includes('"Warehouse"'), "Warehouse title");
assert(copy.includes('"On hand now"'), "On hand now");
assert(copy.includes('"Purchases"'), "Purchases title");
assert(copy.includes('"This month"'), "This month");
assert(copy.includes('"Bags"'), "Bags label");
assert(copy.includes('"KG"'), "KG label");
assert(copy.includes('"Box"'), "Box label");
assert(copy.includes('"Tin"'), "Tin label");

assert(routes.includes('"/totals"'), "route /totals");
assert(ctrl.includes("stockTotals"), "controller stockTotals");
assert(repo.includes("stockTotalsOnHand"), "on-hand repo");
assert(repo.includes("stockTotalsPurchased"), "purchased repo");
assert(repo.includes("default_kg_per_bag"), "kg per bag");
assert(repo.includes("tradeLineQtyBagsExprSql"), "trade bag expr");

const compareDoc = join(
  root,
  "../../docs/modules/staff_home_wire2a_compare.md",
);
assert(existsSync(compareDoc), "staff_home_wire2a_compare.md");

if (failures.length) {
  console.error("Staff home WIRE-2a checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home WIRE-2a checks PASS");
