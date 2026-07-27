/**
 * Notifications /notifications WIRE smoke.
 * Run: node scripts/check-notifications-wire.mjs
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

const apiPath = join(root, "src/features/notifications/notificationsApi.ts");
const feedPath = join(root, "src/features/notifications/notificationsFeed.ts");
const pagePath = join(root, "src/features/notifications/NotificationsPage.tsx");
const cardPath = join(
  root,
  "src/features/notifications/NotificationAlertCard.tsx",
);
const routesPath = join(backend, "src/routes/staffHome.routes.ts");
const repoPath = join(backend, "src/repositories/staffHome.repository.ts");
const ctrlPath = join(backend, "src/controllers/staffHome.controller.ts");
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "api exists");
assert(existsSync(feedPath), "feed exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cardPath), "card exists");

const api = readFileSync(apiPath, "utf8");
const feed = readFileSync(feedPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const routes = readFileSync(routesPath, "utf8");
const repo = readFileSync(repoPath, "utf8");
const ctrl = readFileSync(ctrlPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("/notifications?"), "list path");
assert(api.includes("mark-all-read"), "mark-all path");
assert(api.includes("clear-all"), "clear-all path");
assert(api.includes("method: \"PATCH\""), "patch method");
assert(api.includes("listAppNotifications"), "listAppNotifications");
assert(api.includes("markAllAppNotificationsRead"), "markAll fn");
assert(api.includes("clearAllAppNotifications"), "clearAll fn");
assert(api.includes("patchAppNotificationRead"), "patch fn");

assert(feed.includes("mergeNotificationFeed"), "merge feed");
assert(feed.includes("notificationCategoryForItem"), "category");
assert(feed.includes("wh_low_stock"), "warehouse low");
assert(feed.includes("Welcome to"), "welcome seed");
assert(feed.includes("maxLowStockServerRows"), "cap 12");
assert(
  feed.includes("Purchase-due alerts deferred") ||
    feed.includes("remaining/due_date"),
  "purchase due deferred note",
);

assert(page.includes("listAppNotifications"), "page list");
assert(page.includes("markAllAppNotificationsRead"), "page mark-all");
assert(page.includes("clearAllAppNotifications"), "page clear");
assert(page.includes("fetchStockAlertsSummary"), "alerts summary");
assert(page.includes("NotificationAlertCard"), "card component");
assert(page.includes("notifications-feed"), "feed testid");
assert(page.includes("NOTIFICATIONS_LOAD_ERROR"), "load error copy");

assert(routes.includes('"/mark-all-read"'), "route mark-all");
assert(routes.includes('"/clear-all"'), "route clear-all");
assert(routes.includes('"/:notificationId"'), "route patch");
assert(repo.includes("markAllNotificationsRead"), "repo mark-all");
assert(repo.includes("clearAllNotifications"), "repo clear");
assert(repo.includes("patchNotificationRead"), "repo patch");
assert(ctrl.includes("markAllNotificationsRead"), "ctrl mark-all");

assert(
  pkg.includes("test:notifications-wire"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Notifications WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Notifications WIRE checks PASS");
