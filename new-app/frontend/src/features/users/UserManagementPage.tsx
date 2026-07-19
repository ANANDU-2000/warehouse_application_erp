/**
 * Users list — FIELDS (Step 3).
 * Source: user_list_filters.dart + user_management_page.dart _searchBar.
 * Forbidden this step: API, AppBar handlers, role-filter drawer (BUTTONS).
 */
import { useMemo, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  sessionCanAdminUsers,
  sessionCanCreateUsers,
  sessionCanManageUsers,
} from "../../shared/auth/sessionGates";
import {
  USERS_MGMT_ADD_LABEL,
  USERS_MGMT_SEARCH_HINT,
  USERS_MGMT_TITLE,
  USERS_MGMT_TOOLTIP_BACK,
  USERS_MGMT_TOOLTIP_FILTER,
  USERS_MGMT_TOOLTIP_REFRESH,
  USERS_MGMT_TOOLTIP_SELECT,
} from "./usersManagementCopy";
import {
  USER_LIST_PRIMARY_LABELS,
  USER_LIST_PRIMARY_ORDER,
  copyUserListFilter,
  countForPrimaryFilter,
  DEFAULT_USER_LIST_FILTER,
  type UserListFilterState,
  type UserListPrimaryFilter,
  type UserListRow,
} from "./userListFilters";
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
  const [filter, setFilter] = useState<UserListFilterState>(
    DEFAULT_USER_LIST_FILTER,
  );

  /** Empty until WIRE — counts stay 0. */
  const rows = useMemo<UserListRow[]>(() => [], []);

  if (!sessionCanManageUsers(session)) {
    return <Navigate to="/settings" replace />;
  }

  const canAdmin = sessionCanAdminUsers(session);
  const canCreate = sessionCanCreateUsers(session);

  function setPrimary(primary: UserListPrimaryFilter) {
    setFilter((prev) => copyUserListFilter(prev, { primary }));
  }

  function setSearch(search: string) {
    setFilter((prev) => copyUserListFilter(prev, { search }));
  }

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
        >
          <div className="users-mgmt__search-row">
            <label className="users-mgmt__search-field">
              <span className="users-mgmt__search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  />
                </svg>
              </span>
              <input
                type="text"
                className="users-mgmt__search-input"
                placeholder={USERS_MGMT_SEARCH_HINT}
                value={filter.search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="users-mgmt-search-input"
                aria-label={USERS_MGMT_SEARCH_HINT}
              />
            </label>
            <InertIcon
              className="users-mgmt__icon--filter"
              label={USERS_MGMT_TOOLTIP_FILTER}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                />
              </svg>
            </InertIcon>
          </div>
        </div>

        <div
          className="users-mgmt__status-chips"
          data-slot="statusChips"
          data-testid="users-mgmt-chips-chrome"
          role="tablist"
          aria-label="User status filter"
        >
          {USER_LIST_PRIMARY_ORDER.map((key) => {
            const selected = filter.primary === key;
            const count = countForPrimaryFilter(rows, key);
            const label = USER_LIST_PRIMARY_LABELS[key];
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                className={
                  selected
                    ? "users-mgmt__chip users-mgmt__chip--selected"
                    : "users-mgmt__chip"
                }
                data-testid={`users-mgmt-chip-${key}`}
                onClick={() => setPrimary(key)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

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
