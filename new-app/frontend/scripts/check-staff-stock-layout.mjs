/**
 * Staff stock /staff/stock LAYOUT smoke.
 * Run: node scripts/check-staff-stock-layout.mjs
 * Source: stock_operational_top_bar; stock_status_quick_chips; stock_table_layout
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

const pagePath = join(root, "src/features/staff/stock/StaffStockPage.tsx");
const cssPath = join(root, "src/features/staff/stock/StaffStockPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="tabs"'), "tabs");
assert(page.includes('data-slot="statusChips"'), "statusChips");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="tableHeader"'), "tableHeader");
assert(page.includes('data-slot="results"'), "results");
assert(page.includes('data-slot="empty"'), "empty");
assert(page.includes('data-slot="list"'), "list");
assert(page.includes("staff-stock-chip--all"), "chip all mod");
assert(page.includes("staff-stock-chip--low"), "chip low mod");
assert(page.includes("staff-stock-chip--out"), "chip out mod");
assert(page.includes("readOnly"), "search inert");
assert(page.includes("STAFF_STOCK_EMPTY"), "empty copy");

assert(css.includes("#f5f3ee") || css.includes("#F5F3EE"), "page bg F5F3EE");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brandPrimary All");
assert(css.includes("#e65100") || css.includes("#E65100"), "Low orange");
assert(css.includes("#dc2626") || css.includes("#DC2626"), "Out red");
assert(css.includes("#d8d5d0") || css.includes("#D8D5D0"), "table border");
assert(css.includes("#e8e6e1") || css.includes("#E8E6E1"), "header fill");
assert(css.includes("#475569"), "header label");
assert(css.includes("#1a1a1a") || css.includes("#1A1A1A"), "appBar fg");
assert(css.includes("#9ca3af") || css.includes("#9CA3AF"), "hint");
assert(css.includes("min-height: 48px"), "toolbar 48");
assert(css.includes("min-height: 40px"), "tab/search 40");
assert(css.includes("min-height: 72px"), "row min 72");
assert(css.includes("font-size: 17px"), "title 17");
assert(css.includes("font-weight: 800"), "w800");
assert(css.includes("border-radius: 8px"), "search radius 8");
assert(css.includes("border-radius: 2px 2px 0 0"), "header radius top 2");
assert(css.includes("padding: 4px 12px 2px"), "chip pad");
assert(css.includes("gap: 6px"), "chip gap 6");
assert(css.includes("--ss-gutter: 16px"), "gutter 16");
assert(css.includes("--ss-metric-w: 52px"), "metric 52");
assert(css.includes("pointer-events: none"), "inert chrome");
assert(css.includes("staff-stock-row"), "row chrome CSS");
assert(css.includes("staff-stock-chip--all"), "chip all CSS");

assert(pkg.includes("test:staff-stock-layout"), "layout script");
assert(pkg.includes("test:staff-stock-scaffold"), "scaffold script");

const scaffold = spawnSync(
  process.execPath,
  [join(root, "scripts/check-staff-stock-scaffold.mjs")],
  { cwd: root, encoding: "utf8" },
);
if (scaffold.status !== 0) {
  failures.push("scaffold smoke FAILED");
  if (scaffold.stdout) process.stdout.write(scaffold.stdout);
  if (scaffold.stderr) process.stderr.write(scaffold.stderr);
}

if (failures.length) {
  console.error("Staff stock LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff stock LAYOUT checks PASS");
