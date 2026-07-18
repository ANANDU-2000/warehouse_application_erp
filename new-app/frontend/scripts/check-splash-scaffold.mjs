/**
 * Splash SCAFFOLD smoke checks.
 * Run: node scripts/check-splash-scaffold.mjs
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
assert(splash.includes("Harisree Warehouse"), "appName");
assert(splash.includes("Stock · Purchase · Delivery"), "tagline");
assert(splash.includes("splash-page"), "splash root class");
/* WIRE may navigate/boot — SCAFFOLD chrome only */

const css = readFileSync(
  join(root, "src/features/splash/SplashPage.css"),
  "utf8",
);
assert(css.includes("#062e28") || css.includes("#062E28"), "gradient start");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand mid");
assert(css.includes("#159a8a") || css.includes("#159A8A"), "accent end");
assert(css.includes("96px"), "logo box 96");

const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");
assert(router.includes('path="/splash"'), "splash route");
assert(router.includes('to="/splash"'), "root redirects to splash");

if (failures.length) {
  console.error("Splash SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Splash SCAFFOLD checks PASS");
