/**
 * Splash session restore — Flutter session_notifier._restoreImpl + splash_page._boot.
 * Source: session_notifier.dart, jwt_access_token.dart, splash_page.dart
 *
 * Deferred (N/A this WIRE): SessionCache offline businesses; super-admin flag;
 * full 401 circuit / authSessionExpiredProvider beyond splash navigate notice.
 */
import {
  meBusinesses,
  refreshTokens,
  AuthApiError,
  AuthNetworkError,
  type BusinessBrief,
} from "../../shared/api/authApi";
import { authenticatedHomePath } from "../../shared/auth/postAuthRoute";
import {
  clearPrimaryBusiness,
  writePrimaryBusiness,
} from "../../shared/auth/sessionStore";
import {
  clearTokens,
  readTokens,
  writeTokens,
  type StoredTokens,
} from "../../shared/auth/tokenStore";
import {
  SPLASH_ACCESS_SKEW_SEC,
  SPLASH_RESTORE_TIMEOUT_MS,
} from "./splashCopy";

export type SplashRestoreOk = {
  ok: true;
  businesses: BusinessBrief[];
  homePath: string;
};

export type SplashRestoreFail = {
  ok: false;
  /**
   * no_tokens — nothing stored → /login
   * session_expired — hard auth clear → /login?notice=session_expired
   * soft_fail — tokens still present, no session → splash Retry chrome
   * timeout — web 8s race (caller may warmup-retry once)
   */
  reason: "no_tokens" | "session_expired" | "soft_fail" | "timeout";
};

export type SplashRestoreResult = SplashRestoreOk | SplashRestoreFail;

/** Flutter isAccessTokenExpiredOrNearExpiry — 90s skew. */
export function isAccessTokenExpiredOrNearExpiry(
  accessToken: string | null | undefined,
  skewSec = SPLASH_ACCESS_SKEW_SEC,
): boolean {
  if (accessToken == null || accessToken.trim() === "") return true;
  const parts = accessToken.split(".");
  if (parts.length < 2) return false;
  try {
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const mod = payload.length % 4;
    if (mod > 0) payload += "=".repeat(4 - mod);
    const json = atob(payload);
    const map = JSON.parse(json) as { exp?: unknown };
    if (typeof map.exp !== "number") return false;
    const expMs = Math.floor(map.exp * 1000);
    return Date.now() >= expMs - skewSec * 1000;
  } catch {
    return false;
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("restore_timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function ensureFreshAccess(
  tokens: StoredTokens,
): Promise<StoredTokens> {
  if (!isAccessTokenExpiredOrNearExpiry(tokens.access_token)) {
    return tokens;
  }
  try {
    const pair = await refreshTokens(tokens.refresh_token);
    writeTokens(pair);
    return {
      access_token: pair.access_token,
      refresh_token: pair.refresh_token,
    };
  } catch {
    /* Flutter DioException → keep existing tokens */
    return tokens;
  }
}

function finishEmptyBusinesses(): SplashRestoreFail {
  clearTokens();
  clearPrimaryBusiness();
  return { ok: false, reason: "no_tokens" };
}

function finishOk(businesses: BusinessBrief[]): SplashRestoreOk {
  writePrimaryBusiness(businesses[0]);
  return {
    ok: true,
    businesses,
    homePath: authenticatedHomePath(businesses),
  };
}

/**
 * Restore session: tokens → optional refresh → me/businesses → persist primary.
 * Does not navigate.
 */
export async function restoreSession(): Promise<SplashRestoreResult> {
  const stored = readTokens();
  if (!stored) {
    return { ok: false, reason: "no_tokens" };
  }

  let tokens = stored;

  try {
    tokens = await ensureFreshAccess(tokens);

    let businesses: BusinessBrief[];
    try {
      businesses = await meBusinesses(tokens.access_token);
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 401) {
        const still = readTokens();
        if (!still) {
          clearPrimaryBusiness();
          return { ok: false, reason: "session_expired" };
        }
        try {
          const pair = await refreshTokens(still.refresh_token);
          writeTokens(pair);
          businesses = await meBusinesses(pair.access_token);
        } catch (err2) {
          if (
            err2 instanceof AuthApiError &&
            (err2.status === 401 || err2.status === 403)
          ) {
            clearTokens();
            clearPrimaryBusiness();
            return { ok: false, reason: "session_expired" };
          }
          /* SessionCache offline path deferred — soft fail if tokens remain */
          if (readTokens()) {
            return { ok: false, reason: "soft_fail" };
          }
          clearTokens();
          clearPrimaryBusiness();
          return { ok: false, reason: "session_expired" };
        }
      } else if (
        err instanceof AuthNetworkError ||
        (err instanceof AuthApiError && err.status !== 401)
      ) {
        /* Network / non-401 — Flutter keeps tokens, session null → Retry chrome */
        return { ok: false, reason: "soft_fail" };
      } else {
        return { ok: false, reason: "soft_fail" };
      }
    }

    if (businesses.length === 0) {
      return finishEmptyBusinesses();
    }
    return finishOk(businesses);
  } catch {
    if (readTokens()) {
      return { ok: false, reason: "soft_fail" };
    }
    return { ok: false, reason: "no_tokens" };
  }
}

export async function restoreSessionWithWebTimeout(): Promise<SplashRestoreResult> {
  try {
    return await withTimeout(restoreSession(), SPLASH_RESTORE_TIMEOUT_MS);
  } catch {
    return { ok: false, reason: "timeout" };
  }
}
