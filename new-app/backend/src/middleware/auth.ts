/**
 * Bearer auth — port of get_current_user from source-app/backend/app/deps.py
 */
import type { NextFunction, Request, Response } from "express";
import type { UsersRepository } from "../repositories/users.repository";
import { decodeAccessToken } from "../services/jwtTokens.service";
import { assertAccountEligible } from "../services/accountEligibility.service";
import {
  AccountBlockedError,
  AccountInactiveError,
} from "../services/errors";
import { sendAuthzDetail } from "./authzHttp";

function parseBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== "string") {
    return null;
  }
  const [scheme, token] = header.split(/\s+/, 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }
  return token;
}

/**
 * Factory: require valid access JWT + load user + token_version + eligibility.
 * Sets `req.user` on success.
 */
export function createRequireAuth(users: UsersRepository) {
  return async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const token = parseBearerToken(req);
      if (!token) {
        sendAuthzDetail(res, 401, "Not authenticated");
        return;
      }

      const claims = decodeAccessToken(token);
      if (!claims) {
        sendAuthzDetail(res, 401, "Invalid token");
        return;
      }

      const user = await users.findById(claims.userId);
      if (!user) {
        sendAuthzDetail(res, 401, "User not found");
        return;
      }

      const expectedTv = Math.trunc(user.token_version ?? 0);
      if (claims.tokenVersion !== expectedTv) {
        sendAuthzDetail(res, 401, "Token revoked");
        return;
      }

      try {
        assertAccountEligible(user);
      } catch (e) {
        if (e instanceof AccountInactiveError || e instanceof AccountBlockedError) {
          sendAuthzDetail(res, 403, e.message);
          return;
        }
        throw e;
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Super admin only — port of require_super_admin (deps.py).
 * Must run after createRequireAuth.
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = req.user;
  if (!user) {
    sendAuthzDetail(res, 401, "Not authenticated");
    return;
  }
  if (!user.is_super_admin) {
    sendAuthzDetail(res, 403, "Super admin only");
    return;
  }
  next();
}
