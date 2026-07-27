/**
 * Staff item gallery /staff/items SCAFFOLD smoke.
 * Run: node scripts/check-staff-items-scaffold.mjs
 * Source: staff_item_gallery_page.dart
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(
  root,
  "src/features/staff/items/staffItemGalleryCopy.ts",
);
const filtersPath = join(
  root,
  "src/features/staff/items/staffItemGalleryFilters.ts",
);
const pagePath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.css",
);
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(filtersPath), "filters exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const filters = readFileSync(filtersPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_GALLERY_TITLE = "Item gallery"'), "title");
assert(
  copy.includes('STAFF_GALLERY_BACK_FALLBACK = "/staff/home"'),
  "back /staff/home",
);
assert(
  copy.includes(
    'STAFF_GALLERY_HINT = "Name, item code, category, subcategory…"',
  ),
  "hint",
);
assert(copy.includes('STAFF_GALLERY_FILTER_ALL = "All"'), "All");
assert(
  copy.includes('STAFF_GALLERY_FILTER_MISSING_CODE = "No item code"'),
  "No item code",
);
assert(
  copy.includes('STAFF_GALLERY_FILTER_MISSING_BARCODE = "No barcode"'),
  "No barcode",
);
assert(copy.includes('STAFF_GALLERY_FILTER_LOW = "Low / out"'), "Low / out");
assert(copy.includes('STAFF_GALLERY_FILTER_OPENING = "Opening"'), "Opening");
assert(copy.includes('STAFF_GALLERY_EMPTY = "No items match"'), "empty");
assert(
  copy.includes('STAFF_GALLERY_SUMMARY_EMPTY = "0 items · 0 categories"'),
  "summary empty",
);

assert(filters.includes('"all"'), "filter all");
assert(filters.includes('"missingCode"'), "missingCode");
assert(filters.includes('"missingBarcode"'), "missingBarcode");
assert(filters.includes('"lowStock"'), "lowStock");
assert(filters.includes('"openingMissing"'), "openingMissing");
assert(filters.includes("staffGalleryFilterFromQuery"), "fromQuery");
assert(filters.includes("missing_code"), "alias missing_code");
assert(filters.includes("missing_barcode"), "alias missing_barcode");
assert(filters.includes("low_stock"), "alias low_stock");
assert(filters.includes("opening_stock"), "alias opening_stock");
assert(
  filters.includes(
    'STAFF_GALLERY_DEFAULT_FILTER: StaffGalleryFilter = "all"',
  ) || filters.includes('= "all"'),
  "default all",
);

assert(page.includes('data-slot="appBar"'), "appBar slot");
assert(page.includes('data-slot="search"'), "search slot");
assert(page.includes('data-slot="filters"'), "filters slot");
assert(page.includes('data-slot="summary"'), "summary slot");
assert(page.includes('data-slot="results"'), "results slot");
assert(page.includes("STAFF_GALLERY_HINT"), "uses hint");
assert(page.includes("STAFF_GALLERY_FILTER_ORDER"), "uses filter order");
assert(page.includes("staffGalleryFilterFromQuery"), "reads ?filter=");
assert(
  page.includes("readOnly") || page.includes("search-input--active"),
  "search field present (FIELDS may activate)",
);
assert(page.includes("STAFF_GALLERY_EMPTY"), "empty copy");
assert(!page.includes("fetchListStock"), "no API yet");
/* BUTTONS may add Update stock menu labels */

assert(router.includes("StaffItemGalleryPage"), "router imports page");
assert(router.includes('path="/staff/items"'), "staff items route");
assert(!router.includes('title="Staff gallery"'), "no stub title route");

assert(
  pkg.includes("test:staff-items-scaffold"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Staff items SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff items SCAFFOLD checks PASS");
