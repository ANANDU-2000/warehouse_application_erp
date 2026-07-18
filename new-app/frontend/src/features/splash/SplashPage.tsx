import "./SplashPage.css";

/**
 * Splash — Step 1 SCAFFOLD only.
 * Static branded shell from splash_page.dart (visual chrome only).
 * Spec: HexaColors.appName / appTagline; gradient #062E28 → #0E4F46 → #159A8A.
 */
export function SplashPage() {
  return (
    <div className="splash-page">
      <div className="splash-page__gradient" aria-hidden="true" />
      <div className="splash-page__center">
        <div className="splash-page__logo" aria-hidden="true">
          <WarehouseIcon />
        </div>
        <h1 className="splash-page__title">Harisree Warehouse</h1>
        <p className="splash-page__tagline">Stock · Purchase · Delivery</p>
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
