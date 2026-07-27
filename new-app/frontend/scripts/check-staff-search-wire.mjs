/**
 * Staff search /staff/search WIRE smoke.
 * Run: node scripts/check-staff-search-wire.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const apiPath = join(root, "src/features/staff/search/staffSearchApi.ts");
const pagePath = join(root, "src/features/staff/search/StaffSearchPage.tsx");
const recentsPath = join(root, "src/features/staff/search/staffSearchRecents.ts");
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");
const backendSearch = join(
  root,
  "../backend/src/repositories/search.repository.ts",
);
const backendRoute = join(root, "../backend/src/routes/search.routes.ts");

assert(existsSync(apiPath), "api exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(backendSearch), "backend search repo");
assert(existsSync(backendRoute), "backend search routes");

const api = readFileSync(apiPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const recents = readFileSync(recentsPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");
const repo = readFileSync(backendSearch, "utf8");

assert(api.includes("fetchUnifiedSearch"), "fetchUnifiedSearch");
assert(api.includes("/search?"), "search path");
assert(page.includes("fetchUnifiedSearch"), "page calls API");
assert(page.includes("addRecentSearchQuery"), "addRecent on success");
assert(page.includes("staff-search-item-row"), "item rows");
assert(page.includes("staff-search-bill-row"), "bill rows");
assert(page.includes("/catalog/item/"), "item nav");
assert(page.includes("/staff/purchase-history/"), "bill nav staff");
assert(page.includes("STAFF_SEARCH_FUZZY_CATALOG_STAFF"), "fuzzy banner");
assert(recents.includes("addRecentSearchQuery"), "addRecent helper");
assert(repo.includes("unifiedSearch"), "repo unifiedSearch");
assert(repo.includes("fuzzy_catalog_used"), "fuzzy flag");
assert(repo.includes("catalog_subcategories"), "subcategories");
assert(repo.includes("recent_purchases"), "recent purchases");
assert(router.includes("purchase-history/:purchaseId"), "history detail stub");
assert(pkg.includes("test:staff-search-wire"), "package script");

if (failures.length) {
  console.error("Staff search WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff search WIRE checks PASS");
