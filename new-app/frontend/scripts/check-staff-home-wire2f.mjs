/**
 * Staff /staff/home WIRE-2f — Pull-refresh + light auto-refresh.
 * Run: node scripts/check-staff-home-wire2f.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

function canStaffHomeLightRefresh(lastAt, nowMs, debounceMs = 25_000) {
  if (lastAt == null) return true;
  return nowMs - lastAt >= debounceMs;
}

assert(canStaffHomeLightRefresh(null, 1000), "first light ok");
assert(!canStaffHomeLightRefresh(1000, 2000, 25_000), "debounce blocks");
assert(canStaffHomeLightRefresh(1000, 1000 + 25_000, 25_000), "debounce ok");

const helper = readFileSync(
  join(root, "src/features/staff/staffHomeRefresh.ts"),
  "utf8",
);
const page = readFileSync(
  join(root, "src/features/staff/StaffHomePage.tsx"),
  "utf8",
);
const css = readFileSync(
  join(root, "src/features/staff/StaffHomePage.css"),
  "utf8",
);

assert(helper.includes("STAFF_HOME_AUTO_REFRESH_MS"), "2min const");
assert(helper.includes("2 * 60 * 1000"), "2 min ms");
assert(helper.includes("STAFF_HOME_LIGHT_REFRESH_DEBOUNCE_MS"), "25s const");
assert(helper.includes("25_000"), "25s ms");
assert(helper.includes("canStaffHomeLightRefresh"), "debounce helper");

assert(page.includes("reloadAll"), "reloadAll");
assert(page.includes("refreshLight"), "refreshLight");
assert(page.includes("STAFF_HOME_AUTO_REFRESH_MS"), "uses 2min");
assert(page.includes("visibilitychange"), "visibility listener");
assert(page.includes("onTouchStart"), "pull touch start");
assert(page.includes("STAFF_HOME_PULL_THRESHOLD_PX"), "pull threshold");
assert(page.includes("staff-home-pull-indicator"), "pull indicator");
assert(page.includes("onPullRefresh"), "onPullRefresh");
assert(!page.includes("home-overview"), "no home-overview");

assert(css.includes("staff-home-pull-spinner"), "pull CSS");

assert(
  existsSync(join(root, "../../docs/modules/staff_home_wire2f_compare.md")),
  "staff_home_wire2f_compare.md",
);

if (failures.length) {
  console.error("Staff home WIRE-2f checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home WIRE-2f checks PASS");
