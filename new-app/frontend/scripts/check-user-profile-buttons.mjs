/**
 * Users /settings/users/:userId BUTTONS smoke.
 * Run: node scripts/check-user-profile-buttons.mjs
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
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('USER_PROFILE_BACK_FALLBACK = "/settings/users"'), "back fallback");
assert(copy.includes('USER_PROFILE_SAVE_CHANGES = "Save changes"'), "Save changes");
assert(copy.includes('USER_PROFILE_SAVE_PERMISSIONS = "Save permissions"'), "Save permissions");
assert(copy.includes('USER_PROFILE_MORE_RESET = "Reset password"'), "Reset password");
assert(copy.includes('USER_PROFILE_MORE_COPY_EMAIL = "Copy email"'), "Copy email");
assert(copy.includes('USER_PROFILE_DELETE_TITLE = "Delete user?"'), "Delete user?");
assert(
  copy.includes(
    'USER_PROFILE_DELETE_BODY =\n  "User will be deactivated. Audit history is kept."',
  ) ||
    copy.includes(
      "User will be deactivated. Audit history is kept.",
    ),
  "delete body",
);
assert(copy.includes('USER_PROFILE_FIELD_PHONE = "Phone"'), "Phone label");
assert(copy.includes('USER_PROFILE_ROLE_ADMIN = "Admin"'), "Admin role");

assert(page.includes("function popOrGo"), "popOrGo");
assert(page.includes("USER_PROFILE_BACK_FALLBACK"), "uses back fallback");
assert(page.includes("user-profile-back"), "back button");
assert(page.includes("user-profile-edit"), "edit button");
assert(page.includes("user-profile-more"), "more button");
assert(page.includes("user-profile-edit-sheet"), "edit sheet");
assert(page.includes("user-profile-save-changes"), "save changes");
assert(page.includes("user-profile-save-permissions"), "save permissions");
assert(page.includes("user-profile-delete-dialog"), "delete dialog");
assert(page.includes("onSaveChanges"), "save stub");
assert(page.includes("onMoreAction"), "more stub");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no API path");

assert(
  pkg.includes("test:user-profile-buttons"),
  "package.json script registered",
);

if (failures.length) {
  console.error("User profile BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("User profile BUTTONS checks PASS");
