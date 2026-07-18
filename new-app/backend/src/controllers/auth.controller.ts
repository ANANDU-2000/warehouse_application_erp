/**
 * Auth HTTP adapters — Login + refresh (Phase 3.4/3.5).
 * Business rules: 3.3 services. JWT: JwtTokenIssuer. No login DB writes (Unknown #1).
 * Source: source-app/backend/app/routers/auth.py
 */
import type { Request, Response, NextFunction } from "express";
import type { UsersRepository } from "../repositories/users.repository";
import { resolveUserByEmail } from "../services/authLogin.service";
import { verifyPassword } from "../services/passwords.service";
import { assertAccountEligible } from "../services/accountEligibility.service";
import {
  AccountBlockedError,
  AccountInactiveError,
} from "../services/errors";
import {
  parseLoginRequest,
  LoginRequestValidationError,
} from "../auth/loginRequest";
import type { TokenIssuer } from "../auth/tokenIssuer";
import { TokenIssuanceUnavailableError } from "../auth/tokenIssuer";
import { decodeRefreshToken } from "../services/jwtTokens.service";

export type AuthControllerDeps = {
  users: UsersRepository;
  tokenIssuer: TokenIssuer;
};

function sendDetail(res: Response, status: number, detail: string): void {
  res.status(status).json({ detail });
}

function parseRefreshBody(body: unknown): string | null {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }
  const raw = (body as Record<string, unknown>).refresh_token;
  if (typeof raw !== "string" || raw.length < 1) {
    return null;
  }
  return raw;
}

export function createAuthController(deps: AuthControllerDeps) {
  async function login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      let parsed;
      try {
        parsed = parseLoginRequest(req.body);
      } catch (e) {
        if (e instanceof LoginRequestValidationError) {
          sendDetail(res, 400, e.message);
          return;
        }
        throw e;
      }

      const user = await resolveUserByEmail(deps.users, parsed.email);
      if (
        !user ||
        user.password_hash == null ||
        !verifyPassword(parsed.password, user.password_hash)
      ) {
        sendDetail(res, 401, "Invalid email or password");
        return;
      }

      try {
        assertAccountEligible(user);
      } catch (e) {
        if (e instanceof AccountInactiveError || e instanceof AccountBlockedError) {
          sendDetail(res, 403, e.message);
          return;
        }
        throw e;
      }

      // device_token accepted but not persisted — Unknown #1 / login writes deferred.

      try {
        const pair = await deps.tokenIssuer.issue(user);
        res.status(200).json(pair);
      } catch (e) {
        if (e instanceof TokenIssuanceUnavailableError) {
          sendDetail(res, 503, e.message);
          return;
        }
        sendDetail(
          res,
          503,
          "Sign-in is temporarily unavailable. Try again shortly.",
        );
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /refresh — parity with auth.py refresh_token (no deleted/blocked invent).
   */
  async function refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const refreshToken = parseRefreshBody(req.body);
      if (!refreshToken) {
        sendDetail(res, 401, "Invalid refresh token");
        return;
      }

      const userId = decodeRefreshToken(refreshToken);
      if (!userId) {
        sendDetail(res, 401, "Invalid refresh token");
        return;
      }

      const user = await deps.users.findById(userId);
      if (!user) {
        sendDetail(res, 401, "User not found");
        return;
      }

      try {
        const pair = await deps.tokenIssuer.issue(user);
        res.status(200).json(pair);
      } catch (e) {
        if (e instanceof TokenIssuanceUnavailableError) {
          sendDetail(res, 503, e.message);
          return;
        }
        sendDetail(
          res,
          503,
          "Sign-in is temporarily unavailable. Try again shortly.",
        );
      }
    } catch (err) {
      next(err);
    }
  }

  function notImplemented(
    phaseHint: string,
  ): (_req: Request, res: Response) => void {
    return (_req, res) => {
      sendDetail(res, 501, `Not implemented (${phaseHint})`);
    };
  }

  return {
    login,
    refresh,
    register: notImplemented("Phase later — register"),
    forgotPassword: notImplemented("Phase later — forgot-password"),
    resetPassword: notImplemented("Phase later — reset-password"),
    google: notImplemented("Phase later — Google OAuth"),
  };
}

export type AuthController = ReturnType<typeof createAuthController>;
