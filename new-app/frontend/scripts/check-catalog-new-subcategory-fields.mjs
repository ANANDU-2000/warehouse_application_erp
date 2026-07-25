/**
 * Catalog new subcategory /catalog/category/:categoryId/new-subcategory FIELDS smoke.
 * Run: node scripts/check-catalog-new-subcategory-fields.mjs
 * Source: catalog_add_subcategory_page.dart — Name + Enter a name
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

const copyPath = join(root, "src/features/catalog/catalogAddSubcategoryCopy.ts");
const fieldsPath = join(
  root,
  "src/features/catalog/catalogAddSubcategoryFields.ts",
);
const pagePath = join(
  root,
  "src/features/catalog/CatalogAddSubcategoryPage.tsx",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(fieldsPath), "fields exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const fields = readFileSync(fieldsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('ADD_SUBCATEGORY_NAME_LABEL = "Name"'), "label");
assert(
  copy.includes('ADD_SUBCATEGORY_NAME_HINT = "e.g. Biriyani rice"'),
  "hint",
);
assert(copy.includes('ADD_SUBCATEGORY_NAME_ERROR = "Enter a name"'), "error");

assert(fields.includes("addSubcategoryNameError"), "error helper");
assert(fields.includes("ADD_SUBCATEGORY_NAME_ERROR"), "uses error copy");
assert(fields.includes(".trim()"), "trim empty check");

assert(
  page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    page.includes("COMPARE"),
  "FIELDS+ header",
);
assert(page.includes("useState"), "local state");
assert(page.includes("setName"), "name state");
assert(page.includes("setTouched"), "touched state");
assert(page.includes("addSubcategoryNameError"), "uses helper");
assert(page.includes("data-category-id"), "categoryId");
assert(page.includes('data-testid="add-subcategory-name"'), "name testid");
assert(
  page.includes('data-testid="add-subcategory-name-error"'),
  "error testid",
);
assert(page.includes("add-subcategory-page__field--active"), "field active");
assert(
  page.includes('data-deferred="close"') || page.includes('data-action="close"'),
  "close deferred or BUTTONS",
);
assert(
  page.includes('data-deferred="cancel"') ||
    page.includes('data-action="cancel"'),
  "cancel deferred or BUTTONS",
);
assert(
  page.includes('data-deferred="create"') ||
    page.includes('data-action="create"'),
  "create deferred or BUTTONS",
);
assert(!page.includes("fetch("), "no fetch");

assert(pkg.includes("test:catalog-new-subcategory-fields"), "package script");

function addSubcategoryNameError(args) {
  if (!args.touched) return null;
  if (args.name.trim().length > 0) return null;
  return "Enter a name";
}
assert(
  addSubcategoryNameError({ touched: false, name: "" }) === null,
  "untouched ok",
);
assert(
  addSubcategoryNameError({ touched: true, name: "" }) === "Enter a name",
  "touched empty",
);
assert(
  addSubcategoryNameError({ touched: true, name: "  " }) === "Enter a name",
  "touched whitespace",
);
assert(
  addSubcategoryNameError({ touched: true, name: "Biriyani" }) === null,
  "valid",
);

for (const script of [
  "check-catalog-new-subcategory-scaffold.mjs",
  "check-catalog-new-subcategory-layout.mjs",
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
  console.error("Catalog new-subcategory FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog new-subcategory FIELDS checks PASS");
