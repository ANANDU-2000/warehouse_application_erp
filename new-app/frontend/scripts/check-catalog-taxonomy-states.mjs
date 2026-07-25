/**
 * Catalog taxonomy hub /catalog/taxonomy STATES smoke.
 * Run: node scripts/check-catalog-taxonomy-states.mjs
 * Source: ListSkeleton() · FriendlyLoadError defaults
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
const subPath = join(
  root,
  "src/features/catalog/catalogTaxonomyLoadSubtitle.ts",
);
const pagePath = join(root, "src/features/catalog/CatalogTaxonomyHubPage.tsx");
const cssPath = join(root, "src/features/catalog/CatalogTaxonomyHubPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(subPath), "subtitle exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('TAXONOMY_LOAD_FAILED = "Unable to load data"'), "title");
assert(copy.includes('TAXONOMY_RETRY_SUBTITLE = "Tap to retry."'), "sub");
assert(copy.includes('TAXONOMY_RETRY = "Retry"'), "Retry");
assert(copy.includes("TAXONOMY_SKELETON_ROWS = 6"), "skel 6");
assert(copy.includes("TAXONOMY_SKELETON_HEIGHT_PX = 84"), "h84");

assert(sub.includes("mapTaxonomyLoadTitle"), "title mapper");
assert(sub.includes("mapTaxonomyLoadSubtitle"), "sub mapper");
assert(sub.includes("TAXONOMY_LOAD_FAILED"), "fixed title");
assert(sub.includes("TAXONOMY_RETRY_SUBTITLE"), "fixed sub");

assert(
  page.includes("STATES") || page.includes("COMPARE"),
  "STATES+ header",
);
assert(page.includes("mapTaxonomyLoadTitle"), "uses title");
assert(page.includes("mapTaxonomyLoadSubtitle"), "uses subtitle");
assert(page.includes("showInitialSkeleton"), "skeleton gate");
assert(page.includes("taxonomy-hub-page__skeleton"), "skeleton class");
assert(page.includes("ListSkeleton"), "ListSkeleton aria");
assert(page.includes("taxonomy-hub-page__friendly-error"), "FriendlyLoadError");
assert(page.includes('data-testid="taxonomy-loading"'), "loading testid");
assert(page.includes('data-testid="taxonomy-error"'), "error testid");
assert(page.includes('data-testid="taxonomy-retry"'), "retry testid");
assert(page.includes("TAXONOMY_SKELETON_ROWS"), "uses row count");
assert(page.includes("listItemCategories"), "still wired");
assert(page.includes("hasData"), "null gate");
assert(!page.includes("Loading…"), "no plain Loading text");

assert(css.includes("taxonomy-hub-page__skeleton"), "skeleton css");
assert(css.includes("taxonomy-hub-page__friendly-error"), "friendly css");
assert(css.includes("#eff2f1") || css.includes("#EFF2F1"), "skeleton base");

assert(pkg.includes("test:catalog-taxonomy-states"), "package script");

for (const name of [
  "check-catalog-taxonomy-scaffold.mjs",
  "check-catalog-taxonomy-layout.mjs",
  "check-catalog-taxonomy-fields.mjs",
  "check-catalog-taxonomy-buttons.mjs",
  "check-catalog-taxonomy-wire.mjs",
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
  console.error("Catalog taxonomy STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog taxonomy STATES checks PASS");
