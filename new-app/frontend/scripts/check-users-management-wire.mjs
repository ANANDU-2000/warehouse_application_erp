/**
 * Users /settings/users WIRE smoke.
 * Run: node scripts/check-users-management-wire.mjs
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
const pagePath = join(root, "src/features/users/UserManagementPage.tsx");
const cardPath = join(root, "src/features/users/UserCompactCard.tsx");
const lastPath = join(root, "src/features/users/userLastActive.ts");
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "usersApi.ts");
assert(existsSync(cardPath), "UserCompactCard.tsx");
assert(existsSync(lastPath), "userLastActive.ts");

const api = readFileSync(apiPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const last = readFileSync(lastPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("/users?"), "list path query");
assert(api.includes('include_inactive'), "include_inactive");
assert(api.includes('method: "GET"'), "GET list");
assert(api.includes('method: "POST"'), "POST create/bulk");
assert(api.includes("/users/bulk"), "bulk path");
assert(api.includes("full_name"), "create full_name");
assert(api.includes("listBusinessUsers"), "listBusinessUsers export");
assert(api.includes("createBusinessUser"), "createBusinessUser export");
assert(api.includes("bulkBusinessUsers"), "bulkBusinessUsers export");
assert(!api.includes("/dashboard"), "no dashboard invent");

assert(page.includes("listBusinessUsers"), "page uses list");
assert(page.includes("createBusinessUser"), "page uses create");
assert(page.includes("bulkBusinessUsers"), "page uses bulk");
assert(page.includes("UserCompactCard"), "renders cards");
assert(page.includes("includeInactive: true") || page.includes("include_inactive"), "inactive true");
assert(page.includes("USERS_MGMT_EMPTY_FILTERS") || page.includes("No users match"), "empty copy");

assert(last.includes("Never active"), "Never active");
assert(last.includes("Created recently"), "Created recently");
assert(last.includes("5 * 60 * 1000") || last.includes("minutes"), "online 5min");

assert(router.includes("/settings/users/:userId"), "profile stub route");
assert(
  pkg.includes("test:users-management-wire"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Users management WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Users management WIRE checks PASS");
