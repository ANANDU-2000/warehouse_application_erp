import "./AuthNetworkErrorBanner.css";

type AuthNetworkErrorBannerProps = {
  onRetry: () => void;
  title?: string;
  detail?: string | null;
};

/**
 * Port of AuthNetworkErrorBanner — auth_network_error_banner.dart.
 * Default title: Can't reach server.
 */
export function AuthNetworkErrorBanner({
  onRetry,
  title = "Can't reach server",
  detail,
}: AuthNetworkErrorBannerProps) {
  return (
    <div className="auth-network-banner" role="alert">
      <div className="auth-network-banner__row">
        <span className="auth-network-banner__icon" aria-hidden="true">
          <WifiOffIcon />
        </span>
        <p className="auth-network-banner__title">{title}</p>
        <button
          type="button"
          className="auth-network-banner__retry"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
      {detail && detail.trim() !== "" ? (
        <p className="auth-network-banner__detail">{detail}</p>
      ) : null}
    </div>
  );
}

function WifiOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.99 9C19.15 5.16 13.8 3.76 8.96 5.08l1.66 1.66C14.1 5.9 18.17 6.97 21 9.8l1.99-.8zM3.34 2.75 2.08 4.01l2.8 2.8C3.44 7.83 1.84 9.07.01 10.5l1.99.8c1.37-1.09 2.87-1.97 4.45-2.61l1.68 1.68C6.4 11.15 4.7 12.2 3.25 13.5L5.24 14.3c1.2-1.05 2.6-1.88 4.1-2.45l2.15 2.15c-1.7.55-3.25 1.45-4.55 2.65L9 19l2.5-2.5L20.49 22l1.27-1.27L3.34 2.75zM16.94 14.16l1.48 1.48c.7-.66 1.33-1.4 1.86-2.2l-1.99-.8c-.37.57-.8 1.09-1.35 1.52zM14.21 11.43l1.95 1.95c.5-.35.96-.75 1.37-1.2l-1.99-.8c-.39.38-.82.7-1.33 1.05z" />
    </svg>
  );
}
