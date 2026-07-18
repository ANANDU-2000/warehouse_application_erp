/**
 * Login STATES smoke checks.
 * Run: node scripts/check-login-states.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

/** Inline mirror of mapLoginError rules (keep in sync with mapLoginError.ts). */
function map403(detail) {
  const d = (detail || "").toLowerCase();
  if (d.includes("blocked")) return "This account is blocked. Contact your owner.";
  if (d.includes("inactive")) return "This account is inactive.";
  return "Sign-in not allowed for this account.";
}

assert(
  map403("Account is blocked") ===
    "This account is blocked. Contact your owner.",
  "403 blocked",
);
assert(map403("Account is inactive") === "This account is inactive.", "403 inactive");
assert(
  map403("other") === "Sign-in not allowed for this account.",
  "403 other",
);

const mapSrc = readFileSync(
  join(root, "src/features/auth/mapLoginError.ts"),
  "utf8",
);
assert(mapSrc.includes("Invalid email or password. Try again."), "401 copy");
assert(
  mapSrc.includes("@staff.harisree.local"),
  "422 staff email hint",
);
assert(mapSrc.includes("Can't reach server"), "banner default title");
assert(mapSrc.includes("API not reachable"), "banner refused title");

const login = readFileSync(
  join(root, "src/features/auth/LoginPage.tsx"),
  "utf8",
);
assert(login.includes("AuthNetworkErrorBanner"), "banner component");
assert(login.includes("retryAfterNetwork"), "retry handler");
assert(login.includes("mapLoginError"), "uses mapLoginError");
assert(login.includes("AuthNetworkError"), "network error type");

assert(
  existsSync(
    join(root, "src/shared/auth/AuthNetworkErrorBanner.tsx"),
  ),
  "banner file",
);

const api = readFileSync(join(root, "src/shared/api/authApi.ts"), "utf8");
assert(api.includes("AuthNetworkError"), "AuthNetworkError exported");
assert(api.includes("fetchAuth"), "fetchAuth wrapper");

if (failures.length) {
  console.error("Login STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Login STATES checks PASS");
