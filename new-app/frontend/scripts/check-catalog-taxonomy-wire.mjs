/**
 * Catalog taxonomy hub /catalog/taxonomy WIRE smoke.
 * Run: node scripts/check-catalog-taxonomy-wire.mjs
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

const pagePath = join(root, "src/features/catalog/CatalogTaxonomyHubPage.tsx");
const copyPath = join(root, "src/features/catalog/catalogTaxonomyCopy.ts");
const apiPath = join(root, "src/features/catalog/catalogApi.ts");
const taxPath = join(root, "src/features/catalog/catalogTaxonomy.ts");
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(copyPath), "copy exists");
assert(existsSync(apiPath), "api exists");

const page = readFileSync(pagePath, "utf8");
const copy = readFileSync(copyPath, "utf8");
const api = readFileSync(apiPath, "utf8");
const tax = readFileSync(taxPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  page.includes("WIRE") || page.includes("STATES") || page.includes("COMPARE"),
  "WIRE+ header",
);
assert(page.includes("listItemCategories"), "list categories");
assert(page.includes("listCategoryTypesIndex"), "types index");
assert(page.includes("typeCountForCategory"), "type count");
assert(page.includes("taxonomyFilterCategories"), "contains filter");
assert(page.includes("taxonomyRowSubtitle"), "row subtitle");
assert(page.includes('data-slot="loading"'), "loading");
assert(page.includes('data-slot="error"'), "error");
assert(page.includes('data-action="retry"'), "retry");
assert(page.includes("onBack"), "back still BUTTONS");
assert(page.includes("onAddCategory"), "add category still BUTTONS");
assert(!page.includes("data-sample"), "no BUTTONS sample");
assert(!page.includes("BUTTONS_CATEGORIES"), "no sample list");
assert(!page.includes("TAXONOMY_SAMPLE_CATEGORY_NAME"), "no sample name in page");
assert(
  page.includes("STATES") ||
    page.includes("COMPARE") ||
    page.includes("Loading…"),
  "plain Loading ok until STATES",
);

assert(copy.includes("taxonomyRowSubtitle"), "subtitle helper");
assert(
  copy.includes("No subcategories · General created automatically"),
  "zero-sub copy",
);
assert(copy.includes("${subCount} subcategories"), "count subtitle template");

assert(api.includes("/item-categories"), "api categories path");
assert(api.includes("/category-types-index"), "api types index");
assert(tax.includes("typeCountForCategory"), "shared type count");

assert(pkg.includes("test:catalog-taxonomy-wire"), "package script");

for (const name of [
  "check-catalog-taxonomy-scaffold.mjs",
  "check-catalog-taxonomy-layout.mjs",
  "check-catalog-taxonomy-fields.mjs",
  "check-catalog-taxonomy-buttons.mjs",
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
  console.error("Catalog taxonomy WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog taxonomy WIRE checks PASS");
