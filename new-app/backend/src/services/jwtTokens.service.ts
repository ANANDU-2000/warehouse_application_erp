/**
 * JWT create/decode — port 1:1 from source-app/backend/app/services/jwt_tokens.py
 */
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AccessTokenClaims = {
  userId: string;
  tokenVersion: number;
};

export type JwtSettings = {
  secret: string;
  refreshSecret: string;
  accessTtlMinutes: number;
  refreshTtlDays: number;
};

export function getJwtSettings(): JwtSettings {
  return { ...env.jwt };
}

export function createAccessToken(
  userId: string,
  settings: JwtSettings = getJwtSettings(),
  tokenVersion = 0,
): string {
  const expSeconds = Math.floor(Date.now() / 1000) + settings.accessTtlMinutes * 60;
  const payload = {
    sub: userId,
    typ: "access",
    exp: expSeconds,
    tv: Math.trunc(tokenVersion),
  };
  return jwt.sign(payload, settings.secret, { algorithm: "HS256" });
}

export function createRefreshToken(
  userId: string,
  settings: JwtSettings = getJwtSettings(),
): string {
  const expSeconds =
    Math.floor(Date.now() / 1000) + settings.refreshTtlDays * 24 * 60 * 60;
  const payload = {
    sub: userId,
    typ: "refresh",
    exp: expSeconds,
  };
  return jwt.sign(payload, settings.refreshSecret, { algorithm: "HS256" });
}

export function decodeAccessToken(
  token: string,
  settings: JwtSettings = getJwtSettings(),
): AccessTokenClaims | null {
  try {
    const payload = jwt.verify(token, settings.secret, {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;
    if (payload.typ !== "access") {
      return null;
    }
    if (typeof payload.sub !== "string" || !payload.sub) {
      return null;
    }
    const tv = payload.tv ?? 0;
    return {
      userId: payload.sub,
      tokenVersion: typeof tv === "number" ? Math.trunc(tv) : parseInt(String(tv), 10) || 0,
    };
  } catch {
    return null;
  }
}

export function decodeRefreshToken(
  token: string,
  settings: JwtSettings = getJwtSettings(),
): string | null {
  try {
    const payload = jwt.verify(token, settings.refreshSecret, {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;
    if (payload.typ !== "refresh") {
      return null;
    }
    if (typeof payload.sub !== "string" || !payload.sub) {
      return null;
    }
    return payload.sub;
  } catch {
    return null;
  }
}

/** expires_in seconds for TokenPair — access TTL minutes × 60. */
export function accessExpiresInSeconds(
  settings: JwtSettings = getJwtSettings(),
): number {
  return settings.accessTtlMinutes * 60;
}
