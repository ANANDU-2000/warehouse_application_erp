/**
 * Notifications /notifications SCAFFOLD smoke.
 * Run: node scripts/check-notifications-scaffold.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/notifications/notificationsCopy.ts");
const filtersPath = join(
  root,
  "src/features/notifications/notificationsFilters.ts",
);
const pagePath = join(root, "src/features/notifications/NotificationsPage.tsx");
const cssPath = join(root, "src/features/notifications/NotificationsPage.css");
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(filtersPath), "filters exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const filters = readFileSync(filtersPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('NOTIFICATIONS_TITLE = "Notifications"'), "title");
assert(copy.includes('NOTIFICATIONS_BACK_FALLBACK = "/home"'), "back /home");
assert(copy.includes('NOTIFICATIONS_SEARCH_HINT = "Search alerts…"'), "search");
assert(copy.includes('NOTIFICATIONS_MARK_ALL_READ = "Mark all read"'), "mark all");
assert(
  copy.includes('NOTIFICATIONS_CLEAR_TOOLTIP = "Clear server notifications"'),
  "clear tooltip",
);
assert(copy.includes('"All"'), "All");
assert(copy.includes('"Critical"'), "Critical");
assert(copy.includes('"Warehouse"'), "Warehouse");
assert(copy.includes('"Purchases"'), "Purchases");
assert(copy.includes('"Staff"'), "Staff");
assert(copy.includes('"System"'), "System");

assert(filters.includes("NOTIFICATIONS_FILTER_ORDER_OWNER"), "owner filters");
assert(filters.includes("NOTIFICATIONS_FILTER_ORDER_STAFF"), "staff filters");
assert(!filters.includes('"purchases"') || filters.includes("purchases"), "purchases key");
assert(
  filters.includes('["all", "critical", "warehouse", "staff", "system"]') ||
    filters.includes('"staff", "system"'),
  "staff omits purchases",
);

assert(page.includes('data-slot="appBar"'), "appBar slot");
assert(page.includes('data-slot="search"'), "search slot");
assert(page.includes('data-slot="filters"'), "filters slot");
assert(page.includes('data-slot="list"'), "list slot");
assert(page.includes("NOTIFICATIONS_TITLE"), "uses title");
assert(page.includes("NOTIFICATIONS_FILTER_ORDER_STAFF"), "staff filter set");
assert(page.includes('role === "staff"') || page.includes("=== \"staff\""), "staff role");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no API path");
/* BUTTONS owns popOrGo */

assert(router.includes("NotificationsPage"), "router imports page");
assert(router.includes('path="/notifications"'), "notifications route");
assert(!router.includes('title="Notifications"'), "no stub title route");

assert(
  pkg.includes("test:notifications-scaffold"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Notifications SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Notifications SCAFFOLD checks PASS");
