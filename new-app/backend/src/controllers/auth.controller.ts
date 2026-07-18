/**
 * Auth HTTP adapters — Phase 3.4 Login surface.
 * Business rules: 3.3 services. JWT: 3.5 via TokenIssuer. No login DB writes (Unknown #1).
 * Source: source-app/backend/app/routers/auth.py
 */
import type { Request, Response, NextFunction } from "express";
import type { UsersRepository } from "../repositories/users.repository";
import {
  resolveUserByEmail,
} from "../services/authLogin.service";
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

export type AuthControllerDeps = {
  users: UsersRepository;
  tokenIssuer: TokenIssuer;
};

function sendDetail(res: Response, status: number, detail: string): void {
  res.status(status).json({ detail });
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
      // Session / last_login / staff audit deferred.

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
    register: notImplemented("Phase later — register"),
    forgotPassword: notImplemented("Phase later — forgot-password"),
    resetPassword: notImplemented("Phase later — reset-password"),
    google: notImplemented("Phase 3.5 — Google OAuth"),
    refresh: notImplemented("Phase 3.5 — refresh"),
  };
}

export type AuthController = ReturnType<typeof createAuthController>;
