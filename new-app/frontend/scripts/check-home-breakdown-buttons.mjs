/**
 * Owner /home/breakdown-more BUTTONS smoke checks.
 * Run: node scripts/check-home-breakdown-buttons.mjs
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
assert(existsSync(pagePath), "page exists");

const page = readFileSync(pagePath, "utf8");

assert(page.includes("useNavigate"), "useNavigate");
assert(page.includes("handleBack"), "handleBack");
assert(page.includes("popOrGo"), "popOrGo helper");
assert(page.includes('"/home"') || page.includes("'/home'"), "fallback /home");
assert(page.includes('aria-label="Back"'), "Back aria-label");
assert(page.includes("onClick={handleBack}"), "back onClick");
assert(page.includes("<button"), "back is button");
assert(!page.includes("/dashboard?"), "no month dashboard");
assert(!page.includes("fetch("), "no fetch yet");

const css = readFileSync(
  join(root, "src/features/home/HomeBreakdownListPage.css"),
  "utf8",
);
assert(css.includes("home-breakdown-page__back"), "back button class");
assert(css.includes("cursor: pointer"), "back clickable");
assert(!css.includes("pointer-events: none"), "back not inert");

if (failures.length) {
  console.error("Home breakdown BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home breakdown BUTTONS checks PASS");
