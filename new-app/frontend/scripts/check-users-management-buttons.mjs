/**
 * Users /settings/users BUTTONS smoke.
 * Run: node scripts/check-users-management-buttons.mjs
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
const pagePath = join(root, "src/features/users/UserManagementPage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('USERS_MGMT_BACK_FALLBACK = "/settings"'), "back fallback /settings");
assert(copy.includes('USERS_MGMT_FILTER_HEADING = "Filter by role"'), "filter heading");
assert(copy.includes('USERS_MGMT_ROLE_ADMIN_OWNER = "Admin / Owner"'), "Admin / Owner");
assert(copy.includes('USERS_MGMT_FILTER_CLEAR = "Clear"'), "Clear");
assert(copy.includes('USERS_MGMT_FILTER_APPLY = "Apply"'), "Apply");
assert(copy.includes('USERS_MGMT_BULK_ACTIVATE = "Activate"'), "Activate");
assert(copy.includes('USERS_MGMT_BULK_DEACTIVATE = "Deactivate"'), "Deactivate");
assert(copy.includes('USERS_MGMT_BULK_BLOCK = "Block"'), "Block");
assert(copy.includes('USERS_MGMT_BULK_DELETE = "Delete"'), "Delete");
assert(copy.includes('USERS_MGMT_ADD_SHEET_TITLE = "Add user"'), "Add user");
assert(copy.includes('USERS_MGMT_CREATE_USER = "Create user"'), "Create user");

assert(page.includes("function popOrGo"), "popOrGo");
assert(page.includes("USERS_MGMT_BACK_FALLBACK"), "uses back fallback");
assert(page.includes("users-mgmt-back"), "back button");
assert(page.includes("users-mgmt-select"), "select button");
assert(page.includes("users-mgmt-refresh"), "refresh button");
assert(page.includes("users-mgmt-add"), "add button");
assert(page.includes("users-mgmt-filter"), "filter button");
assert(page.includes("users-mgmt-filter-drawer"), "filter drawer");
assert(page.includes("users-mgmt-create-sheet"), "create sheet");
assert(page.includes("users-mgmt-bulk-activate"), "bulk activate");
assert(page.includes("onBulkAction"), "bulk stub");
assert(page.includes("onCreateSubmit"), "create stub");
assert(page.includes("onRefresh"), "refresh stub");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no users API path");

assert(
  pkg.includes("test:users-management-buttons"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Users management BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Users management BUTTONS checks PASS");
