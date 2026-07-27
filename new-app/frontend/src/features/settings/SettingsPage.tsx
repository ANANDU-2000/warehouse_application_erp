import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness, clearPrimaryBusiness } from "../../shared/auth/sessionStore";
import { clearTokens } from "../../shared/auth/tokenStore";
import "./SettingsPage.css";

export function SettingsPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const title = session?.name ?? "Warehouse";
  const role = (session?.role ?? "owner").toUpperCase();

  function handleLogout() {
    clearTokens();
    clearPrimaryBusiness();
    navigate("/login", { replace: true });
  }

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <button type="button" className="settings-page__back" onClick={() => navigate("/home")}>←</button>
        <h1 className="settings-page__title">Settings</h1>
      </header>

      <main className="settings-page__body">
        <section className="settings-page__card">
          <div className="settings-page__profile">
            <div className="settings-page__avatar">
              {title.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="settings-page__name">{title}</p>
              <p className="settings-page__role">{role}</p>
            </div>
          </div>
        </section>

        <section className="settings-page__card">
          <h2 className="settings-page__section">Account</h2>
          <button type="button" className="settings-page__item" onClick={() => navigate("/settings/users")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            User Management
            <span className="settings-page__arrow">›</span>
          </button>
          <button type="button" className="settings-page__item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Business Profile
            <span className="settings-page__arrow">›</span>
          </button>
        </section>

        <section className="settings-page__card">
          <h2 className="settings-page__section">Preferences</h2>
          <button type="button" className="settings-page__item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            Notifications
            <span className="settings-page__arrow">›</span>
          </button>
          <button type="button" className="settings-page__item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.77 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.89 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.25.12.54.02.68-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
            </svg>
            General
            <span className="settings-page__arrow">›</span>
          </button>
        </section>

        <section className="settings-page__card">
          <h2 className="settings-page__section">Support</h2>
          <button type="button" className="settings-page__item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
            Help Guide
            <span className="settings-page__arrow">›</span>
          </button>
          <button type="button" className="settings-page__item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            About
            <span className="settings-page__arrow">›</span>
          </button>
        </section>

        <section className="settings-page__card">
          <button type="button" className="settings-page__logout" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#DC2626">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Logout
          </button>
        </section>

        <p className="settings-page__version">© 2026 Warehouse ERP</p>
      </main>
    </div>
  );
}
