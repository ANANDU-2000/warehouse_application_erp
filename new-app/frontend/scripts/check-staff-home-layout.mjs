/**
 * Staff /staff/home LAYOUT smoke — exact Flutter section + greeting copy.
 * Run: node scripts/check-staff-home-layout.mjs
 * Source: staff_home_page.dart, staff_home_section_header.dart
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/staff/staffHomeCopy.ts");
const pagePath = join(root, "src/features/staff/StaffHomePage.tsx");
const cssPath = join(root, "src/features/staff/StaffHomePage.css");

assert(existsSync(copyPath), "staffHomeCopy.ts exists");
assert(existsSync(pagePath), "StaffHomePage.tsx exists");
assert(existsSync(cssPath), "StaffHomePage.css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");

assert(copy.includes('STAFF_HOME_GREETING_NAME_FALLBACK = "Staff"'), "name Staff");
assert(copy.includes('STAFF_HOME_GREETING_AVATAR_FALLBACK = "S"'), "avatar S");
assert(copy.includes('STAFF_HOME_ROLE_LABEL = " · STAFF · "'), "role · STAFF ·");
assert(copy.includes('title: "Warehouse & purchases"'), "Warehouse title");
assert(copy.includes('subtitle: "Stock in hand and this month"'), "Warehouse subtitle");
assert(copy.includes('title: "Pending deliveries"'), "Pending deliveries title");
assert(copy.includes('subtitle: "Verify arrivals on the floor"'), "Pending deliveries subtitle");
assert(copy.includes('title: "Your shift today"'), "Shift title");
assert(copy.includes('subtitle: "Scans, stock updates, purchases"'), "Shift subtitle");
assert(copy.includes('title: "Tools"'), "Tools title");
assert(copy.includes('subtitle: "Search, stock, labels, and low stock"'), "Tools subtitle");
assert(copy.includes('title: "Quick actions"'), "Quick actions title");
assert(copy.includes('subtitle: "Fast jump for floor work"'), "Quick actions subtitle");
assert(copy.includes('title: "Start here"'), "Start here title");
assert(copy.includes('subtitle: "Scan and quick actions"'), "Start here subtitle");
assert(copy.includes('title: "Needs attention"'), "Needs attention title");
assert(copy.includes('subtitle: "Other warehouse items"'), "Needs attention subtitle");
assert(copy.includes('title: "Recent activity"'), "Recent activity title");
assert(
  copy.includes('subtitle: "Latest stock and warehouse updates"'),
  "Recent activity subtitle",
);
assert(copy.includes('STAFF_HOME_SCAN_CTA_LABEL = "Scan barcode"'), "Scan barcode");

assert(page.includes("STAFF_HOME_SECTION"), "uses STAFF_HOME_SECTION");
assert(page.includes("STAFF_HOME_ROLE_LABEL"), "uses role label");
assert(page.includes("staff-home-greeting"), "greeting class");
assert(page.includes('data-testid="staff-home-slot-greeting"'), "greeting slot");
assert(page.includes('data-testid="staff-home-slot-floor-kpis"'), "floor-kpis slot");
assert(page.includes('data-testid="staff-home-slot-warehouse"'), "warehouse slot");
assert(page.includes('data-testid="staff-home-slot-pending-deliveries"'), "pending slot");
assert(page.includes('data-testid="staff-home-slot-shift-today"'), "shift slot");
assert(page.includes('data-testid="staff-home-slot-tools"'), "tools slot");
assert(page.includes('data-testid="staff-home-slot-quick-actions"'), "quick-actions slot");
assert(page.includes('data-testid="staff-home-slot-scan-cta"'), "scan-cta slot");
assert(page.includes('data-testid="staff-home-slot-needs-attention"'), "needs-attention slot");
assert(page.includes('data-testid="staff-home-slot-recent-activity"'), "recent-activity slot");
assert(page.includes("staffHomeLayoutDateLabel"), "date label helper");
assert(page.includes('weekday: "short"'), "EEE-style weekday");
assert(page.includes("disabled"), "bell inert");
assert(!page.includes("fetch("), "no fetch in LAYOUT");
assert(!page.includes("home-overview"), "no home-overview");
assert(!page.includes("StaffHomeFocus"), "no focus chips yet (FIELDS)");

assert(css.includes("max-width: 560px"), "max-width 560");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand primary");
assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "brand background");
assert(css.includes("border-radius: 16px"), "avatar/scan radius 16");
assert(css.includes("border-radius: 12px"), "card radius 12");
assert(css.includes("#e5e7eb") || css.includes("#E5E7EB"), "card border");

if (failures.length) {
  console.error("Staff home LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home LAYOUT checks PASS");
