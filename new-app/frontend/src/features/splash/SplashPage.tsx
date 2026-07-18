import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SplashPage.css";

/** Exact legacy string from splash_page.dart (failed token refresh path). */
const SESSION_REFRESH_ERROR =
  "We couldn't refresh your session. Check your connection and tap Retry.";

/**
 * Splash — Step 4 BUTTONS.
 * Error chrome: Retry (local stub) + Use another account → /login.
 * No session restore API wire.
 */
export function SplashPage() {
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(SESSION_REFRESH_ERROR);

  function handleRetry() {
    if (busy) return;
    setBusy(true);
    setError(null);
    window.setTimeout(() => {
      setBusy(false);
      setError(SESSION_REFRESH_ERROR);
    }, 300);
  }

  return (
    <div className="splash-page">
      <div className="splash-page__gradient" aria-hidden="true" />
      <div className="splash-page__center">
        <div className="splash-page__logo" aria-hidden="true">
          {logoFailed ? (
            <WarehouseIcon />
          ) : (
            <img
              className="splash-page__logo-img"
              src="/brand/app_logo.png"
              alt=""
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>
        <h1 className="splash-page__title">Harisree Warehouse</h1>
        <p className="splash-page__tagline">Stock · Purchase · Delivery</p>
        {busy ? (
          <div className="splash-page__spinner" role="status" aria-label="Loading">
            <span className="splash-page__spinner-ring" aria-hidden="true" />
          </div>
        ) : null}
        {error != null ? (
          <div className="splash-page__error">
            <p className="splash-page__error-text">{error}</p>
            <button
              type="button"
              className="splash-page__retry"
              disabled={busy}
              onClick={handleRetry}
            >
              <RefreshIcon />
              Retry
            </button>
            <button
              type="button"
              className="splash-page__other-account"
              onClick={() => navigate("/login")}
            >
              Use another account
            </button>
          </div>
        ) : null}
      </div>
      <p className="splash-page__footer">Harisree Warehouse v1.0</p>
    </div>
  );
}

function WarehouseIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 21V7L12 2 2 7v14h6v-8h8v8h6zM11 19H7v-6h4v6zm6 0h-4v-6h4v6z"
        fill="#ffffff"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="splash-page__retry-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c2.76 0 5 2.24 5 5a5 5 0 0 1-8.66 3.44L6.1 17.68A8 8 0 1 0 17.65 6.35z" />
    </svg>
  );
}
