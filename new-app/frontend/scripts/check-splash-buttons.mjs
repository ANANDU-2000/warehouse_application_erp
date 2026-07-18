/**
 * Splash BUTTONS smoke checks.
 * Run: node scripts/check-splash-buttons.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(
  existsSync(join(root, "src/features/splash/SplashPage.tsx")),
  "SplashPage exists",
);

const splash = readFileSync(
  join(root, "src/features/splash/SplashPage.tsx"),
  "utf8",
);
assert(splash.includes("Retry"), "Retry label");
assert(splash.includes("Use another account"), "Use another account label");
assert(
  splash.includes(
    "We couldn't refresh your session. Check your connection and tap Retry.",
  ),
  "session refresh error string",
);
assert(splash.includes('navigate("/login")'), "navigate to /login");
assert(splash.includes("handleRetry"), "Retry handler");
assert(splash.includes("300"), "Retry stub delay");
assert(!splash.includes("fetch("), "no fetch");
assert(!splash.includes("/auth/refresh"), "no auth refresh path");
assert(!splash.includes("meBusinesses"), "no meBusinesses");
assert(!splash.includes("_boot"), "no boot");

const css = readFileSync(
  join(root, "src/features/splash/SplashPage.css"),
  "utf8",
);
assert(css.includes("padding: 0 40px"), "error pad H 40");
assert(css.includes("rgba(255, 255, 255, 0.2)"), "Retry bg α0.2");
assert(css.includes("rgba(255, 255, 255, 0.7)"), "other account white70");
assert(css.includes("margin-top: 16px"), "gap 16 below error");
assert(css.includes("margin-top: 10px"), "gap 10 between CTAs");

if (failures.length) {
  console.error("Splash BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Splash BUTTONS checks PASS");
