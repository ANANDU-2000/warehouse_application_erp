/**
 * Staff activity /staff/activity STATES smoke.
 * Run: node scripts/check-staff-activity-states.mjs
 * Source: ListSkeleton(10) · HexaErrorCard.fromError · loadStateErrorSubtitle
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
const subPath = join(
  root,
  "src/features/staff/activity/staffActivityLoadSubtitle.ts",
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
assert(existsSync(subPath), "load subtitle exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_ACT_LOAD_FAILED = "Could not load activity"'), "title");
assert(copy.includes('STAFF_ACT_RETRY_SUBTITLE = "Tap to retry."'), "retry sub");
assert(copy.includes('STAFF_ACT_RETRY = "Retry"'), "Retry");
assert(copy.includes("STAFF_ACT_SKELETON_ROWS = 10"), "skel 10");
assert(copy.includes("STAFF_ACT_SKELETON_HEIGHT_PX = 84"), "h84");
assert(
  copy.includes("Invalid request. Please check your input."),
  "sub 400",
);
assert(
  copy.includes("Session expired. Please log in again."),
  "sub 401",
);
assert(
  copy.includes("No connection. Check your network and try again."),
  "sub net",
);

assert(sub.includes("mapStaffActLoadTitle"), "title mapper");
assert(sub.includes("mapStaffActLoadSubtitle"), "subtitle mapper");
assert(sub.includes("STAFF_ACT_LOAD_FAILED"), "fixed title");
assert(sub.includes("StaffActNetworkError"), "network");
assert(sub.includes("StaffActApiError"), "api error");

assert(page.includes("STATES"), "STATES header");
assert(page.includes("mapStaffActLoadTitle"), "uses title");
assert(page.includes("mapStaffActLoadSubtitle"), "uses subtitle");
assert(page.includes("showInitialSkeleton"), "skeleton gate");
assert(page.includes("staff-act-skeleton"), "skeleton class");
assert(page.includes("ListSkeleton"), "ListSkeleton aria");
assert(page.includes("staff-act-friendly-error"), "FriendlyLoadError");
assert(page.includes("staff-act-loading") === false || page.includes("staff-act-skeleton"), "skeleton not plain text");
assert(page.includes('data-testid="staff-act-loading"'), "loading testid");
assert(page.includes('data-testid="staff-act-error"'), "error testid");
assert(page.includes('data-testid="staff-act-retry"'), "retry testid");
assert(page.includes("STAFF_ACT_SKELETON_ROWS"), "uses row count");
assert(page.includes("fetchStaffActivityLog"), "still wired");
assert(!page.includes("onTouchStart") && !page.includes("onTouchEnd"), "no pull (Flutter none)");
assert(!page.includes("CACHE_TTL"), "no keepAlive (autoDispose)");

assert(css.includes("staff-act-skeleton"), "skeleton css");
assert(css.includes("staff-act-friendly-error"), "friendly error css");
assert(css.includes("#eff2f1") || css.includes("#EFF2F1"), "skeleton base");

assert(pkg.includes("test:staff-activity-states"), "package script");

for (const name of [
  "check-staff-activity-scaffold.mjs",
  "check-staff-activity-layout.mjs",
  "check-staff-activity-fields.mjs",
  "check-staff-activity-buttons.mjs",
  "check-staff-activity-wire.mjs",
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
  console.error("Staff activity STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff activity STATES checks PASS");
