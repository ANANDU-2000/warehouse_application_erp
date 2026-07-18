import { AuthPageShell } from "../../shared/auth/AuthPageShell";
import { AuthFormCard } from "../../shared/auth/AuthFormCard";
import "./LoginPage.css";

/**
 * Login page — Step 1 SCAFFOLD only.
 * Shell + empty card. No fields, CTA, or API (docs/modules/login.md).
 */
export function LoginPage() {
  return (
    <div className="login-page">
      <AuthPageShell>
        <AuthFormCard />
      </AuthPageShell>
    </div>
  );
}
