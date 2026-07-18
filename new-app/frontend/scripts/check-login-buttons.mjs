/**
 * Login BUTTONS smoke checks.
 * Run: node scripts/check-login-buttons.mjs
 * Spec: docs/modules/login.md §10; login_page.dart.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const loginSrc = readFileSync(
  join(root, "src/features/auth/LoginPage.tsx"),
  "utf8",
);
assert(loginSrc.includes("attemptSignIn"), "attemptSignIn handler");
assert(loginSrc.includes("setShowValidation"), "showValidation flip");
assert(loginSrc.includes("Forgot password?"), "Forgot password? label");
assert(loginSrc.includes('to="/forgot-password"'), "Forgot navigates");
assert(
  loginSrc.includes("Contact your manager to reset password"),
  "helper text",
);
assert(loginSrc.includes("© 2026"), "copyright");
assert(loginSrc.includes("apiLogin") || loginSrc.includes("onSignIn"), "sign-in wired");
assert(!loginSrc.includes("Sign in with fingerprint"), "no biometric");

const css = readFileSync(
  join(root, "src/features/auth/LoginPage.css"),
  "utf8",
);
assert(css.includes("height: 50px"), "Sign In height 50");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brandPrimary button");

const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");
assert(router.includes("/forgot-password"), "forgot route registered");
assert(
  existsSync(join(root, "src/features/auth/ForgotPasswordStubPage.tsx")),
  "forgot stub page",
);

if (failures.length) {
  console.error("Login BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Login BUTTONS checks PASS");
