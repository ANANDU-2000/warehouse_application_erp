/**
 * Catalog new subcategory /catalog/category/:categoryId/new-subcategory BUTTONS smoke.
 * Run: node scripts/check-catalog-new-subcategory-buttons.mjs
 * Source: catalog_add_subcategory_page.dart close · cancel · create validation
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
const pagePath = join(
  root,
  "src/features/catalog/CatalogAddSubcategoryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/catalog/CatalogAddSubcategoryPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  copy.includes('ADD_SUBCATEGORY_BACK_FALLBACK_OWNER = "/catalog/taxonomy"'),
  "owner fallback",
);
assert(
  copy.includes('ADD_SUBCATEGORY_BACK_FALLBACK_STAFF = "/catalog/taxonomy"'),
  "staff fallback",
);

assert(
  page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    page.includes("COMPARE"),
  "BUTTONS+ header",
);
assert(page.includes("onClose"), "onClose");
assert(page.includes("onCancel"), "onCancel");
assert(page.includes("onCreate"), "onCreate");
assert(page.includes("popOrGo"), "popOrGo");
assert(page.includes("useNavigate"), "navigate");
assert(page.includes("data-category-id"), "categoryId");
assert(page.includes("addSubcategoryNameIsEmpty"), "empty check on create");
assert(page.includes('data-action="close"'), "close action");
assert(page.includes('data-action="cancel"'), "cancel action");
assert(page.includes('data-action="create"'), "create action");
assert(page.includes("setTouched(true)"), "create sets touched");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("createCategoryType"), "no createCategoryType yet");
assert(!page.includes('method: "POST"'), "no POST method yet");

assert(css.includes("add-subcategory-page__icon-btn--active"), "icon active");
assert(css.includes("add-subcategory-page__btn--active"), "btn active");

assert(pkg.includes("test:catalog-new-subcategory-buttons"), "package script");

for (const name of [
  "check-catalog-new-subcategory-scaffold.mjs",
  "check-catalog-new-subcategory-layout.mjs",
  "check-catalog-new-subcategory-fields.mjs",
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
  console.error("Catalog new-subcategory BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog new-subcategory BUTTONS checks PASS");
