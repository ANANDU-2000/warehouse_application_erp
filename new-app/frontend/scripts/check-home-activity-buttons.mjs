/**
 * Owner /home/activity BUTTONS smoke checks.
 * Run: node scripts/check-home-activity-buttons.mjs
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
assert(existsSync(pagePath), "page exists");

const page = readFileSync(pagePath, "utf8");

assert(page.includes("useNavigate"), "useNavigate");
assert(page.includes("handleBack"), "handleBack");
assert(page.includes("popOrGo"), "popOrGo helper");
assert(page.includes('"/home"') || page.includes("'/home'"), "fallback /home");
assert(page.includes('aria-label="Back"'), "Back aria-label");
assert(page.includes("onClick={handleBack}"), "back onClick");

assert(!page.includes("/dashboard?"), "no month dashboard");
/* WIRE owns feed APIs */
const css = readFileSync(
  join(root, "src/features/home/HomeWarehouseActivityPage.css"),
  "utf8",
);
assert(css.includes("home-activity-page__back"), "back button class");
assert(css.includes("cursor: pointer"), "back clickable");

if (failures.length) {
  console.error("Home activity BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home activity BUTTONS checks PASS");
