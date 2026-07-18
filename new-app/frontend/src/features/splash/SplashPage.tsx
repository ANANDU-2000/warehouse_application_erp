import { useState } from "react";
import "./SplashPage.css";

/**
 * Splash — Step 2 LAYOUT.
 * Logo asset + 800ms ease-out fade + static spinner (splash_page.dart chrome).
 * No session restore or API wire.
 */
export function SplashPage() {
  const [logoFailed, setLogoFailed] = useState(false);

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
        <div className="splash-page__spinner" role="status" aria-label="Loading">
          <span className="splash-page__spinner-ring" aria-hidden="true" />
        </div>
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
