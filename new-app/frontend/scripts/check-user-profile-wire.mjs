/**
 * Users /settings/users/:userId WIRE smoke.
 * Run: node scripts/check-user-profile-wire.mjs
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
const pagePath = join(root, "src/features/users/UserProfilePage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "usersApi.ts");
assert(existsSync(pagePath), "page exists");

const api = readFileSync(apiPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("getBusinessUser"), "getBusinessUser");
assert(api.includes("patchBusinessUser"), "patchBusinessUser");
assert(api.includes("deleteBusinessUser"), "deleteBusinessUser");
assert(api.includes("resetBusinessUserPassword"), "resetBusinessUserPassword");
assert(api.includes("getUserPermissions"), "getUserPermissions");
assert(api.includes("patchUserPermissions"), "patchUserPermissions");
assert(api.includes("/reset-password"), "reset-password path");
assert(api.includes("/permissions"), "permissions path");
assert(api.includes('method: "GET"'), "GET");
assert(api.includes('method: "PATCH"'), "PATCH");
assert(api.includes('method: "DELETE"'), "DELETE");
assert(api.includes('method: "POST"'), "POST reset");
assert(!api.includes("/dashboard"), "no invented dashboard");

assert(page.includes("getBusinessUser"), "page loads profile");
assert(page.includes("patchBusinessUser"), "page patches");
assert(page.includes("deleteBusinessUser"), "page deletes");
assert(page.includes("resetBusinessUserPassword"), "page reset");
assert(page.includes("getUserPermissions"), "page get perms");
assert(page.includes("patchUserPermissions"), "page patch perms");
assert(page.includes("USER_PROFILE_LOAD_ERROR") || page.includes("Could not load user"), "load error");
assert(page.includes("USER_PROFILE_NOT_FOUND") || page.includes("User not found"), "not found");
assert(page.includes("stats"), "binds stats");
assert(!page.includes("listUserActivity"), "no activity invent");
assert(!page.includes("stock-adjustments"), "activity stock deferred");

assert(
  pkg.includes("test:user-profile-wire"),
  "package.json script registered",
);

if (failures.length) {
  console.error("User profile WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("User profile WIRE checks PASS");
