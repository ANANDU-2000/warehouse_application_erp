/**
 * Staff /staff/home FIELDS smoke — StaffHomeFocus radios + storage.
 * Run: node scripts/check-staff-home-fields.mjs
 * Source: staff_home_providers.dart, staff_home_page.dart _staffFocusLabel
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const focusPath = join(root, "src/features/staff/staffHomeFocus.ts");
const pagePath = join(root, "src/features/staff/StaffHomePage.tsx");

assert(existsSync(focusPath), "staffHomeFocus.ts exists");
assert(existsSync(pagePath), "StaffHomePage.tsx exists");

const focus = readFileSync(focusPath, "utf8");
const page = readFileSync(pagePath, "utf8");

assert(focus.includes('STAFF_HOME_FOCUS_STORAGE_KEY = "staff_home_focus"'), "storage key");
assert(focus.includes('STAFF_HOME_FOCUS_HEADING = "Home focus"'), "Home focus heading");
assert(focus.includes('all: "All tasks"'), "All tasks");
assert(focus.includes('barcode: "Barcode & labels"'), "Barcode & labels");
assert(focus.includes('stock: "Stock & warehouse"'), "Stock & warehouse");
assert(focus.includes('purchase: "Purchases & delivery"'), "Purchases & delivery");
assert(focus.includes('STAFF_HOME_FOCUS_ORDER: StaffHomeFocus[] = ['), "focus order array");
assert(focus.includes('"all"'), "enum all");
assert(focus.includes('"barcode"'), "enum barcode");
assert(focus.includes('"stock"'), "enum stock");
assert(focus.includes('"purchase"'), "enum purchase");
assert(focus.includes("staffHomeFocusFromStorage"), "fromStorage");
assert(focus.includes('return "all"'), "default all");
assert(focus.includes("staffHomeShowsWarehouse"), "showsWarehouse");
assert(focus.includes("staffHomeShowsBarcodeTools"), "showsBarcodeTools");
assert(focus.includes("staffHomeShowsPurchaseTools"), "showsPurchaseTools");
assert(focus.includes('f === "all" || f === "stock"'), "warehouse gate");
assert(focus.includes('f === "all" || f === "barcode"'), "barcode gate");
assert(focus.includes('f === "all" || f === "purchase"'), "purchase gate");

assert(page.includes("STAFF_HOME_FOCUS_ORDER"), "page uses order");
assert(page.includes("STAFF_HOME_FOCUS_LABELS"), "page uses labels");
assert(page.includes("STAFF_HOME_FOCUS_HEADING"), "page uses heading");
assert(page.includes('type="radio"'), "radio inputs");
assert(page.includes("readStaffHomeFocus"), "hydrate from storage");
assert(page.includes("writeStaffHomeFocus"), "persist focus");
assert(page.includes('data-testid="staff-home-focus"'), "focus test id");
assert(page.includes("role=\"radiogroup\""), "radiogroup");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("useNavigate"), "no useNavigate");
assert(!page.includes("Settings"), "no Settings (BUTTONS sheet)");
assert(!page.includes("Logout"), "no Logout (BUTTONS sheet)");

if (failures.length) {
  console.error("Staff home FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home FIELDS checks PASS");
