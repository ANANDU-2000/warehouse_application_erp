/**
 * Staff search /staff/search STATES smoke.
 * Run: node scripts/check-staff-search-states.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/staff/search/staffSearchCopy.ts");
const subPath = join(
  root,
  "src/features/staff/search/staffSearchLoadSubtitle.ts",
);
const pagePath = join(root, "src/features/staff/search/StaffSearchPage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(subPath), "load subtitle exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

const required = [
  ["Search failed", "FAILED"],
  ["Tap to retry.", "RETRY_SUB"],
  ["Updating results…", "UPDATING"],
  [
    "Search is taking longer than expected. You can keep navigating or try a recent item.",
    "SLOW",
  ],
  ["Session expired. Please log in again.", "401"],
  ["No connection. Check your network and try again.", "NET"],
  ["Server error. Please try again shortly.", "5XX"],
];

for (const [literal, name] of required) {
  assert(
    copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`),
    name,
  );
}

assert(copy.includes("STAFF_SEARCH_CACHE_TTL_MS = 12_000"), "12s TTL");
assert(sub.includes("mapStaffSearchLoadSubtitle"), "subtitle mapper");
assert(sub.includes("StaffSearchNetworkError"), "network");
assert(sub.includes("case 401"), "401");

assert(page.includes("mapStaffSearchLoadSubtitle"), "uses mapper");
assert(page.includes("staff-search-error"), "error testid");
assert(page.includes("staff-search-retry"), "retry");
assert(page.includes("staff-search-loading"), "loading");
assert(page.includes("staff-search-loading-fallback"), "slow fallback");
assert(page.includes("searchReloading"), "reload gate");
assert(page.includes("showResults"), "results gate");
assert(page.includes("onTouchEnd"), "pull refresh");
assert(page.includes("STAFF_SEARCH_CACHE_TTL_MS"), "uses TTL");
assert(page.includes("friendly-error"), "FriendlyLoadError chrome");
assert(!page.includes('setError(STAFF_SEARCH_FAILED)'), "no raw WIRE string error");

assert(pkg.includes("test:staff-search-states"), "package script");

if (failures.length) {
  console.error("Staff search STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff search STATES checks PASS");
