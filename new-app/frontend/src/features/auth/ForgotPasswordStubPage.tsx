import { Link } from "react-router-dom";
import { AuthPageShell } from "../../shared/auth/AuthPageShell";
import { AuthFormCard } from "../../shared/auth/AuthFormCard";
import "./ForgotPasswordStubPage.css";

/**
 * Minimal stub so Login "Forgot password?" does not redirect to /login.
 * Full Forgot FIELDS/API = later page (docs/modules/login.md §15).
 */
export function ForgotPasswordStubPage() {
  return (
    <div className="forgot-stub">
      <AuthPageShell>
        <AuthFormCard>
          <h1 className="forgot-stub__title">Forgot password</h1>
          <p className="forgot-stub__body">
            Not built yet — Login BUTTONS stub only.
          </p>
          <Link to="/login" className="forgot-stub__back">
            Back to Sign In
          </Link>
        </AuthFormCard>
      </AuthPageShell>
    </div>
  );
}
