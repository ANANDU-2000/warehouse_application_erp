/**
 * Splash LAYOUT smoke checks (chrome that must remain after BUTTONS).
 * Run: node scripts/check-splash-layout.mjs
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
  existsSync(join(root, "public/brand/app_logo.png")),
  "app_logo.png in public/brand",
);

const splash = readFileSync(
  join(root, "src/features/splash/SplashPage.tsx"),
  "utf8",
);
assert(splash.includes("/brand/app_logo.png"), "logo src path");
assert(splash.includes("onError"), "logo error fallback");
assert(splash.includes("splash-page__spinner"), "spinner class");
assert(!splash.includes("fetch("), "no API fetch");
assert(!splash.includes("/auth/refresh"), "no auth refresh path");
assert(!splash.includes("_boot"), "no boot");

const css = readFileSync(
  join(root, "src/features/splash/SplashPage.css"),
  "utf8",
);
assert(css.includes("splash-fade"), "fade animation name");
assert(css.includes("800ms"), "fade 800ms");
assert(css.includes("ease-out"), "ease-out curve");
assert(css.includes("96px"), "logo box 96");
assert(css.includes("border-radius: 22px"), "image clip r=22");
assert(css.includes("2.5px"), "spinner stroke 2.5");

if (failures.length) {
  console.error("Splash LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Splash LAYOUT checks PASS");
