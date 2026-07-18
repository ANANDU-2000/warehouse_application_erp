/**
 * Owner /home/activity LAYOUT smoke checks.
 * Run: node scripts/check-home-activity-layout.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const pagePath = join(
  root,
  "src/features/home/HomeWarehouseActivityPage.tsx",
);
const copyPath = join(root, "src/features/home/homeActivityCopy.ts");
const cssPath = join(root, "src/features/home/HomeWarehouseActivityPage.css");

assert(existsSync(pagePath), "page exists");
assert(existsSync(copyPath), "homeActivityCopy exists");

const page = readFileSync(pagePath, "utf8");
const copy = readFileSync(copyPath, "utf8");
const css = readFileSync(cssPath, "utf8");

assert(copy.includes("Warehouse activity"), "appbar title constant");
assert(
  copy.includes("Applies to purchase center and warehouse activity"),
  "period caption exact",
);
assert(copy.includes("Bill · Entered by"), "col bill");
assert(copy.includes("Qty · Bags · Tins"), "col qty");
assert(copy.includes("Verified by"), "col verified");

assert(page.includes("HOME_ACTIVITY_PERIOD_CAPTION"), "uses caption constant");
assert(page.includes("HOME_ACTIVITY_COL_BILL"), "uses table header");
assert(page.includes("BackIcon") || page.includes("back-icon"), "back icon chrome");
assert(page.includes('data-slot="period-filter"'), "period-filter slot");
assert(page.includes('data-slot="activity-list"'), "list slot");

assert(!page.includes("fetch("), "no fetch");
/* BUTTONS may useNavigate + popOrGo — LAYOUT chrome only below */

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "bg brandBackground");
assert(css.includes("#64748b") || css.includes("#64748B"), "caption muted");
assert(css.includes("font-size: 11px"), "caption 11px");
assert(css.includes("border-radius: 16px"), "card r16");
assert(css.includes("#f1f5f9") || css.includes("#F1F5F9"), "table header bg");
assert(css.includes("border-radius: 10px"), "table header r10");
assert(css.includes("height: 32px"), "period chips row 32");
assert(css.includes("font-weight: 800"), "title w800");

if (failures.length) {
  console.error("Home activity LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home activity LAYOUT checks PASS");
