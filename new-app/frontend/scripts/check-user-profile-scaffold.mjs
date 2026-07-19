/**
 * Users /settings/users/:userId SCAFFOLD smoke.
 * Run: node scripts/check-user-profile-scaffold.mjs
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
const pagePath = join(root, "src/features/users/UserProfilePage.tsx");
const cssPath = join(root, "src/features/users/UserProfilePage.css");
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "userProfileCopy.ts");
assert(existsSync(pagePath), "UserProfilePage.tsx");
assert(existsSync(cssPath), "UserProfilePage.css");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('USER_PROFILE_TITLE = "User profile"'), "title");
assert(copy.includes('USER_PROFILE_TAB_OVERVIEW = "Overview"'), "Overview");
assert(copy.includes('USER_PROFILE_TAB_ACTIVITY = "Activity"'), "Activity");
assert(
  copy.includes('USER_PROFILE_TAB_PERMISSIONS = "Permissions"'),
  "Permissions",
);
assert(
  copy.includes('USER_PROFILE_BACK_FALLBACK = "/settings/users"'),
  "back fallback",
);

assert(page.includes("sessionCanManageUsers"), "manage gate");
assert(page.includes('Navigate to="/settings"'), "redirect settings");
assert(page.includes('data-slot="appBar"'), "appBar slot");
assert(page.includes('data-slot="header"'), "header slot");
assert(page.includes('data-slot="tabBar"'), "tabBar slot");
assert(page.includes('data-slot="tabBody"'), "tabBody slot");
assert(page.includes("USER_PROFILE_TITLE"), "uses title");
assert(page.includes("useParams"), "reads userId param");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no API path");
assert(!page.includes("onClick"), "no CTA clicks");

assert(router.includes("UserProfilePage"), "router imports page");
assert(router.includes('/settings/users/:userId'), "profile route");
assert(!router.includes('title="User profile"'), "no stub title route");

assert(
  pkg.includes("test:user-profile-scaffold"),
  "package.json script registered",
);

if (failures.length) {
  console.error("User profile SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("User profile SCAFFOLD checks PASS");
