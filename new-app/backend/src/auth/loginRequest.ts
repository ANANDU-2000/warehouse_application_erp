/**
 * Login body parse — mirrors LoginRequest in source-app/backend/app/schemas/auth.py.
 * Zod deferred to Phase 3.7.
 */

export type LoginRequestBody = {
  email: string;
  password: string;
  device_token: string | null;
};

export class LoginRequestValidationError extends Error {
  readonly code = "LOGIN_REQUEST_INVALID" as const;

  constructor(message: string) {
    super(message);
    this.name = "LoginRequestValidationError";
  }
}

/**
 * Accepts email or deprecated identifier; normalizes email.
 * Password required min_length=1 (schema); device_token optional.
 */
export function parseLoginRequest(body: unknown): LoginRequestBody {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    throw new LoginRequestValidationError(
      "Sign in with your email address and password",
    );
  }

  const raw = body as Record<string, unknown>;
  const password =
    typeof raw.password === "string" ? raw.password : undefined;
  if (password == null || password.length < 1 || password.length > 128) {
    throw new LoginRequestValidationError(
      "Sign in with your email address and password",
    );
  }

  const emailField =
    typeof raw.email === "string" ? raw.email : undefined;
  const identifierField =
    typeof raw.identifier === "string" ? raw.identifier : undefined;

  const resolved = (emailField || identifierField || "").trim().toLowerCase();
  if (!resolved || !resolved.includes("@")) {
    throw new LoginRequestValidationError(
      "Sign in with your email address and password",
    );
  }
  if (resolved.length < 5 || resolved.length > 320) {
    throw new LoginRequestValidationError(
      "Sign in with your email address and password",
    );
  }

  let device_token: string | null = null;
  if (raw.device_token != null) {
    if (typeof raw.device_token !== "string" || raw.device_token.length > 512) {
      throw new LoginRequestValidationError(
        "Sign in with your email address and password",
      );
    }
    const tok = raw.device_token.trim();
    device_token = tok.length > 0 ? tok : null;
  }

  return { email: resolved, password, device_token };
}
