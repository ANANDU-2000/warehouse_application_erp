/**
 * Catalog taxonomy hub /catalog/taxonomy LAYOUT smoke.
 * Run: node scripts/check-catalog-taxonomy-layout.mjs
 * Source: catalog_taxonomy_hub_page.dart · HexaOp · HexaColors
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
const cssPath = join(root, "src/features/catalog/CatalogTaxonomyHubPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  page.includes("LAYOUT") ||
    page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    page.includes("COMPARE"),
  "step header",
);
assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="explainer"'), "explainer");
assert(page.includes('data-slot="chips"'), "chips");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="categoryList"'), "categoryList");
assert(page.includes('data-slot="empty"'), "empty");
assert(page.includes('data-slot="fab"'), "fab");
assert(page.includes("taxonomy-hub-page__search-icon"), "search icon");
assert(
  page.includes("taxonomy-hub-page__search-hint") ||
    page.includes("taxonomy-hub-page__search-input"),
  "search hint or FIELDS input",
);
assert(page.includes("taxonomy-hub-page__action-chip"), "action chip");
assert(page.includes('data-chrome="category-row"'), "row chrome");
assert(page.includes("taxonomy-hub-page__avatar"), "avatar");
assert(page.includes("taxonomy-hub-page__row-name"), "row name");
assert(page.includes("taxonomy-hub-page__empty-icon"), "empty icon");
assert(page.includes("taxonomy-hub-page__fab"), "fab chrome");
assert(page.includes("isStaff"), "staff role awareness");
assert(!page.includes("Navigate"), "staff allowed — no Navigate");
assert(!page.includes("fetch("), "no fetch");
assert(
  page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    !page.includes("onClick"),
  "no onClick until FIELDS+",
);
assert(
  page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    !page.includes("<input"),
  "no input until FIELDS+",
);
assert(
  page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    !page.includes("<button"),
  "no button until FIELDS+",
);

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "brand bg");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brandPrimary");
assert(css.includes("#159a8a") || css.includes("#159A8A"), "primaryMid");
assert(css.includes("#e2e8e6") || css.includes("#E2E8E6"), "brandBorder");
assert(css.includes("#e5e7eb") || css.includes("#E5E7EB"), "input border");
assert(css.includes("#9ca3af") || css.includes("#9CA3AF"), "input hint");
assert(css.includes("#0f172a") || css.includes("#0F172A"), "onSurface");
assert(css.includes("#5c6578") || css.includes("#5C6578"), "textSecondary");
assert(css.includes("--tax-gutter: 16px"), "gutter 16");
assert(css.includes("--tax-toolbar: 56px"), "toolbar 56");
assert(css.includes("border-radius: 12px"), "search radius 12");
assert(css.includes("border-radius: 16px"), "chip radius 16");
assert(css.includes("border-radius: 50%"), "fab/avatar circle");
assert(css.includes("rgba(21, 154, 138, 0.2)"), "avatar tint 20%");
assert(css.includes("font-weight: 800"), "w800");
assert(css.includes("font-size: 16px"), "name 16");
assert(css.includes("font-size: 13px"), "explainer/chip 13");
assert(css.includes("font-size: 12px"), "meta 12");
assert(css.includes("font-size: 48px"), "empty icon 48");
assert(css.includes("width: 56px"), "fab 56");
assert(css.includes("pointer-events: none"), "inert");

assert(pkg.includes("test:catalog-taxonomy-layout"), "package script");

const r = spawnSync(
  process.execPath,
  [join(root, "scripts", "check-catalog-taxonomy-scaffold.mjs")],
  { cwd: root, encoding: "utf8" },
);
if (r.status !== 0) {
  failures.push("scaffold FAILED");
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
}

if (failures.length) {
  console.error("Catalog taxonomy LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog taxonomy LAYOUT checks PASS");
