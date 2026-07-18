/**
 * Splash WIRE smoke — tokens → refresh → me/businesses → home/login.
 * Run: node scripts/check-splash-wire.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const splash = join(root, "src/features/splash/SplashPage.tsx");
const restore = join(root, "src/features/splash/splashRestore.ts");
const copy = join(root, "src/features/splash/splashCopy.ts");
const authApi = join(root, "src/shared/api/authApi.ts");

assert(existsSync(splash), "SplashPage exists");
assert(existsSync(restore), "splashRestore exists");
assert(existsSync(copy), "splashCopy exists");

const page = readFileSync(splash, "utf8");
const rest = readFileSync(restore, "utf8");
const cp = readFileSync(copy, "utf8");
const api = readFileSync(authApi, "utf8");

assert(page.includes("restoreSessionWithWebTimeout"), "boot uses restore");
assert(page.includes("SPLASH_WARMUP_RETRY"), "warmup message");
assert(page.includes("session_expired"), "session_expired notice");
assert(rest.includes("authenticatedHomePath"), "home path helper");
assert(rest.includes("meBusinesses"), "meBusinesses");
assert(rest.includes("refreshTokens"), "refreshTokens");
assert(
  rest.includes("isAccessTokenExpiredOrNearExpiry"),
  "near-expiry refresh",
);
assert(cp.includes("8000"), "web 8s timeout");
assert(cp.includes("10000"), "10s warmup delay");
assert(
  cp.includes("Server is warming up. Retrying in 10 seconds…"),
  "warmup exact string",
);
assert(api.includes("export async function refreshTokens"), "authApi.refreshTokens");
assert(api.includes("/v1/auth/refresh"), "POST refresh path");
assert(!page.includes("setTimeout(() => {\n      setBusy(false)"), "no BUTTONS stub");
assert(page.includes("void boot()"), "Retry re-runs boot");

/* Must not call owner home-overview from splash */
assert(!page.includes("home-overview"), "no home-overview on splash page");
assert(!rest.includes("home-overview"), "no home-overview in restore");

if (failures.length) {
  console.error("Splash WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Splash WIRE checks PASS");
