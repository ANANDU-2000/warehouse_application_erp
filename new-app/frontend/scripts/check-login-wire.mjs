/**
 * Login WIRE smoke checks.
 * Run: node scripts/check-login-wire.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const api = readFileSync(join(root, "src/shared/api/authApi.ts"), "utf8");
assert(api.includes('"/v1/auth/login"'), "login path");
assert(api.includes('"/v1/me/businesses"'), "me businesses path");
assert(api.includes("access_token"), "TokenPair access_token");
assert(api.includes("refresh_token"), "TokenPair refresh_token");
assert(!api.includes("/v2/"), "no invented v2 paths");

const store = readFileSync(join(root, "src/shared/auth/tokenStore.ts"), "utf8");
assert(store.includes("hexa_access_token_bk"), "access key");
assert(store.includes("hexa_refresh_token_bk"), "refresh key");

const route = readFileSync(
  join(root, "src/shared/auth/postAuthRoute.ts"),
  "utf8",
);
assert(route.includes('"staff"'), "staff role check");
assert(route.includes("/staff/home"), "staff home path");
assert(route.includes("/home"), "owner home path");

const login = readFileSync(
  join(root, "src/features/auth/LoginPage.tsx"),
  "utf8",
);
assert(login.includes("apiLogin"), "calls login API");
assert(login.includes("meBusinesses"), "calls meBusinesses");
assert(login.includes("writeTokens"), "stores tokens");
assert(login.includes("Invalid email or password. Try again.") || login.includes("mapLoginError"), "401 via mapLoginError");
assert(!login.includes("onSignInStub"), "stub removed");

const vite = readFileSync(join(root, "vite.config.ts"), "utf8");
assert(vite.includes('"/v1"'), "vite proxy /v1");
assert(vite.includes("localhost:3000"), "proxy target :3000");

const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");
assert(router.includes('path="/home"'), "home stub route");
assert(router.includes('path="/staff/home"'), "staff home stub");
assert(
  existsSync(join(root, "src/features/auth/PostAuthStub.tsx")),
  "PostAuthStub exists",
);

if (failures.length) {
  console.error("Login WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Login WIRE checks PASS");
