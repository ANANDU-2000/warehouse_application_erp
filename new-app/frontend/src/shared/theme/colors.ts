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
  /** HexaColors.inputBorderGrey / auth_input_styles enabledBorder */
  inputBorder: "#E5E7EB",
  /** HexaColors.inputText */
  inputText: "#111111",
  /** HexaColors.inputHint (also used where Material grey.shade500 is close) */
  inputHint: "#9CA3AF",
  /** authFilledDecoration fillColor */
  inputFill: "#F3F4F6",
  /** login_page _err Colors.red.shade700 */
  errorText: "#D32F2F",
  /** visibility icon Color(0xFF6B7280) */
  iconMuted: "#6B7280",
} as const;

/** Public path for AuthBrandAssets.background (login.md §3). */
export const AUTH_BACKGROUND_SRC = "/brand/getstarted_bg.png";
