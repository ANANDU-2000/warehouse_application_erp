/**
 * Notifications /notifications STATES smoke.
 * Run: node scripts/check-notifications-states.mjs
 * Source: notifications_page.dart loading/error/empty; load_state_error.dart
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
const subPath = join(
  root,
  "src/features/notifications/notificationsLoadSubtitle.ts",
);
const pagePath = join(root, "src/features/notifications/NotificationsPage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(subPath), "load subtitle exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

const required = [
  ["Could not refresh server notifications", "LOAD_ERROR"],
  ["Tap to retry.", "RETRY_SUBTITLE"],
  ["Session expired. Please log in again.", "SUB_401"],
  ["You don't have permission for this.", "SUB_403"],
  [
    "No connection. Check your network and try again.",
    "SUB_NO_CONNECTION",
  ],
  ["Server error. Please try again shortly.", "SUB_5XX"],
];

for (const [literal, name] of required) {
  assert(
    copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`),
    name,
  );
}

assert(sub.includes("mapNotificationsLoadSubtitle"), "subtitle mapper");
assert(sub.includes("NotificationsNetworkError"), "network branch");
assert(sub.includes("NotificationsApiError"), "api branch");
assert(sub.includes("case 401"), "401");
assert(sub.includes("case 403"), "403");

assert(page.includes("mapNotificationsLoadSubtitle"), "uses subtitle map");
assert(page.includes("serverLoading"), "serverLoading");
assert(page.includes("stockLoading"), "stockLoading");
assert(page.includes("!serverLoading && !stockLoading"), "empty gate");
assert(page.includes("visible.some"), "hasUnread from visible");
assert(page.includes("notifications-error"), "error testid");
assert(page.includes("notifications-loading"), "loading testid");
assert(page.includes("onTouchEnd"), "pull-to-refresh touch");
assert(page.includes("NOTIFICATIONS_LOAD_ERROR"), "error title constant");
assert(!page.includes("loadErrorMessage"), "no raw WIRE error helper");

assert(
  pkg.includes("test:notifications-states"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Notifications STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Notifications STATES checks PASS");
