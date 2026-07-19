/**
 * Users list — LAYOUT (Step 2).
 * Source: user_management_page.dart AppBar + body chrome.
 * Forbidden this step: form fields, click handlers, API.
 */
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  sessionCanAdminUsers,
  sessionCanCreateUsers,
  sessionCanManageUsers,
} from "../../shared/auth/sessionGates";
import {
  USERS_MGMT_ADD_LABEL,
  USERS_MGMT_TITLE,
  USERS_MGMT_TOOLTIP_BACK,
  USERS_MGMT_TOOLTIP_REFRESH,
  USERS_MGMT_TOOLTIP_SELECT,
} from "./usersManagementCopy";
import "./UserManagementPage.css";

/** Inert icon chrome — handlers deferred to BUTTONS step. */
function InertIcon({
  className,
  label,
  children,
}: {
  className: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`users-mgmt__icon ${className}`}
      title={label}
      aria-label={label}
      role="img"
    >
      {children}
    </span>
  );
}

export function UserManagementPage() {
  const session = readPrimaryBusiness();
  if (!sessionCanManageUsers(session)) {
    return <Navigate to="/settings" replace />;
  }

  const canAdmin = sessionCanAdminUsers(session);
  const canCreate = sessionCanCreateUsers(session);

  return (
    <div className="users-mgmt" data-testid="user-management-page">
      <header className="users-mgmt__appbar" data-slot="appBar">
        <div className="users-mgmt__appbar-leading" data-slot="appBar.leading">
          <InertIcon
            className="users-mgmt__icon--back"
            label={USERS_MGMT_TOOLTIP_BACK}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
          </InertIcon>
        </div>
        <h1 className="users-mgmt__title">{USERS_MGMT_TITLE}</h1>
        <div className="users-mgmt__appbar-actions" data-slot="appBar.actions">
          {canAdmin ? (
            <InertIcon
              className="users-mgmt__icon--select"
              label={USERS_MGMT_TOOLTIP_SELECT}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.5 3C4.12 3 3 4.12 3 5.5S4.12 8 5.5 8 8 6.88 8 5.5 6.88 3 5.5 3zM7.5 14c-.83 0-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5h-1zm6.5-7.5C14 5.67 13.33 5 12.5 5h-1C10.67 5 10 5.67 10 6.5v5c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5v-5zM5.5 10C4.12 10 3 11.12 3 12.5S4.12 15 5.5 15 8 13.88 8 12.5 6.88 10 5.5 10z"
                />
              </svg>
            </InertIcon>
          ) : null}
          <InertIcon
            className="users-mgmt__icon--refresh"
            label={USERS_MGMT_TOOLTIP_REFRESH}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M17.65 6.35A7.95 7.95 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              />
            </svg>
          </InertIcon>
          {canCreate ? (
            <span
              className="users-mgmt__add"
              title={USERS_MGMT_ADD_LABEL}
              aria-label={USERS_MGMT_ADD_LABEL}
              role="img"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              <span className="users-mgmt__add-label">{USERS_MGMT_ADD_LABEL}</span>
            </span>
          ) : null}
        </div>
      </header>

      <div className="users-mgmt__body">
        <div
          className="users-mgmt__search-filter"
          data-slot="searchFilter"
          data-testid="users-mgmt-search-chrome"
          aria-hidden="true"
        >
          <div className="users-mgmt__search-bar" />
        </div>
        <div
          className="users-mgmt__status-chips"
          data-slot="statusChips"
          data-testid="users-mgmt-chips-chrome"
          aria-hidden="true"
        />

        <div className="users-mgmt__split">
          <section
            className="users-mgmt__list"
            data-slot="list"
            data-testid="users-mgmt-list-chrome"
            aria-hidden="true"
          />
          <aside
            className="users-mgmt__detail"
            data-slot="detailPanel"
            data-testid="users-mgmt-detail-chrome"
            aria-hidden="true"
          />
        </div>
      </div>

      <footer
        className="users-mgmt__bulk"
        data-slot="bulkBar"
        data-testid="users-mgmt-bulk-chrome"
        aria-hidden="true"
      />
    </div>
  );
}
