/**
 * Owner /home/activity FIELDS smoke checks.
 * Run: node scripts/check-home-activity-fields.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const pagePath = join(
  root,
  "src/features/home/HomeWarehouseActivityPage.tsx",
);
const copyPath = join(root, "src/features/home/homeActivityCopy.ts");
const periodPath = join(root, "src/features/home/homePeriod.ts");

assert(existsSync(pagePath), "page exists");
assert(existsSync(copyPath), "copy exists");
assert(existsSync(periodPath), "homePeriod exists");

const page = readFileSync(pagePath, "utf8");
const copy = readFileSync(copyPath, "utf8");
const period = readFileSync(periodPath, "utf8");
const css = readFileSync(
  join(root, "src/features/home/HomeWarehouseActivityPage.css"),
  "utf8",
);

assert(page.includes('useState<HomePeriod>("month")'), "default Month");
assert(page.includes("HOME_PERIOD_ORDER"), "chip order");
assert(page.includes("HOME_PERIOD_LABELS"), "chip labels");
assert(page.includes("homeActivityPeriodTitle"), "period list title");
assert(page.includes('type="date"'), "custom date inputs");
assert(page.includes("isValidCustomRange"), "custom validation");
assert(page.includes("selectPeriod"), "selectPeriod handler");
assert(page.includes("home-activity-page__period-chip"), "chip class");

assert(copy.includes("Recent activity (today)"), "title today");
assert(copy.includes("Recent activity (month)"), "title month");
assert(copy.includes("Recent activity (custom range)"), "title custom");
assert(
  copy.includes("From date must be on or before To date"),
  "custom error exact",
);

assert(period.includes('today: "Today"'), "Today label shared");
assert(period.includes("homePeriodRange"), "range helper shared");

assert(!page.includes("/dashboard?"), "no month dashboard UI");
/* WIRE may fetch via homeActivityFeed */

assert(css.includes("home-activity-page__period-chip--selected"), "selected");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand selected");

if (failures.length) {
  console.error("Home activity FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home activity FIELDS checks PASS");
