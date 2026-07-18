/**
 * Owner /home/breakdown-more WIRE smoke checks.
 * Run: node scripts/check-home-breakdown-wire.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const page = readFileSync(
  join(root, "src/features/home/HomeBreakdownListPage.tsx"),
  "utf8",
);
const api = readFileSync(
  join(root, "src/features/home/homeOverviewApi.ts"),
  "utf8",
);
const units = readFileSync(
  join(root, "src/features/home/homeBreakdownUnits.ts"),
  "utf8",
);

assert(page.includes("fetchHomeOverview"), "uses fetchHomeOverview");
assert(page.includes("homePeriodApiDates"), "period dates");
assert(page.includes("formatRupee"), "INR format");
assert(page.includes("categoryRows") || page.includes("categories"), "categories");
assert(page.includes("home_shell") || page.includes("shellRows"), "home_shell");
assert(page.includes("breakdownRowMatchesQuery"), "search filter");
assert(page.includes("HOME_BREAKDOWN_LOADING") || page.includes("Loading…"), "loading");
assert(!page.includes("/dashboard?"), "no month dashboard path");
assert(!page.includes('"/dashboard"'), "no /dashboard string");

assert(api.includes("home-overview"), "home-overview path");
assert(api.includes("shell_bundle"), "shell_bundle");
assert(api.includes("categories"), "categories type");
assert(api.includes("home_shell"), "home_shell type");

assert(units.includes("homePackUnitWord"), "pack unit word");
assert(units.includes("dashboardUnitsLineFromOverview"), "units line");
assert(units.includes("BREAKDOWN_DOT_COLORS"), "dot colors");

if (failures.length) {
  console.error("Home breakdown WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home breakdown WIRE checks PASS");
