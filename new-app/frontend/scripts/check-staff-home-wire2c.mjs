/**
 * Staff /staff/home WIRE-2c — Shift today strip (activity-log + audit/feed).
 * Run: node scripts/check-staff-home-wire2c.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backend = join(root, "..", "backend");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

/** Mirror summarizeStaffToday — must stay aligned with staffShiftSummary.ts */
function summarizeStaffToday({ activityRows, auditRows }) {
  let scan = 0;
  let create = 0;
  let verify = 0;
  let purchases = 0;
  for (const r of activityRows) {
    const a = String(r.action_type ?? r.action ?? "").toUpperCase();
    if (a.includes("SCAN")) scan++;
    else if (a.includes("ITEM") && a.includes("CREATE")) create++;
    else if (a.includes("VERIF")) verify++;
    else if (a.includes("PURCHASE")) purchases++;
  }
  const itemIds = new Set();
  for (const a of auditRows) {
    const id = String(a.item_id ?? "").trim();
    if (id) itemIds.add(id);
  }
  return {
    scanned: scan,
    stockUpdates: auditRows.length,
    itemsCreated: create,
    verifications: verify,
    purchases,
    itemsChecked: itemIds.size,
  };
}

const sum = summarizeStaffToday({
  activityRows: [
    { action_type: "BARCODE_SCAN" },
    { action: "ITEM_CREATE" },
    { action_type: "STAFF_VERIFY" },
    { action_type: "PURCHASE_LOG" },
    { action_type: "OTHER" },
  ],
  auditRows: [{ item_id: "a" }, { item_id: "a" }, { item_id: "b" }],
});
assert(sum.scanned === 1, "summarize scanned");
assert(sum.itemsCreated === 1, "summarize create");
assert(sum.verifications === 1, "summarize verify");
assert(sum.purchases === 1, "summarize purchases");
assert(sum.stockUpdates === 3, "summarize stockUpdates = audit length");
assert(sum.itemsChecked === 2, "summarize unique items");

const api = readFileSync(join(root, "src/features/staff/staffHomeApi.ts"), "utf8");
const page = readFileSync(
  join(root, "src/features/staff/StaffHomePage.tsx"),
  "utf8",
);
const summary = readFileSync(
  join(root, "src/features/staff/staffShiftSummary.ts"),
  "utf8",
);
const copy = readFileSync(
  join(root, "src/features/staff/staffHomeLoadCopy.ts"),
  "utf8",
);
const routes = readFileSync(
  join(backend, "src/routes/staffHome.routes.ts"),
  "utf8",
);
const repo = readFileSync(
  join(backend, "src/repositories/staffHome.repository.ts"),
  "utf8",
);
const ctrl = readFileSync(
  join(backend, "src/controllers/staffHome.controller.ts"),
  "utf8",
);
const app = readFileSync(join(backend, "src/app.ts"), "utf8");

assert(api.includes("fetchActivityLogToday"), "fetchActivityLogToday");
assert(api.includes("activity-log"), "activity-log path");
assert(api.includes('period: "today"'), "period today");
assert(api.includes("per_page"), "per_page");
assert(api.includes("fetchStockAuditFeedToday"), "fetchStockAuditFeedToday");
assert(api.includes("audit/feed"), "audit/feed path");
assert(api.includes('limit: "200"'), "audit limit 200");
assert(!api.includes("home-overview"), "no home-overview");

assert(summary.includes("export function summarizeStaffToday"), "summarize export");
assert(summary.includes("stockUpdates: args.auditRows.length"), "stock = audit len");
assert(summary.includes("staffTodayApiDate"), "today date helper");

assert(page.includes("ShiftSnapshotStrip"), "ShiftSnapshotStrip");
assert(page.includes("fetchActivityLogToday"), "page activity fetch");
assert(page.includes("fetchStockAuditFeedToday"), "page audit fetch");
assert(page.includes("summarizeStaffToday"), "page summarize");
assert(page.includes("counts.pending"), "deliveries from pending count");
assert(page.includes('navigate("/barcode/scan")'), "empty → scan");
assert(page.includes("STAFF_HOME_SHIFT_EMPTY_SUBTITLE"), "empty subtitle");
assert(page.includes('scans="–"'), "loading dashes");
assert(!page.includes("home-overview"), "no home-overview on page");

assert(copy.includes("No activity today"), "empty title");
assert(copy.includes("Tap Stock or Scan to log work"), "empty subtitle");
assert(copy.includes("Scans"), "Scans label");
assert(copy.includes("Deliveries"), "Deliveries label");

assert(routes.includes('"/audit/feed"'), "route audit/feed");
assert(routes.includes("createActivityLogRoutes"), "activity-log routes");
assert(ctrl.includes("listActivityLog"), "controller listActivityLog");
assert(repo.includes("listActivityLog"), "repo listActivityLog");
assert(repo.includes("staff_activity_log"), "staff_activity_log table");
assert(app.includes("activity-log"), "app mounts activity-log");

assert(
  existsSync(join(root, "../../docs/modules/staff_home_wire2c_compare.md")),
  "staff_home_wire2c_compare.md",
);

if (failures.length) {
  console.error("Staff home WIRE-2c checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home WIRE-2c checks PASS");
