import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../src/middleware/errorHandler";
import { HttpError } from "../../src/errors/httpError";
import {
  AccountInactiveError,
  AccountBlockedError,
  PermissionDeniedError,
  PasswordStrengthError,
} from "../../src/services/errors";
import { SchemaValidationError } from "../../src/validation/validate";
import { LoginRequestValidationError } from "../../src/auth/loginRequest";
import { TokenIssuanceUnavailableError } from "../../src/auth/tokenIssuer";

function mockRes(): Response & { statusCode: number; body: unknown } {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

function run(err: unknown) {
  const res = mockRes();
  const next = vi.fn() as NextFunction;
  errorHandler(err, {} as Request, res, next);
  return res;
}

describe("errorHandler (Phase 3.8)", () => {
  it("maps HttpError to status + detail", () => {
    const res = run(new HttpError(401, "Not authenticated"));
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ detail: "Not authenticated" });
    expect(res.body).not.toHaveProperty("error");
  });

  it("maps AccountInactiveError to 403", () => {
    const res = run(new AccountInactiveError());
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ detail: "Account is inactive" });
  });

  it("maps AccountBlockedError to 403", () => {
    const res = run(new AccountBlockedError());
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ detail: "Account is blocked" });
  });

  it("maps PermissionDeniedError to 403", () => {
    const res = run(new PermissionDeniedError("reports_access"));
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ detail: "Permission denied: reports_access" });
  });

  it("maps SchemaValidationError to 400", () => {
    const res = run(new SchemaValidationError("Sign in with your email address and password"));
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      detail: "Sign in with your email address and password",
    });
  });

  it("maps LoginRequestValidationError to 400", () => {
    const res = run(new LoginRequestValidationError());
    expect(res.statusCode).toBe(400);
    expect((res.body as { detail: string }).detail).toContain("Sign in");
  });

  it("maps PasswordStrengthError to 400", () => {
    const res = run(new PasswordStrengthError("Password must be at least 8 characters"));
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      detail: "Password must be at least 8 characters",
    });
  });

  it("maps TokenIssuanceUnavailableError to 503", () => {
    const res = run(new TokenIssuanceUnavailableError());
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      detail: "Sign-in is temporarily unavailable. Try again shortly.",
    });
  });

  it("maps unknown errors to 500 with safe detail (no leak)", () => {
    const res = run(new Error("SELECT * FROM secrets WHERE password='x'"));
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ detail: "Internal Server Error" });
    expect(JSON.stringify(res.body)).not.toContain("SELECT");
    expect(res.body).not.toHaveProperty("error");
  });
});
