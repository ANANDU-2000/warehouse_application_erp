/**
 * Owner /home/breakdown-more LAYOUT smoke checks.
 * Run: node scripts/check-home-breakdown-layout.mjs
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
const copyPath = join(root, "src/features/home/homeBreakdownCopy.ts");
const cssPath = join(root, "src/features/home/HomeBreakdownListPage.css");

assert(existsSync(pagePath), "page exists");
assert(existsSync(copyPath), "homeBreakdownCopy exists");

const page = readFileSync(pagePath, "utf8");
const copy = readFileSync(copyPath, "utf8");
const css = readFileSync(cssPath, "utf8");

assert(copy.includes("Total:"), "Total label");
assert(copy.includes("Search title or quantity…"), "search hint");

assert(page.includes("HOME_BREAKDOWN_TOTAL_LABEL"), "uses Total constant");
assert(page.includes("HOME_BREAKDOWN_SEARCH_HINT"), "uses search hint");
assert(page.includes("BackIcon") || page.includes("back-icon"), "back icon");
assert(page.includes('aria-label="Back"'), "Back aria-label");
/* BUTTONS owns popOrGo */
assert(!page.includes("fetch("), "no fetch");

assert(page.includes('data-slot="total-header"'), "total-header slot");
assert(page.includes('data-slot="search"'), "search slot");
assert(page.includes('data-slot="ranked-list"'), "ranked-list slot");
assert(page.includes('tab !== "category"') || page.includes("showSearchChrome"), "hide search on category");

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "bg brandBackground");
assert(css.includes("#e2e8e6") || css.includes("#E2E8E6"), "brandBorder");
assert(css.includes("#5c6578") || css.includes("#5C6578"), "textSecondary");
assert(css.includes("border-radius: 8px"), "total card r8");
assert(css.includes("border-radius: 12px"), "search r12");
assert(css.includes("font-weight: 800"), "title w800");
assert(css.includes("font-weight: 900"), "amount w900");
assert(css.includes("cursor: pointer"), "back clickable CSS");
assert(css.includes("96px"), "body bottom pad 96");

if (failures.length) {
  console.error("Home breakdown LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home breakdown LAYOUT checks PASS");
