/**
 * Staff item gallery /staff/items FIELDS smoke.
 * Run: node scripts/check-staff-items-fields.mjs
 * Source: staff_item_gallery_page.dart query debounce + filter chips + match helpers
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(
  root,
  "src/features/staff/items/staffItemGalleryCopy.ts",
);
const logicPath = join(
  root,
  "src/features/staff/items/staffItemGalleryLogic.ts",
);
const pagePath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(logicPath), "logic exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const logic = readFileSync(logicPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes("STAFF_GALLERY_DEBOUNCE_MS = 200"), "debounce 200");
assert(copy.includes("STAFF_GALLERY_SUGGESTIONS_MAX = 12"), "suggest max 12");
assert(copy.includes('STAFF_GALLERY_EMPTY = "No items match"'), "empty");

assert(logic.includes("itemMatchesGalleryFilter"), "filter match");
assert(logic.includes("itemLowOrOut"), "low/out");
assert(logic.includes("itemMatchesSearch"), "search match");
assert(logic.includes("groupGalleryItems"), "group");
assert(logic.includes("gallerySuggestions"), "suggestions");
assert(logic.includes("filterGalleryItems"), "filter list");
assert(logic.includes("formatGallerySummary"), "summary format");
assert(logic.includes('STAFF_GALLERY_UNCATEGORIZED = "Uncategorized"'), "Uncategorized");
assert(logic.includes("opening_stock_set"), "opening_stock_set");
assert(logic.includes("needs_opening_stock"), "needs_opening_stock");
assert(logic.includes("missing_barcode"), "missing_barcode");
assert(logic.includes("reorder_level"), "reorder_level");

assert(page.includes("useState"), "local state");
assert(page.includes("setFilter"), "filter state");
assert(page.includes("setQuery"), "query state");
assert(page.includes("debounced"), "debounced");
assert(page.includes("STAFF_GALLERY_DEBOUNCE_MS"), "uses debounce const");
assert(page.includes("search-input--active"), "search active");
assert(page.includes("chip--active"), "chips active");
assert(page.includes("filterGalleryItems"), "uses filter helper");
assert(page.includes("formatGallerySummary"), "uses summary helper");
assert(page.includes("gallerySuggestions"), "uses suggestions");
assert(page.includes("applySuggestion"), "apply suggestion");
assert(page.includes("staffGalleryFilterFromQuery"), "init from ?filter=");
assert(
  page.includes("allItems") || page.includes("StaffGalleryItem"),
  "items catalog state",
);
assert(
  !page.includes("fetchListStock") && !page.includes("listStock("),
  "no listStock API yet",
);
/* BUTTONS owns category expand + row menus; WIRE owns listStock */

assert(css.includes("search-input--active"), "css search active");
assert(css.includes("chip--active"), "css chip active");
assert(css.includes("search-field--active"), "css field active");
assert(css.includes("filter-row--active"), "css filter row active");
assert(css.includes("staff-gallery-page__suggest"), "suggest chrome");

assert(pkg.includes("test:staff-items-fields"), "package.json script");

for (const name of [
  "check-staff-items-scaffold.mjs",
  "check-staff-items-layout.mjs",
]) {
  const r = spawnSync(process.execPath, [join(root, "scripts", name)], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    failures.push(`${name} FAILED`);
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
  }
}

if (failures.length) {
  console.error("Staff items FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff items FIELDS checks PASS");
