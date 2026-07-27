/**
 * Users /settings/users/:userId FIELDS smoke.
 * Run: node scripts/check-user-profile-fields.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const fieldsPath = join(root, "src/features/users/userProfileFields.ts");
const copyPath = join(root, "src/features/users/userProfileCopy.ts");
const pagePath = join(root, "src/features/users/UserProfilePage.tsx");
const activityPath = join(root, "src/features/users/UserActivityPanel.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(fieldsPath), "userProfileFields.ts");
assert(existsSync(pagePath), "page exists");
assert(existsSync(activityPath), "UserActivityPanel exists");

const fields = readFileSync(fieldsPath, "utf8");
const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const activity = readFileSync(activityPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(fields.includes('"Purchases"'), "KPI Purchases");
assert(fields.includes('"Stock updates"'), "KPI Stock updates");
assert(fields.includes('"Items created"'), "KPI Items created");
assert(fields.includes('"Scans"'), "KPI Scans");
assert(fields.includes('"All activity"'), "All activity");
assert(fields.includes('"Stock"'), "activity Stock");
assert(fields.includes('"Ledger"'), "activity Ledger");
assert(fields.includes('"Inventory"'), "perm Inventory");
assert(fields.includes('"Edit stock"'), "Edit stock");
assert(fields.includes('"Manage users"'), "Manage users");
assert(fields.includes("stock_edit"), "stock_edit key");
assert(fields.includes("user_manage"), "user_manage key");

assert(copy.includes('USER_PROFILE_NAME_EMPTY = "—"'), "name empty");
assert(copy.includes('USER_PROFILE_LAST_ACTIVE_PREFIX = "Last active: "'), "last active prefix");
assert(copy.includes('USER_PROFILE_WAREHOUSE_PREFIX = "Warehouse: "'), "warehouse prefix");

assert(page.includes("USER_PROFILE_KPI_ORDER"), "uses KPI order");
assert(
  page.includes("UserActivityPanel") || activity.includes("USER_ACTIVITY_SECTION_ORDER"),
  "uses activity order",
);
assert(activity.includes("USER_ACTIVITY_SECTION_ORDER"), "activity panel order");
assert(page.includes("USER_PERMISSION_GROUPS"), "uses permission groups");
assert(page.includes("setTab"), "tab local state");
assert(page.includes("setActivitySection"), "activity section state");
assert(page.includes("userLastActiveLabel"), "last active helper");
assert(page.includes("displayUserRole"), "role helper");
assert(page.includes("user-profile-kpi-grid"), "kpi grid testid");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no API path");

assert(
  pkg.includes("test:user-profile-fields"),
  "package.json script registered",
);

if (failures.length) {
  console.error("User profile FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("User profile FIELDS checks PASS");
