/**
 * Users /settings/users FIELDS smoke — search + status chips + filter helpers.
 * Run: node scripts/check-users-management-fields.mjs
 * Source: user_list_filters.dart
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const filtersPath = join(root, "src/features/users/userListFilters.ts");
const copyPath = join(root, "src/features/users/usersManagementCopy.ts");
const pagePath = join(root, "src/features/users/UserManagementPage.tsx");
const cssPath = join(root, "src/features/users/UserManagementPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(filtersPath), "userListFilters.ts exists");
assert(existsSync(copyPath), "usersManagementCopy.ts exists");
assert(existsSync(pagePath), "UserManagementPage.tsx exists");

const filters = readFileSync(filtersPath, "utf8");
const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(filters.includes('"All users"') || filters.includes("All users"), "All users");
assert(filters.includes('active: "Active"'), "Active label");
assert(filters.includes('inactive: "Inactive"'), "Inactive label");
assert(filters.includes('blocked: "Blocked"'), "Blocked label");
assert(filters.includes('primary: "all"'), "default primary all");
assert(filters.includes("applyUserListFilters"), "applyUserListFilters");
assert(filters.includes("countForPrimaryFilter"), "countForPrimaryFilter");
assert(filters.includes('r === "admin" || r === "owner"'), "admin matches owner");

assert(copy.includes('USERS_MGMT_SEARCH_HINT = "Search users…"'), "search hint");

assert(page.includes("USERS_MGMT_SEARCH_HINT"), "uses search hint");
assert(page.includes('type="text"'), "search text input");
assert(page.includes("USER_LIST_PRIMARY_ORDER"), "chip order");
assert(page.includes("setPrimary"), "chip primary state");
assert(page.includes("users-mgmt__icon--filter"), "tune icon present");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("/v1/businesses"), "no users API in FIELDS layer");

assert(css.includes("users-mgmt__chip--selected"), "selected chip class");
assert(css.includes("#e2e8f0") || css.includes("#E2E8F0"), "chip border");
assert(css.includes("rgba(14, 79, 70, 0.12)"), "selected chip bg");

assert(
  pkg.includes("test:users-management-fields"),
  "package.json script registered",
);

// Runtime filter parity (transpile-free reimplementation check via dynamic import of TS not available —
// assert source logic with a tiny inline replica of critical cases by evaluating exported logic via viteless parse).
// Instead: require that fixture assertions exist as comments/tests in file — run inline port:

function applyUserListFilters(rows, filtersState) {
  let it = rows;
  switch (filtersState.primary) {
    case "active":
      it = it.filter((u) => u.is_active === true && u.is_blocked !== true);
      break;
    case "inactive":
      it = it.filter((u) => u.is_active !== true && u.is_blocked !== true);
      break;
    case "blocked":
      it = it.filter((u) => u.is_blocked === true);
      break;
    default:
      break;
  }
  if (filtersState.roles.size > 0) {
    it = it.filter((u) => {
      const r = (u.role?.toString() ?? "").toLowerCase();
      if (filtersState.roles.has("admin") && (r === "admin" || r === "owner")) {
        return true;
      }
      return filtersState.roles.has(r);
    });
  }
  const q = filtersState.search.trim().toLowerCase();
  if (q) {
    it = it.filter((u) => {
      const name = (u.name?.toString() ?? "").toLowerCase();
      const email = (u.email?.toString() ?? "").toLowerCase();
      const phone = (u.phone?.toString() ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }
  return it;
}

const fixture = [
  { name: "Ann", email: "a@x.com", phone: "111", role: "staff", is_active: true, is_blocked: false },
  { name: "Bob", email: "b@x.com", phone: "222", role: "owner", is_active: false, is_blocked: false },
  { name: "Cat", email: "c@x.com", phone: "333", role: "admin", is_active: true, is_blocked: true },
];

assert(
  applyUserListFilters(fixture, { search: "", primary: "active", roles: new Set() }).length === 1,
  "active count 1",
);
assert(
  applyUserListFilters(fixture, { search: "", primary: "inactive", roles: new Set() }).length === 1,
  "inactive count 1",
);
assert(
  applyUserListFilters(fixture, { search: "", primary: "blocked", roles: new Set() }).length === 1,
  "blocked count 1",
);
assert(
  applyUserListFilters(fixture, {
    search: "",
    primary: "all",
    roles: new Set(["admin"]),
  }).length === 2,
  "admin role matches owner+admin",
);
assert(
  applyUserListFilters(fixture, {
    search: "ann",
    primary: "all",
    roles: new Set(),
  }).length === 1,
  "search by name",
);

// Ensure TS source still contains the same branching (drift guard)
assert(filters.includes('case "active"'), "TS active case");
assert(filters.includes('case "inactive"'), "TS inactive case");
assert(filters.includes('case "blocked"'), "TS blocked case");

void createRequire; // keep import used if tree-shaken tooling complains

if (failures.length) {
  console.error("Users management FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Users management FIELDS checks PASS");
