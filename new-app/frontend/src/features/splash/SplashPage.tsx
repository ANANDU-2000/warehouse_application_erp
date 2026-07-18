import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SPLASH_SESSION_REFRESH_ERROR,
  SPLASH_USE_ANOTHER_ACCOUNT,
  SPLASH_WARMUP_DELAY_MS,
  SPLASH_WARMUP_RETRY,
  SPLASH_RETRY_LABEL,
} from "./splashCopy";
import { restoreSessionWithWebTimeout } from "./splashRestore";
import { clearTokens, readTokens } from "../../shared/auth/tokenStore";
import { clearPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./SplashPage.css";

/**
 * Splash — Step 5 WIRE.
 * Source: splash_page.dart _boot + session_notifier.restore (web 8s + one warmup).
 */
export function SplashPage() {
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const warmupRetried = useRef(false);
  const bootGen = useRef(0);

  const boot = useCallback(async () => {
    const gen = ++bootGen.current;
    setBusy(true);
    setError(null);

    let result = await restoreSessionWithWebTimeout();
    if (gen !== bootGen.current) return;

    if (!result.ok && result.reason === "timeout") {
      if (!warmupRetried.current) {
        warmupRetried.current = true;
        setBusy(true);
        setError(SPLASH_WARMUP_RETRY);
        await new Promise((r) => setTimeout(r, SPLASH_WARMUP_DELAY_MS));
        if (gen !== bootGen.current) return;
        return boot();
      }
      /* Flutter: continue to token check after second timeout */
      result = { ok: false, reason: "soft_fail" };
    }

    if (gen !== bootGen.current) return;

    if (result.ok) {
      navigate(result.homePath, { replace: true });
      return;
    }

    if (result.reason === "session_expired") {
      clearTokens();
      clearPrimaryBusiness();
      navigate("/login?notice=session_expired", { replace: true });
      return;
    }

    if (result.reason === "no_tokens") {
      navigate("/login", { replace: true });
      return;
    }

    /* soft_fail — tokens present → Retry chrome; else /login */
    const tokens = readTokens();
    if (tokens) {
      setBusy(false);
      setError(SPLASH_SESSION_REFRESH_ERROR);
      return;
    }
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    void boot();
    return () => {
      bootGen.current += 1;
    };
  }, [boot]);

  function handleRetry() {
    if (busy) return;
    void boot();
  }

  function handleUseAnotherAccount() {
    clearTokens();
    clearPrimaryBusiness();
    navigate("/login");
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
              {SPLASH_RETRY_LABEL}
            </button>
            <button
              type="button"
              className="splash-page__other-account"
              onClick={handleUseAnotherAccount}
            >
              {SPLASH_USE_ANOTHER_ACCOUNT}
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
