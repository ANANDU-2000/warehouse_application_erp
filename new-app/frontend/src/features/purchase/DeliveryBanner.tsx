import "./DeliveryBanner.css";

type Props = {
  deliveryStatus: string;
  role: string;
  deliveryBusy: boolean;
  onDispatch: () => void;
  onArrive: () => void;
  onVerify: () => void;
  onCommitStock: () => void;
};

type BannerConfig = {
  color: string;
  bg: string;
  icon: string;
  label: string;
  actions: Array<{ label: string; roles: string[]; onClick: () => void }>;
};

function bannerConfig(status: string, props: Props): BannerConfig {
  const { role, deliveryBusy, onDispatch, onArrive, onVerify, onCommitStock } = props;
  const isOwner = role === "owner" || role === "manager";
  switch (status) {
    case "pending":
      return {
        color: "#92400E", bg: "#FEF3C7",
        icon: `<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>`,
        label: "Awaiting dispatch",
        actions: isOwner ? [{ label: deliveryBusy ? "Dispatching..." : "Mark Dispatched", roles: ["owner", "manager"], onClick: onDispatch }] : [],
      };
    case "dispatched":
    case "in_transit":
      return {
        color: "#1E40AF", bg: "#DBEAFE",
        icon: `<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>`,
        label: status === "dispatched" ? "Dispatched" : "In transit",
        actions: [{ label: deliveryBusy ? "Marking Arrived..." : "Mark Arrived", roles: ["staff", "owner", "manager"], onClick: onArrive }],
      };
    case "arrived":
    case "staff_verifying":
      return {
        color: "#92400E", bg: "#FEF3C7",
        icon: `<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>`,
        label: status === "arrived" ? "Arrived — verify counts" : "Staff verifying",
        actions: [{ label: deliveryBusy ? "Verifying..." : "Verify Counts", roles: ["staff", "owner", "manager"], onClick: onVerify }],
      };
    case "partial":
      return {
        color: "#9A3412", bg: "#FFEDD5",
        icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
        label: "Partial delivery — verify remaining",
        actions: [{ label: deliveryBusy ? "Verifying..." : "Verify Counts", roles: ["staff", "owner", "manager"], onClick: onVerify }],
      };
    case "staff_verified":
      return {
        color: "#065F46", bg: "#D1FAE5",
        icon: `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>`,
        label: "Staff verified — ready to commit stock",
        actions: isOwner ? [{ label: deliveryBusy ? "Committing..." : "Commit to Stock", roles: ["owner", "manager"], onClick: onCommitStock }] : [],
      };
    case "stock_committed":
      return {
        color: "#065F46", bg: "#D1FAE5",
        icon: `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
        label: "Stock committed",
        actions: [],
      };
    case "cancelled":
      return {
        color: "#991B1B", bg: "#FEE2E2",
        icon: `<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>`,
        label: "Cancelled",
        actions: [],
      };
    default:
      return { color: "#6B7280", bg: "#F3F4F6", icon: "", label: status, actions: [] };
  }
}

export function DeliveryBanner(props: Props) {
  const cfg = bannerConfig(props.deliveryStatus, props);

  return (
    <div className="pd-banner" style={{ background: cfg.bg, borderLeft: `4px solid ${cfg.color}` }}>
      <div className="pd-banner__inner">
        <span className="pd-banner__icon" style={{ color: cfg.color }} dangerouslySetInnerHTML={{ __html: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">${cfg.icon}</svg>` }} />
        <span className="pd-banner__label" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
      {cfg.actions.length > 0 && (
        <div className="pd-banner__actions">
          {cfg.actions.map((a, i) => (
            <button key={i} type="button" className="pd-banner__btn" style={{ background: cfg.color }} disabled={props.deliveryBusy} onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
