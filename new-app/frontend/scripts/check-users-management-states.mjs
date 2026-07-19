/**
 * Users /settings/users STATES smoke.
 * Run: node scripts/check-users-management-states.mjs
 * Source: user_management_page.dart ListSkeleton / HexaErrorCard; load_state_error.dart
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/users/usersManagementCopy.ts");
const subPath = join(root, "src/features/users/usersLoadSubtitle.ts");
const pagePath = join(root, "src/features/users/UserManagementPage.tsx");
const cssPath = join(root, "src/features/users/UserManagementPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(subPath), "usersLoadSubtitle.ts");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

const required = [
  ["Could not load users", "USERS_MGMT_LOAD_ERROR"],
  ["Tap to retry.", "USERS_MGMT_RETRY_SUBTITLE"],
  ["Retry", "USERS_MGMT_RETRY_LABEL"],
  ["No users match your filters.", "USERS_MGMT_EMPTY_FILTERS"],
  ["Session expired. Please log in again.", "USERS_MGMT_SUBTITLE_401"],
  ["You don't have permission for this.", "USERS_MGMT_SUBTITLE_403"],
  [
    "No connection. Check your network and try again.",
    "USERS_MGMT_SUBTITLE_NO_CONNECTION",
  ],
  ["Server error. Please try again shortly.", "USERS_MGMT_SUBTITLE_5XX"],
];

for (const [literal, name] of required) {
  assert(
    copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`),
    name,
  );
}

assert(sub.includes("mapUsersLoadSubtitle"), "subtitle mapper export");
assert(sub.includes("UsersNetworkError"), "network branch");
assert(sub.includes("UsersApiError"), "api branch");
assert(sub.includes("case 401"), "401 map");
assert(sub.includes("case 403"), "403 map");

assert(page.includes("UsersListSkeleton"), "ListSkeleton component");
assert(page.includes("UsersFriendlyLoadError"), "FriendlyLoadError component");
assert(page.includes("mapUsersLoadSubtitle"), "uses subtitle map");
assert(page.includes("USERS_MGMT_LOAD_ERROR"), "error title constant");
assert(page.includes("USERS_MGMT_RETRY_LABEL"), "Retry label");
assert(page.includes("USERS_MGMT_EMPTY_FILTERS"), "empty filters");
assert(page.includes("data-testid=\"users-mgmt-skeleton\""), "skeleton testid");
assert(
  page.includes("data-testid=\"users-mgmt-friendly-error\""),
  "error testid",
);
assert(page.includes("length: 6"), "skeleton 6 rows");
assert(!page.includes("USERS_MGMT_LOADING"), "no WIRE loading text");
assert(!page.includes("/dashboard"), "no invented dashboard path");

assert(css.includes("users-mgmt__skeleton-bar"), "skeleton CSS");
assert(css.includes("height: 84px"), "skeleton height 84");
assert(css.includes("#eff2f1") || css.includes("#EFF2F1"), "skeleton color");
assert(css.includes("users-mgmt__friendly-error"), "friendly error CSS");
assert(css.includes("users-mgmt__retry"), "retry CSS");

assert(
  pkg.includes("test:users-management-states"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Users management STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Users management STATES checks PASS");
