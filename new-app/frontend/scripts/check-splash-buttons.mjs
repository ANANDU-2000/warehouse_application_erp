/**
 * Splash BUTTONS smoke checks (labels/CSS remain valid after WIRE).
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
const copy = readFileSync(
  join(root, "src/features/splash/splashCopy.ts"),
  "utf8",
);
assert(copy.includes("Retry"), "Retry label in splashCopy");
assert(copy.includes("Use another account"), "Use another account in splashCopy");
assert(
  copy.includes(
    "We couldn't refresh your session. Check your connection and tap Retry.",
  ),
  "session refresh error string",
);
assert(splash.includes("handleRetry"), "Retry handler");
assert(splash.includes('navigate("/login")'), "navigate to /login");
assert(splash.includes("SPLASH_RETRY_LABEL"), "uses Retry copy constant");

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
