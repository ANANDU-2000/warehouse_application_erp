/**
 * Staff /staff/home STATES — exact Flutter string match.
 * Run: node scripts/check-staff-home-states.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/staff/staffHomeLoadCopy.ts");
assert(existsSync(copyPath), "staffHomeLoadCopy.ts exists");

const copy = readFileSync(copyPath, "utf8");
const required = [
  ["Could not load floor counts", "FLOOR_LOAD_ERROR"],
  ["Retry", "RETRY_LABEL"],
  ["Tap to retry.", "RETRY_SUBTITLE"],
  ["Session expired — sign in again", "SESSION_EXPIRED"],
  ["No connection", "NO_CONNECTION"],
  ["No activity yet today — tap Scan above.", "ACTIVITY_EMPTY"],
  ["Could not load recent activity.", "ACTIVITY_ERROR"],
  ["No activity today", "SHIFT_EMPTY"],
];
for (const [literal, name] of required) {
  assert(copy.includes(`"${literal}"`), name);
}

const page = readFileSync(
  join(root, "src/features/staff/StaffHomePage.tsx"),
  "utf8",
);
assert(page.includes("STAFF_HOME_FLOOR_LOAD_ERROR"), "uses floor error");
assert(page.includes("STAFF_HOME_SESSION_EXPIRED"), "uses session expired");
assert(page.includes("STAFF_HOME_NO_CONNECTION"), "uses no connection");
assert(page.includes("STAFF_HOME_RETRY_LABEL"), "uses Retry");
assert(page.includes("STAFF_HOME_ACTIVITY_EMPTY"), "uses activity empty");
assert(page.includes("STAFF_HOME_SHIFT_EMPTY"), "uses shift empty");
assert(page.includes("StaffFloorKpiSkeleton"), "floor skeleton");
assert(page.includes("FriendlyLoadError"), "friendly error");
assert(page.includes("SectionInlineError"), "inline error");
assert(page.includes("onSessionExpiredRetry"), "session retry");
assert(page.includes('navigate("/login"'), "session → login");
assert(page.includes("reloadShell"), "retry reload");
assert(page.includes("disabled={loading}"), "disabled while loading");
assert(!page.includes("home-overview"), "no home-overview");

const css = readFileSync(
  join(root, "src/features/staff/StaffHomePage.css"),
  "utf8",
);
assert(css.includes("staff-home-kpi-skel"), "skeleton CSS");
assert(css.includes("height: 88px"), "skeleton height 88");
assert(css.includes("#e8ecef") || css.includes("#E8ECEF"), "shimmer base");

if (failures.length) {
  console.error("Staff home STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home STATES checks PASS");
