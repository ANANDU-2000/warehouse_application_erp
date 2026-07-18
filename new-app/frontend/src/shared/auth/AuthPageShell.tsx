import type { ReactNode } from "react";
import { hexaColors } from "../theme/colors";
import "./AuthPageShell.css";

type AuthPageShellProps = {
  children: ReactNode;
};

/**
 * Port of Flutter AuthPageShell — blurred bg + scrim, max-width 420.
 * Source: source-app/.../auth_page_shell.dart; docs/modules/login.md §2–3.
 * SCAFFOLD: no form fields inside — callers pass children.
 */
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div
      className="auth-page-shell"
      style={{ backgroundColor: hexaColors.scaffoldMint }}
    >
      <div className="auth-page-shell__bg" aria-hidden="true">
        <div className="auth-page-shell__atmosphere" />
        <div className="auth-page-shell__scrim" />
      </div>
      <div className="auth-page-shell__scroll">
        <div className="auth-page-shell__column">{children}</div>
      </div>
    </div>
  );
}
