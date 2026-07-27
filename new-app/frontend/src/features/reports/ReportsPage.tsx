import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./ReportsPage.css";

type ReportTab = "overview" | "items" | "purchases" | "stock";

export function ReportsPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const [tab, setTab] = useState<ReportTab>("overview");

  return (
    <div className="reports-page">
      <header className="reports-page__header">
        <button type="button" className="reports-page__back" onClick={() => navigate("/home")}>←</button>
        <h1 className="reports-page__title">Reports</h1>
      </header>

      <div className="reports-page__tabs">
        {(["overview", "items", "purchases", "stock"] as ReportTab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`reports-page__tab${tab === t ? " reports-page__tab--selected" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <main className="reports-page__body">
        {tab === "overview" && (
          <div className="reports-page__section">
            <div className="reports-page__kpi-grid">
              <div className="reports-page__kpi">
                <span className="reports-page__kpi-value">₹0</span>
                <span className="reports-page__kpi-label">Total Purchases</span>
              </div>
              <div className="reports-page__kpi">
                <span className="reports-page__kpi-value">0</span>
                <span className="reports-page__kpi-label">Total Items</span>
              </div>
              <div className="reports-page__kpi">
                <span className="reports-page__kpi-value">0</span>
                <span className="reports-page__kpi-label">Suppliers</span>
              </div>
              <div className="reports-page__kpi">
                <span className="reports-page__kpi-value">₹0</span>
                <span className="reports-page__kpi-label">Stock Value</span>
              </div>
            </div>
            <div className="reports-page__chart-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#D1D5DB">
                <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
              </svg>
              <p>Charts coming soon</p>
            </div>
          </div>
        )}
        {tab === "items" && (
          <div className="reports-page__section">
            <div className="reports-page__empty">
              <p>Item reports coming soon</p>
            </div>
          </div>
        )}
        {tab === "purchases" && (
          <div className="reports-page__section">
            <div className="reports-page__empty">
              <p>Purchase reports coming soon</p>
            </div>
          </div>
        )}
        {tab === "stock" && (
          <div className="reports-page__section">
            <div className="reports-page__empty">
              <p>Stock reports coming soon</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
