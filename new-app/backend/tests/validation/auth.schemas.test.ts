import { describe, it, expect } from "vitest";
import {
  loginRequestSchema,
  refreshRequestSchema,
  LOGIN_DETAIL,
} from "../../src/validation/auth.schemas";
import { validateWithSchema, SchemaValidationError } from "../../src/validation/validate";
import { parseLoginRequest } from "../../src/auth/loginRequest";

describe("loginRequestSchema (auth.py LoginRequest)", () => {
  it("accepts email + password and normalizes email", () => {
    const data = validateWithSchema(loginRequestSchema, {
      email: "  Admin@Example.COM ",
      password: "x",
    });
    expect(data.email).toBe("admin@example.com");
    expect(data.password).toBe("x");
    expect(data.device_token).toBeNull();
  });

  it("accepts identifier alias", () => {
    const data = validateWithSchema(loginRequestSchema, {
      identifier: "staff@example.com",
      password: "secret",
    });
    expect(data.email).toBe("staff@example.com");
  });

  it("rejects missing @ with login detail", () => {
    expect(() =>
      validateWithSchema(
        loginRequestSchema,
        { email: "notanemail", password: "x" },
        LOGIN_DETAIL,
      ),
    ).toThrow(SchemaValidationError);
    try {
      validateWithSchema(
        loginRequestSchema,
        { password: "x" },
        LOGIN_DETAIL,
      );
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect((e as SchemaValidationError).detail).toBe(LOGIN_DETAIL);
    }
  });

  it("trims device_token", () => {
    const data = validateWithSchema(loginRequestSchema, {
      email: "a@b.co",
      password: "x",
      device_token: "  tok  ",
    });
    expect(data.device_token).toBe("tok");
  });
});

describe("refreshRequestSchema", () => {
  it("requires non-empty refresh_token", () => {
    expect(
      validateWithSchema(refreshRequestSchema, { refresh_token: "abc" })
        .refresh_token,
    ).toBe("abc");
    expect(() =>
      validateWithSchema(
        refreshRequestSchema,
        { refresh_token: "" },
        "Invalid refresh token",
      ),
    ).toThrow(SchemaValidationError);
  });
});

describe("parseLoginRequest wrapper", () => {
  it("throws LoginRequestValidationError with LOGIN_DETAIL", () => {
    expect(() => parseLoginRequest({})).toThrow(LOGIN_DETAIL);
  });
});
