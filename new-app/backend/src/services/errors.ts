/**
 * Domain errors for account eligibility gates.
 * Source messages: source-app/backend/app/routers/auth.py (login 403 details).
 * Phase 3.4 maps these to HTTP 403 — no Express wiring here.
 */

export class AccountInactiveError extends Error {
  readonly code = "ACCOUNT_INACTIVE" as const;

  constructor(message = "Account is inactive") {
    super(message);
    this.name = "AccountInactiveError";
  }
}

export class AccountBlockedError extends Error {
  readonly code = "ACCOUNT_BLOCKED" as const;

  constructor(message = "Account is blocked") {
    super(message);
    this.name = "AccountBlockedError";
  }
}

/** Password strength failures — mirrors Python ValueError messages from passwords.py. */
export class PasswordStrengthError extends Error {
  readonly code = "PASSWORD_STRENGTH" as const;

  constructor(message: string) {
    super(message);
    this.name = "PasswordStrengthError";
  }
}

/** Permission gate — mirrors permissions.py require_permission_key detail. */
export class PermissionDeniedError extends Error {
  readonly code = "PERMISSION_DENIED" as const;

  constructor(permissionKey: string) {
    super(`Permission denied: ${permissionKey}`);
    this.name = "PermissionDeniedError";
  }
}
