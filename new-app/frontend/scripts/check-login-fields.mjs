/**
 * Login FIELDS smoke checks.
 * Run: node scripts/check-login-fields.mjs
 * Spec: docs/modules/login.md §6–8; login_page.dart validators.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

/** Mirrors loginValidation.ts / login_page.dart (keep in sync). */
function isLoginFormValid(email, password) {
  const trimmed = email.trim();
  return trimmed.includes("@") && trimmed.length >= 5 && password.length >= 6;
}
function emailError(email, showValidation) {
  if (!showValidation) return null;
  const s = email.trim();
  if (s.length === 0 || !s.includes("@")) return "Enter a valid email address";
  return null;
}
function passwordError(password, showValidation) {
  if (!showValidation) return null;
  if (password.length === 0 || password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null;
}

const loginSrc = readFileSync(
  join(root, "src/features/auth/LoginPage.tsx"),
  "utf8",
);
assert(loginSrc.includes('name="email"'), "email input name=email");
assert(loginSrc.includes('name="password"'), "password input name=password");
assert(loginSrc.includes('placeholder="Email"'), "Email placeholder");
assert(loginSrc.includes('placeholder="Password"'), "Password placeholder");
assert(loginSrc.includes("Show password"), "visibility toggle");
assert(!loginSrc.includes("Sign in with"), "no Sign In CTA button yet");
assert(!/forgot-password/i.test(loginSrc), "no forgot link yet");
assert(!loginSrc.includes("fetch("), "no API fetch");
assert(!loginSrc.includes("/v1/auth"), "no auth API path");

const valPath = join(root, "src/features/auth/loginValidation.ts");
assert(existsSync(valPath), "loginValidation.ts exists");
const valSrc = readFileSync(valPath, "utf8");
assert(valSrc.includes("Enter a valid email address"), "email error copy");
assert(
  valSrc.includes("Password must be at least 6 characters"),
  "password error copy",
);
assert(valSrc.includes("length >= 5"), "email length rule");
assert(valSrc.includes("length >= 6") || valSrc.includes("length < 6"), "password length rule");

assert(isLoginFormValid("a@b.c", "123456") === true, "valid form");
assert(isLoginFormValid("ab", "123456") === false, "email needs @ and len>=5");
assert(isLoginFormValid("a@b.c", "12345") === false, "password needs len>=6");
assert(emailError("", false) === null, "no email error before showValidation");
assert(emailError("", true) === "Enter a valid email address", "empty email error");
assert(emailError("nodomain", true) === "Enter a valid email address", "no @");
assert(emailError("a@b.c", true) === null, "valid email no error msg");
assert(
  passwordError("12345", true) === "Password must be at least 6 characters",
  "short password",
);
assert(passwordError("123456", true) === null, "ok password");
assert(passwordError("x", false) === null, "hidden until showValidation");

if (failures.length) {
  console.error("Login FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Login FIELDS checks PASS");
