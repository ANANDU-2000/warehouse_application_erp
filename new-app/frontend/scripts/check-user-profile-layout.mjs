/**
 * Users /settings/users/:userId LAYOUT smoke.
 * Run: node scripts/check-user-profile-layout.mjs
 * Source: user_profile_page.dart; user_profile_header.dart; HexaColors
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
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('USER_PROFILE_TITLE = "User profile"'), "title");
assert(copy.includes('USER_PROFILE_EDIT_USER = "Edit user"'), "Edit user");
assert(copy.includes('USER_PROFILE_TOOLTIP_MORE = "More actions"'), "More actions");
assert(copy.includes('USER_PROFILE_TAB_OVERVIEW = "Overview"'), "Overview");

assert(page.includes("sessionCanManageUsers"), "manage gate");
assert(page.includes("sessionCanAdminUsers"), "admin visibility");
assert(page.includes("USER_PROFILE_EDIT_USER"), "uses Edit user");
assert(page.includes("user-profile__avatar"), "avatar chrome");
assert(page.includes("user-profile-admin-chrome"), "admin chrome testid");
assert(page.includes('data-slot="appBar"'), "appBar slot");
assert(page.includes('data-slot="header"'), "header slot");
assert(page.includes('data-slot="tabBar"'), "tabBar slot");
assert(page.includes('data-slot="tabBody"'), "tabBody slot");
assert(page.includes("tab-slot--selected") || page.includes("aria-selected"), "selected Overview tab");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no API path");

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "brand background");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand primary");
assert(css.includes("pointer-events: none"), "inert chrome");
assert(css.includes("border-radius: 50%") || css.includes("border-radius:50%"), "avatar circle");
assert(css.includes("min-height: 44px"), "touch Edit chrome");

assert(
  pkg.includes("test:user-profile-layout"),
  "package.json script registered",
);

if (failures.length) {
  console.error("User profile LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("User profile LAYOUT checks PASS");
