/**
 * Token pair shape — mirrors FastAPI TokenPair (schemas/auth.py).
 * Real JWT issuance lands in Phase 3.5.
 */
import type { UserRow } from "../repositories/types";

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export interface TokenIssuer {
  issue(user: UserRow): Promise<TokenPair>;
}

/**
 * Placeholder until Phase 3.5 JWT.
 * Maps to the same 503 detail as FastAPI token-issue failure in auth.py login.
 */
export class NotImplementedTokenIssuer implements TokenIssuer {
  async issue(_user: UserRow): Promise<TokenPair> {
    throw new TokenIssuanceUnavailableError();
  }
}

export class TokenIssuanceUnavailableError extends Error {
  readonly code = "TOKEN_ISSUANCE_UNAVAILABLE" as const;

  constructor(
    message = "Sign-in is temporarily unavailable. Try again shortly.",
  ) {
    super(message);
    this.name = "TokenIssuanceUnavailableError";
  }
}
