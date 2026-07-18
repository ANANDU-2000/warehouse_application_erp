import type { ReactNode } from "react";
import "./AuthFormCard.css";

type AuthFormCardProps = {
  children?: ReactNode;
};

/**
 * Port of Flutter AuthFormCard — frosted card container.
 * LAYOUT: may contain title chrome only; no fields yet.
 * Source: auth_page_shell.dart AuthFormCard; docs/modules/login.md §2.
 */
export function AuthFormCard({ children }: AuthFormCardProps) {
  return <div className="auth-form-card">{children}</div>;
}
