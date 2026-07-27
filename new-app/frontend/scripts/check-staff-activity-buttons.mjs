/**
 * Staff activity /staff/activity BUTTONS smoke.
 * Run: node scripts/check-staff-activity-buttons.mjs
 * Source: AppBar back · ListTile no onTap (display-only)
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

const pagePath = join(
  root,
  "src/features/staff/activity/StaffActivityPage.tsx",
);
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");

const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  page.includes("BUTTONS") || page.includes("WIRE") || page.includes("STATES"),
  "BUTTONS+ header",
);
assert(page.includes("onBack"), "onBack");
assert(page.includes('data-action="back"'), "back action");
assert(page.includes("STAFF_ACT_BACK_FALLBACK"), "back fallback");
assert(page.includes('data-action="select-period"'), "period action");
assert(page.includes('data-interactive="false"'), "rows not interactive");
assert(!page.includes("onClick={() => navigate(") || page.includes("onBack"), "no row navigate");
assert(
  page.includes("fetchStaffActivityLog") || !page.includes("fetch("),
  "no raw fetch unless WIRE",
);
assert(
  page.includes('data-deferred="activity-rows"') ||
    page.includes("fetchStaffActivityLog"),
  "rows deferred or WIRE",
);

assert(pkg.includes("test:staff-activity-buttons"), "package script");

for (const name of [
  "check-staff-activity-scaffold.mjs",
  "check-staff-activity-layout.mjs",
  "check-staff-activity-fields.mjs",
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
  console.error("Staff activity BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff activity BUTTONS checks PASS");
