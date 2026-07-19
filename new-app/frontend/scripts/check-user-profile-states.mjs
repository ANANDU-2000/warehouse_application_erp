/**
 * Users /settings/users/:userId STATES smoke.
 * Run: node scripts/check-user-profile-states.mjs
 * Source: user_profile_page.dart CircularProgressIndicator / HexaErrorCard /
 * FriendlyLoadError; load_state_error.dart; friendlyApiError.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/users/userProfileCopy.ts");
const subPath = join(root, "src/features/users/usersLoadSubtitle.ts");
const pagePath = join(root, "src/features/users/UserProfilePage.tsx");
const cssPath = join(root, "src/features/users/UserProfilePage.css");
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
  ["Could not load user", "USER_PROFILE_LOAD_ERROR"],
  ["User not found.", "USER_PROFILE_NOT_FOUND"],
  ["Tap to retry.", "USER_PROFILE_RETRY_SUBTITLE"],
  ["Retry", "USER_PROFILE_RETRY"],
  [
    "View only — only owners and admins can edit permissions.",
    "USER_PROFILE_PERMS_VIEW_ONLY",
  ],
  ["Session expired. Please sign in again.", "USER_PROFILE_FACING_401_403"],
  ["This item was not found.", "USER_PROFILE_FACING_404"],
  [
    "No connection. Changes will sync when online.",
    "USER_PROFILE_FACING_NETWORK",
  ],
];

for (const [literal, name] of required) {
  assert(
    copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`),
    name,
  );
}

assert(!copy.includes("Loading user…"), "no WIRE Loading user text in copy");

assert(sub.includes("mapUsersLoadSubtitle"), "subtitle mapper");
assert(sub.includes("mapUserFacingError"), "userFacing mapper");
assert(sub.includes("UsersNetworkError"), "network branch");
assert(sub.includes("UsersApiError"), "api branch");
assert(sub.includes("case 401"), "401 map");

assert(page.includes("UserProfileFriendlyLoadError"), "FriendlyLoadError");
assert(page.includes("mapUsersLoadSubtitle"), "uses load subtitle");
assert(page.includes("mapUserFacingError"), "uses facing map");
assert(page.includes("USER_PROFILE_LOAD_ERROR"), "error title constant");
assert(page.includes("USER_PROFILE_NOT_FOUND"), "not found constant");
assert(page.includes("USER_PROFILE_PERMS_VIEW_ONLY"), "view only");
assert(page.includes("user-profile__spinner-ring"), "spinner ring");
assert(
  page.includes('data-testid="user-profile-loading"'),
  "loading testid",
);
assert(
  page.includes("user-profile-friendly-error"),
  "error testid",
);
assert(
  page.includes("user-profile-perms-loading"),
  "perms loading",
);
assert(
  page.includes("user-profile-perms-friendly-error"),
  "perms error",
);
assert(page.includes("permLoading"), "perm loading state");
assert(page.includes("permError"), "perm error state");
assert(page.includes("onRetryPermissions"), "perms retry");
assert(!page.includes("USER_PROFILE_LOADING"), "no WIRE loading constant");
assert(!page.includes("Loading user"), "no Loading user string");
assert(!page.includes("/dashboard"), "no invented dashboard path");

assert(css.includes("user-profile__cold-load"), "cold load CSS");
assert(css.includes("user-profile__spinner-ring"), "spinner CSS");
assert(css.includes("user-profile__friendly-error"), "friendly error CSS");
assert(css.includes("user-profile__retry"), "retry CSS");
assert(css.includes("user-profile__perms-view-only"), "view only CSS");

assert(
  pkg.includes("test:user-profile-states"),
  "package.json script registered",
);

if (failures.length) {
  console.error("User profile STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("User profile STATES checks PASS");
