/**
 * Owner /home/activity SCAFFOLD smoke checks.
 * Run: node scripts/check-home-activity-scaffold.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const pagePath = join(
  root,
  "src/features/home/HomeWarehouseActivityPage.tsx",
);
assert(existsSync(pagePath), "HomeWarehouseActivityPage exists");

const page = readFileSync(pagePath, "utf8");
assert(page.includes("Warehouse activity"), "AppBar title");
assert(page.includes('data-slot="appbar"'), "appbar slot");
assert(page.includes('data-slot="period-filter"'), "period-filter slot");
assert(page.includes('data-slot="period-caption"'), "period-caption slot");
assert(page.includes('data-slot="activity-list"'), "activity-list slot");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("navigate("), "no navigate CTA");
assert(!page.includes("HomePeriod"), "no period chips");
assert(!page.includes("trade-purchases"), "no trade-purchases API");
assert(!page.includes("stock/audit"), "no stock audit API");

const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");
assert(
  router.includes("HomeWarehouseActivityPage"),
  "router imports activity page",
);
assert(router.includes('path="/home/activity"'), "activity route");
assert(
  !router.includes(
    'path="/home/activity"\n          element={<DashboardRouteStubPage',
  ),
  "not stub page",
);

const css = readFileSync(
  join(root, "src/features/home/HomeWarehouseActivityPage.css"),
  "utf8",
);
assert(
  css.includes("#f7f9f6") || css.includes("#F7F9F6"),
  "brandBackground #F7F9F6",
);

if (failures.length) {
  console.error("Home activity SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home activity SCAFFOLD checks PASS");
