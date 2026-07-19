/**
 * Users /settings/users LAYOUT smoke — brand chrome + inert icons.
 * Run: node scripts/check-users-management-layout.mjs
 * Source: user_management_page.dart AppBar chrome; hexaColors
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
const cssPath = join(root, "src/features/users/UserManagementPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "usersManagementCopy.ts exists");
assert(existsSync(pagePath), "UserManagementPage.tsx exists");
assert(existsSync(cssPath), "UserManagementPage.css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('USERS_MGMT_TITLE = "Users"'), "title Users");
assert(copy.includes('USERS_MGMT_ADD_LABEL = "Add"'), "Add label");
assert(copy.includes('USERS_MGMT_TOOLTIP_REFRESH = "Refresh"'), "Refresh tooltip");
assert(copy.includes('USERS_MGMT_TOOLTIP_SELECT = "Select users"'), "Select tooltip");

assert(page.includes("USERS_MGMT_TITLE"), "uses title constant");
assert(page.includes("sessionCanManageUsers"), "manage gate");
assert(page.includes("sessionCanAdminUsers"), "admin visibility");
assert(page.includes("sessionCanCreateUsers"), "create visibility");
assert(page.includes("pointer-events") || css.includes("pointer-events: none"), "inert chrome");
assert(page.includes('data-slot="appBar"'), "appBar slot");
assert(page.includes('data-slot="searchFilter"'), "searchFilter slot");
assert(page.includes('data-slot="statusChips"'), "statusChips slot");
assert(page.includes('data-slot="list"'), "list slot");
assert(page.includes('data-slot="detailPanel"'), "detailPanel slot");
assert(page.includes('data-slot="bulkBar"'), "bulkBar slot");
assert(page.includes("users-mgmt__search-bar"), "search bar chrome");
assert(!/\bonClick\s*=/.test(page), "no onClick handlers");
assert(!page.includes("navigate("), "no navigate");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("<input"), "no input fields");
assert(!page.includes("<Input"), "no Input components");

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "brand background");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand primary");
assert(css.includes("#e5e7eb") || css.includes("#E5E7EB"), "border");
assert(css.includes("#f2f2f7") || css.includes("#F2F2F7"), "elevated chips strip");
assert(css.includes("border-radius: 12px"), "card radius 12");
assert(css.includes("font-size: 24px"), "title 24px");
assert(css.includes("font-weight: 800"), "title w800");
assert(css.includes("pointer-events: none"), "inert pointer-events");

assert(
  pkg.includes("test:users-management-layout"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Users management LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Users management LAYOUT checks PASS");
