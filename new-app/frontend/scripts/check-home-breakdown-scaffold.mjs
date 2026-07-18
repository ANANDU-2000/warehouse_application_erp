/**
 * Owner /home/breakdown-more SCAFFOLD smoke checks.
 * Run: node scripts/check-home-breakdown-scaffold.mjs
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
  "src/features/home/HomeBreakdownListPage.tsx",
);
assert(existsSync(pagePath), "HomeBreakdownListPage exists");

const page = readFileSync(pagePath, "utf8");
assert(page.includes("homeBreakdownAppBarTitle"), "AppBar title helper");
assert(page.includes('data-slot="appbar"'), "appbar slot");
assert(page.includes('data-slot="total-header"'), "total-header slot");
assert(page.includes('data-slot="search"'), "search slot");
assert(page.includes('data-slot="ranked-list"'), "ranked-list slot");
assert(!page.includes("fetch("), "no fetch in SCAFFOLD");
/* BUTTONS owns popOrGo */

const tabPath = join(root, "src/features/home/homeBreakdownTab.ts");
assert(existsSync(tabPath), "homeBreakdownTab.ts exists");
const tab = readFileSync(tabPath, "utf8");
assert(tab.includes("Category"), "Category label");
assert(tab.includes("Subcategory"), "Subcategory label");
assert(tab.includes("Supplier"), "Supplier label");
assert(tab.includes("Items"), "Items label");
assert(tab.includes("homeBreakdownTabFromQuery"), "fromQuery");
assert(tab.includes("All —"), "AppBar title pattern");

const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");
assert(
  router.includes("HomeBreakdownListPage"),
  "router imports breakdown page",
);
assert(router.includes('path="/home/breakdown-more"'), "breakdown route");

const css = readFileSync(
  join(root, "src/features/home/HomeBreakdownListPage.css"),
  "utf8",
);
assert(
  css.includes("#f7f9f6") || css.includes("#F7F9F6"),
  "brandBackground #F7F9F6",
);

if (failures.length) {
  console.error("Home breakdown SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home breakdown SCAFFOLD checks PASS");
