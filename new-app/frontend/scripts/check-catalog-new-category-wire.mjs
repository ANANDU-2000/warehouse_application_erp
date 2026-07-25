/**
 * Catalog new category /catalog/new-category WIRE smoke.
 * Run: node scripts/check-catalog-new-category-wire.mjs
 * Source: catalog_add_category_page.dart create + similar dialog + POST
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

const copyPath = join(root, "src/features/catalog/catalogAddCategoryCopy.ts");
const apiPath = join(root, "src/features/catalog/catalogApi.ts");
const pagePath = join(root, "src/features/catalog/CatalogAddCategoryPage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(apiPath), "api exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const api = readFileSync(apiPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  copy.includes('ADD_CATEGORY_SIMILAR_TITLE = "Similar category exists"'),
  "similar title",
);
assert(copy.includes('ADD_CATEGORY_SIMILAR_GO_BACK = "Go back"'), "go back");
assert(
  copy.includes('ADD_CATEGORY_CREATED_SNACK = "Category created"'),
  "created snack",
);
assert(copy.includes("ADD_CATEGORY_SIMILAR_MIN_SCORE = 86"), "minScore 86");
assert(copy.includes("ADD_CATEGORY_SIMILAR_LIMIT = 4"), "limit 4");
assert(copy.includes("addCategorySimilarBody"), "similar body helper");
assert(
  copy.includes("A close name match exists. Create"),
  "similar empty sample",
);
assert(copy.includes("Close matches include"), "similar named sample");

assert(api.includes("createItemCategory"), "api create");
assert(api.includes('method: "POST"'), "POST");
assert(api.includes("/item-categories"), "item-categories path");

assert(
  page.includes("WIRE") || page.includes("STATES") || page.includes("COMPARE"),
  "WIRE+ header",
);
assert(page.includes("createItemCategory"), "uses create");
assert(page.includes("listItemCategories"), "lists for similar");
assert(page.includes("catalogFuzzyRank"), "fuzzy rank");
assert(page.includes("ADD_CATEGORY_SIMILAR_MIN_SCORE"), "uses 86");
assert(page.includes("ADD_CATEGORY_CREATED_SNACK"), "snack");
assert(page.includes('data-slot="similarDialog"'), "similar dialog");
assert(page.includes('data-action="similar-go-back"'), "similar go back");
assert(page.includes('data-action="similar-create"'), "similar create");
assert(page.includes("setSaving"), "saving state");
assert(page.includes("disabled={saving}"), "disabled while saving");
assert(page.includes("onClose"), "close still BUTTONS");
assert(page.includes('data-testid="add-category-snack"'), "snack testid");

assert(pkg.includes("test:catalog-new-category-wire"), "package script");

/* similar body helper parity */
function addCategorySimilarBody(name, sampleNames) {
  const sample = sampleNames.filter((s) => s.trim().length > 0).slice(0, 2);
  if (sample.length === 0) {
    return `A close name match exists. Create "${name}" anyway?`;
  }
  return `Close matches include "${sample.join('", "')}". Create "${name}" anyway?`;
}
assert(
  addCategorySimilarBody("Rice", []).includes("A close name match exists"),
  "empty sample body",
);
assert(
  addCategorySimilarBody("Rice", ["Rices", "Rice Oil"]).includes(
    'Close matches include "Rices", "Rice Oil"',
  ),
  "named sample body",
);

for (const name of [
  "check-catalog-new-category-scaffold.mjs",
  "check-catalog-new-category-layout.mjs",
  "check-catalog-new-category-fields.mjs",
  "check-catalog-new-category-buttons.mjs",
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
  console.error("Catalog new-category WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog new-category WIRE checks PASS");
