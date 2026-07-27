/**
 * Staff search /staff/search FIELDS smoke.
 * Run: node scripts/check-staff-search-fields.mjs
 * Source: search_page.dart query/section/recents/empty catalogs
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
const recentsPath = join(root, "src/features/staff/search/staffSearchRecents.ts");
const pagePath = join(root, "src/features/staff/search/StaffSearchPage.tsx");
const cssPath = join(root, "src/features/staff/search/StaffSearchPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(recentsPath), "recents exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const recents = readFileSync(recentsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes("STAFF_SEARCH_DEBOUNCE_MS = 350"), "debounce 350");
assert(
  copy.includes(
    "No matching items found. Try recent items, low stock, missing barcode, or scan history.",
  ),
  "global no-match",
);
assert(copy.includes('"Catalog items"'), "items title");
assert(copy.includes('"No matching catalog items."'), "items empty");
assert(copy.includes('"Recent purchase bills"'), "bills title");
assert(
  copy.includes(
    "No bills matched (try item name, supplier, or bill id).",
  ),
  "bills empty",
);
assert(copy.includes('"Recent"'), "Recent title");
assert(copy.includes('"Clear"'), "Clear");

assert(recents.includes("pref_recent_unified_search_v1_"), "prefs key prefix");
assert(recents.includes("loadRecentSearchQueries"), "load");
assert(recents.includes("clearRecentSearchQueries"), "clear");
assert(recents.includes("addRecentSearchQuery"), "add for WIRE");
assert(recents.includes("slice(0, MAX)") || recents.includes("MAX = 12"), "max 12");

assert(page.includes("useState"), "local state");
assert(page.includes("setSection"), "section state");
assert(page.includes("setQuery"), "query state");
assert(page.includes("debounced"), "debounced");
assert(page.includes("STAFF_SEARCH_DEBOUNCE_MS"), "uses debounce const");
assert(page.includes("staff-search-clear"), "search clear");
assert(page.includes("search-input--active"), "search active");
assert(page.includes("chip--active"), "chips active");
assert(page.includes("staff-search-recents"), "recents block");
assert(page.includes("applyQuery"), "apply recent");
assert(page.includes("STAFF_SEARCH_NO_MATCH_GLOBAL"), "global empty");
assert(page.includes("staff-search-section-block-items"), "items block");
assert(page.includes("staff-search-section-block-bills"), "bills block");
assert(
  page.includes("!staffShellEmbedded") ||
    page.includes("Staff types list block gated"),
  "types gated note",
);
assert(page.includes("useSearchParams"), "section query param");
assert(
  page.includes("action-chip--active") || page.includes('aria-disabled="true"'),
  "QF present (BUTTONS may activate)",
);
/* WIRE owns GET /search + addRecent on success */

assert(css.includes("search-input--active"), "css search active");
assert(css.includes("chip--active"), "css chip active");
assert(css.includes("staff-search-page__search-clear"), "css clear");

assert(pkg.includes("test:staff-search-fields"), "package.json script");

if (failures.length) {
  console.error("Staff search FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff search FIELDS checks PASS");
