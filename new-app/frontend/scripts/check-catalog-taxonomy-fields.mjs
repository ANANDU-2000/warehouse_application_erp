/**
 * Catalog taxonomy hub /catalog/taxonomy FIELDS smoke.
 * Run: node scripts/check-catalog-taxonomy-fields.mjs
 * Source: catalog_taxonomy_hub_page.dart — immediate contains filter + empty catalogs
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

const copyPath = join(root, "src/features/catalog/catalogTaxonomyCopy.ts");
const fieldsPath = join(root, "src/features/catalog/catalogTaxonomyFields.ts");
const pagePath = join(root, "src/features/catalog/CatalogTaxonomyHubPage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(fieldsPath), "fields exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const fields = readFileSync(fieldsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('TAXONOMY_SEARCH_HINT = "Search categories"'), "hint");
assert(copy.includes('TAXONOMY_EMPTY_TITLE = "No categories yet"'), "empty title");
assert(copy.includes('TAXONOMY_NO_MATCHES_TITLE = "No matches"'), "no matches title");
assert(
  copy.includes('TAXONOMY_EMPTY_SUB = "Tap Category to add your first one."'),
  "empty sub shared",
);
assert(copy.includes('TAXONOMY_EMPTY_PRIMARY = "Add category"'), "empty primary");

assert(fields.includes("taxonomyFilterCategories"), "filter helper");
assert(fields.includes(".includes(q)"), "contains filter");
assert(fields.includes("taxonomyEmptyMode"), "empty mode");
assert(fields.includes("taxonomyEmptyTitle"), "empty title helper");
assert(fields.includes("taxonomyEmptySub"), "empty sub helper");
assert(!fields.includes("DEBOUNCE_MS"), "no DEBOUNCE_MS (listener immediate)");
assert(
  !fields.includes("catalogFuzzy") && !fields.includes("minScore"),
  "not fuzzy rank",
);

assert(
  page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    page.includes("COMPARE"),
  "FIELDS+ header",
);
assert(page.includes("useState"), "local state");
assert(page.includes("setSearchDraft"), "search draft");
assert(page.includes("searchQuery"), "search query");
assert(page.includes("taxonomyFilterCategories"), "uses filter");
assert(page.includes('data-testid="taxonomy-search"'), "search testid");
assert(page.includes('data-testid="taxonomy-search-clear"'), "clear testid");
assert(page.includes('data-testid="taxonomy-empty"'), "empty testid");
assert(page.includes("taxonomy-hub-page__search--active"), "search active");
assert(page.includes("taxonomyEmptyTitle"), "uses empty title");
assert(page.includes("taxonomyEmptySub"), "uses empty sub");
assert(!page.includes("fetch("), "no fetch");
assert(
  page.includes('data-deferred="back"') || page.includes('data-action="back"'),
  "back still deferred or BUTTONS",
);
assert(
  page.includes('data-deferred="quick-add"') ||
    page.includes('data-action="quick-add"'),
  "fab still deferred or BUTTONS",
);
assert(
  page.includes('data-deferred="chip-category"') ||
    page.includes('data-action="chip-category"'),
  "chip category deferred or BUTTONS",
);

assert(pkg.includes("test:catalog-taxonomy-fields"), "package script");

for (const script of [
  "check-catalog-taxonomy-scaffold.mjs",
  "check-catalog-taxonomy-layout.mjs",
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
  console.error("Catalog taxonomy FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog taxonomy FIELDS checks PASS");
