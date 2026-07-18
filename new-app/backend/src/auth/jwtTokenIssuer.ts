/**
 * Real JWT TokenIssuer — Phase 3.5.
 * Replaces NotImplementedTokenIssuer for login / refresh.
 */
import type { UserRow } from "../repositories/types";
import type { TokenIssuer, TokenPair } from "./tokenIssuer";
import {
  accessExpiresInSeconds,
  createAccessToken,
  createRefreshToken,
  getJwtSettings,
  type JwtSettings,
} from "../services/jwtTokens.service";

export class JwtTokenIssuer implements TokenIssuer {
  constructor(private readonly settings: JwtSettings = getJwtSettings()) {}

  async issue(user: UserRow): Promise<TokenPair> {
    const tokenVersion = Math.trunc(user.token_version ?? 0);
    const access_token = createAccessToken(
      user.id,
      this.settings,
      tokenVersion,
    );
    const refresh_token = createRefreshToken(user.id, this.settings);
    return {
      access_token,
      refresh_token,
      expires_in: accessExpiresInSeconds(this.settings),
    };
  }
}
