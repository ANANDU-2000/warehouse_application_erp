/**
 * Staff deliveries /staff/deliveries STATES smoke.
 * Run: node scripts/check-staff-deliveries-states.mjs
 * Source: ListSkeleton(6) · FriendlyLoadError fixed message + Tap to retry.
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
  "src/features/staff/deliveries/staffDeliveriesCopy.ts",
);
const subPath = join(
  root,
  "src/features/staff/deliveries/staffDeliveriesLoadSubtitle.ts",
);
const pagePath = join(
  root,
  "src/features/staff/deliveries/StaffDeliveriesPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/deliveries/StaffDeliveriesPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(subPath), "load subtitle exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  copy.includes('STAFF_DEL_LOAD_FAILED = "Could not load pending deliveries"'),
  "title",
);
assert(copy.includes('STAFF_DEL_RETRY_SUBTITLE = "Tap to retry."'), "retry sub");
assert(copy.includes('STAFF_DEL_RETRY = "Retry"'), "Retry");
assert(copy.includes("STAFF_DEL_SKELETON_ROWS = 6"), "skel 6");
assert(copy.includes("STAFF_DEL_SKELETON_HEIGHT_PX = 84"), "h84");

assert(sub.includes("mapStaffDelLoadTitle"), "title mapper");
assert(sub.includes("mapStaffDelLoadSubtitle"), "subtitle mapper");
assert(sub.includes("STAFF_DEL_LOAD_FAILED"), "fixed title");
assert(sub.includes("STAFF_DEL_RETRY_SUBTITLE"), "fixed subtitle");

assert(page.includes("STATES"), "STATES header");
assert(page.includes("mapStaffDelLoadTitle"), "uses title");
assert(page.includes("mapStaffDelLoadSubtitle"), "uses subtitle");
assert(page.includes("showInitialSkeleton"), "skeleton gate");
assert(page.includes("staff-del-skeleton"), "skeleton class");
assert(page.includes("ListSkeleton"), "ListSkeleton aria");
assert(page.includes("staff-del-friendly-error"), "FriendlyLoadError");
assert(page.includes('data-testid="staff-del-loading"'), "loading testid");
assert(page.includes('data-testid="staff-del-error"'), "error testid");
assert(page.includes('data-testid="staff-del-retry"'), "retry testid");
assert(page.includes("STAFF_DEL_SKELETON_ROWS"), "uses row count");
assert(page.includes("fetchTradePurchasesRecent"), "still wired");
assert(page.includes("hasData"), "sections-null gate");
assert(!page.includes("Loading…"), "no plain Loading text");
assert(!page.includes("onTouchStart") && !page.includes("onTouchEnd"), "no pull");

assert(css.includes("staff-del-skeleton"), "skeleton css");
assert(css.includes("staff-del-friendly-error"), "friendly error css");
assert(css.includes("#eff2f1") || css.includes("#EFF2F1"), "skeleton base");

assert(pkg.includes("test:staff-deliveries-states"), "package script");

/* Unit: mappers */
function mapStaffDelLoadTitle() {
  return "Could not load pending deliveries";
}
function mapStaffDelLoadSubtitle() {
  return "Tap to retry.";
}
assert(
  mapStaffDelLoadTitle() === "Could not load pending deliveries",
  "unit title",
);
assert(mapStaffDelLoadSubtitle() === "Tap to retry.", "unit subtitle");

for (const name of [
  "check-staff-deliveries-scaffold.mjs",
  "check-staff-deliveries-layout.mjs",
  "check-staff-deliveries-fields.mjs",
  "check-staff-deliveries-buttons.mjs",
  "check-staff-deliveries-wire.mjs",
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
  console.error("Staff deliveries STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff deliveries STATES checks PASS");
