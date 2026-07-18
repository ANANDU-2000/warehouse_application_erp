/**
 * Login LAYOUT smoke checks (no React test runner yet).
 * Run: node scripts/check-login-layout.mjs
 * Source tokens: docs/modules/login.md §2–5.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const bg = join(root, "public/brand/getstarted_bg.png");
assert(existsSync(bg), "missing public/brand/getstarted_bg.png");

const colorsPath = join(root, "src/shared/theme/colors.ts");
const colorsSrc = readFileSync(colorsPath, "utf8");
assert(colorsSrc.includes("#0E4F46"), "brandPrimary #0E4F46 missing");
assert(colorsSrc.includes("#E8F5F2"), "scaffoldMint #E8F5F2 missing");
assert(colorsSrc.includes("/brand/getstarted_bg.png"), "AUTH_BACKGROUND_SRC missing");

const loginSrc = readFileSync(join(root, "src/features/auth/LoginPage.tsx"), "utf8");
assert(loginSrc.includes("Harisree Agency"), "agency title missing");
assert(loginSrc.includes("Warehouse Management"), "subtitle missing");
assert(loginSrc.includes("Sign In"), "Sign In heading missing");
assert(!loginSrc.includes("fetch("), "no API fetch in LAYOUT/FIELDS");

if (failures.length) {
  console.error("Login LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Login LAYOUT checks PASS");
