/**
 * Catalog hub /catalog LAYOUT smoke.
 * Run: node scripts/check-catalog-layout.mjs
 * Source: catalog_page.dart · HexaColors
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

const pagePath = join(root, "src/features/catalog/CatalogPage.tsx");
const cssPath = join(root, "src/features/catalog/CatalogPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  page.includes("LAYOUT") ||
    page.includes("FIELDS") ||
    page.includes("SCAFFOLD") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE"),
  "step header",
);
assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="categoryGrid"'), "grid");
assert(page.includes('data-slot="fab"'), "fab");
assert(page.includes("catalog-page__search-icon"), "search icon");
assert(
  page.includes("catalog-page__search-hint") ||
    page.includes("catalog-page__search-input"),
  "search hint or FIELDS input",
);
assert(page.includes('data-chrome="category-card"'), "card chrome");
assert(page.includes("catalog-page__avatar"), "avatar");
assert(page.includes("catalog-page__fab-label"), "fab label");
assert(page.includes('role === "staff"'), "staff gate");
assert(!page.includes("fetch("), "no fetch");
assert(
  page.includes("FIELDS") || !page.includes("onClick"),
  "no onClick until FIELDS",
);
assert(
  page.includes("FIELDS") || !page.includes("<input"),
  "no input until FIELDS",
);
assert(
  page.includes("FIELDS") || !page.includes("<button"),
  "no button until FIELDS",
);

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "brand bg");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brandPrimary");
assert(css.includes("#159a8a") || css.includes("#159A8A"), "primaryMid");
assert(css.includes("#e2e8e6") || css.includes("#E2E8E6"), "brandBorder");
assert(css.includes("#e5e7eb") || css.includes("#E5E7EB"), "input border");
assert(css.includes("#9ca3af") || css.includes("#9CA3AF"), "input hint");
assert(css.includes("#0f172a") || css.includes("#0F172A"), "onSurface");
assert(css.includes("#5c6578") || css.includes("#5C6578"), "textSecondary");
assert(css.includes("--cat-shell-max: 900px"), "shell max 900");
assert(css.includes("--cat-toolbar: 56px"), "toolbar 56");
assert(css.includes("--cat-gutter: 16px"), "gutter 16");
assert(css.includes("border-radius: 12px"), "search radius 12");
assert(css.includes("border-radius: 14px"), "card radius 14");
assert(css.includes("padding: 12px"), "card pad 12");
assert(css.includes("rgba(21, 154, 138, 0.2)"), "avatar tint 20%");
assert(css.includes("font-weight: 800"), "w800");
assert(css.includes("font-size: 16px"), "name 16");
assert(css.includes("100px"), "bottom pad 100");
assert(css.includes("pointer-events: none"), "inert");

assert(pkg.includes("test:catalog-layout"), "package script");

const r = spawnSync(
  process.execPath,
  [join(root, "scripts", "check-catalog-scaffold.mjs")],
  { cwd: root, encoding: "utf8" },
);
if (r.status !== 0) {
  failures.push("scaffold FAILED");
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
}

if (failures.length) {
  console.error("Catalog LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog LAYOUT checks PASS");
