/**
 * Staff search /staff/search SCAFFOLD smoke.
 * Run: node scripts/check-staff-search-scaffold.mjs
 * Source: search_page.dart staffShellEmbedded chrome
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/staff/search/staffSearchCopy.ts");
const sectionsPath = join(
  root,
  "src/features/staff/search/staffSearchSections.ts",
);
const pagePath = join(root, "src/features/staff/search/StaffSearchPage.tsx");
const cssPath = join(root, "src/features/staff/search/StaffSearchPage.css");
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(sectionsPath), "sections exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const sections = readFileSync(sectionsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_SEARCH_TITLE = "Search"'), "title");
assert(
  copy.includes('STAFF_SEARCH_BACK_FALLBACK = "/staff/home"'),
  "back /staff/home",
);
assert(
  copy.includes(
    'STAFF_SEARCH_HINT = "Item name, code, barcode, category…"',
  ),
  "staff hint",
);
assert(copy.includes('STAFF_SEARCH_CHIP_ITEMS = "Items"'), "Items");
assert(copy.includes('STAFF_SEARCH_CHIP_TYPES = "Subcategories"'), "Subcategories");
assert(copy.includes('STAFF_SEARCH_CHIP_BILLS = "Purchases"'), "Purchases");

assert(sections.includes('"items"'), "section items");
assert(sections.includes('"types"'), "section types");
assert(sections.includes('"bills"'), "section bills");
assert(
  sections.includes('STAFF_SEARCH_DEFAULT_SECTION: StaffSearchSection = "items"') ||
    sections.includes('= "items"'),
  "default items",
);
assert(
  sections.includes('["items", "types", "bills"]') ||
    (sections.includes('"items"') &&
      sections.includes('"types"') &&
      sections.includes('"bills"')),
  "staff chip order",
);
assert(!sections.includes('"suppliers"'), "no suppliers chip (staff)");
assert(!sections.includes('"all"'), "no all chip (staff)");

assert(page.includes('data-slot="search"'), "search slot");
assert(page.includes('data-slot="filters"'), "filters slot");
assert(page.includes('data-slot="results"'), "results slot");
assert(page.includes("STAFF_SEARCH_HINT"), "uses hint");
assert(page.includes("STAFF_SEARCH_SECTION_ORDER"), "uses sections");
assert(page.includes('data-staff-shell-embedded="true"'), "embedded flag");
assert(!page.includes('data-slot="appBar"'), "no AppBar (staff embedded)");
assert(page.includes("STAFF_SEARCH_HINT"), "hint wired");
/* FIELDS owns editable input; WIRE owns GET /search */

assert(router.includes("StaffSearchPage"), "router imports page");
assert(router.includes('path="/staff/search"'), "staff search route");
assert(!router.includes('title="Staff search"'), "no stub title route");

assert(
  pkg.includes("test:staff-search-scaffold"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Staff search SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff search SCAFFOLD checks PASS");
