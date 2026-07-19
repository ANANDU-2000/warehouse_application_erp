/**
 * Express error middleware — Phase 3.8.
 * Client payload always `{ detail: string }` (auth/authz parity).
 * Unknown errors: 500 + safe message; never leak stack/SQL.
 * Logging: Phase 3.9 structured logger.
 * Source intent: source-app/backend/app/main.py global_exception_handler
 */
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";
import {
  AccountBlockedError,
  AccountInactiveError,
  PasswordStrengthError,
  PermissionDeniedError,
} from "../services/errors";
import { SchemaValidationError } from "../validation/validate";
import { LoginRequestValidationError } from "../auth/loginRequest";
import { TokenIssuanceUnavailableError } from "../auth/tokenIssuer";
import { sendDetail } from "../http/sendDetail";
import { logger } from "../logging/logger";

type Mapped = { status: number; detail: string | Record<string, unknown> };

function mapKnownError(err: unknown): Mapped | null {
  if (err instanceof HttpError) {
    return { status: err.status, detail: err.detail };
  }
  if (
    err instanceof AccountInactiveError ||
    err instanceof AccountBlockedError ||
    err instanceof PermissionDeniedError
  ) {
    return { status: 403, detail: err.message };
  }
  if (
    err instanceof SchemaValidationError ||
    err instanceof LoginRequestValidationError ||
    err instanceof PasswordStrengthError
  ) {
    return { status: 400, detail: err.message };
  }
  if (err instanceof TokenIssuanceUnavailableError) {
    return { status: 503, detail: err.message };
  }
  return null;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const mapped = mapKnownError(err);
  if (mapped) {
    sendDetail(res, mapped.status, mapped.detail);
    return;
  }

  const log = req.requestId
    ? logger.child({ requestId: req.requestId })
    : logger;
  const message = err instanceof Error ? err.message : String(err);
  const fields: Record<string, unknown> = { err: message };
  if (err instanceof Error && err.stack) {
    fields.stack = err.stack;
  }
  log.error("Unhandled", fields);
  sendDetail(res, 500, "Internal Server Error");
}
