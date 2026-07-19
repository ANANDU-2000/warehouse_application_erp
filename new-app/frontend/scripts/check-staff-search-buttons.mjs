/**
 * Staff search /staff/search BUTTONS smoke.
 * Run: node scripts/check-staff-search-buttons.mjs
 * Source: search_page.dart staff Quick filters push/go
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const qfPath = join(root, "src/features/staff/search/staffSearchQuickFilters.ts");
const pagePath = join(root, "src/features/staff/search/StaffSearchPage.tsx");
const cssPath = join(root, "src/features/staff/search/StaffSearchPage.css");
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(qfPath), "quick filters exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const qf = readFileSync(qfPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(qf.includes('path: "/staff/items"'), "gallery path");
assert(qf.includes("missing_barcode"), "missing barcode");
assert(qf.includes("missing_code"), "missing code");
assert(qf.includes("/stock/opening-setup"), "opening");
assert(qf.includes("/staff/low-stock"), "low stock");
assert(qf.includes('path: "/staff/scan"'), "scan path");
assert(qf.includes('nav: "push"'), "push mode");
assert(qf.includes('nav: "go"'), "go mode for scan");

assert(page.includes("useNavigate"), "useNavigate");
assert(page.includes("navigateQuickFilter"), "navigate helper");
assert(page.includes('nav === "go"'), "go → replace");
assert(page.includes("replace: true"), "replace true");
assert(page.includes("action-chip--active"), "QF active");
assert(page.includes("navigateQuickFilter(navigate, qf.path, qf.nav)"), "onClick nav");
assert(!page.includes('aria-disabled="true"'), "QF no longer disabled");
assert(!page.includes('data-slot="appBar"'), "no AppBar (staff embedded)");
/* WIRE owns result-row taps + GET /search */

assert(css.includes("action-chip--active"), "css QF active");

assert(router.includes('path="/staff/items"'), "items stub");
assert(router.includes('path="/staff/low-stock"'), "low-stock stub");
assert(router.includes('path="/staff/scan"'), "scan stub");
assert(router.includes('path="/stock/opening-setup"'), "opening stub");

assert(pkg.includes("test:staff-search-buttons"), "package.json script");

if (failures.length) {
  console.error("Staff search BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff search BUTTONS checks PASS");
