/**
 * Notifications /notifications FIELDS smoke.
 * Run: node scripts/check-notifications-fields.mjs
 * Source: notifications_page.dart search/filter/showing/empty catalogs
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
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(filtersPath), "filters exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const filters = readFileSync(filtersPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

const required = [
  ["No alerts yet", "EMPTY_TITLE_ALL"],
  ["No critical alerts", "EMPTY_TITLE_CRITICAL"],
  ["No warehouse alerts", "EMPTY_TITLE_WAREHOUSE"],
  ["No purchase alerts", "EMPTY_TITLE_PURCHASES"],
  ["No staff alerts", "EMPTY_TITLE_STAFF"],
  ["No system notifications", "EMPTY_TITLE_SYSTEM"],
  ["No matches", "EMPTY_TITLE_SEARCH"],
  [
    "Stock, purchase, and system activity will appear here.",
    "EMPTY_SUB_ALL",
  ],
  [
    "Try a different search or clear the search box.",
    "EMPTY_SUB_SEARCH",
  ],
  [
    "Switch to All or another tab — alerts are hidden by the current filter.",
    "EMPTY_SUB_FILTER_HIDDEN",
  ],
  ["Show all alerts", "SHOW_ALL"],
  ["New purchase", "CTA_NEW_PURCHASE"],
  ["Receive shipment", "CTA_RECEIVE"],
];

for (const [literal, name] of required) {
  assert(
    copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`),
    name,
  );
}

assert(filters.includes("NOTIFICATIONS_EMPTY_TITLE"), "empty title map");
assert(filters.includes("NOTIFICATIONS_EMPTY_SUBTITLE"), "empty sub map");

assert(page.includes("useState"), "local state");
assert(page.includes("setFilter"), "filter state");
assert(page.includes("setSearch"), "search state");
assert(page.includes("notifications-empty"), "empty testid");
assert(page.includes("notifications-search-clear"), "search clear");
assert(page.includes("notifications-showing"), "showing count");
assert(page.includes("NOTIFICATIONS_EMPTY_TITLE"), "uses empty titles");
assert(page.includes("NOTIFICATIONS_CTA_RECEIVE"), "receive CTA");
assert(page.includes("NOTIFICATIONS_CTA_NEW_PURCHASE"), "purchase CTA");
assert(page.includes("chip--active"), "chips interactive");
assert(page.includes("search-input--active"), "search interactive");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no API path");
assert(!page.includes("popOrGo"), "back deferred BUTTONS");

assert(
  pkg.includes("test:notifications-fields"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Notifications FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Notifications FIELDS checks PASS");
