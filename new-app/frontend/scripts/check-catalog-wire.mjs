/**
 * Catalog hub /catalog WIRE smoke.
 * Run: node scripts/check-catalog-wire.mjs
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
const apiPath = join(root, "src/features/catalog/catalogApi.ts");
const fuzzyPath = join(root, "src/features/catalog/catalogFuzzy.ts");
const taxPath = join(root, "src/features/catalog/catalogTaxonomy.ts");
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(apiPath), "api exists");
assert(existsSync(fuzzyPath), "fuzzy exists");
assert(existsSync(taxPath), "taxonomy exists");

const page = readFileSync(pagePath, "utf8");
const api = readFileSync(apiPath, "utf8");
const fuzzy = readFileSync(fuzzyPath, "utf8");
const tax = readFileSync(taxPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(page.includes("WIRE") || page.includes("STATES"), "WIRE+ header");
assert(!page.includes("Loading…") || page.includes("STATES"), "plain Loading ok until STATES");
assert(page.includes("listItemCategories"), "list categories");
assert(page.includes("listCatalogItems"), "list items");
assert(page.includes("listCategoryTypesIndex"), "types index");
assert(page.includes("updateItemCategory"), "patch category");
assert(page.includes("deleteItemCategory"), "delete category");
assert(page.includes("catalogDisplayCategories"), "display fuzzy");
assert(page.includes("catalogSuggestionCategories"), "suggestion fuzzy");
assert(page.includes("typeCountForCategory"), "type count");
assert(page.includes("itemCountForCategory"), "item count");
assert(page.includes('data-slot="loading"'), "loading");
assert(page.includes('data-slot="error"'), "error");
assert(page.includes('data-action="retry"'), "retry");
assert(page.includes('data-action="rename-category"'), "rename");
assert(page.includes('data-action="delete-category"'), "delete");
assert(!page.includes('data-sample="buttons"'), "no buttons sample");
assert(page.includes("onBack"), "back still BUTTONS");

assert(api.includes("/item-categories"), "api categories path");
assert(api.includes("/catalog-items"), "api items path");
assert(api.includes("/category-types-index"), "api types index");
assert(api.includes("method: \"PATCH\""), "patch");
assert(api.includes("method: \"DELETE\""), "delete");

assert(fuzzy.includes("catalogFuzzyRank"), "fuzzy rank");
assert(fuzzy.includes("catalogFuzzyScore"), "fuzzy score");
assert(fuzzy.includes("normalizeCatalogSearch"), "normalize");

assert(tax.includes("typeCountForCategory"), "tax type count");
assert(tax.includes("catalogCategoryMeta"), "meta");
assert(tax.includes("subcategories ·"), "meta format");

assert(pkg.includes("test:catalog-wire"), "package script");

/* Inline fuzzy parity (catalog_fuzzy.dart) */
function normalizeCatalogSearch(s) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}
function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(b.length + 1).fill(0);
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}
function catalogFuzzyScore(query, candidate) {
  const q = normalizeCatalogSearch(query);
  const c = normalizeCatalogSearch(candidate);
  if (!q.length) return 100;
  if (!c.length) return 0;
  if (c.includes(q)) return 100;
  const maxLen = Math.max(q.length, c.length);
  if (maxLen > 48) return 0;
  const sim = 70 - levenshtein(q, c) * 4;
  return sim < 0 ? 0 : sim;
}
assert(normalizeCatalogSearch("  A  B ") === "a b", "normalize spaces");
assert(catalogFuzzyScore("rice", "Basmati Rice") === 100, "contains score 100");
assert(
  catalogFuzzyScore(
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    "Oil",
  ) === 0,
  "overlong query score 0",
);

for (const name of [
  "check-catalog-scaffold.mjs",
  "check-catalog-layout.mjs",
  "check-catalog-fields.mjs",
  "check-catalog-buttons.mjs",
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
  console.error("Catalog WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog WIRE checks PASS");
