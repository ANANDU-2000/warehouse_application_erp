/**
 * Web token store — Flutter SecureTokenStore web keys (login.md §16).
 * Source: hexa_access_token_bk / hexa_refresh_token_bk via SharedPreferences.
 */
const ACCESS_KEY = "hexa_access_token_bk";
const REFRESH_KEY = "hexa_refresh_token_bk";

export type StoredTokens = {
  access_token: string;
  refresh_token: string;
};

export function writeTokens(tokens: StoredTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
}

export function readTokens(): StoredTokens | null {
  const access_token = localStorage.getItem(ACCESS_KEY);
  const refresh_token = localStorage.getItem(REFRESH_KEY);
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("access_token");
}

/** Read access token from either key */
export function readAccessToken(): string {
  return localStorage.getItem(ACCESS_KEY) ?? localStorage.getItem("access_token") ?? "";
}
