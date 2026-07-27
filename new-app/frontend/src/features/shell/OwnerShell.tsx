import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./OwnerShell.css";

const OWNER_TABS = [
  { id: "home", label: "Home", path: "/home", icon: "grid" },
  { id: "stock", label: "Stock", path: "/stock", icon: "inventory" },
  { id: "reports", label: "Reports", path: "/reports", icon: "bar_chart" },
  { id: "history", label: "History", path: "/purchase", icon: "receipt" },
  { id: "search", label: "Search", path: "/search", icon: "search" },
] as const;

type TabId = (typeof OWNER_TABS)[number]["id"];

function tabIcon(icon: string, selected: boolean): ReactNode {
  const color = selected ? "#0E7C6B" : "#6B7280";
  const size = 22;
  const icons: Record<string, ReactNode> = {
    grid: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" />
      </svg>
    ),
    inventory: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM6 6h5v5H6V6zm7 0h5v2h-5V6zm0 3h5v2h-5V9zM6 13h5v5H6v-5zm7 2h5v3h-5v-3z" />
      </svg>
    ),
    bar_chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
      </svg>
    ),
    receipt: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
  };
  return icons[icon] ?? null;
}

export function OwnerShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "owner").toLowerCase();
  const isStaff = role === "staff";

  if (isStaff) {
    return <StaffShellInternal>{children}</StaffShellInternal>;
  }

  return <OwnerShellInternal>{children}</OwnerShellInternal>;
}

function OwnerShellInternal({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [fabOpen, setFabOpen] = useState(false);

  const currentTab =
    OWNER_TABS.find((t) => location.pathname.startsWith(t.path))?.id ?? "home";

  return (
    <div className="owner-shell">
      <main className="owner-shell__body">{children}</main>
      <nav className="owner-shell__bottombar" role="navigation">
        <div className="owner-shell__tabs">
          {OWNER_TABS.map((tab) => {
            const selected = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`owner-shell__tab${selected ? " owner-shell__tab--selected" : ""}`}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                aria-current={selected ? "page" : undefined}
              >
                <span className="owner-shell__tab-icon">
                  {tabIcon(tab.icon, selected)}
                </span>
                <span className="owner-shell__tab-label">{tab.label}</span>
              </button>
            );
          })}
          <div className="owner-shell__fab-wrap">
            <button
              type="button"
              className="owner-shell__fab"
              onClick={() => setFabOpen((v) => !v)}
              aria-label="Quick actions"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
          </div>
        </div>
        {fabOpen && (
          <div
            className="owner-shell__fab-sheet"
            onClick={() => setFabOpen(false)}
          >
            <div
              className="owner-sheet__content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="owner-sheet__item"
                onClick={() => {
                  setFabOpen(false);
                  navigate("/purchase/new");
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B">
                  <path d="M8 6h13v14H8z" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                  <path d="M11 11h7M11 15h7" />
                </svg>
                Add Purchase
              </button>
              <button
                type="button"
                className="owner-sheet__item"
                onClick={() => {
                  setFabOpen(false);
                  navigate("/catalog/new-category");
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B">
                  <path d="M21 8l-9-4-9 4v8l9 4 9-4V8z" />
                  <path d="M3 8l9 4 9-4M12 12v8" />
                </svg>
                Add Item
              </button>
              <button
                type="button"
                className="owner-sheet__item"
                onClick={() => {
                  setFabOpen(false);
                  navigate("/barcode/scan");
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B">
                  <path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" />
                  <rect x="7" y="7" width="10" height="10" rx="1" />
                </svg>
                Scan Barcode
              </button>
              <button
                type="button"
                className="owner-sheet__item"
                onClick={() => {
                  setFabOpen(false);
                  navigate("/barcode/bulk-print");
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B">
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                </svg>
                Print Labels
              </button>
              <button
                type="button"
                className="owner-sheet__item"
                onClick={() => {
                  setFabOpen(false);
                  navigate("/stock");
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B">
                  <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
                </svg>
                Stock Adjustment
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

function StaffShellInternal({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const STAFF_TABS = [
    { id: "home", label: "Home", path: "/staff/home", icon: "grid" },
    { id: "stock", label: "Stock", path: "/staff/stock", icon: "inventory" },
    { id: "scan", label: "Scan", path: "/staff/scan", icon: "qr" },
    { id: "search", label: "Search", path: "/staff/search", icon: "search" },
    { id: "deliveries", label: "Deliveries", path: "/staff/deliveries", icon: "truck" },
    { id: "tasks", label: "Tasks", path: "/staff/activity", icon: "checklist" },
  ] as const;

  const currentTab =
    STAFF_TABS.find((t) => location.pathname.startsWith(t.path))?.id ?? "home";

  function staffTabIcon(icon: string, selected: boolean): ReactNode {
    const color = selected ? "#0E7C6B" : "#6B7280";
    const size = 20;
    const icons: Record<string, ReactNode> = {
      grid: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" />
        </svg>
      ),
      inventory: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M21 2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H3V4h18v16z" />
          <path d="M5 6h4v4H5V6zm0 7h4v4H5v-4zm6-7h4v2h-4V6zm0 3h4v2h-4V9zm0 3h4v2h-4v-2z" />
        </svg>
      ),
      qr: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" />
          <rect x="7" y="7" width="10" height="10" rx="1" />
        </svg>
      ),
      search: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      ),
      truck: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      ),
      checklist: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z" />
        </svg>
      ),
    };
    return icons[icon] ?? null;
  }

  return (
    <div className="owner-shell">
      <main className="owner-shell__body">{children}</main>
      <nav className="owner-shell__bottombar" role="navigation">
        <div className="owner-shell__tabs owner-shell__tabs--staff">
          {STAFF_TABS.map((tab) => {
            const selected = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`owner-shell__tab${selected ? " owner-shell__tab--selected" : ""}`}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                aria-current={selected ? "page" : undefined}
              >
                <span className="owner-shell__tab-icon">
                  {staffTabIcon(tab.icon, selected)}
                </span>
                <span className="owner-shell__tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
