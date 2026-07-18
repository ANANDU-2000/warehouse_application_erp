/**
 * Staff /staff/home WIRE-2d — Recent activity feed.
 * Run: node scripts/check-staff-home-wire2d.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

/** Mirror staffActivityLabel */
function staffActivityLabel(actionType) {
  switch (actionType.toUpperCase()) {
    case "STAFF_LOGIN":
      return "Signed in";
    case "STAFF_LOGOUT":
      return "Signed out";
    case "PURCHASE_CREATE":
      return "Purchase saved";
    case "SCAN":
    case "BARCODE_SCAN":
      return "Barcode scan";
    default:
      return actionType.replaceAll("_", " ");
  }
}

assert(staffActivityLabel("STAFF_LOGIN") === "Signed in", "label login");
assert(staffActivityLabel("PURCHASE_CREATE") === "Purchase saved", "label purchase");
assert(staffActivityLabel("BARCODE_SCAN") === "Barcode scan", "label scan");
assert(staffActivityLabel("FOO_BAR") === "FOO BAR", "label default");

function staffActivityTimeAgo(at, now) {
  const ms = now.getTime() - at.getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return at.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const now = new Date("2026-07-18T12:00:00Z");
assert(
  staffActivityTimeAgo(new Date("2026-07-18T11:59:30Z"), now) === "just now",
  "timeAgo just now",
);
assert(
  staffActivityTimeAgo(new Date("2026-07-18T11:45:00Z"), now) === "15m ago",
  "timeAgo minutes",
);
assert(
  staffActivityTimeAgo(new Date("2026-07-18T09:00:00Z"), now) === "3h ago",
  "timeAgo hours",
);

function buildStaffRecentActivity({ activityRows, scans, now: n }) {
  const items = [];
  for (const r of activityRows) {
    items.push({
      label: staffActivityLabel(String(r.action_type ?? r.action ?? "")),
      when: new Date(String(r.created_at)),
      isScan: false,
    });
  }
  for (const s of scans) {
    items.push({
      label: "Barcode scan",
      when: n,
      isScan: true,
    });
  }
  items.sort((a, b) => b.when.getTime() - a.when.getTime());
  return items.slice(0, 8);
}

const merged = buildStaffRecentActivity({
  activityRows: Array.from({ length: 10 }, (_, i) => ({
    action_type: "STAFF_LOGIN",
    created_at: `2026-07-18T0${i}:00:00Z`,
  })),
  scans: [{ id: "1", name: "A", code: "c" }],
  now: new Date("2026-07-18T23:00:00Z"),
});
assert(merged.length === 8, "take 8");
assert(merged[0].isScan === true, "scan sorts to top with when=now");

const helper = readFileSync(
  join(root, "src/features/staff/staffRecentActivity.ts"),
  "utf8",
);
const api = readFileSync(join(root, "src/features/staff/staffHomeApi.ts"), "utf8");
const page = readFileSync(
  join(root, "src/features/staff/StaffHomePage.tsx"),
  "utf8",
);
const copy = readFileSync(
  join(root, "src/features/staff/staffHomeLoadCopy.ts"),
  "utf8",
);
const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");

assert(helper.includes("buildStaffRecentActivity"), "build export");
assert(helper.includes("staffActivityLabel"), "label export");
assert(helper.includes("loadBarcodeRecentScans"), "local scans");
assert(helper.includes("barcode_recent_scans_v1"), "prefs key");
assert(helper.includes("slice(0, 8)"), "take 8");

assert(api.includes("fetchActivityLogToday"), "activity-log fetch");
assert(!api.includes("home-overview"), "no home-overview");

assert(page.includes("RecentActivitySection"), "RecentActivitySection");
assert(page.includes("buildStaffRecentActivity"), "page merge");
assert(page.includes("loadBarcodeRecentScans"), "page local scans");
assert(page.includes("STAFF_HOME_ACTIVITY_ERROR"), "error copy");
assert(page.includes("STAFF_HOME_ACTIVITY_FULL_LOG"), "full log");
assert(page.includes('navigate("/staff/activity")'), "activity nav");
assert(page.includes("/catalog/item/"), "item nav");
assert(page.includes("STAFF_HOME_ACTIVITY_INNER_SUBTITLE"), "inner header");
assert(!page.includes("home-overview"), "no home-overview on page");

assert(copy.includes("Full activity log"), "Full activity log copy");
assert(copy.includes("Scans, stock updates, and purchases today"), "inner subtitle");
assert(copy.includes("Could not load recent activity."), "error literal");

assert(router.includes('path="/catalog/item/:itemId"'), "catalog item stub");
assert(router.includes('path="/staff/activity"'), "activity stub");

assert(
  existsSync(join(root, "../../docs/modules/staff_home_wire2d_compare.md")),
  "staff_home_wire2d_compare.md",
);

if (failures.length) {
  console.error("Staff home WIRE-2d checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home WIRE-2d checks PASS");
