/**
 * Notifications /notifications LAYOUT smoke.
 * Run: node scripts/check-notifications-layout.mjs
 * Source: notifications_page.dart _FilterChip; notification_alert_card.dart; HexaColors
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
const pagePath = join(root, "src/features/notifications/NotificationsPage.tsx");
const cssPath = join(root, "src/features/notifications/NotificationsPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(page.includes('data-slot="appBar"'), "appBar slot");
assert(page.includes('data-slot="search"'), "search slot");
assert(page.includes('data-slot="filters"'), "filters slot");
assert(page.includes('data-slot="list"'), "list slot");
assert(page.includes("notifications-page__search-icon"), "search icon");
assert(
  page.includes("notifications-card-chrome") ||
    css.includes("notifications-page__card-chrome"),
  "card chrome",
);
assert(
  page.includes("notifications-page__card-priority") ||
    css.includes("notifications-page__card-priority"),
  "priority bar",
);
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no API path");
/* BUTTONS owns popOrGo */

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "brand background");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand primary");
assert(css.includes("#159a8a") || css.includes("#159A8A"), "primaryMid accent chip");
assert(css.includes("pointer-events: none"), "inert chrome");
assert(css.includes("border-radius: 20px"), "chip radius 20");
assert(css.includes("border-radius: 12px"), "search/card radius 12");
assert(css.includes("#9ca3af") || css.includes("#9CA3AF"), "input hint");
assert(css.includes("#e5e7eb") || css.includes("#E5E7EB"), "input border");
assert(css.includes("notifications-page__card-chrome"), "card chrome CSS");
assert(css.includes("width: 4px"), "unread priority width 4");

assert(
  pkg.includes("test:notifications-layout"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Notifications LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Notifications LAYOUT checks PASS");
