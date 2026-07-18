/** Brand tokens from HexaColors / HexaDsColors / login.md §2–5. */
export const hexaColors = {
  brandPrimary: "#0E4F46",
  brandBackground: "#F7F9F6",
  scaffoldMint: "#E8F5F2",
  /** HexaDsColors.textPrimary → HexaColors.textOnLightSurface */
  textPrimary: "#0F172A",
  /** HexaDsColors.textMuted → HexaColors.neutral */
  textMuted: "#64748B",
  white: "#FFFFFF",
} as const;

/** Public path for AuthBrandAssets.background (login.md §3). */
export const AUTH_BACKGROUND_SRC = "/brand/getstarted_bg.png";
