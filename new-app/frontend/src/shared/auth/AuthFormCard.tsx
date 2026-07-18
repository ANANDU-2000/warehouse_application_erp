import type { ReactNode } from "react";
import "./AuthFormCard.css";

type AuthFormCardProps = {
  children?: ReactNode;
};

/**
 * Port of Flutter AuthFormCard — frosted card container.
 * SCAFFOLD: empty card (no fields). Source: auth_page_shell.dart AuthFormCard.
 */
export function AuthFormCard({ children }: AuthFormCardProps) {
  return <div className="auth-form-card">{children}</div>;
}
