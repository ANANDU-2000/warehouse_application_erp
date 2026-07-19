/**
 * Catalog hub /catalog FIELDS smoke.
 * Run: node scripts/check-catalog-fields.mjs
 * Source: catalog_page.dart search debounce 150ms + empty catalogs
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

const copyPath = join(root, "src/features/catalog/catalogCopy.ts");
const fieldsPath = join(root, "src/features/catalog/catalogFields.ts");
const pagePath = join(root, "src/features/catalog/CatalogPage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(fieldsPath), "fields exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const fields = readFileSync(fieldsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('CATALOG_SEARCH_HINT = "Search categories (fuzzy)"'), "hint");
assert(copy.includes('CATALOG_EMPTY_TITLE = "No categories yet"'), "empty title");
assert(copy.includes('CATALOG_NO_MATCHES_TITLE = "No matches"'), "no matches title");
assert(
  copy.includes("Try a different spelling or clear search."),
  "no matches sub",
);
assert(
  copy.includes(
    "Add a category, then subcategories and items — all from this catalog.",
  ),
  "empty sub",
);

assert(fields.includes("CATALOG_SEARCH_DEBOUNCE_MS = 150"), "debounce 150");
assert(fields.includes("catalogEmptyMode"), "empty mode");
assert(fields.includes("catalogEmptyTitle"), "empty title helper");
assert(fields.includes("catalogEmptySub"), "empty sub helper");

assert(
  page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES"),
  "FIELDS+ header",
);
assert(page.includes("useState"), "local state");
assert(page.includes("setSearchDraft"), "search draft");
assert(page.includes("setSearchQuery"), "search query");
assert(page.includes("CATALOG_SEARCH_DEBOUNCE_MS"), "uses debounce");
assert(page.includes('data-testid="catalog-search"'), "search testid");
assert(page.includes('data-testid="catalog-search-clear"'), "clear testid");
assert(page.includes('data-testid="catalog-empty"'), "empty testid");
assert(page.includes("catalog-page__search--active"), "search active");
assert(page.includes("catalogEmptyTitle"), "uses empty title");
assert(page.includes("catalogEmptySub"), "uses empty sub");
assert(!page.includes("fetch("), "no fetch");
assert(page.includes('data-deferred="back"') || page.includes('data-action="back"'), "back still deferred or BUTTONS");
assert(
  page.includes('data-deferred="add-category"') ||
    page.includes('data-action="add-category"'),
  "fab still deferred or BUTTONS",
);
assert(page.includes('data-deferred="suggestion-chips"'), "chips deferred");

assert(pkg.includes("test:catalog-fields"), "package script");

for (const script of [
  "check-catalog-scaffold.mjs",
  "check-catalog-layout.mjs",
]) {
  const r = spawnSync(process.execPath, [join(root, "scripts", script)], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    failures.push(`${script} FAILED`);
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
  }
}

if (failures.length) {
  console.error("Catalog FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog FIELDS checks PASS");
