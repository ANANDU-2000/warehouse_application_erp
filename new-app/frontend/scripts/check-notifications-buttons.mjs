/**
 * Notifications /notifications BUTTONS smoke.
 * Run: node scripts/check-notifications-buttons.mjs
 * Source: notifications_page.dart back / mark-all / clear dialog / empty CTAs
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
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('NOTIFICATIONS_BACK_FALLBACK = "/home"'), "back /home");
assert(
  copy.includes('NOTIFICATIONS_CTA_PATH_STAFF = "/staff/receive"'),
  "CTA staff path",
);
assert(
  copy.includes('NOTIFICATIONS_CTA_PATH_OWNER = "/purchase/new"'),
  "CTA owner path",
);
assert(
  copy.includes('NOTIFICATIONS_CLEAR_DIALOG_TITLE = "Clear server notifications?"'),
  "clear title",
);
assert(
  copy.includes(
    "Stock alerts generated from live warehouse data will still appear until the stock issue is fixed.",
  ),
  "clear body",
);
assert(copy.includes('NOTIFICATIONS_CLEAR_DIALOG_CANCEL = "Cancel"'), "Cancel");
assert(copy.includes('NOTIFICATIONS_CLEAR_DIALOG_CONFIRM = "Clear"'), "Clear");

assert(page.includes("function popOrGo"), "popOrGo");
assert(page.includes("useNavigate"), "useNavigate");
assert(page.includes("NOTIFICATIONS_BACK_FALLBACK"), "uses back fallback");
assert(page.includes("markAllRead"), "markAllRead stub");
assert(page.includes("confirmClearServer"), "confirmClear stub");
assert(page.includes("notifications-clear-dialog"), "clear dialog");
assert(page.includes("NOTIFICATIONS_CLEAR_DIALOG_TITLE"), "dialog title");
assert(page.includes("NOTIFICATIONS_CTA_PATH_STAFF"), "navigate staff CTA");
assert(page.includes("NOTIFICATIONS_CTA_PATH_OWNER"), "navigate owner CTA");
assert(page.includes("hasUnread"), "hasUnread gate");
assert(page.includes("clearDisabled"), "clear disabled gate");
/* WIRE owns fetch + mark-all/clear API */

assert(css.includes("notifications-page__dialog"), "dialog CSS");
assert(router.includes('path="/staff/receive"'), "receive stub route");
assert(router.includes('path="/purchase/new"'), "purchase/new stub route");

assert(
  pkg.includes("test:notifications-buttons"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Notifications BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Notifications BUTTONS checks PASS");
