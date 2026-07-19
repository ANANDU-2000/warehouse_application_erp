/**
 * Staff activity /staff/activity FIELDS smoke.
 * Run: node scripts/check-staff-activity-fields.mjs
 * Source: SegmentedButton onSelectionChanged → today|week|month
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

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
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  page.includes("FIELDS") || page.includes("BUTTONS") || page.includes("WIRE"),
  "FIELDS+ header",
);
assert(page.includes("useState"), "useState");
assert(page.includes("setPeriod"), "setPeriod");
assert(page.includes("STAFF_ACT_DEFAULT_PERIOD"), "default period");
assert(page.includes('data-action="select-period"'), "select-period");
assert(page.includes("staff-act-periods--active"), "periods active");
assert(page.includes('data-period={period}'), "page data-period");
assert(page.includes('data-period={key}'), "chip data-period");
assert(!page.includes("staff-act-periods--inert"), "not inert");
assert(!page.includes('data-deferred="period-select"'), "period not deferred");
assert(
  page.includes('data-deferred="activity-rows"') ||
    page.includes("fetchStaffActivityLog"),
  "rows deferred or WIRE",
);
assert(
  page.includes("fetchStaffActivityLog") || !page.includes("fetch("),
  "no raw fetch unless WIRE",
);

assert(copy.includes('"today"'), "today");
assert(copy.includes('"week"'), "week");
assert(copy.includes('"month"'), "month");

assert(css.includes("staff-act-periods--active"), "active css");
assert(css.includes("cursor: pointer"), "pointer cursor");

assert(pkg.includes("test:staff-activity-fields"), "package script");

for (const name of [
  "check-staff-activity-scaffold.mjs",
  "check-staff-activity-layout.mjs",
]) {
  const r = spawnSync(process.execPath, [join(root, "scripts", name)], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    failures.push(`${name} FAILED`);
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
  }
}

if (failures.length) {
  console.error("Staff activity FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff activity FIELDS checks PASS");
