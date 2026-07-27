/**
 * Owner /home/activity WIRE smoke checks.
 * Run: node scripts/check-home-activity-wire.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backend = join(root, "../backend/src");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const page = readFileSync(
  join(root, "src/features/home/HomeWarehouseActivityPage.tsx"),
  "utf8",
);
const api = readFileSync(
  join(root, "src/features/home/homeActivityApi.ts"),
  "utf8",
);
const feed = readFileSync(
  join(root, "src/features/home/homeActivityFeed.ts"),
  "utf8",
);
const units = readFileSync(
  join(root, "src/features/home/homeActivityUnits.ts"),
  "utf8",
);
const routes = readFileSync(
  join(backend, "routes/staffHome.routes.ts"),
  "utf8",
);
const repo = readFileSync(
  join(backend, "repositories/homeActivity.repository.ts"),
  "utf8",
);

assert(page.includes("fetchHomeWarehouseActivity"), "page uses feed");
assert(page.includes("events in period"), "events count label");
assert(
  page.includes("HomeSectionSkeleton") || page.includes("Loading activity"),
  "loading UI",
);
assert(page.includes("150"), "debounce 150");
assert(!page.includes("/dashboard?"), "no month dashboard");

assert(api.includes("/trade-purchases"), "trade-purchases path");
assert(api.includes("/stock/audit/recent"), "audit/recent path");
assert(api.includes("/stock/staff-purchases"), "staff-purchases path");
assert(api.includes("50"), "trade page max 50");

assert(feed.includes("delivery_verified"), "merge kinds");
assert(feed.includes("stock_quick_purchase"), "staff quick purchase");
assert(feed.includes("collapseDuplicateDeliveryActivity") || feed.includes("deliveryGroups"), "collapse");
assert(feed.includes("keepKinds") || feed.includes("KEEP_KINDS"), "keepKinds");
assert(feed.includes("200") || feed.includes("maxItems"), "maxItems 200");

assert(units.includes("stockAuditActivityUnitsLine"), "audit units");
assert(units.includes("purchaseActivityUnitsLine"), "purchase units");

assert(routes.includes("/audit/recent"), "route audit");
assert(routes.includes("/staff-purchases"), "route staff-purchases");
assert(routes.includes('r.get(\n    "/",'), "trade list GET /");

assert(repo.includes("listTradePurchases"), "repo listTradePurchases");
assert(repo.includes("auditRecent"), "repo auditRecent");
assert(repo.includes("listStaffPurchases"), "repo listStaffPurchases");

if (failures.length) {
  console.error("Home activity WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home activity WIRE checks PASS");
