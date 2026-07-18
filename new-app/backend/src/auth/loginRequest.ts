/**
 * Thin re-export — login parse now uses Zod (Phase 3.7).
 * Kept for stable imports from auth.controller / tests.
 */
export {
  loginRequestSchema,
  type LoginRequestBody,
  LOGIN_DETAIL,
} from "../validation/auth.schemas";
export {
  validateWithSchema,
  SchemaValidationError,
} from "../validation/validate";

import { loginRequestSchema, LOGIN_DETAIL } from "../validation/auth.schemas";
import {
  validateWithSchema,
  SchemaValidationError,
} from "../validation/validate";
import type { LoginRequestBody } from "../validation/auth.schemas";

/** @deprecated Use SchemaValidationError — alias for controller catch compatibility. */
export class LoginRequestValidationError extends SchemaValidationError {
  constructor(message: string = LOGIN_DETAIL) {
    super(message);
    this.name = "LoginRequestValidationError";
  }
}

export function parseLoginRequest(body: unknown): LoginRequestBody {
  try {
    return validateWithSchema(loginRequestSchema, body, LOGIN_DETAIL);
  } catch (e) {
    if (e instanceof SchemaValidationError) {
      throw new LoginRequestValidationError(e.detail);
    }
    throw e;
  }
}
