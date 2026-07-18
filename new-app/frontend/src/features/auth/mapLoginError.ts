/**
 * Login HTTP/network error mapping — login_page.dart `_signIn` + auth_error_messages.dart.
 * Spec: docs/modules/login.md §12.
 */

export type LoginErrorKind = "network" | "inline";

export type MappedLoginError = {
  kind: LoginErrorKind;
  /** Inline auth error under fields */
  inlineMessage?: string;
  bannerTitle?: string;
  bannerDetail?: string | null;
};

export const MSG_401 = "Invalid email or password. Try again.";
export const MSG_403_BLOCKED =
  "This account is blocked. Contact your owner.";
export const MSG_403_INACTIVE = "This account is inactive.";
export const MSG_403_OTHER = "Sign-in not allowed for this account.";
export const MSG_422 =
  "Use your full login email (e.g. 1234567890@staff.harisree.local) and password from the owner.";
export const MSG_503 =
  "Sign-in is temporarily unavailable. Try again in a moment.";
export const MSG_5XX =
  "Something went wrong on our side. Please try again in a moment.";
export const MSG_GENERIC = "Something went wrong. Please try again.";
export const MSG_LOGIN_BAD_REQUEST =
  "Something was not right with that sign-in. Try again.";

export const BANNER_TITLE_DEFAULT = "Can't reach server";
export const BANNER_TITLE_REFUSED = "API not reachable";
export const BANNER_TITLE_CONNECTION = "Connection problem";
export const BANNER_DETAIL_REFUSED =
  "The app could not reach your server. If you are the administrator, confirm the API URL used for this deployment.";
export const BANNER_DETAIL_TIMEOUT =
  "Check your network, firewall, and VPN, then try again.";

/** Flutter `_blobLooksLikeConnectionRefused` subset used for banner title. */
export function blobLooksLikeConnectionRefused(blob: string): boolean {
  const b = blob.toLowerCase();
  return (
    b.includes("connection refused") ||
    b.includes("failed to fetch") ||
    b.includes("err_connection_refused") ||
    b.includes("econnrefused")
  );
}

export function blobLooksLikeTimeout(blob: string): boolean {
  const b = blob.toLowerCase();
  return (
    b.includes("timed out") ||
    b.includes("timeout") ||
    b.includes("network is unreachable")
  );
}

/**
 * Map AuthApiError / network Error to UI — mirrors login_page DioException branches.
 */
export function mapLoginError(
  err: unknown,
  opts?: { status?: number; detail?: string; network?: boolean; message?: string },
): MappedLoginError {
  if (opts?.network || isNetworkLike(err, opts?.message)) {
    const blob = opts?.message ?? (err instanceof Error ? err.message : "");
    if (blobLooksLikeConnectionRefused(blob)) {
      return {
        kind: "network",
        bannerTitle: BANNER_TITLE_REFUSED,
        bannerDetail: BANNER_DETAIL_REFUSED,
      };
    }
    if (blobLooksLikeTimeout(blob)) {
      return {
        kind: "network",
        bannerTitle: BANNER_TITLE_CONNECTION,
        bannerDetail: BANNER_DETAIL_TIMEOUT,
      };
    }
    return {
      kind: "network",
      bannerTitle: BANNER_TITLE_DEFAULT,
      bannerDetail: null,
    };
  }

  const status = opts?.status;
  const detail = (opts?.detail ?? "").toLowerCase();

  if (status === 401) {
    return { kind: "inline", inlineMessage: MSG_401 };
  }
  if (status === 403) {
    if (detail.includes("blocked")) {
      return { kind: "inline", inlineMessage: MSG_403_BLOCKED };
    }
    if (detail.includes("inactive")) {
      return { kind: "inline", inlineMessage: MSG_403_INACTIVE };
    }
    return { kind: "inline", inlineMessage: MSG_403_OTHER };
  }
  if (status === 422) {
    return { kind: "inline", inlineMessage: MSG_422 };
  }
  if (status === 400) {
    return { kind: "inline", inlineMessage: MSG_LOGIN_BAD_REQUEST };
  }
  if (status === 503) {
    return { kind: "inline", inlineMessage: MSG_503 };
  }
  if (status != null && status >= 500) {
    return { kind: "inline", inlineMessage: MSG_5XX };
  }
  return { kind: "inline", inlineMessage: MSG_GENERIC };
}

function isNetworkLike(err: unknown, message?: string): boolean {
  if (message && blobLooksLikeConnectionRefused(message)) return true;
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    if (
      m.includes("failed to fetch") ||
      m.includes("networkerror") ||
      m.includes("load failed")
    ) {
      return true;
    }
  }
  return false;
}
