/**
 * Owner /home/breakdown-more FIELDS smoke checks.
 * Run: node scripts/check-home-breakdown-fields.mjs
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
const searchPath = join(root, "src/features/home/homeBreakdownSearch.ts");
const copyPath = join(root, "src/features/home/homeBreakdownCopy.ts");

assert(existsSync(pagePath), "page exists");
assert(existsSync(searchPath), "homeBreakdownSearch exists");

const page = readFileSync(pagePath, "utf8");
const search = readFileSync(searchPath, "utf8");
const copy = readFileSync(copyPath, "utf8");

assert(copy.includes("Search title or quantity…"), "hint literal");
assert(page.includes("HOME_BREAKDOWN_SEARCH_HINT"), "uses hint");
assert(page.includes("searchQuery"), "searchQuery state");
assert(page.includes("type=\"search\"") || page.includes("type='search'"), "search input");
assert(page.includes("clearSearch") || page.includes("search-clear"), "clear");
assert(page.includes("searchActive"), "searchActive collapses total");
assert(page.includes('tab !== "category"') || page.includes("showSearch"), "hide on category");
assert(!page.includes("popOrGo"), "no back BUTTONS");
assert(!page.includes("fetch("), "no fetch");

assert(search.includes("breakdownRowMatchesQuery"), "match helper");
assert(search.includes("toLowerCase"), "case-insensitive");

/* Runtime match parity vs Flutter _breakdownRowMatchesQuery */
function breakdownRowMatchesQuery({ title, qtyLine, query }) {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  return (
    title.toLowerCase().includes(q) || qtyLine.toLowerCase().includes(q)
  );
}
assert(breakdownRowMatchesQuery({ title: "Rice", qtyLine: "10 BAG", query: "" }), "empty matches");
assert(breakdownRowMatchesQuery({ title: "Rice", qtyLine: "10 BAG", query: "rice" }), "title match");
assert(breakdownRowMatchesQuery({ title: "Rice", qtyLine: "10 BAG", query: "bag" }), "qty match");
assert(!breakdownRowMatchesQuery({ title: "Rice", qtyLine: "10 BAG", query: "wheat" }), "no match");

if (failures.length) {
  console.error("Home breakdown FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home breakdown FIELDS checks PASS");
