/**
 * Staff activity /staff/activity SCAFFOLD smoke.
 * Run: node scripts/check-staff-activity-scaffold.mjs
 * Source: staff_activity_page.dart
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(
  root,
  "src/features/staff/activity/staffActivityCopy.ts",
);
const pagePath = join(
  root,
  "src/features/staff/activity/StaffActivityPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/activity/StaffActivityPage.css",
);
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_ACT_TITLE = "My activity"'), "title");
assert(
  copy.includes('STAFF_ACT_BACK_FALLBACK = "/staff/home"'),
  "back fallback",
);
assert(copy.includes('STAFF_ACT_PERIOD_TODAY = "Today"'), "Today");
assert(copy.includes('STAFF_ACT_PERIOD_WEEK = "Week"'), "Week");
assert(copy.includes('STAFF_ACT_PERIOD_MONTH = "Month"'), "Month");
assert(
  copy.includes('STAFF_ACT_EMPTY = "No activity in this period"'),
  "empty",
);
assert(
  copy.includes("Scans, stock updates, and purchases appear here."),
  "empty sub",
);
assert(
  copy.includes('STAFF_ACT_LOAD_FAILED = "Could not load activity"'),
  "load failed copy",
);
assert(copy.includes('STAFF_ACT_DEFAULT_PERIOD: StaffActPeriod = "today"'), "default today");

assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="periods"'), "periods");
assert(page.includes('data-slot="empty"'), "empty");
assert(page.includes('data-deferred="period-select"'), "period deferred");
assert(page.includes('data-deferred="activity-rows"'), "rows deferred");
assert(page.includes("STAFF_ACT_BACK_FALLBACK"), "back");
assert(page.includes("STAFF_ACT_EMPTY"), "empty copy");
assert(page.includes("disabled"), "periods disabled");
assert(!page.includes("fetch("), "no fetch");

assert(css.includes("staff-act-page"), "page css");
assert(css.includes("staff-act-period--selected"), "selected period");
assert(css.includes("staff-act-empty"), "empty css");

assert(router.includes("StaffActivityPage"), "router import");
assert(router.includes('path="/staff/activity"'), "route");
assert(!router.includes('title="Staff activity"'), "no stub title");

assert(pkg.includes("test:staff-activity-scaffold"), "package script");

if (failures.length) {
  console.error("Staff activity SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff activity SCAFFOLD checks PASS");
