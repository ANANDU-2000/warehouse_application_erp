/**
 * Client login validation — mirrors login_page.dart
 * `_isFormValid`, `_emailError`, `_passError` (docs/modules/login.md §8).
 */

export const EMAIL_ERROR = "Enter a valid email address";
export const PASSWORD_ERROR = "Password must be at least 6 characters";

/** Flutter: email.contains('@') && email.length >= 5 && p.length >= 6 */
export function isLoginFormValid(email: string, password: string): boolean {
  const trimmed = email.trim();
  return trimmed.includes("@") && trimmed.length >= 5 && password.length >= 6;
}

/**
 * Flutter `_emailError`: only when showValidation;
 * empty or no `@` → EMAIL_ERROR. (Does not check length ≥ 5 for the message.)
 */
export function emailError(
  email: string,
  showValidation: boolean,
): string | null {
  if (!showValidation) return null;
  const s = email.trim();
  if (s.length === 0 || !s.includes("@")) return EMAIL_ERROR;
  return null;
}

/**
 * Flutter `_passError`: only when showValidation;
 * empty or length < 6 → PASSWORD_ERROR.
 */
export function passwordError(
  password: string,
  showValidation: boolean,
): string | null {
  if (!showValidation) return null;
  if (password.length === 0 || password.length < 6) return PASSWORD_ERROR;
  return null;
}
