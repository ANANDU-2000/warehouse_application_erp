/**
 * Users /settings/users/:userId Activity WIRE smoke.
 * Run: node scripts/check-user-profile-activity-wire.mjs
 * Source: user_activity_tab.dart · user_profile_providers.dart · hexa_api listUser*
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const apiPath = join(root, "src/features/users/usersApi.ts");
const panelPath = join(root, "src/features/users/UserActivityPanel.tsx");
const timelinePath = join(root, "src/features/users/UserActivityTimeline.tsx");
const pagePath = join(root, "src/features/users/UserProfilePage.tsx");
const copyPath = join(root, "src/features/users/userProfileCopy.ts");
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "usersApi.ts");
assert(existsSync(panelPath), "UserActivityPanel");
assert(existsSync(timelinePath), "UserActivityTimeline");

const api = readFileSync(apiPath, "utf8");
const panel = readFileSync(panelPath, "utf8");
const timeline = readFileSync(timelinePath, "utf8");
const page = readFileSync(pagePath, "utf8");
const copy = readFileSync(copyPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("listUserActivity"), "listUserActivity");
assert(api.includes("listUserStockAdjustments"), "listUserStockAdjustments");
assert(api.includes("listUserPurchases"), "listUserPurchases");
assert(api.includes("listUserCreatedItems"), "listUserCreatedItems");
assert(api.includes("listUserLedgerGrouped"), "listUserLedgerGrouped");
assert(api.includes("activity-log"), "activity-log path");
assert(api.includes("stock-adjustments"), "stock-adjustments path");
assert(api.includes("created-items"), "created-items path");
assert(api.includes("/purchases"), "purchases path");
assert(api.includes("/ledger"), "ledger path");
assert(api.includes("grouped"), "ledger grouped");
assert(api.includes("user_id"), "activity user_id query");
assert(api.includes("days"), "activity days query");
assert(!api.includes("/dashboard"), "no invented dashboard");

assert(panel.includes("listUserActivity"), "panel feed");
assert(panel.includes("listUserStockAdjustments"), "panel stock");
assert(panel.includes("listUserPurchases"), "panel purchases");
assert(panel.includes("listUserCreatedItems"), "panel items");
assert(panel.includes("listUserLedgerGrouped"), "panel ledger");
assert(panel.includes("UserActivityTimeline"), "uses timeline");
assert(panel.includes("mapUserFacingError"), "feed facing error");
assert(panel.includes("USER_PROFILE_ACTIVITY_LOAD_DEFAULT"), "default error");
assert(panel.includes("user-profile-activity-loading"), "loading testid");
assert(panel.includes("user-profile-activity-error"), "error testid");
assert(panel.includes("user-profile-activity-retry"), "retry testid");

assert(timeline.includes("No activity in the last 30 days.") || copy.includes("No activity in the last 30 days."), "feed empty");
assert(copy.includes("No stock activity yet."), "stock empty");
assert(copy.includes("No purchase activity yet."), "purchases empty");
assert(copy.includes("No items created yet."), "items empty");
assert(copy.includes("No ledger activity yet."), "ledger empty");
assert(copy.includes("Unable to load data"), "default load message");

assert(timeline.includes("friendlyActionType"), "friendly action");
assert(timeline.includes("groupActivityByDay"), "group by day");
assert(timeline.includes("Today"), "Today label");
assert(timeline.includes("Yesterday"), "Yesterday label");

assert(page.includes("UserActivityPanel"), "page mounts panel");
assert(!page.includes("listUserActivity"), "page delegates activity API");

assert(
  pkg.includes("test:user-profile-activity-wire"),
  "package.json script registered",
);

if (failures.length) {
  console.error("User profile Activity WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("User profile Activity WIRE checks PASS");
