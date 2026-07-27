/**
 * Staff /staff/home WIRE-2b — Pending delivery cards via trade-purchases.
 * Run: node scripts/check-staff-home-wire2b.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const api = readFileSync(join(root, "src/features/staff/staffHomeApi.ts"), "utf8");
const page = readFileSync(
  join(root, "src/features/staff/StaffHomePage.tsx"),
  "utf8",
);
const helper = readFileSync(
  join(root, "src/features/staff/staffPendingDeliveries.ts"),
  "utf8",
);
const copy = readFileSync(
  join(root, "src/features/staff/staffHomeLoadCopy.ts"),
  "utf8",
);
const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");

assert(api.includes("fetchTradePurchasesRecent"), "fetchTradePurchasesRecent");
assert(api.includes("trade-purchases"), "trade-purchases path");
assert(api.includes("limit"), "limit query");
assert(!api.includes("home-overview"), "no home-overview");

assert(helper.includes("groupStaffDeliverySections"), "group sections");
assert(helper.includes("staffPendingDeliveriesFromRows"), "pending from rows");
assert(helper.includes("Pending delivery"), "status label Pending delivery");
assert(helper.includes("Arrived — verify"), "Arrived — verify label");
assert(helper.includes("needsStaffAction") || helper.includes("deliveryNeedsStaffAction"), "needsStaffAction");

assert(page.includes("PendingDeliveryCards"), "PendingDeliveryCards");
assert(page.includes("staffPendingDeliveriesFromRows"), "uses filter helper");
assert(page.includes("fetchTradePurchasesRecent"), "page fetches");
assert(page.includes("STAFF_HOME_MARK_ARRIVED"), "Mark arrived");
assert(page.includes("STAFF_HOME_VERIFY"), "Verify");
assert(page.includes('navigate("/staff/receive")'), "receive nav");
assert(page.includes("pendingDeliveries.length > 0"), "hide when empty");
assert(!page.includes("home-overview"), "no home-overview on page");

assert(copy.includes("Mark arrived"), "Mark arrived copy");
assert(copy.includes("Verify"), "Verify copy");
assert(copy.includes("View all"), "View all copy");

assert(router.includes('path="/staff/receive"'), "receive stub route");

assert(
  existsSync(join(root, "../../docs/modules/staff_home_wire2b_compare.md")),
  "staff_home_wire2b_compare.md",
);

if (failures.length) {
  console.error("Staff home WIRE-2b checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home WIRE-2b checks PASS");
