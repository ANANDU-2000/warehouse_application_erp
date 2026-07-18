import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { AuthPageShell } from "../../shared/auth/AuthPageShell";
import { AuthFormCard } from "../../shared/auth/AuthFormCard";
import { hexaColors } from "../../shared/theme/colors";
import {
  emailError,
  isLoginFormValid,
  passwordError,
} from "./loginValidation";
import "./LoginPage.css";

/**
 * Login page — Step 4 BUTTONS.
 * Sign In + Forgot + helper/©. No live API (stub onSignIn).
 * Spec: docs/modules/login.md §10–11; login_page.dart FilledButton/TextButton.
 */
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [obscure, setObscure] = useState(true);
  const [showValidation, setShowValidation] = useState(false);
  /** Flutter `_loading` — stays false until WIRE drives real login. */
  const [loading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const formValid = isLoginFormValid(email, password);
  const eErr = emailError(email, showValidation);
  const pErr = passwordError(password, showValidation);

  /** Flutter `_signIn` body deferred to WIRE — no fetch here. */
  function onSignInStub() {
    /* no-op until WIRE */
  }

  function attemptSignIn() {
    if (loading) return;
    if (!formValid) {
      setShowValidation(true);
      return;
    }
    onSignInStub();
  }

  function onEmailKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  }

  function onPasswordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      attemptSignIn();
    }
  }

  function onCardSubmit(e: FormEvent) {
    e.preventDefault();
    attemptSignIn();
  }

  return (
    <div
      className="login-page"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
      }}
    >
      <AuthPageShell>
        <AuthFormCard>
          <form className="login-page__form" onSubmit={onCardSubmit} noValidate>
            <div className="login-page__brand">
              <WarehouseIcon />
              <div className="login-page__titles">
                <h1 className="login-page__agency">Harisree Agency</h1>
                <p className="login-page__subtitle">Warehouse Management</p>
              </div>
            </div>
            <h2 className="login-page__sign-in">Sign In</h2>

            <div className="login-page__field">
              <div
                className={`auth-filled${eErr ? " auth-filled--err" : ""}`}
              >
                <span className="auth-filled__prefix" aria-hidden="true">
                  <EmailIcon />
                </span>
                <input
                  className="auth-filled__input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={onEmailKeyDown}
                  disabled={loading}
                  aria-invalid={eErr != null}
                  aria-describedby={eErr ? "login-email-error" : undefined}
                />
              </div>
              {eErr ? (
                <p id="login-email-error" className="login-page__err" role="alert">
                  {eErr}
                </p>
              ) : null}
            </div>

            <div className="login-page__field">
              <div
                className={`auth-filled${pErr ? " auth-filled--err" : ""}`}
              >
                <span className="auth-filled__prefix" aria-hidden="true">
                  <KeyIcon />
                </span>
                <input
                  ref={passwordRef}
                  className="auth-filled__input"
                  type={obscure ? "password" : "text"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={onPasswordKeyDown}
                  disabled={loading}
                  aria-invalid={pErr != null}
                  aria-describedby={pErr ? "login-password-error" : undefined}
                />
                <button
                  type="button"
                  className="auth-filled__suffix"
                  title={obscure ? "Show password" : "Hide password"}
                  aria-label={obscure ? "Show password" : "Hide password"}
                  onClick={() => setObscure((v) => !v)}
                  disabled={loading}
                >
                  {obscure ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </button>
              </div>
              {pErr ? (
                <p
                  id="login-password-error"
                  className="login-page__err"
                  role="alert"
                >
                  {pErr}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="login-page__submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-page__spinner" aria-label="Loading" />
              ) : (
                "Sign In"
              )}
            </button>

            {loading ? (
              <span className="login-page__forgot login-page__forgot--disabled">
                Forgot password?
              </span>
            ) : (
              <Link to="/forgot-password" className="login-page__forgot">
                Forgot password?
              </Link>
            )}

            <p className="login-page__helper">
              Contact your manager to reset password
            </p>
            <p className="login-page__copyright">© 2026</p>
          </form>
        </AuthFormCard>
      </AuthPageShell>
    </div>
  );
}

function WarehouseIcon() {
  return (
    <svg
      className="login-page__icon"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22 21V7L12 2 2 7v14h6v-8h8v8h6zM11 19H7v-6h4v6zm6 0h-4v-6h4v6z"
        fill={hexaColors.brandPrimary}
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

function VisibilityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function VisibilityOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
    </svg>
  );
}
