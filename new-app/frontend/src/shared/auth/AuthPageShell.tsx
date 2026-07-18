import type { ReactNode } from "react";
import { AUTH_BACKGROUND_SRC, hexaColors } from "../theme/colors";
import "./AuthPageShell.css";

type AuthPageShellProps = {
  children: ReactNode;
};

/**
 * Port of Flutter AuthPageShell — blurred getstarted_bg + scrim, max-width 420.
 * Source: source-app/.../auth_page_shell.dart; docs/modules/login.md §2–3.
 * LAYOUT: background asset + atmosphere fallback. No form fields.
 */
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div
      className="auth-page-shell"
      style={{ backgroundColor: hexaColors.scaffoldMint }}
    >
      <div className="auth-page-shell__bg" aria-hidden="true">
        <img
          className="auth-page-shell__photo"
          src={AUTH_BACKGROUND_SRC}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="auth-page-shell__atmosphere" />
        <div className="auth-page-shell__blur" />
        <div className="auth-page-shell__scrim" />
      </div>
      <div className="auth-page-shell__scroll">
        <div className="auth-page-shell__column">{children}</div>
      </div>
    </div>
  );
}
