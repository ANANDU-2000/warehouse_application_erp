/**
 * Staff low stock /staff/low-stock LAYOUT smoke.
 * Run: node scripts/check-staff-low-stock-layout.mjs
 * Source: low_stock_dashboard_page.dart · LowStockCompactItemRow · HexaColors
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

const pagePath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="tabs"'), "tabs");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="results"'), "results");
assert(page.includes('data-slot="empty"'), "empty");
assert(page.includes('data-slot="tree"'), "tree");
assert(page.includes('data-slot="categoryCard"'), "category card");
assert(page.includes('data-slot="compactRow"'), "compact row");
assert(
  page.includes("staff-ls-tabs--inert") ||
    page.includes("staff-ls-tabs--active"),
  "tabs class",
);
assert(
  page.includes("staff-ls-search--inert") ||
    page.includes("staff-ls-search--active"),
  "search class",
);
assert(page.includes("staff-ls-export--inert") || page.includes("exportActions"), "export slot");
assert(
  page.includes("readOnly") ||
    page.includes("staff-ls-search__input--active"),
  "search field present (FIELDS may activate)",
);
assert(page.includes("staff-ls-row__bar--out"), "bar out");
assert(page.includes("staff-ls-status--out"), "status out");
assert(
  page.includes("staff-ls-status--low") ||
    css.includes("staff-ls-status--low"),
  "status low",
);
assert(page.includes('data-deferred="inform-owner"') || page.includes('data-action="inform-owner"'), "inform deferred");
assert(page.includes('data-deferred="category-tree"') || page.includes('data-slot="tree"'), "tree deferred");
assert(!page.includes("fetch("), "no fetch");

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "page bg");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brandPrimary");
assert(css.includes("#e2e8e6") || css.includes("#E2E8E6"), "brandBorder");
assert(css.includes("#9ca3af") || css.includes("#9CA3AF"), "hint");
assert(css.includes("#64748b") || css.includes("#64748B"), "muted");
assert(css.includes("#159a8a") || css.includes("#159A8A"), "brandAccent");
assert(css.includes("#065f46") || css.includes("#065F46"), "tab selected");
assert(css.includes("#f1f5f4") || css.includes("#F1F5F4"), "tab bg");
assert(css.includes("#334155"), "tab fg");
assert(css.includes("#dc2626") || css.includes("#DC2626"), "critical");
assert(css.includes("#f59e0b") || css.includes("#F59E0B"), "warn");
assert(css.includes("#94a3b8") || css.includes("#94A3B8"), "sub muted");
assert(css.includes("--sls-gutter: 12px"), "gutter 12");
assert(css.includes("border-radius: 10px"), "search radius 10");
assert(css.includes("min-height: 56px"), "appBar 56");
assert(css.includes("min-height: 40px"), "search/tabs 40");
assert(css.includes("font-size: 20px"), "title 20");
assert(css.includes("font-size: 13px"), "tab 13");
assert(css.includes("font-size: 11px"), "subtab/inform 11");
assert(css.includes("gap: 6px"), "gap 6");
assert(css.includes("pointer-events: none"), "inert chrome");
assert(css.includes("staff-ls-row"), "row chrome");
assert(css.includes("staff-ls-category"), "category chrome");
assert(css.includes("staff-ls-status"), "status chip");
assert(css.includes("--sls-list-pad-bottom: 88px"), "list pad 88");

assert(pkg.includes("test:staff-low-stock-layout"), "layout script");
assert(pkg.includes("test:staff-low-stock-scaffold"), "scaffold script");

const scaffold = spawnSync(
  process.execPath,
  [join(root, "scripts/check-staff-low-stock-scaffold.mjs")],
  { cwd: root, encoding: "utf8" },
);
if (scaffold.status !== 0) {
  failures.push("scaffold smoke FAILED");
  if (scaffold.stdout) process.stdout.write(scaffold.stdout);
  if (scaffold.stderr) process.stderr.write(scaffold.stderr);
}

if (failures.length) {
  console.error("Staff low-stock LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff low-stock LAYOUT checks PASS");
