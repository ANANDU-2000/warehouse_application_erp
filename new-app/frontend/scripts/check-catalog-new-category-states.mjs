/**
 * Catalog new category /catalog/new-category STATES smoke.
 * Run: node scripts/check-catalog-new-category-states.mjs
 * Source: form_feedback.dart showRetryableErrorSnackBar · Retry
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
const errPath = join(root, "src/features/catalog/catalogAddCategoryError.ts");
const pagePath = join(root, "src/features/catalog/CatalogAddCategoryPage.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(errPath), "error mapper exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const err = readFileSync(errPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('ADD_CATEGORY_RETRY = "Retry"'), "Retry label");
assert(copy.includes('ADD_CATEGORY_CREATED_SNACK = "Category created"'), "ok snack");

assert(err.includes("mapAddCategoryError"), "mapper");
assert(err.includes("Session expired. Please sign in again."), "401/403");
assert(err.includes("This item was not found."), "404");
assert(err.includes("Request timed out. Please try again."), "408");
assert(err.includes("Too many requests. Wait a moment and try again."), "429");
assert(err.includes("Something went wrong. Please try again."), "5xx");
assert(err.includes("CatalogApiError"), "api error");
assert(err.includes("CatalogNetworkError"), "network error");

assert(
  page.includes("STATES") || page.includes("COMPARE"),
  "STATES+ header",
);
assert(page.includes("mapAddCategoryError"), "uses mapper");
assert(page.includes('data-action="retry"'), "retry action");
assert(page.includes("onRetry"), "onRetry");
assert(page.includes('data-snack-kind'), "snack kind");
assert(page.includes("add-category-page__snack--error"), "error snack class");
assert(page.includes("disabled={saving}"), "saving disables");
assert(page.includes('data-slot="saving"'), "spinner slot");
assert(page.includes("createItemCategory"), "wire create still");
assert(!/DioException|stack trace/i.test(page), "no raw dio/stack in page");

assert(pkg.includes("test:catalog-new-category-states"), "package script");

for (const name of [
  "check-catalog-new-category-scaffold.mjs",
  "check-catalog-new-category-layout.mjs",
  "check-catalog-new-category-fields.mjs",
  "check-catalog-new-category-buttons.mjs",
  "check-catalog-new-category-wire.mjs",
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
  console.error("Catalog new-category STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog new-category STATES checks PASS");
