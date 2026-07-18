/**
 * Owner /home/breakdown-more STATES smoke checks.
 * Run: node scripts/check-home-breakdown-states.mjs
 * Source: home_breakdown_list_page.dart — spinner cold load; silent empty; no FriendlyLoadError.
 */
import { readFileSync } from "node:fs";
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
const css = readFileSync(
  join(root, "src/features/home/HomeBreakdownListPage.css"),
  "utf8",
);

assert(page.includes("showColdSpinner"), "cold-load spinner branch");
assert(
  page.includes("home-breakdown-cold-spinner") ||
    page.includes("home-breakdown-page__cold-load"),
  "cold spinner testid/class",
);
assert(page.includes("emptyOverviewSeed"), "empty seed on fail/no session");
assert(page.includes("fetchHomeOverview"), "still wires home-overview");
assert(
  !page.includes("function FriendlyLoadError") &&
    !page.includes("<FriendlyLoadError"),
  "no FriendlyLoadError component on this route",
);
assert(!page.includes("HomeSectionSkeleton"), "no skeleton rows");
assert(!page.includes("Could not load breakdown"), "no raw/fixed load-error alert");
assert(!page.includes("HOME_BREAKDOWN_LOADING"), "no WIRE Loading… paragraph");
assert(!page.includes("loadError"), "no loadError state");
assert(
  !page.includes("No category breakdown for this period"),
  "no home analytics empty hint on this page",
);
assert(
  !page.includes("No activity in this period"),
  "no activity empty copy",
);
assert(!page.includes("/dashboard?"), "no month dashboard");
assert(!page.includes('"/dashboard"'), "no /dashboard string");

assert(css.includes("home-breakdown-page__cold-load"), "cold-load CSS");
assert(css.includes("home-breakdown-page__spinner-ring"), "spinner ring CSS");
assert(css.includes("@keyframes home-breakdown-spin"), "spin keyframes");

if (failures.length) {
  console.error("Home breakdown STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home breakdown STATES checks PASS");
