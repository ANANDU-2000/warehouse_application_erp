/**
 * Owner /home FIELDS smoke checks.
 * Run: node scripts/check-home-fields.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(
  existsSync(join(root, "src/features/home/homePeriod.ts")),
  "homePeriod.ts exists",
);
assert(
  existsSync(join(root, "src/features/home/HomePage.tsx")),
  "HomePage exists",
);

const period = readFileSync(
  join(root, "src/features/home/homePeriod.ts"),
  "utf8",
);
assert(period.includes('today: "Today"'), "Today label");
assert(period.includes('week: "Week"'), "Week label");
assert(period.includes('month: "Month"'), "Month label");
assert(period.includes('year: "Year"'), "Year label");
assert(period.includes('allTime: "All time"'), "All time label");
assert(period.includes('custom: "Custom"'), "Custom label");
assert(period.includes("homePeriodRange"), "range helper");
assert(period.includes("-29"), "month rolling 29");

const home = readFileSync(
  join(root, "src/features/home/HomePage.tsx"),
  "utf8",
);
assert(home.includes('useState<HomePeriod>("month")'), "default Month");
assert(
  home.includes("Applies to purchase center and warehouse activity"),
  "caption",
);
assert(home.includes("HOME_PERIOD_ORDER"), "chip order");
assert(home.includes("HOME_PERIOD_LABELS"), "chip labels");
assert(home.includes("home-page__period-chip"), "chip class");
assert(home.includes('type="date"'), "custom date inputs");
assert(home.includes("isValidCustomRange"), "custom validation");
assert(!home.includes("fetch("), "no fetch");
assert(!home.includes("home-overview"), "no home-overview");
assert(!home.includes("useNavigate"), "no navigate");

const css = readFileSync(
  join(root, "src/features/home/HomePage.css"),
  "utf8",
);
assert(css.includes("home-page__period-chip--selected"), "selected chip class");
assert(css.includes("#f1f5f9") || css.includes("#F1F5F9"), "unselected bg");

if (failures.length) {
  console.error("Home FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home FIELDS checks PASS");
