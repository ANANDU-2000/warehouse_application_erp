/**
 * Staff /staff/home BUTTONS smoke — tools, quick actions, scan CTA, profile.
 * Run: node scripts/check-staff-home-buttons.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const toolsPath = join(root, "src/features/staff/staffHomeTools.ts");
const pagePath = join(root, "src/features/staff/StaffHomePage.tsx");
const routerPath = join(root, "src/app/router.tsx");

assert(existsSync(toolsPath), "staffHomeTools.ts exists");
assert(existsSync(pagePath), "StaffHomePage exists");

const tools = readFileSync(toolsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");

const toolPairs = [
  ["Search", "/staff/search"],
  ["Gallery", "/staff/items"],
  ["Categories", "/catalog/taxonomy"],
  ["Stock", "/staff/stock"],
  ["Labels", "/barcode/bulk-print"],
  ["Purchases", "/staff/purchase-history"],
  ["Low stock", "/staff/low-stock"],
  ["Daily log", "/staff/activity"],
];
for (const [label, path] of toolPairs) {
  assert(tools.includes(`label: "${label}"`), `tool label ${label}`);
  assert(tools.includes(`path: "${path}"`), `tool path ${path}`);
}

assert(tools.includes('label: "Deliveries"'), "quick Deliveries");
assert(tools.includes('path: "/staff/deliveries"'), "quick Deliveries path");
assert(tools.includes('path: "/stock"'), "quick Low stock → /stock");
assert(tools.includes('label: "Scan"'), "quick Scan");
assert(tools.includes('path: "/staff/scan"'), "quick Scan path");
assert(tools.includes('STAFF_HOME_SCAN_CTA_LABEL = "Scan barcode"'), "Scan barcode");
assert(tools.includes('STAFF_HOME_SETTINGS_PATH = "/staff/settings"'), "settings path");
assert(tools.includes('STAFF_HOME_APP_NAME = "Harisree Warehouse"'), "app name");
assert(
  tools.includes('STAFF_HOME_LOGOUT_TITLE = `Log out of ${STAFF_HOME_APP_NAME}?`') ||
    tools.includes("Log out of ${STAFF_HOME_APP_NAME}?"),
  "logout title",
);
assert(
  tools.includes(
    'STAFF_HOME_LOGOUT_BODY =\n  "You will need to sign in again to continue."',
  ) || tools.includes("You will need to sign in again to continue."),
  "logout body",
);
assert(tools.includes("staffHomeToolsForFocus"), "focus gate helper");
assert(tools.includes("barcodeOnly: true"), "Labels barcodeOnly");

assert(page.includes("useNavigate"), "useNavigate");
assert(page.includes('navigate("/notifications")'), "bell notifications");
assert(page.includes("staffHomeToolsForFocus"), "tools for focus");
assert(page.includes("STAFF_HOME_QUICK_ACTIONS"), "quick actions");
assert(page.includes("STAFF_HOME_SCAN_CTA_LABEL"), "scan CTA");
assert(page.includes("STAFF_HOME_SETTINGS_LABEL"), "Settings");
assert(page.includes("STAFF_HOME_LOGOUT_LABEL"), "Logout");
assert(page.includes("STAFF_HOME_CLOSE_LABEL"), "Close");
assert(page.includes("clearTokens"), "clear tokens");
assert(page.includes("clearPrimaryBusiness"), "clear business");
assert(page.includes('navigate("/login"'), "logout → login");
assert(page.includes("staff-home-profile-sheet"), "profile sheet");
assert(page.includes("STAFF_HOME_FOCUS_HEADING"), "focus in sheet");
assert(!page.includes("fetch("), "no fetch");

const stubPaths = [
  "/staff/settings",
  "/staff/search",
  "/staff/items",
  "/staff/stock",
  "/staff/purchase-history",
  "/staff/low-stock",
  "/staff/activity",
  "/staff/deliveries",
  "/staff/scan",
  "/catalog/taxonomy",
  "/barcode/bulk-print",
];
for (const p of stubPaths) {
  assert(router.includes(`path="${p}"`), `router stub ${p}`);
}

if (failures.length) {
  console.error("Staff home BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home BUTTONS checks PASS");
