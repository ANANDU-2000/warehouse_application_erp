/**
 * Auth request schemas — port of source-app/backend/app/schemas/auth.py
 * Login + Refresh only (Phase 3.7). Register/forgot/google deferred with 501 routes.
 */
import { z } from "zod";

const LOGIN_DETAIL = "Sign in with your email address and password";

/**
 * Mirrors LoginRequest: email | identifier, password, optional device_token.
 * Resolves email via strip+lower; requires `@`.
 */
export const loginRequestSchema = z
  .object({
    email: z.string().min(5).max(320).optional().nullable(),
    identifier: z.string().max(320).optional().nullable(),
    password: z.string().min(1).max(128),
    device_token: z.string().max(512).optional().nullable(),
  })
  .transform((data, ctx) => {
    const resolved = (data.email || data.identifier || "").trim().toLowerCase();
    if (!resolved || !resolved.includes("@")) {
      ctx.addIssue({
        code: "custom",
        message: LOGIN_DETAIL,
      });
      return z.NEVER;
    }
    if (resolved.length < 5 || resolved.length > 320) {
      ctx.addIssue({
        code: "custom",
        message: LOGIN_DETAIL,
      });
      return z.NEVER;
    }

    let device_token: string | null = null;
    if (data.device_token != null && data.device_token !== "") {
      const tok = data.device_token.trim();
      device_token = tok.length > 0 ? tok : null;
    }

    return {
      email: resolved,
      password: data.password,
      device_token,
    };
  });

export type LoginRequestBody = z.infer<typeof loginRequestSchema>;

/** Mirrors RefreshRequest — non-empty refresh_token for HTTP mapping. */
export const refreshRequestSchema = z.object({
  refresh_token: z.string().min(1),
});

export type RefreshRequestBody = z.infer<typeof refreshRequestSchema>;

export { LOGIN_DETAIL };
